import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame, Droplets, Dumbbell, Zap, ChevronRight, Info,
  Target, UtensilsCrossed, MapPin, Quote
} from "lucide-react";
import REX from "../components/REX";
import { cache } from "../lib/cache";
import { bmiCategory, dayStreak } from "../lib/calculations";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* ── Daily motivation quotes (rotates by day of year) ─────────── */
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
  const diff = new Date() - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

/* ── Weather code → emoji + label ─────────────────────────────── */
function weatherInfo(code) {
  if (code === 0)                return { emoji: "☀️", label: "Clear" };
  if (code <= 3)                 return { emoji: "⛅", label: "Partly cloudy" };
  if (code <= 48)                return { emoji: "🌫️", label: "Foggy" };
  if (code <= 67)                return { emoji: "🌧️", label: "Rainy" };
  if (code <= 77)                return { emoji: "❄️", label: "Snowy" };
  if (code <= 82)                return { emoji: "🌦️", label: "Showers" };
  return                                { emoji: "⛈️", label: "Stormy" };
}

/* ── useWeather hook ───────────────────────────────────────────── */
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
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
          });
        } catch {}
      },
      () => {}
    );
  }, []);

  return weather;
}

/* ── Dashboard ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const profile = cache.getProfile();
  const plan = cache.getPlan();
  const stats = cache.getStats();
  const weather = useWeather();

  if (!profile || !plan) { navigate("/onboarding", { replace: true }); return null; }

  const dayName = DAYS[new Date().getDay()];
  const todayPlan = plan.weekPlan?.find((d) => d.day === dayName) || plan.weekPlan?.[0];
  const streak = dayStreak(stats.startDate);
  const goalList = Array.isArray(profile.goals) ? profile.goals : [profile.goal || ""].filter(Boolean);
  const hasCondition = profile.conditions?.some((c) => c !== "None");
  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const waterLitres = parseFloat(String(plan.water).replace("L", "")) || 2.5;
  const quote = getDailyQuote();

  const statCards = [
    { label: "Calories", value: `${plan.calories ?? "—"}`, sub: "kcal target",           Icon: Flame,   color: "#FF6B6B",          glow: "rgba(255,107,107,0.15)" },
    { label: "Water",    value: `${waterLitres}L`,          sub: "daily goal",             Icon: Droplets,color: "#4ECDC4",           glow: "rgba(78,205,196,0.15)" },
    { label: "Workout",  value: todayPlan?.workout?.type || "Rest", sub: todayPlan?.workout?.duration || "today", Icon: Dumbbell, color: "var(--c-accent)", glow: "var(--c-accent-bg)" },
    { label: "Streak",   value: `${streak}d`,               sub: "days active",            Icon: Zap,     color: "var(--c-warn)",     glow: "var(--c-warn-bg)" },
    { label: "Focus",    value: (profile.bodyFocus || "Full").split(" ")[0], sub: profile.bodyFocus || "Full body", Icon: Target, color: "var(--c-accent)", glow: "var(--c-accent-bg)" },
  ];

  const wInfo = weather ? weatherInfo(weather.code) : null;

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>

      {/* ── Hero header card ───────────────────────────────────── */}
      <div className="px-4 pt-safe pt-4">
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--c-card)",
            border: "1px solid var(--c-border-bright)",
            boxShadow: "var(--c-card-shadow)",
          }}>

          {/* Accent gradient top strip */}
          <div style={{ height: 3, background: "linear-gradient(90deg, var(--c-accent) 0%, #FF6B6B 50%, #4ECDC4 100%)" }} />

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* Left: text content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: "var(--c-sub)" }}>{dateStr}</p>
                <h1 className="mt-0.5 text-2xl font-bold leading-tight" style={{ color: "var(--c-text)" }}>
                  {greeting()}, {profile.name?.split(" ")[0]} 👋
                </h1>

                {/* Weather row */}
                {wInfo ? (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-base leading-none">{wInfo.emoji}</span>
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
                    <span key={g} className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border-bright)", color: "var(--c-accent)" }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: REX — absolute scale from bottom so full figure is visible */}
              <div style={{ position: "relative", flexShrink: 0, width: 66, height: 90, overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: "50%", transformOrigin: "bottom center", transform: "translateX(-50%) scale(0.45)" }}>
                  <REX state="idle" />
                </div>
              </div>
            </div>

            {/* Motivation quote */}
            <div className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2"
              style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)" }}>
              <Quote size={12} style={{ color: "var(--c-accent)", flexShrink: 0, marginTop: 2 }} />
              <p className="text-[11px] leading-relaxed italic" style={{ color: "var(--c-sub)" }}>
                {quote}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">

        {/* Stats scroll */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {statCards.map(({ label, value, sub, Icon, color, glow }) => (
            <div key={label} className="flex-shrink-0 w-[118px] rounded-2xl p-3"
              style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: glow }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="mt-2 text-xl font-extrabold" style={{ color: "var(--c-text)" }}>{value}</p>
              <p className="text-[11px] font-semibold" style={{ color }}>{label}</p>
              <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Today's Log shortcut */}
        <button onClick={() => navigate("/log")}
          className="w-full rounded-2xl p-4 flex items-center justify-between transition-all active:scale-95"
          style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--c-accent-bg)" }}>
              <UtensilsCrossed size={18} style={{ color: "var(--c-accent)" }} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>Today's Log</p>
              <p className="text-xs" style={{ color: "var(--c-sub)" }}>Track food & water</p>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "var(--c-sub)" }} />
        </button>

        {/* Health condition tip */}
        {hasCondition && plan.conditionNote && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "rgba(var(--c-accent-rgb),0.07)", borderLeft: "3px solid var(--c-accent)" }}>
            <Info size={16} style={{ color: "var(--c-accent)", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: "var(--c-accent)" }}>Health tip for you</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--c-sub)" }}>{plan.conditionNote}</p>
            </div>
          </motion.div>
        )}

        {/* Today's meals */}
        {todayPlan?.meals && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold" style={{ color: "var(--c-text)" }}>Today's meals</h2>
              <button onClick={() => navigate("/diet")} className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--c-accent)" }}>
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(todayPlan.meals).map(([type, meal]) => (
                <button key={type} onClick={() => navigate("/diet")}
                  className="rounded-2xl p-3 text-left transition-all active:scale-95"
                  style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--c-sub)" }}>{type}</p>
                  <p className="mt-1 text-xs font-bold leading-tight" style={{ color: "var(--c-text)" }}>{meal.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--c-accent)" }}>{meal.calories} kcal</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today's workout */}
        {todayPlan?.workout && (
          <button onClick={() => navigate("/exercise")}
            className="w-full rounded-2xl p-4 text-left transition-all active:scale-95 gradient-border"
            style={{ background: "var(--c-card)" }}>
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
        )}

        {/* Ask FiTAi — REX clipped to prevent animation overflow */}
        <button onClick={() => navigate("/coach")}
          className="w-full rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-95"
          style={{ background: "var(--c-card)", border: "1px solid var(--c-border-bright)", boxShadow: "var(--c-card-shadow)" }}>
          <div style={{ position: "relative", flexShrink: 0, width: 60, height: 80, overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: "50%", transformOrigin: "bottom center", transform: "translateX(-50%) scale(0.40)" }}>
              <REX state="idle" />
            </div>
          </div>
          <div className="text-left flex-1">
            <p className="font-bold" style={{ color: "var(--c-text)" }}>Ask FiTAi</p>
            <p className="text-xs" style={{ color: "var(--c-sub)" }}>Your AI coach is ready to help</p>
          </div>
          <ChevronRight size={18} style={{ color: "var(--c-accent)" }} />
        </button>

        {/* Daily targets */}
        {plan.macros && (
          <div>
            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--c-text)" }}>Daily targets</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Protein", val: plan.macros.protein, color: "var(--c-accent)" },
                { label: "Carbs",   val: plan.macros.carbs,   color: "var(--c-warn)" },
                { label: "Fat",     val: plan.macros.fat,     color: "#FF6B6B" },
                { label: "Fibre",   val: plan.macros.fibre,   color: "#4ECDC4" },
              ].map(({ label, val, color }) => (
                <div key={label} className="rounded-xl p-3 text-center"
                  style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", boxShadow: "var(--c-card-shadow)" }}>
                  <p className="text-base font-extrabold" style={{ color }}>{val}g</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--c-sub)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
