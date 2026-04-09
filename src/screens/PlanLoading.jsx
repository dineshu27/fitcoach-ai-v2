import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import REX from "../components/REX";

const STEPS = [
  "Calculating your metrics...",
  "Building your nutrition plan...",
  "Designing your workout split...",
  "Personalising for your conditions...",
];

export default function PlanLoading() {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState([]);

  useEffect(() => {
    const intervals = STEPS.map((_, i) =>
      setTimeout(() => {
        setDone((d) => [...d, i]);
        if (i < STEPS.length - 1) setCurrentStep(i + 1);
      }, (i + 1) * 4000)
    );
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8"
      style={{ background: "#0A0A0F" }}>
      {/* Glow */}
      <div className="absolute" style={{ width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* REX thinking */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <REX state="thinking" size="lg" />
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        className="mt-6 rounded-2xl px-5 py-3 text-sm font-semibold text-center max-w-xs"
        style={{ background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.3)", color: "#F0F0FF" }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🤖 REX is building your personalised plan...
      </motion.div>

      {/* Steps */}
      <div className="mt-8 w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => {
          const isDone = done.includes(i);
          const isCurrent = currentStep === i && !isDone;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isCurrent || isDone ? 1 : 0.35, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: isDone ? "#4ECDC4" : isCurrent ? "rgba(108,99,255,0.3)" : "rgba(108,99,255,0.1)",
                  border: isCurrent ? "1px solid #6C63FF" : "1px solid transparent" }}>
                {isDone ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs">✓</motion.span>
                ) : isCurrent ? (
                  <motion.div className="h-3 w-3 rounded-full" style={{ background: "#6C63FF" }}
                    animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                ) : (
                  <div className="h-2 w-2 rounded-full" style={{ background: "rgba(108,99,255,0.3)" }} />
                )}
              </div>
              <p className="text-sm font-medium" style={{ color: isDone ? "#4ECDC4" : isCurrent ? "#F0F0FF" : "#8888AA" }}>
                {step}
              </p>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-xs" style={{ color: "#8888AA" }}>This takes 20–30 seconds...</p>
    </div>
  );
}
