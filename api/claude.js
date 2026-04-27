// Vercel serverless function — proxies requests to Anthropic API.
// The API key lives here (server-side) and is never exposed to the browser.

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB — supports vision (base64 image) payloads
const MAX_MESSAGES   = 60;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  // ── Body size check ────────────────────────────────────────────
  const rawBody = JSON.stringify(req.body);
  if (!rawBody || rawBody.length > MAX_BODY_BYTES) {
    return res.status(413).json({ error: "Request too large" });
  }

  // ── Schema validation ──────────────────────────────────────────
  const { model, messages, max_tokens, system } = req.body;

  if (typeof model !== "string" || !model.startsWith("claude-")) {
    return res.status(400).json({ error: "Invalid model" });
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: "Invalid messages" });
  }
  // Each message must have role + string OR array content (array = vision blocks)
  for (const m of messages) {
    if (!["user", "assistant"].includes(m.role)) {
      return res.status(400).json({ error: "Invalid message format" });
    }
    if (typeof m.content !== "string" && !Array.isArray(m.content)) {
      return res.status(400).json({ error: "Invalid message format" });
    }
    if (Array.isArray(m.content)) {
      for (const block of m.content) {
        if (!["text", "image"].includes(block.type)) {
          return res.status(400).json({ error: "Invalid content block type" });
        }
      }
    }
  }
  if (typeof max_tokens !== "number" || max_tokens < 1 || max_tokens > 16000) {
    return res.status(400).json({ error: "Invalid max_tokens" });
  }
  if (system !== undefined && typeof system !== "string") {
    return res.status(400).json({ error: "Invalid system prompt" });
  }

  // ── Forward to Anthropic ───────────────────────────────────────
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, messages, max_tokens, ...(system ? { system } : {}) }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch {
    return res.status(500).json({ error: "Upstream request failed" });
  }
}
