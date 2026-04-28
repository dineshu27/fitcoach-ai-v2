import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalOverlay, rewardReveal } from "../motion/variants";
import { pressablePrimary, pressable } from "../motion/presets";
import { confettiBurst } from "../motion/confetti";
import { useCountUp } from "../motion/useCountUp";
import { useAchievement } from "../hooks/useAchievement";

function StreakContent({ payload }) {
  const days = payload?.days || 0;
  const countVal = useCountUp(0, days, "confident");
  const milestones = [3, 7, 14, 30, 60, 100, 365];
  const nextMilestone = milestones.find(m => m > days) || days + 30;
  const prevMilestone = [...milestones].reverse().find(m => m < days) || 0;
  const progress = prevMilestone < nextMilestone
    ? ((days - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100;

  return (
    <>
      <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 14px" }}>
        <div style={{ position: "absolute", inset: -10, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)" }} />
        <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#2A1F0F", border: "2px solid #FBBF24", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <span style={{ fontSize: 40 }}>🔥</span>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#FBBF24", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 6 }}>STREAK MILESTONE</p>
      <p style={{ fontSize: 32, fontWeight: 500, color: "var(--c-text)", letterSpacing: "-0.5px", marginBottom: 4 }}>{countVal} Day Streak!</p>
      <p style={{ fontSize: 13, color: "var(--c-sub)", marginBottom: 20 }}>You're on fire — keep it going 🔥</p>
      <div style={{ background: "#141210", border: "1px solid var(--c-border)", borderRadius: 14, padding: "12px 14px", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "var(--c-sub)" }}>Next milestone</span>
          <span style={{ fontSize: 11, color: "var(--c-text)" }}>{nextMilestone} days</span>
        </div>
        <div style={{ height: 5, borderRadius: 9999, background: "var(--c-border)", overflow: "hidden", marginBottom: 6 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", background: "#FBBF24", borderRadius: 9999 }} />
        </div>
        <p style={{ fontSize: 10, color: "var(--c-sub)" }}>{nextMilestone - days} days to go</p>
      </div>
    </>
  );
}

function PersonalBestContent({ payload }) {
  const { exerciseName = "", weight = 0, reps = 0, prevWeight = 0, prevReps = 0 } = payload || {};
  return (
    <>
      <svg width={90} height={90} viewBox="0 0 90 90" style={{ margin: "0 auto 14px", display: "block" }}>
        <polygon points="45,5 85,30 85,70 45,90 5,70 5,30" fill="url(#hexGrad)" stroke="#FC4C02" strokeWidth={1.5} />
        <defs>
          <linearGradient id="hexGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <text x={45} y={55} textAnchor="middle" fontSize={26} fontWeight={500} fill="#141210" fontFamily="Space Grotesk, sans-serif">PR</text>
      </svg>
      <p style={{ fontSize: 11, color: "#FBBF24", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 6 }}>PERSONAL BEST</p>
      <p style={{ fontSize: 22, fontWeight: 500, color: "var(--c-text)", marginBottom: 4 }}>{exerciseName}</p>
      <p style={{ fontSize: 15, color: "var(--c-text)", marginBottom: 4 }}>{weight}kg × {reps} reps</p>
      <p style={{ fontSize: 12, color: "var(--c-sub)" }}>Up from {prevWeight}kg × {prevReps}</p>
    </>
  );
}

function WeeklyGoalContent({ payload }) {
  const { workoutsCompleted = 0 } = payload || {};
  const r = 35;
  const circ = 2 * Math.PI * r;
  return (
    <>
      <svg width={90} height={90} viewBox="0 0 90 90" style={{ margin: "0 auto 14px", display: "block" }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke="var(--c-border)" strokeWidth={10} />
        <motion.circle cx={45} cy={45} r={r} fill="none" stroke="var(--c-cool)" strokeWidth={10}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          transform="rotate(-90 45 45)" />
        <text x={45} y={52} textAnchor="middle" fontSize={20} fill="#FBBF24" fontFamily="Space Grotesk">🏆</text>
      </svg>
      <p style={{ fontSize: 11, color: "var(--c-cool)", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 6 }}>WEEKLY GOAL</p>
      <p style={{ fontSize: 32, fontWeight: 500, color: "var(--c-text)", marginBottom: 4 }}>Week complete!</p>
      <p style={{ fontSize: 13, color: "var(--c-sub)" }}>Keep crushing it 💚 ({workoutsCompleted} workouts)</p>
    </>
  );
}

export default function AchievementOverlay() {
  const { current, dismiss } = useAchievement();
  const timerRef = useRef(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!current) return;
    const isMilestone = current.type === "streak_milestone" || current.type === "weekly_goal";
    if (!reduced) confettiBurst(isMilestone ? "celebration" : "soft");
    timerRef.current = setTimeout(dismiss, 8000);
    return () => clearTimeout(timerRef.current);
  }, [current, dismiss, reduced]);

  function handleShare() {
    const { type, payload } = current || {};
    let text = "I'm crushing my fitness goals with FiTAi! 💪";
    if (type === "streak_milestone") text = `I just hit a ${payload?.days} day streak on FiTAi! 🔥`;
    if (type === "personal_best") text = `New personal best: ${payload?.exerciseName} ${payload?.weight}kg × ${payload?.reps} reps! 💪`;
    if (type === "weekly_goal") text = `Week complete! ${payload?.workoutsCompleted} workouts done 🏆`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
  }

  return (
    <AnimatePresence>
      {current && (
        <motion.div variants={modalOverlay} initial="hidden" animate="show" exit="exit"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={dismiss}
        >
          <motion.div variants={rewardReveal} initial="hidden" animate="show" exit="exit"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 430, padding: "20px 20px 32px", textAlign: "center" }}
            onClick={e => e.stopPropagation()}
            onMouseEnter={() => clearTimeout(timerRef.current)}
            onMouseLeave={() => { timerRef.current = setTimeout(dismiss, 4000); }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--c-border)", margin: "0 auto 18px" }} />
            {current.type === "streak_milestone" && <StreakContent payload={current.payload} />}
            {current.type === "personal_best" && <PersonalBestContent payload={current.payload} />}
            {current.type === "weekly_goal" && <WeeklyGoalContent payload={current.payload} />}
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <motion.button {...pressable} onClick={handleShare}
                style={{ flex: 1, padding: "10px 0", borderRadius: 14, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-text)", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
                Share
              </motion.button>
              <motion.button {...pressablePrimary} onClick={dismiss}
                style={{ flex: 2, padding: "10px 0", borderRadius: 14, background: "var(--c-accent)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                Continue →
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
