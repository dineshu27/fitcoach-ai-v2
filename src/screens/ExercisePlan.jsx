import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, Target, Moon } from "lucide-react";
import ExerciseCard from "../components/ExerciseCard";
import REX from "../components/REX";
import { cache } from "../lib/cache";

const SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const TYPE_STYLE = {
  Gym: { bg: "rgba(108,99,255,0.2)", border: "rgba(108,99,255,0.5)", color: "#6C63FF" },
  Cardio: { bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.4)", color: "#FF6B6B" },
  Outdoor: { bg: "rgba(78,205,196,0.15)", border: "rgba(78,205,196,0.4)", color: "#4ECDC4" },
  Home: { bg: "rgba(255,230,109,0.15)", border: "rgba(255,230,109,0.4)", color: "#FFE66D" },
  Rest: { bg: "rgba(136,136,170,0.1)", border: "rgba(136,136,170,0.2)", color: "#8888AA" },
};

export default function ExercisePlan() {
  const plan = cache.getPlan();
  const profile = cache.getProfile();
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const [day, setDay] = useState(todayIdx);

  if (!plan) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#0A0A0F" }}>
      <p style={{ color: "#8888AA" }}>No plan found.</p>
    </div>
  );

  const dayPlan = plan.weekPlan?.[day];
  const w = dayPlan?.workout;
  const isRest = w?.type === "Rest";
  const ts = TYPE_STYLE[w?.type] || TYPE_STYLE.Gym;
  const hasCondition = profile?.conditions?.some((c) => c !== "None");

  return (
    <div className="min-h-screen pb-nav" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <div className="px-4 pt-safe pt-6 pb-4" style={{ borderBottom: "1px solid rgba(108,99,255,0.12)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "#F0F0FF" }}>Exercise Plan</h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm" style={{ color: "#8888AA" }}>{profile?.daysPerWeek} workout days/week</p>
          {(profile?.bodyFocus || plan?.bodyFocus) && (
            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "#6C63FF" }}>
              <Target size={10} /> {profile?.bodyFocus || plan?.bodyFocus}
            </span>
          )}
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 mt-4 pb-1">
        {SHORT.map((d, i) => {
          const isR = plan.weekPlan?.[i]?.workout?.type === "Rest";
          return (
            <button key={d} onClick={() => setDay(i)}
              className="flex-shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all"
              style={{
                background: day === i ? "#6C63FF" : "rgba(26,26,38,0.8)",
                border: day === i ? "1px solid #6C63FF" : "1px solid rgba(108,99,255,0.15)",
                color: day === i ? "#fff" : "#8888AA",
                boxShadow: day === i ? "0 0 10px rgba(108,99,255,0.35)" : "none",
              }}>
              {d}{isR ? " 💤" : ""}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-4">
        {dayPlan && (
          <motion.div key={day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Day header */}
            <div className="rounded-2xl p-4 glass">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "#F0F0FF" }}>{FULL[day]}</h2>
                  <p className="text-sm mt-0.5" style={{ color: "#8888AA" }}>{w?.focus || "Rest day"}</p>
                  {!isRest && (
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color }}>
                        {w?.type}
                      </span>
                      {w?.duration && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#8888AA" }}>
                          <Clock size={12} /> {w.duration}
                        </span>
                      )}
                      {w?.exercises?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#8888AA" }}>
                          <Flame size={12} /> {w.exercises.length} exercises
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {isRest && <Moon size={28} style={{ color: "#8888AA" }} />}
              </div>
            </div>

            {isRest ? (
              <div className="rounded-2xl p-5 glass text-center">
                <div className="flex justify-center mb-4">
                  <REX state="idle" size="md" />
                </div>
                <p className="font-bold mb-1" style={{ color: "#F0F0FF" }}>Rest & Recovery Day</p>
                <p className="text-sm mb-4" style={{ color: "#8888AA" }}>Let REX recharge too 🤖</p>
                {w?.exercises?.length > 0 ? (
                  <div className="space-y-2 text-left">
                    <p className="text-xs font-semibold mb-2" style={{ color: "#6C63FF" }}>Light mobility work:</p>
                    {w.exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} />)}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-left" style={{ color: "#8888AA" }}>
                    {["Light 20–30 min walk", "Full body stretching 10 min", "Aim for 2L+ water", "Get 7–9 hours sleep"].map((t, i) => (
                      <p key={i}>• {t}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {w?.warmup && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(255,230,109,0.06)", border: "1px solid rgba(255,230,109,0.2)" }}>
                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#FFE66D" }}>Warm-up</p>
                    <p className="text-sm" style={{ color: "#F0F0FF" }}>{w.warmup}</p>
                  </div>
                )}

                {w?.exercises?.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2" style={{ color: "#F0F0FF" }}>Exercises</h3>
                    <div className="space-y-2">
                      {w.exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} />)}
                    </div>
                  </div>
                )}

                {w?.cooldown && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)" }}>
                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#4ECDC4" }}>Cool-down</p>
                    <p className="text-sm" style={{ color: "#F0F0FF" }}>{w.cooldown}</p>
                  </div>
                )}
              </>
            )}

            {hasCondition && plan.conditionTips?.[1] && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,230,109,0.06)", border: "1px solid rgba(255,230,109,0.2)" }}>
                <p className="text-xs font-bold uppercase mb-1" style={{ color: "#FFE66D" }}>Condition note</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8888AA" }}>{plan.conditionTips[1]}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
