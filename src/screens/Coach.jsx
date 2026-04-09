import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import REX from "../components/REX";
import ChatBubble, { TypingIndicator } from "../components/ChatBubble";
import { cache } from "../lib/cache";
import { rexChat } from "../lib/api";

const QUICK_PROMPTS = [
  "How am I doing?",
  "What to eat pre-workout?",
  "I only have 20 mins today",
  "Help me stay motivated",
  "Best exercises for my focus",
  "Can I have a cheat meal?",
  "I skipped the gym today",
  "What's a good snack?",
];

function detectRexState(lastMsg, isLoading) {
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
  return `Hey ${name}! I'm REX, your AI fitness coach. I've set you up with a ${plan?.calories || ""}kcal plan targeting: ${goals}. ${profile?.bodyFocus ? `Your focus is ${profile.bodyFocus}. ` : ""}What can I help you with today?`;
}

export default function Coach() {
  const profile = cache.getProfile();
  const plan = cache.getPlan();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const lastMsg = messages[messages.length - 1];
  const rexState = detectRexState(lastMsg, loading);
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

  async function send(text) {
    const q = (text || input).trim();
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
      const reply = await rexChat(apiMsgs, profile, plan);
      setMessages((m) => [...m, { role: "assistant", content: reply, id: Date.now() + 1 }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "My circuits are a bit scrambled right now. Check your connection and try again! 🤖", id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col coach-grid" style={{ height: "100svh", background: "#0A0A0F" }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-safe pt-4 pb-3"
        style={{ borderBottom: "1px solid rgba(108,99,255,0.15)", background: "rgba(10,10,15,0.95)", backdropFilter: "blur(16px)" }}>
        <div>
          <p className="font-bold" style={{ color: "#F0F0FF" }}>REX — AI Coach</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#4ECDC4" }} />
            <span className="text-xs" style={{ color: "#8888AA" }}>Online</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Chat limit pill */}
          {!cache.isPremium() && (
            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{ background: remaining <= 1 ? "rgba(255,107,107,0.15)" : "rgba(108,99,255,0.15)",
                border: remaining <= 1 ? "1px solid rgba(255,107,107,0.3)" : "1px solid rgba(108,99,255,0.25)",
                color: remaining <= 1 ? "#FF6B6B" : "#6C63FF" }}>
              {remaining}/5 chats left
            </span>
          )}
          <button onClick={() => { cache.saveChat([]); setMessages([{ role: "assistant", content: buildWelcome(profile, plan), id: Date.now() }]); }}
            className="text-xs rounded-lg px-3 py-1.5" style={{ background: "rgba(108,99,255,0.1)", color: "#8888AA" }}>
            Clear
          </button>
        </div>
      </div>

      {/* REX hero + messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: 130 }}>
        {/* REX display area */}
        <div className="flex flex-col items-center py-4">
          <AnimatePresence mode="wait">
            <motion.div key={rexState} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
              <REX state={rexState} size="lg" />
            </motion.div>
          </AnimatePresence>
          {/* Speech bubble for latest assistant message */}
          {lastMsg?.role === "assistant" && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-4 max-w-[280px] rounded-2xl px-4 py-3 text-sm text-center"
              style={{ background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.25)", color: "#F0F0FF" }}
            >
              {lastMsg.content.slice(0, 100)}{lastMsg.content.length > 100 ? "..." : ""}
            </motion.div>
          )}
        </div>

        {/* Chat history */}
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ChatBubble message={msg} />
          </motion.div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts + input */}
      <div className="flex-shrink-0" style={{ background: "rgba(10,10,15,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(108,99,255,0.15)" }}>
        {/* Quick prompts */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-3 pb-2">
          {QUICK_PROMPTS.map((q) => (
            <button key={q} onClick={() => send(q)} disabled={loading}
              className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
              style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", color: "#8888AA", whiteSpace: "nowrap" }}>
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-4 pt-2 pb-safe" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <div className="flex flex-1 items-center rounded-full px-4 py-2.5 transition-all"
            style={{ background: "rgba(26,26,38,0.9)", border: "1px solid rgba(108,99,255,0.2)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask REX anything..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "#F0F0FF", fontFamily: "Space Grotesk, sans-serif" }}
            />
          </div>
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-40"
            style={{ background: "#6C63FF", boxShadow: "0 0 15px rgba(108,99,255,0.4)" }}>
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
