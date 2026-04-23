import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Flame, Target, Moon, Zap, ChevronRight } from "lucide-react";
import ExerciseCard from "../components/ExerciseCard";
import StretchCard from "../components/StretchCard";
import REX from "../components/REX";
import { cache } from "../lib/cache";

const SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const TYPE_STYLE = {
  Gym: { bg: "rgba(var(--c-accent-rgb),0.2)", border: "rgba(var(--c-accent-rgb),0.5)", color: "var(--c-accent)" },
  Cardio: { bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.4)", color: "#FF6B6B" },
  Outdoor: { bg: "rgba(78,205,196,0.15)", border: "rgba(78,205,196,0.4)", color: "#4ECDC4" },
  Home: { bg: "var(--c-warn-bg)", border: "var(--c-warn-border)", color: "var(--c-warn)" },
  Rest: { bg: "rgba(136,136,170,0.1)", border: "rgba(136,136,170,0.2)", color: "var(--c-sub)" },
};

export default function ExercisePlan() {
  const navigate = useNavigate();
  const plan = cache.getPlan();
  const profile = cache.getProfile();
  const weekLen = plan?.weekPlan?.length || 7;
  const today = new Date().getDay();
  const rawIdx = today === 0 ? 6 : today - 1;
  const todayIdx = Math.min(rawIdx, weekLen - 1);
  const [day, setDay] = useState(todayIdx);

  if (!plan) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--c-bg)" }}>
      <p style={{ color: "var(--c-sub)" }}>No plan found.</p>
    </div>
  );

  const dayPlan = plan.weekPlan?.[day];
  const w = dayPlan?.workout;
  const isRest = w?.type === "Rest";
  const ts = TYPE_STYLE[w?.type] || TYPE_STYLE.Gym;
  const hasCondition = profile?.conditions?.some((c) => c !== "None");

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>
      {/* Header */}
      <div className="px-4 safe-top pt-6 pb-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--c-text)" }}>Exercise Plan</h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm" style={{ color: "var(--c-sub)" }}>{profile?.daysPerWeek} workout days/week</p>
          {(profile?.bodyFocus || plan?.bodyFocus) && (
            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: "rgba(var(--c-accent-rgb),0.15)", border: "1px solid rgba(var(--c-accent-rgb),0.3)", color: "var(--c-accent)" }}>
              <Target size={10} /> {profile?.bodyFocus || plan?.bodyFocus}
            </span>
          )}
        </div>
      </div>

      {/* ── Today's Pick ────────────────────────────────────────── */}
      {(() => {
        const todayW = plan.weekPlan?.[todayIdx]?.workout;
        const picks = todayW?.exercises?.slice(0, 2) || [];
        if (!picks.length || todayW?.type === "Rest") return null;
        return (
          <div className="px-4 mt-4">
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(124,109,255,0.15), rgba(124,109,255,0.06))",
                border: "1px solid var(--c-border-bright)",
              }}>
              <div className="flex items-center gap-2 px-4 pt-3 pb-2" style={{ borderBottom: "1px solid var(--c-border)" }}>
                <Zap size={14} style={{ color: "var(--c-accent)" }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--c-accent)" }}>Today's Pick</span>
                <span className="ml-auto text-[10px]" style={{ color: "var(--c-sub)" }}>{todayW?.focus}</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                {picks.map((ex) => (
                  <div key={ex.name} className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ background: "var(--c-card)", border: "1px solid var(--c-border)" }}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--c-text)" }}>{ex.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>
                        {ex.sets} × {ex.reps || ex.duration}{ex.muscleGroup ? ` · ${ex.muscleGroup}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/log", { state: { preloadExercise: ex } })}
                      className="rounded-lg px-2.5 py-1 text-xs font-bold transition-all active:scale-95"
                      style={{ background: "var(--c-accent)", color: "#fff" }}>
                      + Log
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 mt-4 pb-1">
        {SHORT.map((d, i) => {
          const isR = plan.weekPlan?.[i]?.workout?.type === "Rest";
          return (
            <button key={d} onClick={() => setDay(i)}
              className="flex-shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all"
              style={{
                background: day === i ? "var(--c-accent)" : "var(--c-card)",
                border: day === i ? "1px solid var(--c-accent)" : "1px solid rgba(var(--c-accent-rgb),0.15)",
                color: day === i ? "#fff" : "var(--c-sub)",
                boxShadow: day === i ? "0 0 10px rgba(var(--c-accent-rgb),0.35)" : "none",
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
                  <h2 className="text-lg font-bold" style={{ color: "var(--c-text)" }}>{FULL[day]}</h2>
                  <p className="text-sm mt-0.5" style={{ color: "var(--c-sub)" }}>{w?.focus || "Rest day"}</p>
                  {!isRest && (
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color }}>
                        {w?.type}
                      </span>
                      {w?.duration && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--c-sub)" }}>
                          <Clock size={12} /> {w.duration}
                        </span>
                      )}
                      {w?.exercises?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--c-sub)" }}>
                          <Flame size={12} /> {w.exercises.length} exercises
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {isRest && <Moon size={28} style={{ color: "var(--c-sub)" }} />}
              </div>
            </div>

            {isRest ? (
              <div className="rounded-2xl p-5 glass text-center">
                <div className="flex justify-center mb-4">
                  <REX state="idle" size="md" />
                </div>
                <p className="font-bold mb-1" style={{ color: "var(--c-text)" }}>Rest & Recovery Day</p>
                <p className="text-sm mb-4" style={{ color: "var(--c-sub)" }}>Let APEX power down too ⚡</p>
                {w?.exercises?.length > 0 ? (
                  <div className="space-y-2 text-left">
                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--c-accent)" }}>Light mobility work:</p>
                    {w.exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} />)}
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-left" style={{ color: "var(--c-sub)" }}>
                    {["Light 20–30 min walk", "Full body stretching 10 min", "Aim for 2L+ water", "Get 7–9 hours sleep"].map((t, i) => (
                      <p key={i}>• {t}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Pre-workout stretch */}
                <StretchCard type="pre" workoutFocus={w?.focus} />

                {w?.warmup && (
                  <div className="rounded-xl p-3" style={{ background: "var(--c-warn-bg)", border: "1px solid var(--c-warn-border)" }}>
                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--c-warn)" }}>Warm-up notes</p>
                    <p className="text-sm" style={{ color: "var(--c-text)" }}>{w.warmup}</p>
                  </div>
                )}

                {w?.exercises?.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2" style={{ color: "var(--c-text)" }}>Exercises</h3>
                    <div className="space-y-2">
                      {w.exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} index={i} />)}
                    </div>
                  </div>
                )}

                {/* Post-workout stretch */}
                <StretchCard type="post" workoutFocus={w?.focus} />

                {w?.cooldown && (
                  <div className="rounded-xl p-3" style={{ background: "var(--c-cool-bg)", border: "1px solid var(--c-cool-border)" }}>
                    <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#4ECDC4" }}>Cool-down notes</p>
                    <p className="text-sm" style={{ color: "var(--c-text)" }}>{w.cooldown}</p>
                  </div>
                )}
              </>
            )}

            {hasCondition && plan.conditionTips?.[1] && (
              <div className="rounded-2xl p-4" style={{ background: "var(--c-warn-bg)", border: "1px solid var(--c-warn-border)" }}>
                <p className="text-xs font-bold uppercase mb-1" style={{ color: "var(--c-warn)" }}>Condition note</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--c-sub)" }}>{plan.conditionTips[1]}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
