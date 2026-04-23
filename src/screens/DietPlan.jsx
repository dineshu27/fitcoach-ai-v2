import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Zap, UtensilsCrossed } from "lucide-react";
import MacroRing from "../components/MacroRing";
import MealCard from "../components/MealCard";
import { cache } from "../lib/cache";

const SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const FULL  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

/* ── Per-meal predefined food suggestions ─────────────────────── */
const MEAL_SUGGESTIONS = {
  breakfast: [
    { name: "Oats + Banana",     kcal: 290, icon: "🥣" },
    { name: "Scrambled Eggs",    kcal: 215, icon: "🍳" },
    { name: "Greek Yoghurt",     kcal: 130, icon: "🫙" },
    { name: "Avocado Toast",     kcal: 320, icon: "🥑" },
    { name: "Protein Shake",     kcal: 185, icon: "💪" },
    { name: "Smoothie Bowl",     kcal: 340, icon: "🍓" },
  ],
  lunch: [
    { name: "Chicken + Rice",    kcal: 490, icon: "🍗" },
    { name: "Tuna Salad",        kcal: 280, icon: "🥗" },
    { name: "Veggie Wrap",       kcal: 350, icon: "🌯" },
    { name: "Salmon + Quinoa",   kcal: 460, icon: "🐟" },
    { name: "Pasta + Sauce",     kcal: 420, icon: "🍝" },
    { name: "Chicken Caesar",    kcal: 380, icon: "🫙" },
  ],
  dinner: [
    { name: "Grilled Salmon",    kcal: 380, icon: "🐟" },
    { name: "Chicken Stir Fry",  kcal: 430, icon: "🥦" },
    { name: "Beef + Veg Bowl",   kcal: 510, icon: "🥩" },
    { name: "Turkey Curry",      kcal: 450, icon: "🍛" },
    { name: "Egg Fried Rice",    kcal: 390, icon: "🍚" },
    { name: "Lentil Soup",       kcal: 260, icon: "🫕" },
  ],
  snack: [
    { name: "Almonds (30g)",     kcal: 174, icon: "🥜" },
    { name: "Protein Bar",       kcal: 200, icon: "🍫" },
    { name: "Apple + Peanut Butter", kcal: 185, icon: "🍎" },
    { name: "Rice Cakes",        kcal: 77,  icon: "🍘" },
    { name: "Cottage Cheese",    kcal: 147, icon: "🧀" },
    { name: "Banana",            kcal: 105, icon: "🍌" },
  ],
};

const MEAL_ACCENT = {
  breakfast: "var(--c-accent)",
  lunch:     "var(--c-warn)",
  dinner:    "#F87171",
  snack:     "var(--c-cool)",
  snacks:    "var(--c-cool)",
};

function SuggestionRow({ mealType, onTap }) {
  const key = mealType === "snacks" ? "snack" : mealType;
  const items = MEAL_SUGGESTIONS[key] || MEAL_SUGGESTIONS.snack;
  const color = MEAL_ACCENT[mealType] || "var(--c-accent)";
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2" style={{ width: "max-content" }}>
        {items.map(({ name, kcal, icon }) => (
          <button key={name}
            onClick={() => onTap(name)}
            className="flex flex-col items-center gap-1 rounded-2xl p-3 transition-all active:scale-95 flex-shrink-0"
            style={{ background: "var(--c-card)", border: `1px solid var(--c-border)`, minWidth: 90, boxShadow: "var(--c-card-shadow)" }}>
            <span className="text-2xl">{icon}</span>
            <p className="text-[10px] font-bold text-center leading-tight" style={{ color: "var(--c-text)" }}>{name}</p>
            <p className="text-[9px] font-semibold" style={{ color }}>{kcal} kcal</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DietPlan() {
  const navigate = useNavigate();
  const plan = cache.getPlan();
  const weekLen = plan?.weekPlan?.length || 7;
  const today = new Date().getDay();
  const rawIdx = today === 0 ? 6 : today - 1;
  const todayIdx = Math.min(rawIdx, weekLen - 1);
  const [day, setDay] = useState(todayIdx);
  const [expandMeal, setExpandMeal] = useState(null);

  if (!plan) return (
    <div className="flex min-h-screen items-center justify-center px-8 text-center" style={{ background: "var(--c-bg)" }}>
      <p style={{ color: "var(--c-sub)" }}>No plan found. Go back and create one.</p>
    </div>
  );

  const todayPlan = plan.weekPlan?.[todayIdx];
  const dayPlan   = plan.weekPlan?.[day];

  function handleSuggestionTap(foodName) {
    navigate("/log", { state: { preloadFood: foodName } });
  }

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-4 safe-top pt-6 pb-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--c-accent-bg)" }}>
            <UtensilsCrossed size={18} style={{ color: "var(--c-accent)" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--c-text)" }}>Diet Plan</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--c-sub)" }}>
              {plan.calories} kcal · {plan.macros?.protein}g protein daily
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">

        {/* ── Today's meals highlight ─────────────────────────── */}
        {todayPlan?.meals && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} style={{ color: "var(--c-accent)" }} />
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--c-accent)" }}>
                Today's Meals
              </h2>
            </div>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "var(--c-card)", border: "1px solid var(--c-border-bright)", boxShadow: "var(--c-card-shadow)" }}>
              {Object.entries(todayPlan.meals).map(([type, meal], idx, arr) => {
                const borderColor = MEAL_ACCENT[type] || "var(--c-accent)";
                const isLast = idx === arr.length - 1;
                return (
                  <div key={type}
                    style={{ borderBottom: !isLast ? "1px solid var(--c-border)" : "none" }}>
                    {/* Meal row */}
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.99]"
                      onClick={() => setExpandMeal(expandMeal === type ? null : type)}>
                      <div style={{ width: 3, alignSelf: "stretch", background: borderColor, borderRadius: 2, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide capitalize" style={{ color: borderColor }}>{type}</p>
                        <p className="text-sm font-bold leading-tight mt-0.5 truncate" style={{ color: "var(--c-text)" }}>{meal.name}</p>
                        {meal.macros && (
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--c-sub)" }}>
                            P {meal.macros.protein}g · C {meal.macros.carbs}g · F {meal.macros.fat}g
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold" style={{ color: borderColor }}>{meal.calories} kcal</p>
                      </div>
                    </button>

                    {/* Expanded: quick suggestions */}
                    {expandMeal === type && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="px-4 pb-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--c-sub)" }}>
                            Quick add suggestions →
                          </p>
                          <SuggestionRow mealType={type} onTap={handleSuggestionTap} />
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Log food CTA */}
            <button
              onClick={() => navigate("/log")}
              className="flex w-full items-center justify-center gap-2 mt-3 rounded-2xl py-3 text-sm font-bold transition-all active:scale-95"
              style={{ background: "var(--c-accent)", color: "#fff", boxShadow: `0 4px 16px rgba(var(--c-accent-rgb),0.35)` }}>
              + Log Today's Food
            </button>
          </div>
        )}

        {/* ── Weekly targets ring ─────────────────────────────── */}
        <div className="mt-6 rounded-2xl p-4 glass">
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--c-sub)" }}>Weekly Targets</p>
          <div className="flex items-center gap-4">
            <MacroRing consumed={0} target={plan.calories} size={110} color="var(--c-accent)" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              {[
                { label: "Protein", val: plan.macros?.protein, color: "var(--c-accent)" },
                { label: "Carbs",   val: plan.macros?.carbs,   color: "var(--c-warn)" },
                { label: "Fat",     val: plan.macros?.fat,      color: "#F87171" },
                { label: "Fibre",   val: plan.macros?.fibre,    color: "var(--c-cool)" },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl p-2 text-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
                  <p className="text-sm font-extrabold" style={{ color }}>{val}g</p>
                  <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
          {plan.water && (
            <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
              <span className="text-base">💧</span>
              <span className="text-xs font-semibold" style={{ color: "#38BDF8" }}>Water goal: {plan.water} / day</span>
            </div>
          )}
        </div>

        {/* ── Day tabs ────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-5 pb-1 -mx-1 px-1">
          {SHORT.map((d, i) => {
            const isRest = plan.weekPlan?.[i]?.workout?.type === "Rest";
            const isSelected = day === i;
            return (
              <button key={d} onClick={() => setDay(i)}
                className="flex-shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all"
                style={{
                  background: isSelected ? "var(--c-accent)" : "var(--c-card)",
                  border: isSelected ? "1px solid var(--c-accent)" : "1px solid var(--c-border)",
                  color: isSelected ? "#fff" : "var(--c-sub)",
                  boxShadow: isSelected ? `0 0 12px rgba(var(--c-accent-rgb),0.4)` : "var(--c-card-shadow)",
                }}>
                {d}{isRest ? " 💤" : ""}
              </button>
            );
          })}
        </div>

        {/* ── Day meals ───────────────────────────────────────── */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold" style={{ color: "var(--c-text)" }}>{FULL[day]}</h2>
            {dayPlan?.workout?.type === "Rest" && (
              <span className="rounded-full px-2.5 py-0.5 text-xs"
                style={{ background: "var(--c-pill-inactive)", color: "var(--c-sub)" }}>Rest day</span>
            )}
          </div>

          {dayPlan?.meals ? (
            Object.entries(dayPlan.meals).map(([type, meal], i) => (
              <motion.div key={`${day}-${type}`}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}>
                <MealCard type={type} meal={meal} />
                {/* Suggestions below each meal card */}
                <div className="mt-2">
                  <p className="text-[10px] font-semibold mb-1.5 pl-1" style={{ color: "var(--c-sub)" }}>
                    What to eat for {type}:
                  </p>
                  <SuggestionRow mealType={type} onTap={handleSuggestionTap} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl p-6 text-center glass">
              <p style={{ color: "var(--c-sub)" }}>No meal data for this day.</p>
            </div>
          )}
        </div>

        {/* ── Diet tips ───────────────────────────────────────── */}
        {plan.dietTips?.length > 0 && (
          <div className="mt-6 rounded-2xl p-4"
            style={{ background: "var(--c-cool-bg)", border: "1px solid var(--c-cool-border)" }}>
            <h3 className="font-bold mb-3" style={{ color: "var(--c-cool)" }}>Nutrition tips</h3>
            <ol className="space-y-2">
              {plan.dietTips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--c-sub)" }}>
                  <span className="font-bold flex-shrink-0" style={{ color: "var(--c-cool)" }}>{i + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
