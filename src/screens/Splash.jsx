import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import REX from "../components/REX";
import { cache } from "../lib/cache";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const profile = cache.getProfile();
      const plan = cache.getPlan();
      navigate(profile && plan ? "/dashboard" : "/onboarding", { replace: true });
    }, 2600);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center"
      style={{ background: "var(--c-bg)" }}>

      {/* Glow orb behind REX */}
      <div className="absolute" style={{ width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(var(--c-accent-rgb),0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* REX enters from bottom */}
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 14, stiffness: 100, delay: 0.2 }}
      >
        <REX state="celebrating" size="lg" />
      </motion.div>

      {/* App name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center"
      >
        <h1 className="text-5xl font-extrabold tracking-tight"
          style={{ color: "var(--c-text)", textShadow: "0 0 30px rgba(var(--c-accent-rgb),0.6)" }}>
          FitCoach<span style={{ color: "var(--c-accent)" }}>AI</span>
        </h1>
        <p className="mt-2 text-base font-medium" style={{ color: "var(--c-sub)" }}>
          Your intelligent gym partner
        </p>
      </motion.div>

      {/* Speech bubble from REX */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 rounded-2xl px-5 py-3 text-sm font-semibold"
        style={{ background: "rgba(var(--c-accent-rgb),0.15)", border: "1px solid rgba(var(--c-accent-rgb),0.3)", color: "var(--c-text)" }}
      >
        🤖 Ready to get gains? Let's go!
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full overflow-hidden"
        style={{ width: 160, height: 3, background: "rgba(var(--c-accent-rgb),0.2)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--c-accent)", boxShadow: "0 0 8px var(--c-accent)" }}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.4, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}
