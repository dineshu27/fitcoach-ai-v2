import { motion } from "framer-motion";
import REX from "./REX";
import { chatMessage } from "../motion/variants";
import { dur } from "../motion/tokens";
import { useMotionSafe } from "../motion/useMotionSafe";

export default function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const { v } = useMotionSafe();

  return (
    <motion.div
      variants={v(chatMessage)}
      initial="hidden"
      animate="show"
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 mb-1"
          style={{
            transform: "scale(0.5)",
            transformOrigin: "bottom left",
            width: 60, height: 60,
            marginLeft: -10, marginBottom: -5,
          }}
        >
          <REX state="idle" size="sm" />
        </div>
      )}
      <div
        className="max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={isUser ? {
          background: "linear-gradient(135deg, var(--c-accent), #5B52E5)",
          borderRadius: "18px 18px 4px 18px",
          color: "var(--c-text)",
          boxShadow: "0 0 15px rgba(var(--c-accent-rgb),0.3)",
        } : {
          background: "var(--c-input)",
          border: "1px solid rgba(var(--c-accent-rgb),0.25)",
          borderRadius: "18px 18px 18px 4px",
          color: "var(--c-text)",
        }}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
}

// Typing indicator — 3 dots with staggered opacity pulse.
// Replaces CSS animate-bounce with controlled Framer Motion.
// Amplitude: tiny scale (1 → 1.18), opacity (0.35 → 1).
// No bounce, no large movement — calm AI thinking state.
export function TypingIndicator() {
  const dotVariant = {
    idle: { opacity: 0.35, scale: 1 },
    pulse: {
      opacity: [0.35, 1, 0.35],
      scale:   [1, 1.18, 1],
      transition: {
        duration: dur.celebration,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      variants={chatMessage}
      initial="hidden"
      animate="show"
      className="flex items-end gap-2"
    >
      <div
        className="flex-shrink-0 mb-1"
        style={{
          transform: "scale(0.5)",
          transformOrigin: "bottom left",
          width: 60, height: 60,
          marginLeft: -10, marginBottom: -5,
        }}
      >
        <REX state="thinking" size="sm" />
      </div>
      <div
        className="rounded-2xl px-4 py-3"
        style={{
          background: "var(--c-input)",
          border: "1px solid rgba(var(--c-accent-rgb),0.25)",
        }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              variants={dotVariant}
              initial="idle"
              animate="pulse"
              transition={{ delay: i * 0.18 }}
              style={{
                display: "block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--c-accent)",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
