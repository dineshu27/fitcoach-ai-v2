import { useEffect } from "react";
import { motion } from "framer-motion";
import { rewardReveal, modalOverlay } from "../motion/variants";
import { confettiBurst } from "../motion/confetti";

export default function AchievementToast({ type = "personal_best", label = "", onDismiss }) {
  const isMilestone = type === "streak" || type === "milestone";

  useEffect(() => {
    confettiBurst(isMilestone ? "celebration" : "soft");
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss, isMilestone]);

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
