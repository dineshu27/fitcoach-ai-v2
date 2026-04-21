import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import REX from "../components/REX";
import ChatBubble, { TypingIndicator } from "../components/ChatBubble";
import { cache } from "../lib/cache";
import { rexChat, sanitizeInput } from "../lib/api";

const QUICK_PROMPT_GROUPS = [
  {
    label: "Today",
    prompts: ["How am I doing today?", "What should I eat now?", "Suggest a quick workout"],
  },
  {
    label: "Plan",
    prompts: ["Update my calorie target", "Change my workout days", "Adjust for weight loss faster"],
  },
  {
    label: "Help",
    prompts: ["I only have 20 mins", "I'm feeling sore", "Motivate me", "Can I have a cheat meal?", "I skipped the gym today"],
  },
];

function detectState(lastMsg, isLoading) {
  if (isLoading) return "thinking";
  if (!lastMsg) return "idle";
  const text = (lastMsg.content || "").toLowerCase();
  if (text.includes("great") || text.includes("amazing") || text.includes("well done") || text.includes("congrats")) return "celebrating";
  if (text.includes("careful") || text.includes("warning") || text.includes("avoid") || text.includes("skip")) return "warning";
  if (lastMsg.role === "assistant") return "talking";
  return "idle";
}

function buildWelcome(profile, plan) {
  const name = profile?.name?.split(" ")[0] || "there";
  const goals = Array.isArray(profile?.goals) ? profile.goals.join(" + ") : (profile?.goal || "fitness");
  return `Hey ${name}! I'm FiTAi, your AI fitness coach. I've set you up with a ${plan?.calories || ""}kcal plan targeting: ${goals}. ${profile?.bodyFocus ? `Your focus is ${profile.bodyFocus}. ` : ""}What can I help you with today?`;
}

/* Parse RESPONSE/ACTION format from rexChat */
function parseReply(raw) {
  const responseMatch = raw.match(/RESPONSE:\s*([\s\S]*?)(?=ACTION:|$)/);
  const actionMatch = raw.match(/ACTION:\s*(\{[\s\S]*?\})/);
  const text = responseMatch?.[1]?.trim() || raw;
  let action = null;
  try { action = actionMatch ? JSON.parse(actionMatch[1]) : null; } catch {}
  return { text, action };
}

function executeAction(action) {
  if (!action) return null;
  if (action.action === "log_food" && Array.isArray(action.items)) {
    action.items.forEach(item => {
      const kcal = Math.round((item.quantity || 100) * 4); // rough estimate
      cache.logCalories(item.name, kcal, {});
    });
    return `Logged ${action.items.length} food item${action.items.length > 1 ? "s" : ""} ✓`;
  }
  if (action.action === "log_exercise" && Array.isArray(action.items)) {
    action.items.forEach(item => {
      cache.markExerciseDone(item.name);
    });
    return `Logged ${action.items.length} exercise${action.items.length > 1 ? "s" : ""} ✓`;
  }
  if (action.action === "update_calories" && action.calories) {
    const plan = cache.getPlan();
    if (plan) cache.savePlan({ ...plan, calories: action.calories });
    return `Calorie target updated to ${action.calories} kcal ✓`;
  }
  return null;
}

export default function Coach() {
  const navigate = useNavigate();
  const profile = cache.getProfile();
  const plan = cache.getPlan();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const lastMsg = messages[messages.length - 1];
  const fitaiState = detectState(lastMsg, loading);
  const remaining = cache.chatsRemaining();

  useEffect(() => {
    const saved = cache.getChat();
    if (saved?.length > 0) { setMessages(saved); return; }
    if (profile && plan) {
      setMessages([{ role: "assistant", content: buildWelcome(profile, plan), id: Date.now() }]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0) cache.saveChat(messages);
  }, [messages]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function send(text) {
    const q = sanitizeInput((text || input), 500);
    if (!q || loading) return;
    if (!cache.canChat()) {
      setMessages((m) => [...m, { role: "assistant", content: "You've used all 5 free chats today! Come back tomorrow for more. 🤖", id: Date.now() }]);
      return;
    }
    const userMsg = { role: "user", content: q, id: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const apiMsgs = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      cache.incrementChatCount();
      const raw = await rexChat(apiMsgs, profile, plan);
      const { text: replyText, action } = parseReply(raw);
      setMessages((m) => [...m, { role: "assistant", content: replyText, id: Date.now() + 1 }]);
      const result = executeAction(action);
      if (result) showToast(result);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "My circuits are a bit scrambled right now. Check your connection and try again! 🤖", id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col coach-grid" style={{ height: "100svh", background: "var(--c-bg)" }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 pt-safe pt-3 pb-3"
        style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-nav)", backdropFilter: "blur(20px)" }}>
        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-90"
          style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)" }}>
          <ArrowLeft size={16} style={{ color: "var(--c-accent)" }} />
        </button>
        {/* Mini REX orb */}
        <div style={{ flexShrink: 0, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <REX state={fitaiState} size="xs" />
        </div>
        <div className="flex-1">
          <p className="font-bold" style={{ color: "var(--c-text)" }}>FiTAi</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#4ECDC4" }} />
            <span className="text-xs" style={{ color: "var(--c-sub)" }}>AI fitness coach · online</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!cache.isPremium() && (
            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{
                background: remaining <= 1 ? "rgba(255,107,107,0.15)" : "var(--c-accent-bg)",
                border: remaining <= 1 ? "1px solid rgba(255,107,107,0.3)" : "1px solid var(--c-border-bright)",
                color: remaining <= 1 ? "#FF6B6B" : "var(--c-accent)",
              }}>
              {remaining}/5 left
            </span>
          )}
          <button onClick={() => { cache.saveChat([]); setMessages([{ role: "assistant", content: buildWelcome(profile, plan), id: Date.now() }]); }}
            className="text-xs rounded-lg px-2.5 py-1.5" style={{ background: "var(--c-accent-bg)", color: "var(--c-sub)" }}>
            Clear
          </button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ paddingBottom: 16 }}>
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ChatBubble message={msg} />
          </motion.div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick prompts + input ────────────────────────────────────── */}
      <div className="flex-shrink-0" style={{ background: "var(--c-nav)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--c-border)" }}>
        {/* Quick prompts groups */}
        <div className="overflow-x-auto scrollbar-hide pt-3 pb-1">
          <div className="flex gap-4 px-4" style={{ width: "max-content" }}>
            {QUICK_PROMPT_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-bold uppercase tracking-wide mb-1.5 px-0.5" style={{ color: "var(--c-sub)" }}>{group.label}</p>
                <div className="flex gap-2">
                  {group.prompts.map((q) => (
                    <button key={q} onClick={() => send(q)} disabled={loading || remaining <= 0}
                      className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)", color: "var(--c-sub)", whiteSpace: "nowrap" }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 px-4 pt-2 pb-safe" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <div className="flex flex-1 items-center rounded-full px-4 py-2.5 transition-all"
            style={{ background: "var(--c-input)", border: "1px solid var(--c-border)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && remaining > 0 && send()}
              placeholder={remaining > 0 ? "Ask FiTAi anything…" : "No chats left today"}
              disabled={remaining <= 0}
              className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
              style={{ color: "var(--c-text)", fontFamily: "Space Grotesk, sans-serif" }}
            />
          </div>
          <button onClick={() => send()} disabled={!input.trim() || loading || remaining <= 0}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-40"
            style={{ background: "var(--c-accent)", boxShadow: "0 0 15px rgba(var(--c-accent-rgb),0.4)" }}>
            <Send size={16} color="white" />
          </button>
        </div>
      </div>

      {/* Action toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-bold text-white z-50"
            style={{ background: "var(--c-accent)", boxShadow: "0 4px 20px rgba(var(--c-accent-rgb),0.4)", whiteSpace: "nowrap" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
