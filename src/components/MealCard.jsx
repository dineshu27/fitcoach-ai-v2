import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RefreshCw, Check, X } from "lucide-react";

const MEAL_META = {
  breakfast: { label: "Breakfast", emoji: "🌅", accent: "#F59E0B" },
  lunch:     { label: "Lunch",     emoji: "☀️",  accent: "#4ECDC4" },
  dinner:    { label: "Dinner",    emoji: "🌙",  accent: "var(--c-accent)" },
  snacks:    { label: "Snacks",    emoji: "⚡",   accent: "#FF6B6B" },
};

// Healthy swap alternatives per food category (keyword-matched)
const SWAP_POOL = {
  protein:  ["Grilled chicken breast", "Tofu (firm, pan-fried)", "Canned tuna", "Boiled eggs (2)", "Greek yoghurt (0% fat)", "Cottage cheese", "Tempeh", "Edamame"],
  carbs:    ["Brown rice (cooked)", "Whole-wheat pasta", "Oats (porridge)", "Sweet potato (baked)", "Quinoa", "Wholemeal bread", "Barley", "Bulgur wheat"],
  veg:      ["Steamed broccoli", "Spinach salad", "Roasted courgette", "Cucumber & tomato salad", "Stir-fried kale", "Mixed salad leaves", "Roasted peppers"],
  fruit:    ["Apple", "Banana", "Mixed berries", "Orange", "Mango (½)", "Grapes (handful)", "Pear", "Pineapple chunks"],
  fat:      ["Avocado (½)", "Handful of almonds", "Walnut pieces", "Pumpkin seeds", "Flaxseed (1 tbsp)", "Olive oil drizzle"],
  drink:    ["Water with lemon", "Green tea", "Black coffee", "Skimmed milk", "Oat milk", "Coconut water"],
};

function categorise(food) {
  const l = food.toLowerCase();
  if (/chicken|fish|tuna|egg|tofu|paneer|lentil|dal|bean|prawn|salmon|cod|meat|turkey|beef|lamb|pork|protein/.test(l)) return "protein";
  if (/rice|pasta|bread|oat|potato|naan|roti|wrap|grain|quinoa|cereal|flour/.test(l)) return "carbs";
  if (/broccoli|spinach|kale|salad|vegetable|veg|courgette|carrot|pepper|onion|tomato|cucumber/.test(l)) return "veg";
  if (/apple|banana|berry|fruit|mango|orange|grape|pear|melon/.test(l)) return "fruit";
  if (/oil|nut|almond|walnut|seed|avocado|butter|fat/.test(l)) return "fat";
  if (/water|tea|coffee|milk|juice|drink/.test(l)) return "drink";
  return "protein"; // default
}

function pickSwap(original) {
  const cat = categorise(original);
  const pool = SWAP_POOL[cat] || SWAP_POOL.protein;
  const options = pool.filter((s) => s.toLowerCase() !== original.toLowerCase());
  return options[Math.floor(Math.random() * options.length)] || pool[0];
}

export default function MealCard({ type, meal }) {
  const [open, setOpen] = useState(false);
  const rawFoods = meal?.foods?.length
    ? meal.foods
    : meal?.name ? meal.name.split(/,|and|with/).map(s => s.trim()).filter(Boolean) : [];
  const [foods, setFoods] = useState(rawFoods.length ? rawFoods : [meal?.name || "Meal item"]);
  const [swapping, setSwapping] = useState(null); // index being swapped
  const [swapOption, setSwapOption] = useState(null);

  if (!meal) return null;
  const meta = MEAL_META[type] || { label: type, emoji: "🍽️", accent: "var(--c-accent)" };
  const customised = JSON.stringify(foods) !== JSON.stringify(meal?.foods);

  function initiateSwap(idx) {
    const suggestion = pickSwap(foods[idx]);
    setSwapping(idx);
    setSwapOption(suggestion);
  }

  function confirmSwap(idx) {
    setFoods((prev) => prev.map((f, i) => i === idx ? swapOption : f));
    setSwapping(null);
    setSwapOption(null);
  }

  function cancelSwap() {
    setSwapping(null);
    setSwapOption(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl transition-all"
      style={{
        background: "var(--c-card)",
        border: `1px solid ${open ? meta.accent + "55" : "var(--c-border)"}`,
      }}>
      <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen((o) => !o)}>
        <span className="text-2xl">{meta.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: meta.accent }}>{meta.label}</p>
            {customised && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: meta.accent + "22", color: meta.accent }}>Customised</span>}
          </div>
          <p className="font-bold text-sm mt-0.5" style={{ color: "var(--c-text)" }}>{meal.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--c-sub)" }}>{meal.calories ?? "—"} kcal</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-1.5">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(var(--c-accent-rgb),0.15)", color: "var(--c-accent)" }}>P:{meal.protein}g</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--c-warn-bg)", color: "var(--c-warn)" }}>C:{meal.carbs}g</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(255,107,107,0.15)", color: "#FF6B6B" }}>F:{meal.fat}g</span>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} style={{ color: "var(--c-sub)" }} />
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
                  { label: "Protein", val: meal.protein ?? 0, color: "var(--c-accent)" },
                  { label: "Carbs",   val: meal.carbs ?? 0,   color: "var(--c-warn)" },
                  { label: "Fat",     val: meal.fat ?? 0,     color: "#FF6B6B" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex-1 rounded-xl p-2 text-center"
                    style={{ background: `${color}11`, border: `1px solid ${color}33` }}>
                    <p className="font-bold text-sm" style={{ color }}>{val}g</p>
                    <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Food items with swap */}
              <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--c-sub)" }}>Foods — tap swap to change any item</p>
              <div className="space-y-1.5">
                {foods.map((food, i) => (
                  <div key={i}>
                    {swapping === i ? (
                      <div className="rounded-xl p-2.5 flex items-center gap-2"
                        style={{ background: meta.accent + "10", border: `1px solid ${meta.accent}44` }}>
                        <span className="flex-1 text-xs font-semibold" style={{ color: "var(--c-text)" }}>{swapOption}</span>
                        <button onClick={() => confirmSwap(i)} className="rounded-full p-1" style={{ background: "rgba(78,205,196,0.2)" }}>
                          <Check size={12} color="#4ECDC4" />
                        </button>
                        <button onClick={cancelSwap} className="rounded-full p-1" style={{ background: "rgba(255,107,107,0.15)" }}>
                          <X size={12} color="#FF6B6B" />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                        style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)" }}>
                        <span className="flex-1 text-xs" style={{ color: "var(--c-text)" }}>{food}</span>
                        <button onClick={() => initiateSwap(i)}
                          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all"
                          style={{ background: meta.accent + "18", color: meta.accent }}>
                          <RefreshCw size={9} />
                          Swap
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
