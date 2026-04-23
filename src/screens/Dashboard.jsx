import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame, Droplets, Dumbbell, Zap, ChevronRight, Info,
  Target, UtensilsCrossed, MapPin, Sun, Cloud, CloudSun,
  CloudRain, Snowflake, CloudDrizzle, CloudLightning, ClipboardList,
  Moon, Sunset,
} from "lucide-react";
import REX from "../components/REX";
import { cache } from "../lib/cache";
import { bmiCategory, dayStreak } from "../lib/calculations";
import { useTheme } from "../lib/theme";
import { staggerContainer, staggerItem, fadeUp } from "../motion/variants";
import { pressable, pressablePrimary, cardInteractive } from "../motion/presets";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Push yourself, because no one else is going to do it for you.",
  "Success starts with self-discipline.",
  "Train insane or remain the same.",
  "Sweat now. Shine later.",
  "You don't have to be great to start, but you have to start to be great.",
  "The pain you feel today is the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
  "Small steps every day lead to massive results.",
  "Progress, not perfection.",
  "Your health is an investment, not an expense.",
  "Be stronger than your excuses.",
  "Do something today your future self will thank you for.",
  "Consistency is the key to transformation.",
  "Sore today. Strong tomorrow.",
  "Your only competition is who you were yesterday.",
  "It never gets easier. You just get stronger.",
  "One rep at a time. One day at a time.",
  "Results happen over time, not overnight. Work hard, stay consistent.",
  "Fitness is not a destination. It is a way of life.",
  "Take care of your body. It's the only place you have to live.",
];

function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((new Date() - start) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

const AI_TIPS = {
  rest: [
    "Rest days are where the real gains happen — your muscles are rebuilding right now. Stay hydrated and get 7–9 hours sleep tonight.",
    "Active recovery is your secret weapon. A 20-minute walk today keeps soreness low and momentum high.",
    "Use today to prep your meals for tomorrow. Nutrition on training days is where most people fall behind.",
    "Sleep is the most anabolic thing you can do. Prioritise 8 hours — your body will thank you on the next session.",
  ],
  workout: [
    "Hit your protein target today — your muscles need the building blocks right after training. Aim for 30g within an hour of your session.",
    "Warm up properly before you lift. 5 minutes of dynamic movement cuts injury risk and boosts performance significantly.",
    "Progressive overload is the key. Even one extra rep or half a kg more than last week is real progress.",
    "Stay in the zone — put your phone away during your sets. Focus compounds results.",
    "Don't skip your post-workout stretch. 10 minutes now saves you days of stiffness.",
  ],
  weightLoss: [
    "Protein keeps you full and protects muscle while you're in a deficit. Make sure every meal has a quality source.",
    "Drink a full glass of water before each meal — it reduces hunger and helps you hit your hydration target.",
    "A 300–500 kcal deficit is the sweet spot: fast enough to see results, slow enough to keep energy high.",
    "Track everything today — even the small snacks. Awareness is the single most powerful fat-loss tool.",
  ],
  muscleGain: [
    "Eat in a slight surplus today — you can't build muscle on an empty tank. Make sure you hit your calorie target.",
    "Compound lifts first, isolation work after. Squats, deadlifts and bench build the base everything else sits on.",
    "Consistency over intensity. Showing up every session beats chasing PBs when you're fatigued.",
    "Carbs around your workout fuel performance. Don't fear them — they're your training ally.",
  ],
  general: [
    "Small habits repeated daily build extraordinary results. You're one session closer today.",
    "Your body adapts to whatever you consistently do. Make today's habits worth adapting to.",
    "Fuel your workouts, recover hard, and trust the process. Results follow consistency.",
    "Hydration affects everything — energy, focus, recovery. Keep that water bottle close.",
  ],
};

function getAITip({ goals = [], isRest = false }) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((new Date() - start) / 86400000);

  const goalStr = goals.join(" ").toLowerCase();
  let pool;
  if (isRest) {
    pool = AI_TIPS.rest;
  } else if (goalStr.includes("weight") || goalStr.includes("fat") || goalStr.includes("loss")) {
    pool = [...AI_TIPS.weightLoss, ...AI_TIPS.workout];
  } else if (goalStr.includes("muscle") || goalStr.includes("bulk") || goalStr.includes("mass") || goalStr.includes("strength")) {
    pool = [...AI_TIPS.muscleGain, ...AI_TIPS.workout];
  } else {
    pool = [...AI_TIPS.workout, ...AI_TIPS.general];
  }
  return pool[dayOfYear % pool.length];
}

function weatherInfo(code) {
  if (code === 0)  return { Icon: Sun,           label: "Clear",         color: "#F59E0B" };
  if (code <= 3)   return { Icon: CloudSun,       label: "Partly cloudy", color: "#F59E0B" };
  if (code <= 48)  return { Icon: Cloud,          label: "Foggy",         color: "var(--c-sub)" };
  if (code <= 67)  return { Icon: CloudRain,      label: "Rainy",         color: "#38BDF8" };
  if (code <= 77)  return { Icon: Snowflake,      label: "Snowy",         color: "#38BDF8" };
  if (code <= 82)  return { Icon: CloudDrizzle,   label: "Showers",       color: "#38BDF8" };
  return               { Icon: CloudLightning, label: "Stormy",        color: "#F87171" };
}

function useWeather() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`
        );
        const data = await res.json();
        setWeather({ temp: Math.round(data.current.temperature_2m), code: data.current.weather_code });
      } catch {}
    }, () => {});
  }, []);
  return weather;
}

const THEME_ICONS = { auto: Sunset, light: Sun, dark: Moon };
const THEME_LABELS = { auto: "Auto", light: "Light", dark: "Dark" };

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-6">
      <h2 className="text-sm font-bold border-l-[3px] pl-3 uppercase tracking-wide"
        style={{ color: "var(--c-text)", borderColor: "var(--c-accent)" }}>
        {title}
      </h2>
      {action && (
        <button onClick={onAction} className="flex items-center gap-0.5 text-xs font-semibold"
          style={{ color: "var(--c-accent)" }}>
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

const MEAL_BORDER = {
  breakfast: "var(--c-accent)",
  lunch:     "var(--c-warn)",
  dinner:    "#F87171",
  snacks:    "var(--c-cool)",
};

/* ── Calorie ring (SVG) ──────────────────────────────────────────── */
function CalRing({ consumed, target, size = 68 }) {
  const pct = Math.min(consumed / Math.max(target, 1), 1);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const over = consumed > target;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--c-pill-inactive)" strokeWidth="5" />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={over ? "#F87171" : "var(--c-accent)"} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize="10" fontWeight="700" fill="var(--c-text)" fontFamily="Space Grotesk">
        {consumed > 0 ? consumed : target}
      </text>
      <text x="50%" y="63%" dominantBaseline="middle" textAnchor="middle"
        fontSize="7" fill="var(--c-sub)" fontFamily="Space Grotesk">
        kcal
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { mode, cycle } = useTheme();
  const ThemeIcon = THEME_ICONS[mode] || Sunset;

  const profile = cache.getProfile();
  const plan    = cache.getPlan();
  const stats   = cache.getStats();
  const weather = useWeather();
  const todayLog = cache.getTodayLog();

  if (!profile || !plan) { navigate("/onboarding", { replace: true }); return null; }

  const jsDay   = new Date().getDay();
  const monIdx  = jsDay === 0 ? 6 : jsDay - 1;
  const weekLen = plan.weekPlan?.length || 7;
  const todayPlan = plan.weekPlan?.[Math.min(monIdx, weekLen - 1)] || plan.weekPlan?.[0];

  const streak   = dayStreak(stats.startDate);
  const goalList = Array.isArray(profile.goals) ? profile.goals : [profile.goal || ""].filter(Boolean);
  const hasCondition = profile.conditions?.some(c => c !== "None");
  const dateStr  = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const waterLitres = parseFloat(String(plan.water).replace("L", "")) || 2.5;
  const quote    = getDailyQuote();
  const wInfo    = weather ? weatherInfo(weather.code) : null;
  const WIcon    = wInfo?.Icon;

  const loggedCal = todayLog?.calories || 0;
  const waterGlasses = todayLog?.water || 0;
  const waterTarget  = Math.round(waterLitres * 4);
  const isRestDay = todayPlan?.workout?.type === "Rest";
  const aiTip = getAITip({ goals: goalList, isRest: isRestDay });

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>

      {/* ── Premium hero ──────────────────────────────────────────── */}
      <div style={{ background: "var(--c-card)", borderBottom: "1px solid var(--c-border)" }}>
        {/* Gradient accent bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #FC4C02 0%, #FBBF24 50%, #FC4C02 100%)" }} />

        <div className="px-4 safe-top pt-4 pb-4">
          {/* Top row: date + theme toggle */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium" style={{ color: "var(--c-sub)" }}>{dateStr}</p>
            {/* Theme toggle — always visible here */}
            <button onClick={cycle}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95"
              style={{
                background: "var(--c-accent-bg)",
                border: "1px solid var(--c-border-bright)",
                color: "var(--c-accent)",
              }}>
              <ThemeIcon size={12} />
              {THEME_LABELS[mode]}
            </button>
          </div>

          {/* Greeting row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold leading-tight" style={{ color: "var(--c-text)" }}>
                {greeting()},<br />{profile.name?.split(" ")[0]} 👋
              </h1>

              {/* Weather */}
              <div className="flex items-center gap-2 mt-2">
                {wInfo ? (
                  <>
                    <WIcon size={13} style={{ color: wInfo.color }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>{weather.temp}°C</span>
                    <span className="text-xs" style={{ color: "var(--c-sub)" }}>{wInfo.label}</span>
                  </>
                ) : (
                  <>
                    <MapPin size={11} style={{ color: "var(--c-sub)" }} />
                    <span className="text-[11px]" style={{ color: "var(--c-sub)" }}>Fetching weather…</span>
                  </>
                )}
                {/* Streak badge */}
                <span className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "var(--c-warn-bg)", border: "1px solid var(--c-warn-border)", color: "var(--c-warn)" }}>
                  <Zap size={10} /> {streak}d
                </span>
              </div>

              {/* Goals */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {goalList.map(g => (
                  <span key={g} className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border-bright)", color: "var(--c-accent)" }}>
                    <Target size={9} /> {g}
                  </span>
                ))}
              </div>
            </div>

            {/* REX + Calorie ring */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <REX state="idle" size="xs" />
              </div>
              <CalRing consumed={loggedCal} target={plan.calories} size={64} />
              <p className="text-[9px] text-center font-semibold" style={{ color: "var(--c-sub)" }}>
                / {plan.calories}
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-3 border-l-2 pl-3" style={{ borderColor: "var(--c-accent)" }}>
            <p className="text-[11px] italic leading-relaxed" style={{ color: "var(--c-sub)" }}>{quote}</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">

        {/* ── Daily macro targets (top) ────────────────────────────── */}
        {plan.macros && (
          <div>
            <SectionHeader title="Daily targets" />
            <motion.div
              className="grid grid-cols-4 gap-2"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[
                { label: "Protein", val: plan.macros.protein, color: "var(--c-accent)" },
                { label: "Carbs",   val: plan.macros.carbs,   color: "var(--c-warn)" },
                { label: "Fat",     val: plan.macros.fat,      color: "#F87171" },
                { label: "Fibre",   val: plan.macros.fibre,    color: "var(--c-cool)" },
              ].map(({ label, val, color }) => (
                <motion.div key={label} variants={staggerItem} className="rounded-2xl p-3 text-center"
                  style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
                  <p className="text-base font-extrabold" style={{ color }}>{val}g</p>
                  <p className="text-[9px] mt-0.5 font-semibold" style={{ color: "var(--c-sub)" }}>{label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* ── Today's progress strip ─────────────────────────────── */}
        <motion.div
          className="grid grid-cols-3 gap-3 mt-5"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {[
            {
              icon: "🔥", label: "Calories",
              value: `${loggedCal}`, sub: `/ ${plan.calories}`,
              color: "#FC4C02", bg: "rgba(252,76,2,0.10)", border: "rgba(252,76,2,0.25)",
              pct: Math.min(loggedCal / plan.calories, 1),
            },
            {
              icon: "💧", label: "Water",
              value: `${waterGlasses}`, sub: `/ ${waterTarget} gl`,
              color: "#38BDF8", bg: "rgba(56,189,248,0.1)", border: "rgba(56,189,248,0.25)",
              pct: Math.min(waterGlasses / waterTarget, 1),
            },
            {
              icon: todayPlan?.workout?.type === "Rest" ? "😴" : "💪",
              label: todayPlan?.workout?.type === "Rest" ? "Rest" : "Workout",
              value: (todayPlan?.workout?.type || "Rest").split(" ")[0],
              sub: todayPlan?.workout?.duration || "today",
              color: "var(--c-cool)", bg: "var(--c-cool-bg)", border: "var(--c-cool-border)",
              pct: null,
            },
          ].map(({ icon, label, value, sub, color, bg, border, pct }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className="rounded-2xl p-3 flex flex-col"
              style={{ background: bg, border: `1px solid ${border}`, boxShadow: "var(--c-card-shadow)" }}
            >
              <p className="text-base leading-none mb-1">{icon}</p>
              <p className="text-[17px] font-extrabold leading-tight tabular-nums" style={{ color }}>{value}</p>
              <p className="text-[9px] font-bold mt-0.5 uppercase tracking-wide" style={{ color }}>{label}</p>
              <p className="text-[9px] mt-0.5 leading-tight" style={{ color: "var(--c-sub)" }}>{sub}</p>
              {pct !== null && (
                <div className="mt-2.5">
                  {/* Segmented progress — segments reveal with stagger, feel earned */}
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-full"
                        style={{ height: 4, background: i / 10 < pct ? color : "rgba(255,255,255,0.12)" }}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ duration: 0.22, delay: 0.12 + i * 0.035, ease: [0.0, 0.0, 0.2, 1.0] }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] font-bold text-right" style={{ color }}>
                    {Math.round(pct * 100)}%
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* ── Quick actions ──────────────────────────────────────── */}
        <div className="flex gap-3 mt-4">
          <motion.button
            onClick={() => navigate("/log")}
            {...pressable}
            className="flex-1 flex items-center gap-3 rounded-2xl p-4 text-left"
            style={{
              background: "linear-gradient(135deg, rgba(var(--c-accent-rgb),0.14), rgba(var(--c-accent-rgb),0.06))",
              border: "1px solid var(--c-border-bright)",
              boxShadow: "var(--c-card-shadow)",
            }}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--c-accent)" }}>
              <ClipboardList size={18} color="#fff" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>Log Today</p>
              <p className="text-[11px]" style={{ color: "var(--c-sub)" }}>Food & water</p>
            </div>
          </motion.button>
          <motion.button
            onClick={() => navigate("/exercise")}
            {...pressable}
            className="flex-1 flex items-center gap-3 rounded-2xl p-4 text-left"
            style={{
              background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.04))",
              border: "1px solid var(--c-cool-border)",
              boxShadow: "var(--c-card-shadow)",
            }}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--c-cool)" }}>
              <Dumbbell size={18} color="#fff" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>Train</p>
              <p className="text-[11px]" style={{ color: "var(--c-sub)" }}>Today's plan</p>
            </div>
          </motion.button>
        </div>


        {/* ── Today's meals ─────────────────────────────────────── */}
        {todayPlan?.meals && (
          <div>
            <SectionHeader title="Today's meals" action="Diet plan" onAction={() => navigate("/diet")} />
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
              {Object.entries(todayPlan.meals).map(([type, meal], idx, arr) => {
                const borderColor = MEAL_BORDER[type] || "var(--c-accent)";
                return (
                  <button key={type} onClick={() => navigate("/diet")}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.99]"
                    style={{ borderBottom: idx < arr.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                    <div style={{ width: 3, alignSelf: "stretch", background: borderColor, borderRadius: 2, flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold capitalize" style={{ color: borderColor }}>{type}</p>
                      <p className="text-sm font-semibold leading-tight mt-0.5 truncate" style={{ color: "var(--c-text)" }}>{meal.name}</p>
                    </div>
                    <p className="text-xs font-bold flex-shrink-0" style={{ color: borderColor }}>{meal.calories} kcal</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Today's workout ─────────────────────────────────────── */}
        {todayPlan?.workout && (
          <div>
            <SectionHeader title="Today's workout" />
            <button onClick={() => navigate("/exercise")}
              className="w-full rounded-2xl p-4 text-left transition-all active:scale-95"
              style={{
                background: "var(--c-card)",
                borderLeft: "4px solid var(--c-accent)",
                border: "1px solid var(--c-border)",
                borderLeftColor: "var(--c-accent)",
                borderLeftWidth: 4,
                boxShadow: "var(--c-card-shadow)",
              }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>
                    {todayPlan.workout.focus || todayPlan.workout.type}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                      style={{ background: "var(--c-accent-bg)", color: "var(--c-accent)" }}>
                      {todayPlan.workout.type}
                    </span>
                    {todayPlan.workout.duration && (
                      <span className="rounded-full px-2.5 py-0.5 text-[10px]"
                        style={{ background: "var(--c-pill-inactive)", color: "var(--c-sub)" }}>
                        {todayPlan.workout.duration}
                      </span>
                    )}
                    {todayPlan.workout.exercises?.length > 0 && (
                      <span className="rounded-full px-2.5 py-0.5 text-[10px]"
                        style={{ background: "var(--c-pill-inactive)", color: "var(--c-sub)" }}>
                        {todayPlan.workout.exercises.length} exercises
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--c-accent-bg)" }}>
                  <Dumbbell size={18} style={{ color: "var(--c-accent)" }} />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── Ask FiTAi ───────────────────────────────────────────── */}
        <div className="mt-5">
          <button onClick={() => navigate("/coach")}
            className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(138,127,255,0.16), rgba(138,127,255,0.06))",
              border: "1px solid var(--c-border-bright)",
              boxShadow: "var(--c-card-shadow)",
            }}>
            <div className="flex items-center gap-4 px-4 py-3">
              <div style={{ flexShrink: 0, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <REX state="idle" size="xs" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--c-accent)" }}>Your AI Coach</p>
                <p className="font-bold text-base" style={{ color: "var(--c-text)" }}>Chat with FiTAi →</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--c-sub)" }}>Nutrition · Workouts · Motivation</p>
              </div>
            </div>
          </button>
        </div>

        {/* ── APEX AI daily tip ────────────────────────────────────── */}
        <div className="mt-5">
          <SectionHeader title="Today's tip" />
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(var(--c-accent-rgb),0.10), rgba(var(--c-accent-rgb),0.04))",
              border: "1px solid var(--c-border-bright)",
              boxShadow: "var(--c-card-shadow)",
            }}
          >
            <div className="flex items-start gap-3 px-4 py-4">
              {/* APEX in talking state */}
              <div style={{ flexShrink: 0, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                <REX state="talking" size="xs" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--c-accent)" }}>
                  APEX · {isRestDay ? "Recovery day" : "Training day"}
                </p>
                {/* Speech bubble tail */}
                <div className="rounded-xl rounded-tl-sm px-3 py-2.5"
                  style={{ background: "var(--c-card)", border: "1px solid var(--c-border)" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--c-text)" }}>{aiTip}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Health tip (bottom) ──────────────────────────────────── */}
        {hasCondition && plan.conditionNote && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "var(--c-warn-bg)", border: "1px solid var(--c-warn-border)" }}>
            <Info size={15} style={{ color: "var(--c-warn)", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ color: "var(--c-warn)" }}>Health note</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--c-sub)" }}>{plan.conditionNote}</p>
            </div>
          </motion.div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
