import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import REX from "../components/REX";
import { dur, ease } from "../motion/tokens";

const STEPS = [
  { text: "Calculating your metrics...", icon: "📊" },
  { text: "Building your nutrition plan...", icon: "🥗" },
  { text: "Designing your workout split...", icon: "🏋️" },
  { text: "Personalising for your goals...", icon: "🎯" },
  { text: "Finalising your 7-day plan...", icon: "✨" },
];

const TIPS = [
  "Consistency beats perfection every time.",
  "Progress, not perfection.",
  "Your future self will thank you.",
  "Every rep counts. Every meal counts.",
  "Small steps. Big results.",
];

export default function PlanLoading() {
  const [activeStep, setActiveStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Advance step indicator every 6s — keeps moving but never "completes"
  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // Rotate tips every 5s
  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const progress = Math.min((elapsed / 35) * 100, 95);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 relative overflow-hidden"
      style={{ background: "var(--c-bg)" }}>

      {/* Background glow */}
      <div className="absolute pointer-events-none" style={{
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(var(--c-accent-rgb),0.1) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%, -50%)"
      }} />

      {/* REX */}
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: dur.medium, ease: ease.out }}>
        <REX state="thinking" size="lg" />
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        className="mt-5 rounded-2xl px-5 py-3 text-sm font-bold text-center max-w-xs"
        style={{ background: "rgba(var(--c-accent-rgb),0.12)", border: "1px solid rgba(var(--c-accent-rgb),0.3)", color: "var(--c-text)" }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ⚡ APEX is building your plan...
      </motion.div>

      {/* Progress bar */}
      <div className="mt-6 w-full max-w-xs rounded-full overflow-hidden" style={{ height: 4, background: "rgba(var(--c-accent-rgb),0.15)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--c-accent), #4ECDC4)" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: dur.progress, ease: ease.out }}
        />
      </div>

      {/* Steps — show completed up to active, pulse active */}
      <div className="mt-6 w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => {
          const isDone = i < activeStep;
          const isCurrent = i === activeStep;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: isCurrent || isDone ? 1 : 0.25, x: 0 }}
              transition={{ duration: dur.standard, ease: ease.out, delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background: isDone ? "rgba(78,205,196,0.2)" : isCurrent ? "rgba(var(--c-accent-rgb),0.2)" : "rgba(var(--c-accent-rgb),0.05)",
                  border: isDone ? "1px solid #4ECDC4" : isCurrent ? "1px solid var(--c-accent)" : "1px solid transparent"
                }}>
                {isDone ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: "#4ECDC4", fontSize: 12 }}>✓</motion.span>
                ) : isCurrent ? (
                  <motion.div className="h-3 w-3 rounded-full" style={{ background: "var(--c-accent)" }}
                    animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />
                ) : (
                  <span style={{ fontSize: 12 }}>{step.icon}</span>
                )}
              </div>
              <p className="text-sm font-semibold" style={{ color: isDone ? "#4ECDC4" : isCurrent ? "var(--c-text)" : "var(--c-sub)" }}>
                {step.text}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-8 w-full max-w-xs">
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: dur.medium, ease: ease.out }}
            className="text-center text-xs italic"
            style={{ color: "var(--c-accent)" }}
          >
            "{TIPS[tipIndex]}"
          </motion.p>
        </AnimatePresence>
        <p className="text-center text-xs mt-3" style={{ color: "var(--c-sub)" }}>
          {elapsed < 35 ? "This takes about 30 seconds..." : "Still working — almost there..."}
        </p>
      </div>
    </div>
  );
}
