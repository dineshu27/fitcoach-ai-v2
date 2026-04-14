import { useState } from "react";
import { motion } from "framer-motion";
import MacroRing from "../components/MacroRing";
import MealCard from "../components/MealCard";
import { cache } from "../lib/cache";

const SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function DietPlan() {
  const plan = cache.getPlan();
  const weekLen = plan?.weekPlan?.length || 7;
  const today = new Date().getDay();
  const rawIdx = today === 0 ? 6 : today - 1;
  const todayIdx = Math.min(rawIdx, weekLen - 1);
  const [day, setDay] = useState(todayIdx);

  if (!plan) return (
    <div className="flex min-h-screen items-center justify-center text-center px-8" style={{ background: "var(--c-bg)" }}>
      <p style={{ color: "var(--c-sub)" }}>No plan found. Go back and create one.</p>
    </div>
  );

  const dayPlan = plan.weekPlan?.[day];

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>
      {/* Header */}
      <div className="px-4 pt-safe pt-6 pb-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--c-text)" }}>Diet Plan</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--c-sub)" }}>{plan.calories} kcal · {plan.macros?.protein}g protein daily target</p>
      </div>

      {/* Ring + macros */}
      <div className="mx-4 mt-4 rounded-2xl p-4 glass">
        <div className="flex items-center gap-4">
          <MacroRing consumed={0} target={plan.calories} size={130} color="var(--c-accent)" />
          <div className="flex-1 grid grid-cols-2 gap-2">
            {[
              { label: "Protein", val: plan.macros?.protein, color: "var(--c-accent)" },
              { label: "Carbs", val: plan.macros?.carbs, color: "var(--c-warn)" },
              { label: "Fat", val: plan.macros?.fat, color: "#FF6B6B" },
              { label: "Fibre", val: plan.macros?.fibre, color: "#4ECDC4" },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-xl p-2 text-center"
                style={{ background: `${color}11`, border: `1px solid ${color}33` }}>
                <p className="text-sm font-extrabold" style={{ color }}>{val}g</p>
                <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 mt-4 pb-1">
        {SHORT.map((d, i) => {
          const isRest = plan.weekPlan?.[i]?.workout?.type === "Rest";
          return (
            <button key={d} onClick={() => setDay(i)}
              className="flex-shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all"
              style={{
                background: day === i ? "var(--c-accent)" : "var(--c-card)",
                border: day === i ? "1px solid var(--c-accent)" : "1px solid rgba(var(--c-accent-rgb),0.15)",
                color: day === i ? "#fff" : "var(--c-sub)",
                boxShadow: day === i ? "0 0 10px rgba(var(--c-accent-rgb),0.35)" : "none",
              }}>
              {d}{isRest ? "😴" : ""}
            </button>
          );
        })}
      </div>

      {/* Meals */}
      <div className="px-4 mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold" style={{ color: "var(--c-text)" }}>{FULL[day]}</h2>
          {dayPlan?.workout?.type === "Rest" && (
            <span className="rounded-full px-2.5 py-0.5 text-xs" style={{ background: "var(--c-pill-inactive)", color: "var(--c-sub)" }}>Rest day</span>
          )}
        </div>

        {dayPlan?.meals ? (
          Object.entries(dayPlan.meals).map(([type, meal], i) => (
            <motion.div key={`${day}-${type}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <MealCard type={type} meal={meal} />
            </motion.div>
          ))
        ) : (
          <div className="rounded-2xl p-6 text-center glass">
            <p style={{ color: "var(--c-sub)" }}>No meal data for this day.</p>
          </div>
        )}
      </div>

      {/* Diet tips */}
      {plan.dietTips?.length > 0 && (
        <div className="mx-4 mt-6 rounded-2xl p-4" style={{ background: "var(--c-cool-bg)", border: "1px solid var(--c-cool-border)" }}>
          <h3 className="font-bold mb-3" style={{ color: "#4ECDC4" }}>Nutrition tips</h3>
          <ol className="space-y-2">
            {plan.dietTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--c-sub)" }}>
                <span className="font-bold flex-shrink-0" style={{ color: "#4ECDC4" }}>{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
