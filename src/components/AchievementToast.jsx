import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { rewardReveal, modalOverlay } from "../motion/variants";

const CONFETTI_COLORS = ["#FC4C02", "#FBBF24", "#4ECDC4", "#6C63FF", "#F87171", "#34D399"];

function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: 8 + (i * 4.1 + 5) % 84,
      size: 4 + (i * 3 + 1) % 6,
      delay: (i * 0.06) % 0.55,
      duration: 0.85 + (i * 0.09) % 0.9,
      dx: ((i * 11 + 7) % 70) - 35,
      dy: 90 + (i * 17) % 130,
      rotate: (i * 47) % 360,
    })),
  []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, background: p.color, left: `${p.left}%`, top: -8 }}
          animate={{ y: p.dy, x: p.dx, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export default function AchievementToast({ type = "personal_best", label = "", onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isPB = type === "personal_best";

  return (
    <motion.div
      variants={modalOverlay}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onDismiss}
    >
      <motion.div
        variants={rewardReveal}
        initial="hidden"
        animate="show"
        exit="exit"
        className="relative w-full max-w-xs rounded-3xl p-8 text-center overflow-hidden"
        style={{
          background: "var(--c-card)",
          border: "1px solid var(--c-border-bright)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <Confetti />
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 16 }}>
          {isPB ? "🏆" : "🔥"}
        </div>
        <p className="text-xl font-extrabold" style={{ color: "var(--c-accent)" }}>
          {isPB ? "Personal Best!" : "Streak Milestone!"}
        </p>
        {label && (
          <p className="text-sm mt-2" style={{ color: "var(--c-sub)" }}>{label}</p>
        )}
        <p className="text-xs mt-5 font-semibold" style={{ color: "var(--c-sub)" }}>
          Tap to dismiss
        </p>
      </motion.div>
    </motion.div>
  );
}
