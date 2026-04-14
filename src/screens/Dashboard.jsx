import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame, Droplets, Dumbbell, Zap, ChevronRight, Info,
  Target, UtensilsCrossed, MapPin, Sun, Cloud, CloudSun,
  CloudRain, Snowflake, CloudDrizzle, CloudLightning, ClipboardList,
} from "lucide-react";
import REX from "../components/REX";
import { cache } from "../lib/cache";
import { bmiCategory, dayStreak } from "../lib/calculations";

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
  "Wake up. Work out. Look hot. Win.",
  "Train insane or remain the same.",
  "Sweat now. Shine later.",
  "You don't have to be great to start, but you have to start to be great.",
  "The pain you feel today is the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done.",
  "Small steps every day lead to massive results.",
  "Believe in yourself and all that you are.",
  "Make yourself proud.",
  "Your health is an investment, not an expense.",
  "Progress, not perfection.",
  "Every workout is a step closer to your goal.",
  "Be stronger than your excuses.",
  "Do something today your future self will thank you for.",
  "A little progress each day adds up to big results.",
  "Consistency is the key to transformation.",
  "Champions aren't made in gyms. They are made from something deep inside them.",
  "The clock is ticking. Are you becoming the person you want to be?",
  "Sore today. Strong tomorrow.",
  "Your only competition is who you were yesterday.",
  "It never gets easier. You just get stronger.",
  "One rep at a time. One day at a time.",
  "Discipline is doing what needs to be done even when you don't want to do it.",
  "Results happen over time, not overnight. Work hard, stay consistent.",
  "Fitness is not a destination. It is a way of life.",
  "Take care of your body. It's the only place you have to live.",
];

function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((new Date() - start) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

/* ── Weather code → Lucide icon ───────────────────────────────────── */
function weatherInfo(code) {
  if (code === 0)  return { Icon: Sun,            label: "Clear",         color: "#F59E0B" };
  if (code <= 3)   return { Icon: CloudSun,        label: "Partly cloudy", color: "#F59E0B" };
  if (code <= 48)  return { Icon: Cloud,           label: "Foggy",         color: "var(--c-sub)" };
  if (code <= 67)  return { Icon: CloudRain,        label: "Rainy",         color: "#4ECDC4" };
  if (code <= 77)  return { Icon: Snowflake,        label: "Snowy",         color: "#4ECDC4" };
  if (code <= 82)  return { Icon: CloudDrizzle,     label: "Showers",       color: "#4ECDC4" };
  return               { Icon: CloudLightning,   label: "Stormy",        color: "#FF6B6B" };
}

function useWeather() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`
          );
          const data = await res.json();
          setWeather({ temp: Math.round(data.current.temperature_2m), code: data.current.weather_code });
        } catch {}
      }, () => {}
    );
  }, []);
  return weather;
}

/* ── Section header with left accent border ────────────────────────── */
function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-6">
      <h2 className="text-base font-bold border-l-[3px] pl-3"
        style={{ color: "var(--c-text)", borderColor: "var(--c-accent)" }}>
        {title}
      </h2>
      {action && (
        <button onClick={onAction} className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: "var(--c-accent)" }}>
          {action} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

/* ── Meal type left-border color ───────────────────────────────────── */
const MEAL_BORDER = {
  breakfast: "var(--c-accent)",
  lunch: "var(--c-warn)",
  dinner: "#FF6B6B",
  snacks: "var(--c-cool)",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = cache.getProfile();
  const plan = cache.getPlan();
  const stats = cache.getStats();
  const weather = useWeather();

  if (!profile || !plan) { navigate("/onboarding", { replace: true }); return null; }

  const dayName = DAYS[new Date().getDay()];
  const jsDay = new Date().getDay();
  const monIdx = jsDay === 0 ? 6 : jsDay - 1;
  const weekLen = plan.weekPlan?.length || 7;
  const todayPlan = plan.weekPlan?.[Math.min(monIdx, weekLen - 1)] || plan.weekPlan?.[0];

  const streak = dayStreak(stats.startDate);
  const goalList = Array.isArray(profile.goals) ? profile.goals : [profile.goal || ""].filter(Boolean);
  const hasCondition = profile.conditions?.some((c) => c !== "None");
  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const waterLitres = parseFloat(String(plan.water).replace("L", "")) || 2.5;
  const quote = getDailyQuote();

  const statCards = [
    { label: "Calories", value: `${plan.calories ?? "—"}`, sub: "kcal target", Icon: Flame,   color: "#FF6B6B",          glow: "rgba(255,107,107,0.15)",  top: "#FF6B6B" },
    { label: "Water",    value: `${waterLitres}L`,          sub: "daily goal",  Icon: Droplets, color: "#4ECDC4",           glow: "rgba(78,205,196,0.15)",   top: "#4ECDC4" },
    { label: "Workout",  value: (todayPlan?.workout?.type || "Rest").split(" ")[0], sub: todayPlan?.workout?.duration || "today", Icon: Dumbbell, color: "var(--c-accent)", glow: "var(--c-accent-bg)", top: "var(--c-accent)" },
    { label: "Streak",   value: `${streak}d`,               sub: "days active", Icon: Zap,      color: "var(--c-warn)",     glow: "var(--c-warn-bg)",        top: "var(--c-warn)" },
    { label: "Focus",    value: (profile.bodyFocus || "Full").split(" ")[0], sub: profile.bodyFocus || "Full body", Icon: Target, color: "var(--c-accent)", glow: "var(--c-accent-bg)", top: "var(--c-accent)" },
  ];

  const wInfo = weather ? weatherInfo(weather.code) : null;
  const WIcon = wInfo?.Icon;

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>

      {/* ── Hero header card ───────────────────────────────────────── */}
      <div className="px-4 pt-safe pt-4">
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--c-card)",
            border: "1px solid var(--c-border-bright)",
            boxShadow: "var(--c-card-shadow)",
            backgroundImage: "radial-gradient(ellipse at top right, rgba(124,109,255,0.12), transparent 60%)",
          }}>

          {/* Accent strip */}
          <div style={{ height: 3, background: "linear-gradient(90deg, var(--c-accent), #9B8FFF)" }} />

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* Left */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: "var(--c-sub)" }}>{dateStr}</p>
                <h1 className="mt-0.5 text-2xl font-bold leading-tight" style={{ color: "var(--c-text)" }}>
                  {greeting()}, {profile.name?.split(" ")[0]} 👋
                </h1>

                {/* Weather */}
                {wInfo ? (
                  <div className="flex items-center gap-1.5 mt-2">
                    <WIcon size={14} style={{ color: wInfo.color }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>{weather.temp}°C</span>
                    <span className="text-xs" style={{ color: "var(--c-sub)" }}>{wInfo.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin size={11} style={{ color: "var(--c-sub)" }} />
                    <span className="text-[11px]" style={{ color: "var(--c-sub)" }}>Fetching weather…</span>
                  </div>
                )}

                {/* Goal pills */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {goalList.map((g) => (
                    <span key={g} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border-bright)", color: "var(--c-accent)" }}>
                      <Target size={10} /> {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* REX — larger, anchored to bottom */}
              <div style={{ position: "relative", flexShrink: 0, width: 100, height: 140, overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: "50%", transformOrigin: "bottom center", transform: "translateX(-50%) scale(0.65)" }}>
                  <REX state="idle" />
                </div>
              </div>
            </div>

            {/* Motivation quote — borderless italic */}
            <div className="mt-3 border-l-2 pl-3 ml-1" style={{ borderColor: "var(--c-accent)" }}>
              <p className="text-[11px] leading-relaxed italic" style={{ color: "var(--c-sub)" }}>{quote}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">

        {/* ── Stats scroll ───────────────────────────────────────── */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {statCards.map(({ label, value, sub, Icon, color, glow, top }) => (
              <div key={label} className="flex-shrink-0 min-w-[120px] flex-1 basis-[120px] rounded-2xl overflow-hidden"
                style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
                {/* Top color line */}
                <div style={{ height: 3, background: top }} />
                <div className="p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: glow }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <p className="mt-2 text-xl font-extrabold truncate" style={{ color: "var(--c-text)" }}>{value}</p>
                  <p className="text-[11px] font-semibold" style={{ color }}>{label}</p>
                  <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Overflow hint */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10"
            style={{ background: "linear-gradient(to left, var(--c-bg), transparent)" }} />
        </div>

        {/* ── Quick actions ──────────────────────────────────────── */}
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate("/log")}
            className="flex-1 flex items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-95"
            style={{ background: "var(--c-card)", borderLeft: "4px solid var(--c-accent)", border: "1px solid var(--c-border)", borderLeftWidth: 4, borderLeftColor: "var(--c-accent)", boxShadow: "var(--c-card-shadow)", minHeight: 76 }}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--c-accent-bg)" }}>
              <ClipboardList size={18} style={{ color: "var(--c-accent)" }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>Log Today</p>
              <p className="text-xs" style={{ color: "var(--c-sub)" }}>Track food & water</p>
            </div>
          </button>
          <button onClick={() => navigate("/exercise")}
            className="flex-1 flex items-center gap-3 rounded-2xl p-4 text-left transition-all active:scale-95"
            style={{ background: "var(--c-card)", borderLeft: "4px solid var(--c-warn)", border: "1px solid var(--c-border)", borderLeftWidth: 4, borderLeftColor: "var(--c-warn)", boxShadow: "var(--c-card-shadow)", minHeight: 76 }}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--c-warn-bg)" }}>
              <Dumbbell size={18} style={{ color: "var(--c-warn)" }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>Start Workout</p>
              <p className="text-xs" style={{ color: "var(--c-sub)" }}>View today's plan</p>
            </div>
          </button>
        </div>

        {/* Health condition tip */}
        {hasCondition && plan.conditionNote && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-start gap-3 mt-6"
            style={{ background: "rgba(var(--c-accent-rgb),0.07)", borderLeft: "3px solid var(--c-accent)" }}>
            <Info size={16} style={{ color: "var(--c-accent)", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: "var(--c-accent)" }}>Health tip for you</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--c-sub)" }}>{plan.conditionNote}</p>
            </div>
          </motion.div>
        )}

        {/* ── Today's meals — vertical list ─────────────────────── */}
        {todayPlan?.meals && (
          <div>
            <SectionHeader title="Today's meals" action="View all" onAction={() => navigate("/diet")} />
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
                      <p className="text-[11px] font-semibold capitalize" style={{ color: "var(--c-sub)" }}>{type}</p>
                      <p className="text-sm font-bold leading-tight mt-0.5 truncate" style={{ color: "var(--c-text)" }}>{meal.name}</p>
                    </div>
                    <p className="text-xs font-bold flex-shrink-0" style={{ color: "var(--c-accent)" }}>{meal.calories} kcal</p>
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
              style={{ background: "var(--c-card)", borderLeft: "4px solid var(--c-accent)", border: "1px solid var(--c-border)", borderLeftWidth: 4, borderLeftColor: "var(--c-accent)", boxShadow: "var(--c-card-shadow)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-sub)" }}>Today's workout</p>
                  <p className="mt-1 font-bold text-base" style={{ color: "var(--c-text)" }}>{todayPlan.workout.focus}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border-bright)", color: "var(--c-accent)" }}>
                      {todayPlan.workout.type}
                    </span>
                    {todayPlan.workout.duration && (
                      <span className="rounded-full px-2.5 py-1 text-xs"
                        style={{ background: "var(--c-pill-inactive)", border: "1px solid var(--c-border)", color: "var(--c-sub)" }}>
                        {todayPlan.workout.duration}
                      </span>
                    )}
                    {todayPlan.workout.exercises?.length > 0 && (
                      <span className="rounded-full px-2.5 py-1 text-xs"
                        style={{ background: "var(--c-pill-inactive)", border: "1px solid var(--c-border)", color: "var(--c-sub)" }}>
                        {todayPlan.workout.exercises.length} exercises
                      </span>
                    )}
                  </div>
                </div>
                <Dumbbell size={28} style={{ color: "var(--c-accent)", opacity: 0.7 }} />
              </div>
            </button>
          </div>
        )}

        {/* ── Ask FiTAi banner ────────────────────────────────────── */}
        <div className="mt-6">
          <button onClick={() => navigate("/coach")}
            className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(124,109,255,0.18), rgba(124,109,255,0.08))",
              border: "1px solid var(--c-border-bright)",
              boxShadow: "var(--c-card-shadow)",
            }}>
            <div className="flex items-center gap-3 p-4" style={{ minHeight: 100 }}>
              <div style={{ position: "relative", flexShrink: 0, width: 80, height: 120, overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: "50%", transformOrigin: "bottom center", transform: "translateX(-50%) scale(0.55)" }}>
                  <REX state="idle" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--c-accent)" }}>Your AI Coach</p>
                <p className="font-bold text-base" style={{ color: "var(--c-text)" }}>Ask FiTAi →</p>
                <p className="text-xs mt-1" style={{ color: "var(--c-sub)" }}>Nutrition · Workouts · Motivation</p>
              </div>
            </div>
          </button>
        </div>

        {/* ── Daily targets 2×2 ───────────────────────────────────── */}
        {plan.macros && (
          <div>
            <SectionHeader title="Daily targets" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Protein", val: plan.macros.protein, color: "var(--c-accent)" },
                { label: "Carbs",   val: plan.macros.carbs,   color: "var(--c-warn)" },
                { label: "Fat",     val: plan.macros.fat,     color: "#FF6B6B" },
                { label: "Fibre",   val: plan.macros.fibre,   color: "#4ECDC4" },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
                  <p className="text-lg font-extrabold" style={{ color }}>{val}g</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--c-sub)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
