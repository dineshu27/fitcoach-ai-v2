import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Minus, Flame, Droplets, X, ChevronDown,
  CheckCircle2, Utensils, Dumbbell, RefreshCw, Zap, Sparkles, Edit2, Check,
} from "lucide-react";
import { cache } from "../lib/cache";
import { parseAutoLog } from "../lib/api";
import REX from "../components/REX";

/* ── Food database ─────────────────────────────────────────────────── */
const FOOD_DB = [
  // Proteins
  { name: "Chicken breast (grilled)",   g: 165, p: 31, c:  0, f:  4, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw",     g: 120, p: 23, c:  0, f:  2 } },
  { name: "Chicken thigh (grilled)",    g: 177, p: 25, c:  0, f:  9, unit: "g",  qty: 120, stateLabel: "Cooked",  alt: { label: "Raw",     g: 150, p: 18, c:  0, f:  8 } },
  { name: "Salmon fillet",              g: 208, p: 25, c:  0, f: 13, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw",     g: 183, p: 20, c:  0, f: 12 } },
  { name: "Tuna (canned in water)",     g: 116, p: 26, c:  0, f:  1, unit: "g",  qty:  85 },
  { name: "Egg (whole)",                g: 155, p: 13, c:  1, f: 11, unit: "g",  qty:  60, stateLabel: "Cooked",  alt: { label: "Raw",     g: 143, p: 13, c:  1, f: 10 } },
  { name: "Egg whites",                 g:  52, p: 11, c:  1, f:  0, unit: "g",  qty:  60 },
  { name: "Greek yoghurt (0%)",         g:  59, p: 10, c:  4, f:  0, unit: "g",  qty: 200 },
  { name: "Cottage cheese",             g:  98, p: 11, c:  3, f:  4, unit: "g",  qty: 150 },
  { name: "Tofu (firm)",                g:  76, p:  8, c:  2, f:  4, unit: "g",  qty: 150 },
  { name: "Beef mince (lean)",          g: 215, p: 26, c:  0, f: 12, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw",     g: 250, p: 17, c:  0, f: 20 } },
  { name: "Turkey breast",              g: 135, p: 29, c:  0, f:  1, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw",     g: 113, p: 24, c:  0, f:  1 } },
  { name: "Paneer",                     g: 296, p: 18, c:  3, f: 23, unit: "g",  qty: 100 },
  { name: "Lentils (cooked)",           g: 116, p:  9, c: 20, f:  0, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 353, p: 24, c: 63, f:  1 } },
  { name: "Chickpeas (cooked)",         g: 164, p:  9, c: 27, f:  3, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 378, p: 19, c: 63, f:  6 } },
  { name: "Black beans (cooked)",       g: 132, p:  9, c: 24, f:  0, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 341, p: 22, c: 62, f:  1 } },
  { name: "Tempeh",                     g: 193, p: 19, c:  8, f: 11, unit: "g",  qty: 100 },
  { name: "Edamame",                    g: 121, p: 11, c:  9, f:  5, unit: "g",  qty: 100 },
  { name: "Whey protein shake",         g: 370, p: 80, c:  8, f:  4, unit: "g",  qty:  30 },
  { name: "Shrimp / Prawns",            g:  99, p: 20, c:  0, f:  1, unit: "g",  qty: 120, stateLabel: "Cooked",  alt: { label: "Raw",     g:  85, p: 20, c:  0, f:  1 } },
  { name: "Cod fillet",                 g:  82, p: 18, c:  0, f:  1, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw",     g:  69, p: 16, c:  0, f:  1 } },
  // Carbs
  { name: "White rice (cooked)",        g: 130, p:  3, c: 28, f:  0, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 365, p:  7, c: 80, f:  1 } },
  { name: "Brown rice (cooked)",        g: 122, p:  3, c: 25, f:  1, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 350, p:  7, c: 73, f:  3 } },
  { name: "Oats (dry)",                 g: 389, p: 13, c: 67, f:  7, unit: "g",  qty:  50, stateLabel: "Dry",     alt: { label: "Cooked",  g:  71, p:  2, c: 12, f:  2 } },
  { name: "Whole wheat bread",          g: 247, p:  9, c: 44, f:  4, unit: "g",  qty:  35 },
  { name: "White bread",                g: 265, p:  8, c: 49, f:  3, unit: "g",  qty:  35 },
  { name: "Pasta (cooked)",             g: 158, p:  5, c: 31, f:  1, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 370, p: 13, c: 74, f:  2 } },
  { name: "Whole wheat pasta (cooked)", g: 149, p:  6, c: 29, f:  1, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 348, p: 14, c: 70, f:  3 } },
  { name: "Quinoa (cooked)",            g: 120, p:  4, c: 22, f:  2, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 368, p: 14, c: 64, f:  6 } },
  { name: "Sweet potato (baked)",       g:  90, p:  2, c: 20, f:  0, unit: "g",  qty: 150, stateLabel: "Baked",   alt: { label: "Raw",     g:  86, p:  2, c: 20, f:  0 } },
  { name: "White potato (boiled)",      g:  86, p:  2, c: 20, f:  0, unit: "g",  qty: 150, stateLabel: "Boiled",  alt: { label: "Raw",     g:  77, p:  2, c: 17, f:  0 } },
  { name: "Roti / Chapati",             g: 297, p:  8, c: 50, f:  8, unit: "g",  qty:  50 },
  { name: "Naan bread",                 g: 310, p:  9, c: 50, f:  7, unit: "g",  qty:  80 },
  { name: "Couscous (cooked)",          g: 112, p:  4, c: 23, f:  0, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 376, p: 13, c: 77, f:  1 } },
  { name: "Corn tortilla",              g: 218, p:  5, c: 46, f:  3, unit: "g",  qty:  30 },
  { name: "Barley (cooked)",            g: 123, p:  2, c: 28, f:  0, unit: "g",  qty: 150, stateLabel: "Cooked",  alt: { label: "Raw/Dry", g: 354, p: 12, c: 74, f:  2 } },
  // Vegetables
  { name: "Broccoli",   g:  34, p: 3, c:  7, f: 0, unit: "g", qty: 150 },
  { name: "Spinach",    g:  23, p: 3, c:  4, f: 0, unit: "g", qty: 100 },
  { name: "Kale",       g:  49, p: 4, c:  9, f: 1, unit: "g", qty: 100 },
  { name: "Tomato",     g:  18, p: 1, c:  4, f: 0, unit: "g", qty: 120 },
  { name: "Cucumber",   g:  15, p: 1, c:  4, f: 0, unit: "g", qty: 100 },
  { name: "Carrot",     g:  41, p: 1, c: 10, f: 0, unit: "g", qty: 100 },
  { name: "Bell pepper",g:  31, p: 1, c:  7, f: 0, unit: "g", qty: 120 },
  { name: "Mushroom",   g:  22, p: 3, c:  3, f: 0, unit: "g", qty: 100 },
  { name: "Avocado",    g: 160, p: 2, c:  9, f:15, unit: "g", qty: 100 },
  { name: "Onion",      g:  40, p: 1, c: 10, f: 0, unit: "g", qty:  80 },
  { name: "Cauliflower",g:  25, p: 2, c:  5, f: 0, unit: "g", qty: 150 },
  { name: "Courgette",  g:  17, p: 1, c:  3, f: 0, unit: "g", qty: 150 },
  { name: "Corn",       g:  86, p: 3, c: 19, f: 1, unit: "g", qty: 100 },
  { name: "Peas",       g:  81, p: 5, c: 14, f: 0, unit: "g", qty: 100 },
  { name: "Green beans",g:  31, p: 2, c:  7, f: 0, unit: "g", qty: 100 },
  { name: "Asparagus",  g:  20, p: 2, c:  4, f: 0, unit: "g", qty: 100 },
  { name: "Beetroot",   g:  43, p: 2, c: 10, f: 0, unit: "g", qty: 100 },
  // Fruits
  { name: "Banana",      g:  89, p: 1, c: 23, f: 0, unit: "g", qty: 120 },
  { name: "Apple",       g:  52, p: 0, c: 14, f: 0, unit: "g", qty: 150 },
  { name: "Orange",      g:  47, p: 1, c: 12, f: 0, unit: "g", qty: 130 },
  { name: "Mango",       g:  60, p: 1, c: 15, f: 0, unit: "g", qty: 150 },
  { name: "Strawberries",g:  32, p: 1, c:  8, f: 0, unit: "g", qty: 150 },
  { name: "Blueberries", g:  57, p: 1, c: 14, f: 0, unit: "g", qty: 100 },
  { name: "Grapes",      g:  69, p: 1, c: 18, f: 0, unit: "g", qty: 100 },
  { name: "Pineapple",   g:  50, p: 1, c: 13, f: 0, unit: "g", qty: 150 },
  { name: "Watermelon",  g:  30, p: 1, c:  8, f: 0, unit: "g", qty: 200 },
  { name: "Kiwi",        g:  61, p: 1, c: 15, f: 0, unit: "g", qty:  75 },
  // Dairy
  { name: "Whole milk",             g:  61, p: 3, c: 5, f: 3, unit: "ml", qty: 200 },
  { name: "Semi-skimmed milk",      g:  46, p: 3, c: 5, f: 2, unit: "ml", qty: 200 },
  { name: "Skimmed milk",           g:  35, p: 3, c: 5, f: 0, unit: "ml", qty: 200 },
  { name: "Oat milk",               g:  40, p: 1, c: 6, f: 2, unit: "ml", qty: 200 },
  { name: "Almond milk",            g:  15, p: 1, c: 1, f: 1, unit: "ml", qty: 200 },
  { name: "Cheddar cheese",         g: 403, p:25, c: 0, f:34, unit: "g",  qty:  30 },
  { name: "Mozzarella",             g: 280, p:22, c: 2, f:22, unit: "g",  qty:  30 },
  { name: "Feta cheese",            g: 264, p:14, c: 4, f:21, unit: "g",  qty:  30 },
  // Fats/Nuts
  { name: "Almonds",       g: 579, p:21, c:22, f:50, unit: "g", qty:  30 },
  { name: "Walnuts",       g: 654, p:15, c:14, f:65, unit: "g", qty:  30 },
  { name: "Peanut butter", g: 588, p:25, c:20, f:50, unit: "g", qty:  32 },
  { name: "Almond butter", g: 614, p:21, c:20, f:56, unit: "g", qty:  32 },
  { name: "Olive oil",     g: 884, p: 0, c: 0, f:100,unit: "g", qty:  10 },
  { name: "Cashews",       g: 553, p:18, c:30, f:44, unit: "g", qty:  30 },
  { name: "Pumpkin seeds", g: 559, p:30, c:11, f:49, unit: "g", qty:  30 },
  { name: "Chia seeds",    g: 486, p:17, c:42, f:31, unit: "g", qty:  15 },
  // Condiments
  { name: "Hummus",               g: 166, p: 8, c:14, f: 9, unit: "g",  qty:  50 },
  { name: "Tomato sauce (pasta)", g:  48, p: 2, c: 9, f: 1, unit: "g",  qty: 100 },
  { name: "Soy sauce",            g:  53, p: 8, c: 5, f: 0, unit: "ml", qty:  15 },
  // Snacks
  { name: "Dark chocolate (70%)", g: 598, p: 5, c:46, f:43, unit: "g",  qty:  20 },
  { name: "Honey",                g: 304, p: 0, c:82, f: 0, unit: "g",  qty:  15 },
  { name: "Rice cakes",           g: 387, p: 7, c:82, f: 3, unit: "g",  qty:  20 },
  { name: "Protein bar",          g: 380, p:20, c:45, f:12, unit: "g",  qty:  55 },
  { name: "Mixed salad leaves",   g:  15, p: 1, c: 2, f: 0, unit: "g",  qty:  80 },
  // Drinks
  { name: "Orange juice",         g:  45, p: 1, c:10, f: 0, unit: "ml", qty: 200 },
  { name: "Banana smoothie",      g:  75, p: 1, c:16, f: 1, unit: "ml", qty: 300 },
  { name: "Protein shake",        g:  55, p:10, c: 4, f: 1, unit: "ml", qty: 300 },
  { name: "Coffee (black)",       g:   2, p: 0, c: 0, f: 0, unit: "ml", qty: 250 },
  { name: "Green tea",            g:   1, p: 0, c: 0, f: 0, unit: "ml", qty: 250 },
  { name: "Coconut water",        g:  19, p: 0, c: 4, f: 0, unit: "ml", qty: 250 },
  // Indian / South Asian
  { name: "Dal (cooked)",         g:  93, p: 6, c:15, f: 1, unit: "g",  qty: 200 },
  { name: "Rajma (kidney beans)", g: 127, p: 9, c:23, f: 0, unit: "g",  qty: 150 },
  { name: "Chole (chickpea curry)",g: 150, p: 8, c:20, f: 5, unit: "g", qty: 200 },
  { name: "Sabzi (mixed veg)",    g:  80, p: 3, c:10, f: 3, unit: "g",  qty: 150 },
  { name: "Dosa",                 g: 160, p: 3, c:30, f: 4, unit: "g",  qty: 100 },
  { name: "Idli",                 g:  39, p: 2, c: 8, f: 0, unit: "g",  qty:  40 },
  { name: "Sambar",               g:  55, p: 3, c: 8, f: 1, unit: "ml", qty: 200 },
  { name: "Ghee",                 g: 900, p: 0, c: 0, f:100,unit: "g",  qty:   5 },
];

/* ── Ethnicity-based suggestions ──────────────────────────────────── */
const ETHNICITY_SUGGESTIONS = {
  "Asian – Indian": {
    carbs: ["Rice", "Roti / Chapati", "Naan bread", "Dosa", "Idli"],
    protein: ["Dal (cooked)", "Paneer", "Chicken breast (grilled)", "Rajma (kidney beans)", "Chole (chickpea curry)", "Egg (whole)"],
    fat: ["Ghee", "Almonds", "Cashews", "Peanut butter"],
    veg: ["Sabzi (mixed veg)", "Spinach", "Cauliflower", "Onion", "Tomato"],
  },
  "Asian – Pakistani": {
    carbs: ["Roti / Chapati", "White rice (cooked)", "Naan bread"],
    protein: ["Chicken breast (grilled)", "Beef mince (lean)", "Lentils (cooked)", "Egg (whole)"],
    fat: ["Ghee", "Almonds", "Cashews"],
    veg: ["Spinach", "Onion", "Tomato", "Bell pepper"],
  },
  "Asian – Bangladeshi": {
    carbs: ["White rice (cooked)", "Roti / Chapati"],
    protein: ["Salmon fillet", "Shrimp / Prawns", "Lentils (cooked)", "Chicken breast (grilled)", "Egg (whole)"],
    fat: ["Almonds", "Coconut water", "Peanut butter"],
    veg: ["Spinach", "Cauliflower", "Green beans", "Peas"],
  },
  "Asian – Chinese": {
    carbs: ["White rice (cooked)", "Whole wheat bread", "Corn"],
    protein: ["Tofu (firm)", "Salmon fillet", "Egg (whole)", "Shrimp / Prawns"],
    fat: ["Almonds", "Pumpkin seeds", "Chia seeds"],
    veg: ["Broccoli", "Mushroom", "Bell pepper", "Kale"],
  },
  "Asian – Japanese": {
    carbs: ["White rice (cooked)", "Oats (dry)"],
    protein: ["Salmon fillet", "Tuna (canned in water)", "Edamame", "Tofu (firm)", "Egg (whole)"],
    fat: ["Almonds", "Chia seeds"],
    veg: ["Mushroom", "Cucumber", "Spinach", "Kale"],
  },
  "Middle Eastern / Arab": {
    carbs: ["Whole wheat bread", "Couscous (cooked)", "Barley (cooked)", "Corn tortilla"],
    protein: ["Hummus", "Chickpeas (cooked)", "Lentils (cooked)", "Salmon fillet", "Chicken breast (grilled)"],
    fat: ["Almonds", "Walnuts", "Olive oil", "Peanut butter"],
    veg: ["Cucumber", "Tomato", "Bell pepper", "Spinach"],
  },
  "default": {
    carbs: ["Brown rice (cooked)", "Oats (dry)", "Whole wheat bread", "Sweet potato (baked)"],
    protein: ["Chicken breast (grilled)", "Egg (whole)", "Greek yoghurt (0%)", "Tuna (canned in water)", "Cottage cheese"],
    fat: ["Almonds", "Peanut butter", "Avocado", "Walnuts"],
    veg: ["Broccoli", "Spinach", "Carrot", "Bell pepper"],
  },
};

function getSuggestions(ethnicity) {
  if (!ethnicity) return ETHNICITY_SUGGESTIONS.default;
  for (const key of Object.keys(ETHNICITY_SUGGESTIONS)) {
    if (key !== "default" && ethnicity.toLowerCase().includes(key.split(" – ")[1]?.toLowerCase() || key.toLowerCase())) {
      return ETHNICITY_SUGGESTIONS[key];
    }
  }
  return ETHNICITY_SUGGESTIONS.default;
}

/* ── Food Search ──────────────────────────────────────────────────── */
function FoodSearch({ onAdd, preloadName }) {
  const [query, setQuery]       = useState(preloadName || "");
  const [selected, setSelected] = useState(null);
  const [qty, setQty]           = useState("");
  const [useAlt, setUseAlt]     = useState(false);
  const qtyRef                  = useRef(null);

  const results = query.length > 1
    ? FOOD_DB.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  function handleSelect(food) {
    setSelected(food); setQty(String(food.qty)); setQuery(food.name); setUseAlt(false);
    setTimeout(() => qtyRef.current?.focus(), 50);
  }

  function handleAdd() {
    if (!selected) return;
    const g = parseFloat(qty);
    if (!g || g <= 0) return;
    const data = (useAlt && selected.alt) ? { ...selected, ...selected.alt } : selected;
    const cal = Math.round(g / 100 * data.g);
    const macros = {
      protein: Math.round(g / 100 * (data.p || 0)),
      carbs:   Math.round(g / 100 * (data.c || 0)),
      fat:     Math.round(g / 100 * (data.f || 0)),
    };
    const baseName = selected.name.replace(/\s*\([^)]+\)\s*$/, "").trim();
    const stateStr = (useAlt && selected.alt) ? selected.alt.label : (selected.stateLabel || "");
    const label = `${baseName}${stateStr ? ` — ${stateStr}` : ""} (${g}${selected.unit})`;
    onAdd(label, cal, macros);
    setQuery(""); setSelected(null); setQty(""); setUseAlt(false);
  }

  const qtyNum = parseFloat(qty);
  const data = selected ? ((useAlt && selected.alt) ? { ...selected, ...selected.alt } : selected) : null;
  const calcKcal = data && qtyNum > 0 ? Math.round(qtyNum / 100 * data.g) : null;
  const calcP = calcKcal !== null ? Math.round(qtyNum / 100 * (data.p || 0)) : null;
  const calcC = calcKcal !== null ? Math.round(qtyNum / 100 * (data.c || 0)) : null;
  const calcF = calcKcal !== null ? Math.round(qtyNum / 100 * (data.f || 0)) : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--c-sub)" }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null); setQty(""); setUseAlt(false); }}
          placeholder="Search food (chicken, rice, oats…)"
          className="w-full rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none"
          style={{ background: "var(--c-input)", border: "1px solid var(--c-border)", color: "var(--c-text)" }}
        />
        {query.length > 0 && (
          <button onClick={() => { setQuery(""); setSelected(null); setQty(""); setUseAlt(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <X size={13} style={{ color: "var(--c-sub)" }} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {results.length > 0 && !selected && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--c-border)", maxHeight: 260, overflowY: "auto" }}>
            {results.map((food, i) => (
              <button key={food.name} onClick={() => handleSelect(food)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                style={{ background: "var(--c-card)", borderBottom: i < results.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate" style={{ color: "var(--c-text)" }}>{food.name}</p>
                  {food.alt && <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>{food.stateLabel} · {food.alt.label} available</p>}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-xs font-bold" style={{ color: "var(--c-accent)" }}>{Math.round(food.qty / 100 * food.g)} kcal</p>
                  <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>per {food.qty}{food.unit}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {selected.alt && (
            <div className="flex gap-2">
              <button onClick={() => setUseAlt(false)} className="flex-1 rounded-lg py-1.5 text-xs font-bold transition-all"
                style={{ background: !useAlt ? "var(--c-accent)" : "var(--c-accent-bg)", color: !useAlt ? "#fff" : "var(--c-accent)", border: `1px solid ${!useAlt ? "var(--c-accent)" : "var(--c-border)"}` }}>
                {selected.stateLabel || "Default"}
              </button>
              <button onClick={() => setUseAlt(true)} className="flex-1 rounded-lg py-1.5 text-xs font-bold transition-all"
                style={{ background: useAlt ? "var(--c-accent)" : "var(--c-accent-bg)", color: useAlt ? "#fff" : "var(--c-accent)", border: `1px solid ${useAlt ? "var(--c-accent)" : "var(--c-border)"}` }}>
                <span className="flex items-center justify-center gap-1"><RefreshCw size={9} /> {selected.alt.label}</span>
              </button>
            </div>
          )}
          <div className="flex gap-2 items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: "var(--c-input)", border: "1px solid var(--c-border-bright)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--c-sub)" }}>Qty</span>
              <input ref={qtyRef} type="number" value={qty} onChange={e => setQty(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                className="w-14 text-sm font-bold outline-none text-center"
                style={{ background: "transparent", color: "var(--c-text)" }} />
              <span className="text-xs" style={{ color: "var(--c-sub)" }}>{selected.unit}</span>
              {calcKcal !== null && <span className="ml-auto text-sm font-extrabold" style={{ color: "var(--c-accent)" }}>{calcKcal} kcal</span>}
            </div>
            <button onClick={handleAdd}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-95"
              style={{ background: "var(--c-accent)" }}>
              <Plus size={18} color="#fff" />
            </button>
          </div>
          {calcKcal !== null && (
            <div className="flex gap-4 px-1">
              <span className="text-xs font-semibold" style={{ color: "var(--c-accent)" }}>P: {calcP}g</span>
              <span className="text-xs font-semibold" style={{ color: "var(--c-warn)" }}>C: {calcC}g</span>
              <span className="text-xs font-semibold" style={{ color: "#FF6B6B" }}>F: {calcF}g</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ── Water Tracker ─────────────────────────────────────────────────── */
function WaterTracker({ glasses, max, onChange }) {
  const dots = Math.max(max, 8);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Droplets size={14} style={{ color: "#4ECDC4" }} />
          <span className="text-xs font-bold" style={{ color: "var(--c-text)" }}>Water</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onChange(Math.max(0, glasses - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "var(--c-pill-inactive)", border: "1px solid var(--c-border)" }}>
            <Minus size={12} style={{ color: "var(--c-sub)" }} />
          </button>
          <span className="text-sm font-extrabold tabular-nums" style={{ color: "#4ECDC4", minWidth: 52, textAlign: "center" }}>
            {glasses}/{max}
          </span>
          <button onClick={() => onChange(Math.min(glasses + 1, 20))}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "rgba(78,205,196,0.15)", border: "1px solid rgba(78,205,196,0.35)" }}>
            <Plus size={12} style={{ color: "#4ECDC4" }} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: dots }).map((_, i) => (
          <button key={i} onClick={() => onChange(i < glasses ? i : i + 1)}
            className="h-6 w-6 rounded-full transition-all"
            style={{
              background: i < glasses ? "#4ECDC4" : "var(--c-pill-inactive)",
              border: i < glasses ? "1px solid rgba(78,205,196,0.6)" : "1px solid var(--c-border)",
              boxShadow: i < glasses ? "0 0 6px rgba(78,205,196,0.35)" : "none",
            }} />
        ))}
      </div>
      <p className="mt-1.5 text-[10px]" style={{ color: "var(--c-sub)" }}>
        {glasses * 250} ml consumed · goal {max * 250} ml
      </p>
    </div>
  );
}

/* ── Ethnicity Suggestions ─────────────────────────────────────────── */
function EthnicitySuggestions({ ethnicity, onChipTap }) {
  const sugg = getSuggestions(ethnicity);
  const categories = [
    { key: "carbs",   label: "Carbs",   color: "var(--c-warn)" },
    { key: "protein", label: "Protein", color: "var(--c-accent)" },
    { key: "fat",     label: "Fats",    color: "#FF6B6B" },
    { key: "veg",     label: "Veggies", color: "#4ECDC4" },
  ];
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--c-border)" }}>
        <Utensils size={14} style={{ color: "var(--c-accent)" }} />
        <span className="text-sm font-bold" style={{ color: "var(--c-text)" }}>What to eat today</span>
        {ethnicity && <span className="text-[10px] ml-auto" style={{ color: "var(--c-sub)" }}>{ethnicity.split(" – ")[1] || ethnicity}</span>}
      </div>
      <div className="px-4 py-3 space-y-3">
        {categories.map(({ key, label, color }) => (
          <div key={key}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color }}>{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {(sugg[key] || []).map(name => (
                <button key={name} onClick={() => onChipTap(name)}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold transition-all active:scale-95"
                  style={{ background: "var(--c-input)", border: `1px solid var(--c-border)`, color: "var(--c-text)" }}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Exercise Item (with inline edit) ──────────────────────────────── */
function ExerciseItem({ name, detail, done, onToggle }) {
  const [editing, setEditing] = useState(false);

  // Parse defaults from cache first, then fall back to plan detail
  const [weight, setWeight] = useState(() => {
    const cached = cache.getExerciseLog(name);
    return cached?.[0]?.weight || "";
  });
  const [reps, setReps] = useState(() => {
    const cached = cache.getExerciseLog(name);
    if (cached?.[0]?.reps) return String(cached[0].reps);
    // Parse default reps from plan detail e.g. "3 × 10" → "10"
    return detail?.split("×")[1]?.trim() || "";
  });
  // Persist the saved note so it doesn't revert to predefined detail
  const [savedNote, setSavedNote] = useState(() => {
    const cached = cache.getExerciseLog(name);
    return cached?.[0]?.note || null;
  });

  function saveEdit() {
    const note = [weight ? `${weight}kg` : "", reps ? `${reps} reps` : ""].filter(Boolean).join(" · ");
    if (note) {
      cache.logExerciseSet(name, [{ set: 1, weight, reps: parseInt(reps) || 0, done: true, note }]);
      setSavedNote(note);
    }
    setEditing(false);
  }

  const displayDetail = savedNote || detail;

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{
        background: done ? "rgba(52,211,153,0.07)" : "var(--c-input)",
        border: done ? "1px solid rgba(52,211,153,0.3)" : "1px solid var(--c-border)",
      }}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button onClick={onToggle}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all"
          style={{
            background: done ? "rgba(52,211,153,0.2)" : "var(--c-accent-bg)",
            border: done ? "1px solid rgba(52,211,153,0.5)" : "1px solid var(--c-border-bright)",
          }}>
          <CheckCircle2 size={14} style={{ color: done ? "#34D399" : "var(--c-sub)" }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate"
            style={{ color: done ? "var(--c-sub)" : "var(--c-text)", textDecoration: done ? "line-through" : "none" }}>
            {name}
          </p>
          {displayDetail && (
            <p className="text-[10px]" style={{ color: savedNote ? "#34D399" : "var(--c-sub)" }}>
              {displayDetail}
            </p>
          )}
        </div>
        <button onClick={() => setEditing(e => !e)}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-all"
          style={{ background: editing ? "var(--c-accent-bg)" : "transparent", border: editing ? "1px solid var(--c-border)" : "none" }}>
          <Edit2 size={12} style={{ color: editing ? "var(--c-accent)" : "var(--c-sub)" }} />
        </button>
      </div>

      {/* Inline edit panel */}
      {editing && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden">
          <div className="flex items-center gap-2 px-3 pb-2.5">
            <input type="number" placeholder="Weight (kg)" value={weight}
              onChange={e => setWeight(e.target.value)} min="0"
              className="flex-1 rounded-lg px-2.5 py-1.5 text-xs text-center outline-none"
              style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", color: "var(--c-text)" }} />
            <input type="number" placeholder="Reps" value={reps}
              onChange={e => setReps(e.target.value)} min="1"
              className="flex-1 rounded-lg px-2.5 py-1.5 text-xs text-center outline-none"
              style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", color: "var(--c-text)" }} />
            <button onClick={saveEdit}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-all active:scale-90"
              style={{ background: "var(--c-accent)", flexShrink: 0 }}>
              <Check size={12} color="#fff" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── Calorie burn estimator ─────────────────────────────────────────── */
const BURN_HIGH  = ["deadlift","squat","clean","thruster","snatch","row","pull","press","bench","lunge","rdl","hip thrust","split squat","step up","leg press"];
const BURN_MED   = ["curl","extension","raise","fly","kickback","dip","push","crunch","plank","row"];
function estimateBurn(name, sets = 3) {
  const n = (name || "").toLowerCase();
  const kcalPerSet = BURN_HIGH.some(k => n.includes(k)) ? 10
    : BURN_MED.some(k => n.includes(k)) ? 5
    : 7;
  return kcalPerSet * sets;
}

/* ── Exercise Log ───────────────────────────────────────────────────── */
function ExerciseLog({ plan }) {
  const jsDay = new Date().getDay();
  const monIdx = jsDay === 0 ? 6 : jsDay - 1;
  const weekLen = plan?.weekPlan?.length || 7;
  const todayPlan = plan?.weekPlan?.[Math.min(monIdx, weekLen - 1)];
  const planExercises = todayPlan?.workout?.exercises || [];
  const isRest = todayPlan?.workout?.type === "Rest";

  const todayLog = cache.getTodayLog();
  const [doneSet, setDoneSet] = useState(() => new Set(todayLog.doneExercises || []));
  const [customList, setCustomList] = useState(() => todayLog.customExercises || []);
  const [customInput, setCustomInput] = useState("");

  function toggle(name) {
    const updated = new Set(doneSet);
    if (updated.has(name)) { updated.delete(name); cache.unmarkExerciseDone(name); }
    else { updated.add(name); cache.markExerciseDone(name); }
    setDoneSet(new Set(updated));
  }

  function addCustom() {
    const name = customInput.trim();
    if (!name || customList.includes(name)) return;
    cache.addCustomExercise(name);
    setCustomList(prev => [...prev, name]);
    setCustomInput("");
  }

  const allExercises = [
    ...planExercises.map(e => ({ name: e.name, sets: e.sets || 3 })),
    ...customList.map(name => ({ name, sets: 3 })),
  ];
  const allNames = allExercises.map(e => e.name);
  const doneCount = allNames.filter(n => doneSet.has(n)).length;
  const totalBurn = allExercises
    .filter(e => doneSet.has(e.name))
    .reduce((sum, e) => sum + estimateBurn(e.name, e.sets), 0);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
      <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
        <div className="flex items-center gap-2">
          <Dumbbell size={15} style={{ color: "var(--c-accent)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--c-text)" }}>Exercise Log</span>
        </div>
        <div className="flex items-center gap-2">
          {totalBurn > 0 && (
            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ background: "rgba(252,163,17,0.12)", color: "var(--c-warn)" }}>
              <Flame size={11} />
              ~{totalBurn} kcal
            </span>
          )}
          {allNames.length > 0 && (
            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{
                background: doneCount === allNames.length ? "rgba(78,205,196,0.15)" : "var(--c-accent-bg)",
                color: doneCount === allNames.length ? "#4ECDC4" : "var(--c-accent)",
              }}>
              {doneCount}/{allNames.length} done
            </span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        {isRest ? (
          <p className="text-sm text-center py-2" style={{ color: "var(--c-sub)" }}>Rest day — enjoy your recovery 💤</p>
        ) : planExercises.length === 0 ? (
          <p className="text-sm text-center py-2" style={{ color: "var(--c-sub)" }}>No exercises in today's plan — add custom ones below</p>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--c-sub)" }}>Today's workout</p>
            {planExercises.map(ex => (
              <ExerciseItem key={ex.name} name={ex.name}
                detail={ex.sets && (ex.reps || ex.duration) ? `${ex.sets} × ${ex.reps || ex.duration}` : undefined}
                done={doneSet.has(ex.name)} onToggle={() => toggle(ex.name)} />
            ))}
          </>
        )}
        {customList.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase pt-1" style={{ color: "var(--c-sub)" }}>Custom exercises</p>
            {customList.map(name => (
              <ExerciseItem key={name} name={name} done={doneSet.has(name)} onToggle={() => toggle(name)} />
            ))}
          </>
        )}
        <div className="flex gap-2 pt-1">
          <input value={customInput} onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustom()}
            placeholder="Add custom exercise (e.g. Cycling 30 min)…"
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: "var(--c-input)", border: "1px solid var(--c-border)", color: "var(--c-text)" }} />
          <button onClick={addCustom}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)" }}>
            <Plus size={16} style={{ color: "var(--c-accent)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Auto Log Mode ──────────────────────────────────────────────────── */
function AutoLog({ onLogComplete }) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  async function handleParse() {
    if (!text.trim() || parsing) return;
    setParsing(true); setParseError(""); setParsed(null);
    try {
      const result = await parseAutoLog(text);
      setParsed(result);
    } catch (e) {
      setParseError("Couldn't parse that — try manual logging or rephrase your description.");
    } finally {
      setParsing(false);
    }
  }

  function handleConfirm() {
    if (!parsed) return;
    // Log foods
    (parsed.foods || []).forEach(item => {
      const match = FOOD_DB.find(f => f.name.toLowerCase().includes(item.name.toLowerCase()));
      const qty = item.quantity || 100;
      const kcal = match ? Math.round(qty / 100 * match.g) : Math.round(qty * 2); // rough fallback
      const macros = match ? {
        protein: Math.round(qty / 100 * (match.p || 0)),
        carbs:   Math.round(qty / 100 * (match.c || 0)),
        fat:     Math.round(qty / 100 * (match.f || 0)),
      } : {};
      cache.logCalories(`${item.name} (${qty}${item.unit || "g"})`, kcal, macros);
    });
    // Log exercises
    (parsed.exercises || []).forEach(ex => cache.markExerciseDone(ex.name));
    // Log water (convert ml to glasses)
    if (parsed.water > 0) {
      const existing = cache.getTodayLog();
      cache.setWater((existing.water || 0) + Math.round(parsed.water / 250));
    }
    setConfirmed(true);
    setTimeout(() => {
      onLogComplete();
      setText(""); setParsed(null); setConfirmed(false);
    }, 2500);
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center py-8 gap-4">
        <REX state="celebrating" size="md" />
        <p className="text-sm font-bold text-center" style={{ color: "var(--c-accent)" }}>
          Logged! {parsed?.foods?.length || 0} foods · {parsed?.exercises?.length || 0} exercises
          {parsed?.water ? ` · ${parsed.water}ml water` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Describe what you ate and did today… e.g. Had rice 150g with dal, drank 2 glasses of water, did 3 sets of bench press 10 reps at 60kg"
        rows={4}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
        style={{
          background: "var(--c-input)", border: "1px solid var(--c-border)", color: "var(--c-text)",
          fontFamily: "Space Grotesk, sans-serif", minHeight: 100, maxHeight: 200,
        }}
      />
      <button onClick={handleParse} disabled={!text.trim() || parsing}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-40">
        {parsing ? (
          <><REX state="thinking" size="xs" /> Analysing…</>
        ) : (
          <><Sparkles size={15} /> Parse &amp; Log</>
        )}
      </button>
      <p className="text-[11px] text-center" style={{ color: "var(--c-sub)" }}>
        FiTAi will extract food items, portions, and exercises from your description
      </p>

      {parseError && (
        <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#FF6B6B" }}>
          {parseError}
        </div>
      )}

      {/* Review card */}
      {parsed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--c-card)", border: "1px solid var(--c-border-bright)" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--c-border)", background: "var(--c-accent-bg)" }}>
            <Zap size={13} style={{ color: "var(--c-accent)" }} />
            <span className="text-xs font-bold" style={{ color: "var(--c-accent)" }}>FiTAi extracted</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {parsed.foods?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: "var(--c-sub)" }}>Foods</p>
                {parsed.foods.map((f, i) => {
                  const match = FOOD_DB.find(fd => fd.name.toLowerCase().includes(f.name.toLowerCase()));
                  const qty = f.quantity || 100;
                  const kcal = match ? Math.round(qty / 100 * match.g) : "~";
                  return (
                    <div key={i} className="flex justify-between text-xs py-1"
                      style={{ borderBottom: i < parsed.foods.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                      <span style={{ color: "var(--c-text)" }}>{f.name} ({qty}{f.unit || "g"})</span>
                      <span style={{ color: "var(--c-accent)" }}>{kcal} kcal</span>
                    </div>
                  );
                })}
              </div>
            )}
            {parsed.exercises?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: "var(--c-sub)" }}>Exercises</p>
                {parsed.exercises.map((ex, i) => (
                  <p key={i} className="text-xs py-1" style={{ color: "var(--c-text)" }}>
                    {ex.name} — {ex.sets}×{ex.reps}{ex.weight ? ` @ ${ex.weight}${ex.weightUnit || "kg"}` : ""}
                  </p>
                ))}
              </div>
            )}
            {parsed.water > 0 && (
              <p className="text-xs" style={{ color: "#4ECDC4" }}>Water: {parsed.water}ml</p>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={handleConfirm}
                className="btn-primary flex-1 py-2.5 text-sm font-bold">
                Confirm &amp; Add to Log
              </button>
              <button onClick={() => setParsed(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ background: "var(--c-pill-inactive)", color: "var(--c-sub)" }}>
                Edit
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── TodayLog Screen ────────────────────────────────────────────────── */
export default function TodayLog({ preloadExercise }) {
  const location = useLocation();
  const plan = cache.getPlan();
  const profile = cache.getProfile();
  const [log, setLog] = useState(() => cache.getTodayLog());
  // Switch to manual mode if a food is preloaded from DietPlan
  const [mode, setMode] = useState(location.state?.preloadFood ? "manual" : "auto");
  const [foodSearchPrefill, setFoodSearchPrefill] = useState(location.state?.preloadFood || "");

  const waterLitres = parseFloat(String(plan?.water || "2.5").replace("L", "")) || 2.5;
  const waterGlassTarget = Math.round(waterLitres * 4);
  const calorieTarget = plan?.calories || 2000;
  const pct = Math.min(1, log.calories / calorieTarget);
  const over = log.calories > calorieTarget;

  function refresh() { setLog(cache.getTodayLog()); }
  function handleAdd(name, cal, macros) { cache.logCalories(name, cal, macros); refresh(); }
  function handleUndo() { cache.removeLastFood(); refresh(); }
  function handleWater(g) { cache.setWater(g); refresh(); }

  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>
      {/* Header */}
      <div className="px-4 pt-safe pt-6 pb-4" style={{ background: "var(--c-surface)", borderBottom: "1px solid var(--c-border)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--c-text)" }}>Today's Log</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--c-sub)" }}>{dateStr}</p>
      </div>

      <div className="px-4 mt-4 space-y-4">

        {/* ── Calorie summary ───────────────────────────────────── */}
        <div className="rounded-2xl p-4"
          style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Flame size={15} style={{ color: "#FF6B6B" }} />
              <span className="text-sm font-bold" style={{ color: "var(--c-text)" }}>Calories</span>
            </div>
            <span className="text-lg font-extrabold" style={{ color: over ? "#FF6B6B" : "var(--c-accent)" }}>
              {log.calories}
              <span className="text-sm font-semibold ml-1" style={{ color: "var(--c-sub)" }}>/ {calorieTarget} kcal</span>
            </span>
          </div>
          <div className="progress-track mb-2">
            <motion.div className="progress-fill"
              style={{ background: over ? "#FF6B6B" : "var(--c-accent)", width: `${pct * 100}%` }}
              initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
          <p className="text-xs" style={{ color: "var(--c-sub)" }}>
            {over ? `${log.calories - calorieTarget} kcal over target` : `${calorieTarget - log.calories} kcal remaining`}
          </p>

          {(log.foods || []).length > 0 && (
            <div className="mt-3 space-y-1.5">
              {log.foods.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: "var(--c-input)", border: "1px solid var(--c-border)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: "var(--c-text)" }}>{f.name}</p>
                    {(f.protein || f.carbs || f.fat) ? (
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--c-sub)" }}>P:{f.protein}g · C:{f.carbs}g · F:{f.fat}g</p>
                    ) : null}
                  </div>
                  <span className="text-xs font-bold ml-3 flex-shrink-0" style={{ color: "var(--c-accent)" }}>{f.calories} kcal</span>
                </div>
              ))}
              <button onClick={handleUndo} className="flex items-center gap-1.5 text-xs font-semibold mt-1"
                style={{ color: "#FF6B6B" }}>
                <X size={11} /> Remove last entry
              </button>
            </div>
          )}
        </div>

        {/* ── Macros ───────────────────────────────────────────── */}
        {plan?.macros && (
          <div className="rounded-2xl p-4"
            style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
            <p className="text-sm font-bold mb-3" style={{ color: "var(--c-text)" }}>Macros</p>
            <div className="space-y-3">
              {[
                { label: "Protein", val: log.protein || 0, target: plan.macros.protein || 150, color: "var(--c-accent)" },
                { label: "Carbs",   val: log.carbs   || 0, target: plan.macros.carbs   || 250, color: "var(--c-warn)" },
                { label: "Fat",     val: log.fat     || 0, target: plan.macros.fat     ||  70, color: "#FF6B6B" },
              ].map(({ label, val, target, color }) => {
                const mp = target > 0 ? Math.min(1, val / target) : 0;
                const mOv = val > target;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: "var(--c-sub)" }}>{label}</span>
                      <span className="text-xs font-bold" style={{ color: mOv ? "#FF6B6B" : color }}>
                        {val}g <span className="font-medium" style={{ color: "var(--c-sub)" }}>/ {target}g</span>
                      </span>
                    </div>
                    <div className="progress-track">
                      <motion.div className="progress-fill" style={{ background: mOv ? "#FF6B6B" : color, width: `${mp * 100}%` }}
                        initial={{ width: 0 }} animate={{ width: `${mp * 100}%` }} transition={{ duration: 0.5, delay: 0.1 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Mode toggle ───────────────────────────────────────── */}
        <div className="flex rounded-2xl p-1.5" style={{ background: "var(--c-card)", border: "1px solid var(--c-border)" }}>
          {[
            { key: "auto",   label: "Auto Log",   icon: Sparkles },
            { key: "manual", label: "Manual Log",  icon: Plus },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setMode(key)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all"
              style={{
                background: mode === key ? "var(--c-accent)" : "transparent",
                color: mode === key ? "#fff" : "var(--c-sub)",
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Auto Log ──────────────────────────────────────────── */}
        {mode === "auto" && (
          <div className="rounded-2xl p-4"
            style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
            <AutoLog onLogComplete={refresh} />
          </div>
        )}

        {/* ── Manual Log ────────────────────────────────────────── */}
        {mode === "manual" && (
          <>
            <div className="rounded-2xl p-4"
              style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
              <p className="text-sm font-bold mb-3" style={{ color: "var(--c-text)" }}>Add Food</p>
              <FoodSearch onAdd={handleAdd} preloadName={foodSearchPrefill} key={foodSearchPrefill} />
            </div>

            <div className="rounded-2xl p-4"
              style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
              <WaterTracker glasses={log.water || 0} max={waterGlassTarget} onChange={handleWater} />
            </div>

            <ExerciseLog plan={plan} />

            <EthnicitySuggestions
              ethnicity={profile?.ethnicity}
              onChipTap={(name) => { setFoodSearchPrefill(name); setMode("manual"); }}
            />

            {plan?.dietTips?.length > 0 && (
              <div className="rounded-2xl p-4"
                style={{ background: "var(--c-cool-bg)", border: "1px solid var(--c-cool-border)" }}>
                <p className="text-xs font-bold uppercase mb-2" style={{ color: "var(--c-cool)" }}>Nutrition tips</p>
                <ol className="space-y-1.5">
                  {plan.dietTips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--c-sub)" }}>
                      <span className="font-bold flex-shrink-0" style={{ color: "var(--c-cool)" }}>{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
