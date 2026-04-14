import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Minus, Flame, Droplets, X, ChevronDown,
  CheckCircle2, Utensils, Dumbbell, RefreshCw
} from "lucide-react";
import { cache } from "../lib/cache";

/* ── Food database ─────────────────────────────────────────────────
   g = kcal/100g, p/c/f = protein/carbs/fat per 100g
   stateLabel = label for the DEFAULT state toggle button
   alt = alternative state (raw/dry ↔ cooked) with its own g/p/c/f
──────────────────────────────────────────────────────────────────── */
const FOOD_DB = [
  // ── Proteins ───────────────────────────────────────────────────
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
  // ── Carbs / Grains ─────────────────────────────────────────────
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
  // ── Vegetables ─────────────────────────────────────────────────
  { name: "Broccoli",                   g:  34, p:  3, c:  7, f:  0, unit: "g",  qty: 150 },
  { name: "Spinach",                    g:  23, p:  3, c:  4, f:  0, unit: "g",  qty: 100 },
  { name: "Kale",                       g:  49, p:  4, c:  9, f:  1, unit: "g",  qty: 100 },
  { name: "Tomato",                     g:  18, p:  1, c:  4, f:  0, unit: "g",  qty: 120 },
  { name: "Cucumber",                   g:  15, p:  1, c:  4, f:  0, unit: "g",  qty: 100 },
  { name: "Carrot",                     g:  41, p:  1, c: 10, f:  0, unit: "g",  qty: 100 },
  { name: "Bell pepper",                g:  31, p:  1, c:  7, f:  0, unit: "g",  qty: 120 },
  { name: "Mushroom",                   g:  22, p:  3, c:  3, f:  0, unit: "g",  qty: 100 },
  { name: "Avocado",                    g: 160, p:  2, c:  9, f: 15, unit: "g",  qty: 100 },
  { name: "Onion",                      g:  40, p:  1, c: 10, f:  0, unit: "g",  qty:  80 },
  { name: "Cauliflower",                g:  25, p:  2, c:  5, f:  0, unit: "g",  qty: 150 },
  { name: "Courgette (zucchini)",       g:  17, p:  1, c:  3, f:  0, unit: "g",  qty: 150 },
  { name: "Corn (kernels)",             g:  86, p:  3, c: 19, f:  1, unit: "g",  qty: 100 },
  { name: "Peas (frozen/cooked)",       g:  81, p:  5, c: 14, f:  0, unit: "g",  qty: 100 },
  { name: "Green beans",                g:  31, p:  2, c:  7, f:  0, unit: "g",  qty: 100 },
  { name: "Asparagus",                  g:  20, p:  2, c:  4, f:  0, unit: "g",  qty: 100 },
  { name: "Celery",                     g:  16, p:  1, c:  3, f:  0, unit: "g",  qty: 100 },
  { name: "Beetroot",                   g:  43, p:  2, c: 10, f:  0, unit: "g",  qty: 100 },
  // ── Fruits ─────────────────────────────────────────────────────
  { name: "Banana",                     g:  89, p:  1, c: 23, f:  0, unit: "g",  qty: 120 },
  { name: "Apple",                      g:  52, p:  0, c: 14, f:  0, unit: "g",  qty: 150 },
  { name: "Orange",                     g:  47, p:  1, c: 12, f:  0, unit: "g",  qty: 130 },
  { name: "Mango",                      g:  60, p:  1, c: 15, f:  0, unit: "g",  qty: 150 },
  { name: "Strawberries",               g:  32, p:  1, c:  8, f:  0, unit: "g",  qty: 150 },
  { name: "Blueberries",                g:  57, p:  1, c: 14, f:  0, unit: "g",  qty: 100 },
  { name: "Grapes",                     g:  69, p:  1, c: 18, f:  0, unit: "g",  qty: 100 },
  { name: "Pineapple",                  g:  50, p:  1, c: 13, f:  0, unit: "g",  qty: 150 },
  { name: "Watermelon",                 g:  30, p:  1, c:  8, f:  0, unit: "g",  qty: 200 },
  { name: "Peach",                      g:  39, p:  1, c: 10, f:  0, unit: "g",  qty: 150 },
  { name: "Kiwi",                       g:  61, p:  1, c: 15, f:  0, unit: "g",  qty: 75  },
  { name: "Cherries",                   g:  50, p:  1, c: 12, f:  0, unit: "g",  qty: 100 },
  // ── Dairy ──────────────────────────────────────────────────────
  { name: "Whole milk",                 g:  61, p:  3, c:  5, f:  3, unit: "ml", qty: 200 },
  { name: "Semi-skimmed milk",          g:  46, p:  3, c:  5, f:  2, unit: "ml", qty: 200 },
  { name: "Skimmed milk",               g:  35, p:  3, c:  5, f:  0, unit: "ml", qty: 200 },
  { name: "Oat milk",                   g:  40, p:  1, c:  6, f:  2, unit: "ml", qty: 200 },
  { name: "Almond milk (unsweetened)",  g:  15, p:  1, c:  1, f:  1, unit: "ml", qty: 200 },
  { name: "Cheddar cheese",             g: 403, p: 25, c:  0, f: 34, unit: "g",  qty:  30 },
  { name: "Mozzarella",                 g: 280, p: 22, c:  2, f: 22, unit: "g",  qty:  30 },
  { name: "Feta cheese",                g: 264, p: 14, c:  4, f: 21, unit: "g",  qty:  30 },
  // ── Fats / Nuts ────────────────────────────────────────────────
  { name: "Almonds",                    g: 579, p: 21, c: 22, f: 50, unit: "g",  qty:  30 },
  { name: "Walnuts",                    g: 654, p: 15, c: 14, f: 65, unit: "g",  qty:  30 },
  { name: "Peanut butter",              g: 588, p: 25, c: 20, f: 50, unit: "g",  qty:  32 },
  { name: "Almond butter",              g: 614, p: 21, c: 20, f: 56, unit: "g",  qty:  32 },
  { name: "Olive oil",                  g: 884, p:  0, c:  0, f:100, unit: "g",  qty:  10 },
  { name: "Cashews",                    g: 553, p: 18, c: 30, f: 44, unit: "g",  qty:  30 },
  { name: "Pumpkin seeds",              g: 559, p: 30, c: 11, f: 49, unit: "g",  qty:  30 },
  { name: "Chia seeds",                 g: 486, p: 17, c: 42, f: 31, unit: "g",  qty:  15 },
  { name: "Flaxseed",                   g: 534, p: 18, c: 29, f: 42, unit: "g",  qty:  15 },
  // ── Sauces / Condiments ────────────────────────────────────────
  { name: "Hummus",                     g: 166, p:  8, c: 14, f:  9, unit: "g",  qty:  50 },
  { name: "Tomato sauce (pasta)",       g:  48, p:  2, c:  9, f:  1, unit: "g",  qty: 100 },
  { name: "Soy sauce",                  g:  53, p:  8, c:  5, f:  0, unit: "ml", qty:  15 },
  { name: "Ketchup",                    g: 101, p:  1, c: 25, f:  0, unit: "g",  qty:  20 },
  // ── Snacks / Other ─────────────────────────────────────────────
  { name: "Dark chocolate (70%)",       g: 598, p:  5, c: 46, f: 43, unit: "g",  qty:  20 },
  { name: "Honey",                      g: 304, p:  0, c: 82, f:  0, unit: "g",  qty:  15 },
  { name: "Rice cakes",                 g: 387, p:  7, c: 82, f:  3, unit: "g",  qty:  20 },
  { name: "Protein bar",                g: 380, p: 20, c: 45, f: 12, unit: "g",  qty:  55 },
  { name: "Mixed salad leaves",         g:  15, p:  1, c:  2, f:  0, unit: "g",  qty:  80 },
  // ── Drinks ─────────────────────────────────────────────────────
  { name: "Orange juice",               g:  45, p:  1, c: 10, f:  0, unit: "ml", qty: 200 },
  { name: "Banana smoothie",            g:  75, p:  1, c: 16, f:  1, unit: "ml", qty: 300 },
  { name: "Protein shake (mixed)",      g:  55, p: 10, c:  4, f:  1, unit: "ml", qty: 300 },
  { name: "Coffee (black)",             g:   2, p:  0, c:  0, f:  0, unit: "ml", qty: 250 },
  { name: "Green tea",                  g:   1, p:  0, c:  0, f:  0, unit: "ml", qty: 250 },
  { name: "Coconut water",              g:  19, p:  0, c:  4, f:  0, unit: "ml", qty: 250 },
];

/* ── Food Search ──────────────────────────────────────────────────── */
function FoodSearch({ onAdd }) {
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState(null);
  const [qty, setQty]           = useState("");
  const [useAlt, setUseAlt]     = useState(false);
  const qtyRef                  = useRef(null);

  // Show all matching foods — no artificial cap
  const results = query.length > 1
    ? FOOD_DB.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  function handleSelect(food) {
    setSelected(food);
    setQty(String(food.qty));
    setQuery(food.name);
    setUseAlt(false);
    setTimeout(() => qtyRef.current?.focus(), 50);
  }

  function handleAdd() {
    if (!selected) return;
    const g = parseFloat(qty);
    if (!g || g <= 0) return;
    const data = (useAlt && selected.alt) ? { ...selected, ...selected.alt } : selected;
    const cal  = Math.round(g / 100 * data.g);
    const macros = {
      protein: Math.round(g / 100 * (data.p || 0)),
      carbs:   Math.round(g / 100 * (data.c || 0)),
      fat:     Math.round(g / 100 * (data.f || 0)),
    };
    // Build a clean label, e.g. "Chicken breast — Raw (150g)"
    const baseName = selected.name.replace(/\s*\([^)]+\)\s*$/, "").trim();
    const stateStr = (useAlt && selected.alt) ? selected.alt.label : (selected.stateLabel || "");
    const label    = `${baseName}${stateStr ? ` — ${stateStr}` : ""} (${g}${selected.unit})`;
    onAdd(label, cal, macros);
    setQuery(""); setSelected(null); setQty(""); setUseAlt(false);
  }

  const qtyNum   = parseFloat(qty);
  const data     = selected ? ((useAlt && selected.alt) ? { ...selected, ...selected.alt } : selected) : null;
  const calcKcal = data && qtyNum > 0 ? Math.round(qtyNum / 100 * data.g) : null;
  const calcP    = calcKcal !== null ? Math.round(qtyNum / 100 * (data.p || 0)) : null;
  const calcC    = calcKcal !== null ? Math.round(qtyNum / 100 * (data.c || 0)) : null;
  const calcF    = calcKcal !== null ? Math.round(qtyNum / 100 * (data.f || 0)) : null;

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--c-sub)" }} />
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

      {/* Scrollable results dropdown — ALL matching foods */}
      <AnimatePresence>
        {results.length > 0 && !selected && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)", maxHeight: 260, overflowY: "auto" }}>
            {results.map((food, i) => (
              <button key={food.name} onClick={() => handleSelect(food)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                style={{
                  background: "var(--c-card)",
                  borderBottom: i < results.length - 1 ? "1px solid var(--c-border)" : "none",
                }}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate" style={{ color: "var(--c-text)" }}>{food.name}</p>
                  {food.alt && (
                    <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>
                      {food.stateLabel} · {food.alt.label} available
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-xs font-bold" style={{ color: "var(--c-accent)" }}>
                    {Math.round(food.qty / 100 * food.g)} kcal
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>
                    per {food.qty}{food.unit}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected food: cooked/raw toggle + qty + add */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">

          {/* Cooked / Raw state toggle */}
          {selected.alt && (
            <div className="flex gap-2">
              <button
                onClick={() => setUseAlt(false)}
                className="flex-1 rounded-lg py-1.5 text-xs font-bold transition-all"
                style={{
                  background: !useAlt ? "var(--c-accent)" : "var(--c-accent-bg)",
                  color: !useAlt ? "#fff" : "var(--c-accent)",
                  border: `1px solid ${!useAlt ? "var(--c-accent)" : "var(--c-border)"}`,
                }}>
                {selected.stateLabel || "Default"}
              </button>
              <button
                onClick={() => setUseAlt(true)}
                className="flex-1 rounded-lg py-1.5 text-xs font-bold transition-all"
                style={{
                  background: useAlt ? "var(--c-accent)" : "var(--c-accent-bg)",
                  color: useAlt ? "#fff" : "var(--c-accent)",
                  border: `1px solid ${useAlt ? "var(--c-accent)" : "var(--c-border)"}`,
                }}>
                <span className="flex items-center justify-center gap-1">
                  <RefreshCw size={9} /> {selected.alt.label}
                </span>
              </button>
            </div>
          )}

          {/* Qty row */}
          <div className="flex gap-2 items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: "var(--c-input)", border: "1px solid var(--c-border-bright)" }}>
              <span className="text-xs font-semibold" style={{ color: "var(--c-sub)" }}>Qty</span>
              <input
                ref={qtyRef}
                type="number"
                value={qty}
                onChange={e => setQty(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                className="w-14 text-sm font-bold outline-none text-center"
                style={{ background: "transparent", color: "var(--c-text)" }}
              />
              <span className="text-xs" style={{ color: "var(--c-sub)" }}>{selected.unit}</span>
              {calcKcal !== null && (
                <span className="ml-auto text-sm font-extrabold" style={{ color: "var(--c-accent)" }}>
                  {calcKcal} kcal
                </span>
              )}
            </div>
            <button onClick={handleAdd}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-95"
              style={{ background: "var(--c-accent)" }}>
              <Plus size={18} color="#fff" />
            </button>
          </div>

          {/* Macro breakdown preview */}
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

/* ── Water Tracker ────────────────────────────────────────────────── */
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

/* ── Meal Suggestions ─────────────────────────────────────────────── */
const MEAL_META = {
  breakfast: { label: "Breakfast", emoji: "🌅", color: "#F59E0B" },
  lunch:     { label: "Lunch",     emoji: "☀️",  color: "#4ECDC4" },
  dinner:    { label: "Dinner",    emoji: "🌙",  color: "var(--c-accent)" },
  snacks:    { label: "Snacks",    emoji: "⚡",   color: "#FF6B6B" },
};

function MealSuggestions({ plan }) {
  const [open, setOpen] = useState(false);
  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const jsDay = new Date().getDay();
  const monIdx = jsDay === 0 ? 6 : jsDay - 1;
  const weekLen = plan?.weekPlan?.length || 7;
  const todayPlan = plan?.weekPlan?.[Math.min(monIdx, weekLen - 1)];
  const meals = todayPlan?.meals;

  if (!meals) return null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Utensils size={15} style={{ color: "var(--c-accent)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--c-text)" }}>Today's Meal Plan</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: "var(--c-sub)" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            style={{ overflow: "hidden" }} transition={{ duration: 0.22 }}>
            <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid var(--c-border)" }}>
              {Object.entries(meals).map(([type, meal]) => {
                const meta = MEAL_META[type] || { label: type, emoji: "🍽️", color: "var(--c-accent)" };
                return (
                  <div key={type} className="rounded-xl p-3"
                    style={{ background: "var(--c-input)", border: "1px solid var(--c-border)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{meta.emoji}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
                      <span className="ml-auto text-[10px] font-semibold" style={{ color: meta.color }}>{meal.calories} kcal</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>{meal.name}</p>
                    {meal.protein && (
                      <p className="text-[10px] mt-1" style={{ color: "var(--c-sub)" }}>
                        P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fat}g
                      </p>
                    )}
                    {meal.foods?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {meal.foods.map((f, i) => (
                          <span key={i} className="rounded-full px-2 py-0.5 text-[10px]"
                            style={{ background: "var(--c-accent-bg)", color: "var(--c-sub)" }}>{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Exercise Item ────────────────────────────────────────────────── */
function ExerciseItem({ name, detail, done, onToggle }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
      style={{
        background: done ? "rgba(78,205,196,0.08)" : "var(--c-input)",
        border: done ? "1px solid rgba(78,205,196,0.3)" : "1px solid var(--c-border)",
      }}>
      <button
        onClick={onToggle}
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all"
        style={{
          background: done ? "rgba(78,205,196,0.2)" : "var(--c-accent-bg)",
          border: done ? "1px solid rgba(78,205,196,0.5)" : "1px solid var(--c-border-bright)",
        }}>
        <CheckCircle2 size={14} style={{ color: done ? "#4ECDC4" : "var(--c-sub)" }} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{
          color: done ? "var(--c-sub)" : "var(--c-text)",
          textDecoration: done ? "line-through" : "none",
        }}>{name}</p>
        {detail && <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>{detail}</p>}
      </div>
    </div>
  );
}

/* ── Exercise Log ─────────────────────────────────────────────────── */
function ExerciseLog({ plan }) {
  // Use same Mon-indexed day logic as ExercisePlan.jsx for consistency
  const jsDay  = new Date().getDay();          // 0=Sun, 1=Mon … 6=Sat
  const monIdx = jsDay === 0 ? 6 : jsDay - 1;  // Mon=0 … Sun=6
  const weekLen = plan?.weekPlan?.length || 7;
  const todayPlan = plan?.weekPlan?.[Math.min(monIdx, weekLen - 1)];
  const planExercises = todayPlan?.workout?.exercises || [];
  const isRest = todayPlan?.workout?.type === "Rest";

  // Load done/custom lists from cache (persisted per day)
  const todayLog = cache.getTodayLog();
  const [doneSet, setDoneSet]       = useState(() => new Set(todayLog.doneExercises || []));
  const [customList, setCustomList] = useState(() => todayLog.customExercises || []);
  const [customInput, setCustomInput] = useState("");

  function toggle(name) {
    const updated = new Set(doneSet);
    if (updated.has(name)) {
      updated.delete(name);
      cache.unmarkExerciseDone(name);
    } else {
      updated.add(name);
      cache.markExerciseDone(name);
    }
    setDoneSet(new Set(updated)); // new reference so React re-renders
  }

  function addCustom() {
    const name = customInput.trim();
    if (!name || customList.includes(name)) return;
    cache.addCustomExercise(name);
    setCustomList(prev => [...prev, name]);
    setCustomInput("");
  }

  const allNames = [...planExercises.map(e => e.name), ...customList];
  const doneCount = allNames.filter(n => doneSet.has(n)).length;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
        <div className="flex items-center gap-2">
          <Dumbbell size={15} style={{ color: "var(--c-accent)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--c-text)" }}>Exercise Log</span>
        </div>
        {allNames.length > 0 && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{
              background: doneCount === allNames.length && allNames.length > 0
                ? "rgba(78,205,196,0.15)" : "var(--c-accent-bg)",
              color: doneCount === allNames.length && allNames.length > 0
                ? "#4ECDC4" : "var(--c-accent)",
            }}>
            {doneCount}/{allNames.length} done
          </span>
        )}
      </div>

      <div className="p-4 space-y-2.5">
        {/* Plan exercises */}
        {isRest ? (
          <p className="text-sm text-center py-2" style={{ color: "var(--c-sub)" }}>
            Rest day — enjoy your recovery 💤
          </p>
        ) : planExercises.length === 0 ? (
          <p className="text-sm text-center py-2" style={{ color: "var(--c-sub)" }}>
            No exercises in today's plan — add custom ones below
          </p>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase" style={{ color: "var(--c-sub)" }}>
              Today's workout
            </p>
            {planExercises.map(ex => (
              <ExerciseItem
                key={ex.name}
                name={ex.name}
                detail={ex.sets && (ex.reps || ex.duration) ? `${ex.sets} × ${ex.reps || ex.duration}` : undefined}
                done={doneSet.has(ex.name)}
                onToggle={() => toggle(ex.name)}
              />
            ))}
          </>
        )}

        {/* Custom exercises */}
        {customList.length > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase pt-1" style={{ color: "var(--c-sub)" }}>
              Custom exercises
            </p>
            {customList.map(name => (
              <ExerciseItem
                key={name}
                name={name}
                done={doneSet.has(name)}
                onToggle={() => toggle(name)}
              />
            ))}
          </>
        )}

        {/* Add custom exercise input */}
        <div className="flex gap-2 pt-1">
          <input
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustom()}
            placeholder="Add custom exercise (e.g. Cycling 30 min)…"
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: "var(--c-input)", border: "1px solid var(--c-border)", color: "var(--c-text)" }}
          />
          <button
            onClick={addCustom}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)" }}>
            <Plus size={16} style={{ color: "var(--c-accent)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── TodayLog Screen ──────────────────────────────────────────────── */
export default function TodayLog() {
  const plan    = cache.getPlan();
  const [log, setLog] = useState(() => cache.getTodayLog());

  const waterLitres      = parseFloat(String(plan?.water || "2.5").replace("L", "")) || 2.5;
  const waterGlassTarget = Math.round(waterLitres * 4);
  const calorieTarget    = plan?.calories || 2000;
  const pct              = Math.min(1, log.calories / calorieTarget);
  const over             = log.calories > calorieTarget;

  function handleAdd(name, cal, macros) {
    cache.logCalories(name, cal, macros);
    setLog(cache.getTodayLog());
  }
  function handleUndo() {
    cache.removeLastFood();
    setLog(cache.getTodayLog());
  }
  function handleWater(g) {
    cache.setWater(g);
    setLog(cache.getTodayLog());
  }

  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>
      {/* Header */}
      <div className="px-4 pt-safe pt-6 pb-4"
        style={{ background: "var(--c-surface)", borderBottom: "1px solid var(--c-border)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--c-text)" }}>Today's Log</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--c-sub)" }}>{dateStr}</p>
      </div>

      <div className="px-4 mt-4 space-y-4">

        {/* ── Calorie summary ─────────────────────────────── */}
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

          {/* Logged food list */}
          {(log.foods || []).length > 0 && (
            <div className="mt-3 space-y-1.5">
              {log.foods.map((f, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: "var(--c-input)", border: "1px solid var(--c-border)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: "var(--c-text)" }}>{f.name}</p>
                    {(f.protein || f.carbs || f.fat) ? (
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--c-sub)" }}>
                        P:{f.protein}g · C:{f.carbs}g · F:{f.fat}g
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs font-bold ml-3 flex-shrink-0" style={{ color: "var(--c-accent)" }}>
                    {f.calories} kcal
                  </span>
                </div>
              ))}
              <button onClick={handleUndo}
                className="flex items-center gap-1.5 text-xs font-semibold mt-1"
                style={{ color: "#FF6B6B" }}>
                <X size={11} /> Remove last entry
              </button>
            </div>
          )}
        </div>

        {/* ── Macros progress bars ─────────────────────────── */}
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
                const mp  = target > 0 ? Math.min(1, val / target) : 0;
                const mOv = val > target;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold" style={{ color: "var(--c-sub)" }}>{label}</span>
                      <span className="text-xs font-bold" style={{ color: mOv ? "#FF6B6B" : color }}>
                        {val}g
                        <span className="font-medium ml-1" style={{ color: "var(--c-sub)" }}>/ {target}g</span>
                      </span>
                    </div>
                    <div className="progress-track">
                      <motion.div className="progress-fill"
                        style={{ background: mOv ? "#FF6B6B" : color, width: `${mp * 100}%` }}
                        initial={{ width: 0 }} animate={{ width: `${mp * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.1 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Food search ──────────────────────────────────── */}
        <div className="rounded-2xl p-4"
          style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--c-text)" }}>Add Food</p>
          <FoodSearch onAdd={handleAdd} />
        </div>

        {/* ── Water tracker ────────────────────────────────── */}
        <div className="rounded-2xl p-4"
          style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
          <WaterTracker glasses={log.water || 0} max={waterGlassTarget} onChange={handleWater} />
        </div>

        {/* ── Exercise log ─────────────────────────────────── */}
        <ExerciseLog plan={plan} />

        {/* ── Meal suggestions ─────────────────────────────── */}
        <MealSuggestions plan={plan} />

        {/* ── Diet tips ────────────────────────────────────── */}
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

      </div>
    </div>
  );
}
