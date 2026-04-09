import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const MEAL_META = {
  breakfast: { label: "Breakfast", emoji: "🌅", accent: "#FFE66D" },
  lunch: { label: "Lunch", emoji: "☀️", accent: "#4ECDC4" },
  dinner: { label: "Dinner", emoji: "🌙", accent: "#6C63FF" },
  snacks: { label: "Snacks", emoji: "⚡", accent: "#FF6B6B" },
};

export default function MealCard({ type, meal }) {
  const [open, setOpen] = useState(false);
  if (!meal) return null;
  const meta = MEAL_META[type] || { label: type, emoji: "🍽️", accent: "#6C63FF" };

  return (
    <div className="overflow-hidden rounded-2xl transition-all"
      style={{
        background: "rgba(26,26,38,0.8)",
        border: `1px solid ${open ? meta.accent + "55" : "rgba(108,99,255,0.15)"}`,
      }}>
      <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen((o) => !o)}>
        <span className="text-2xl">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: meta.accent }}>{meta.label}</p>
          <p className="font-bold text-sm mt-0.5" style={{ color: "#F0F0FF" }}>{meal.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "#8888AA" }}>{meal.calories} kcal</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-1.5">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(108,99,255,0.15)", color: "#6C63FF" }}>P:{meal.protein}g</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(255,230,109,0.15)", color: "#FFE66D" }}>C:{meal.carbs}g</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(255,107,107,0.15)", color: "#FF6B6B" }}>F:{meal.fat}g</span>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} style={{ color: "#8888AA" }} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            style={{ overflow: "hidden" }} transition={{ duration: 0.2 }}>
            <div className="px-4 pb-4" style={{ borderTop: `1px solid ${meta.accent}22` }}>
              {/* Macro row */}
              <div className="flex gap-3 mt-3 mb-3">
                {[
                  { label: "Protein", val: meal.protein, color: "#6C63FF" },
                  { label: "Carbs", val: meal.carbs, color: "#FFE66D" },
                  { label: "Fat", val: meal.fat, color: "#FF6B6B" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex-1 rounded-xl p-2 text-center"
                    style={{ background: `${color}11`, border: `1px solid ${color}33` }}>
                    <p className="font-bold text-sm" style={{ color }}>{val}g</p>
                    <p className="text-[10px]" style={{ color: "#8888AA" }}>{label}</p>
                  </div>
                ))}
              </div>
              {/* Food items */}
              <div className="flex flex-wrap gap-1.5">
                {(meal.foods || []).map((food, i) => (
                  <span key={i} className="rounded-full px-3 py-1 text-xs"
                    style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", color: "#8888AA" }}>
                    {food}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
