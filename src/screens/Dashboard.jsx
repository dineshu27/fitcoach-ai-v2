import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Droplets, Dumbbell, Zap, ChevronRight, Info, Target } from "lucide-react";
import REX from "../components/REX";
import { cache } from "../lib/cache";
import { bmiCategory, dayStreak } from "../lib/calculations";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = cache.getProfile();
  const plan = cache.getPlan();
  const stats = cache.getStats();

  if (!profile || !plan) { navigate("/onboarding", { replace: true }); return null; }

  const dayName = DAYS[new Date().getDay()];
  const todayPlan = plan.weekPlan?.find((d) => d.day === dayName) || plan.weekPlan?.[0];
  const bmiCat = bmiCategory(plan.bmi);
  const streak = dayStreak(stats.startDate);
  const goalList = Array.isArray(profile.goals) ? profile.goals : [profile.goal || ""].filter(Boolean);
  const hasCondition = profile.conditions?.some((c) => c !== "None");
  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const statCards = [
    { label: "Calories", value: `${plan.calories}`, sub: "kcal target", Icon: Flame, color: "#FF6B6B", glow: "rgba(255,107,107,0.2)" },
    { label: "Water", value: `${plan.water || "2.5"}L`, sub: "daily goal", Icon: Droplets, color: "#4ECDC4", glow: "rgba(78,205,196,0.2)" },
    { label: "Workout", value: todayPlan?.workout?.type || "Rest", sub: todayPlan?.workout?.duration || "today", Icon: Dumbbell, color: "#6C63FF", glow: "rgba(108,99,255,0.2)" },
    { label: "Streak", value: `${streak}d`, sub: "days active", Icon: Zap, color: "#FFE66D", glow: "rgba(255,230,109,0.2)" },
    { label: "Focus", value: (profile.bodyFocus || "Full").split(" ")[0], sub: profile.bodyFocus || "Full body", Icon: Target, color: "#6C63FF", glow: "rgba(108,99,255,0.2)" },
  ];

  return (
    <div className="min-h-screen pb-nav" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <div className="px-4 pt-safe pt-6 pb-5" style={{ background: "linear-gradient(180deg, rgba(108,99,255,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(108,99,255,0.1)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs" style={{ color: "#8888AA" }}>{dateStr}</p>
            <h1 className="mt-0.5 text-2xl font-bold" style={{ color: "#F0F0FF" }}>
              {greeting()}, {profile.name?.split(" ")[0]} 👋
            </h1>
            {/* Goal pills */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {goalList.map((g) => (
                <span key={g} className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.3)", color: "#6C63FF" }}>
                  {g}
                </span>
              ))}
            </div>
            {plan.summary && <p className="mt-2 text-xs leading-relaxed max-w-xs" style={{ color: "#8888AA" }}>{plan.summary}</p>}
          </div>
          <div className="flex-shrink-0">
            <REX state="idle" size="sm" />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 mt-5">
        {/* Stats horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {statCards.map(({ label, value, sub, Icon, color, glow }) => (
            <div key={label} className="flex-shrink-0 w-32 rounded-2xl p-3"
              style={{ background: "rgba(18,18,26,0.9)", border: "1px solid rgba(108,99,255,0.15)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: glow }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="mt-2 text-xl font-extrabold" style={{ color: "#F0F0FF" }}>{value}</p>
              <p className="text-[11px] font-semibold" style={{ color }}>{label}</p>
              <p className="text-[10px]" style={{ color: "#8888AA" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Condition tip */}
        {hasCondition && plan.conditionNote && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "rgba(108,99,255,0.08)", borderLeft: "3px solid #6C63FF" }}>
            <Info size={16} style={{ color: "#6C63FF", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: "#6C63FF" }}>Health tip for you</p>
              <p className="text-xs leading-relaxed" style={{ color: "#8888AA" }}>{plan.conditionNote}</p>
            </div>
          </motion.div>
        )}

        {/* Today's meals */}
        {todayPlan?.meals && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold" style={{ color: "#F0F0FF" }}>Today's meals</h2>
              <button onClick={() => navigate("/diet")} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#6C63FF" }}>
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(todayPlan.meals).map(([type, meal]) => (
                <button key={type} onClick={() => navigate("/diet")}
                  className="rounded-2xl p-3 text-left transition-all active:scale-95"
                  style={{ background: "rgba(18,18,26,0.9)", border: "1px solid rgba(108,99,255,0.12)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#8888AA" }}>{type}</p>
                  <p className="mt-1 text-xs font-bold leading-tight" style={{ color: "#F0F0FF" }}>{meal.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#6C63FF" }}>{meal.calories} kcal</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today's workout */}
        {todayPlan?.workout && (
          <button onClick={() => navigate("/exercise")}
            className="w-full rounded-2xl p-4 text-left transition-all active:scale-95 gradient-border"
            style={{ background: "rgba(18,18,26,0.9)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8888AA" }}>Today's workout</p>
                <p className="mt-1 font-bold text-base" style={{ color: "#F0F0FF" }}>{todayPlan.workout.focus}</p>
                <div className="mt-2 flex gap-2">
                  <span className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.4)", color: "#6C63FF" }}>
                    {todayPlan.workout.type}
                  </span>
                  {todayPlan.workout.duration && (
                    <span className="rounded-full px-2.5 py-1 text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#8888AA" }}>
                      {todayPlan.workout.duration}
                    </span>
                  )}
                  {todayPlan.workout.exercises?.length > 0 && (
                    <span className="rounded-full px-2.5 py-1 text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#8888AA" }}>
                      {todayPlan.workout.exercises.length} exercises
                    </span>
                  )}
                </div>
              </div>
              <Dumbbell size={28} style={{ color: "#6C63FF", opacity: 0.7 }} />
            </div>
          </button>
        )}

        {/* Ask REX */}
        <button onClick={() => navigate("/coach")}
          className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(255,107,107,0.08) 100%)",
            border: "1px solid rgba(108,99,255,0.25)" }}>
          <REX state="idle" size="sm" />
          <div className="text-left">
            <p className="font-bold" style={{ color: "#F0F0FF" }}>Ask REX</p>
            <p className="text-xs" style={{ color: "#8888AA" }}>Your AI coach is ready to help</p>
          </div>
          <ChevronRight size={18} style={{ color: "#6C63FF", marginLeft: "auto" }} />
        </button>

        {/* Macros */}
        {plan.macros && (
          <div>
            <h2 className="font-bold mb-3" style={{ color: "#F0F0FF" }}>Daily targets</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Protein", val: plan.macros.protein, color: "#6C63FF" },
                { label: "Carbs", val: plan.macros.carbs, color: "#FFE66D" },
                { label: "Fat", val: plan.macros.fat, color: "#FF6B6B" },
                { label: "Fibre", val: plan.macros.fibre, color: "#4ECDC4" },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(18,18,26,0.9)", border: `1px solid ${color}33` }}>
                  <p className="text-base font-extrabold" style={{ color }}>{val}g</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#8888AA" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
