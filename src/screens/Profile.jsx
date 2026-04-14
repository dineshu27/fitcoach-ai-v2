import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, RefreshCw, AlertCircle, Trash2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import REX from "../components/REX";
import { cache } from "../lib/cache";
import { generateWeeklyPlan } from "../lib/api";
import { calcBMI, calcBMR, calcTDEE, calcTargetCalories, calcMacros, bmiCategory, calcWaterIntake, calcHeartRateZones, dayStreak } from "../lib/calculations";
import PlanLoading from "./PlanLoading";

const COND_COLORS = {
  "High LDL / High Cholesterol":    { bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.3)",  color: "#FF6B6B" },
  "Type 2 Diabetes":                 { bg: "rgba(255,165,0,0.15)",   border: "rgba(255,165,0,0.3)",    color: "#FFA500" },
  "Hypertension (High Blood Pressure)": { bg: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.25)", color: "#FF6B6B" },
  "PCOS":                            { bg: "rgba(var(--c-accent-rgb),0.15)",  border: "rgba(var(--c-accent-rgb),0.3)",   color: "var(--c-accent)" },
  "Thyroid condition":               { bg: "rgba(78,205,196,0.15)",  border: "rgba(78,205,196,0.3)",   color: "#4ECDC4" },
  "Obesity (BMI 30+)": { bg: "var(--c-warn-bg)", border: "var(--c-warn-border)", color: "var(--c-warn)" },
  "Joint pain / Arthritis":          { bg: "rgba(78,205,196,0.12)",  border: "rgba(78,205,196,0.25)", color: "#4ECDC4" },
};

function ActionBtn({ onClick, Icon, label, style }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl p-4 text-left font-semibold transition-all active:scale-95" style={style}>
      <Icon size={18} />
      {label}
    </button>
  );
}

function BMIBar({ bmi }) {
  if (!bmi) return null;
  const capped = Math.min(Math.max(bmi, 10), 40);
  const pct = ((capped - 10) / 30) * 100;
  const segments = [
    { label: "Under", end: 46.7, color: "#4ECDC4" },
    { label: "Normal", end: 66.7, color: "#4CAF50" },
    { label: "Over",   end: 83.3, color: "var(--c-warn)" },
    { label: "Obese",  end: 100,  color: "#FF6B6B" },
  ];
  const bmiColor = bmi < 18.5 ? "#4ECDC4" : bmi < 25 ? "#4CAF50" : bmi < 30 ? "var(--c-warn)" : "#FF6B6B";
  return (
    <div>
      <div className="relative h-3 rounded-full overflow-hidden flex" style={{ background: "var(--c-border)" }}>
        {segments.map((s, i) => (
          <div key={i} className="h-full" style={{ width: `${s.end - (segments[i - 1]?.end || 0)}%`, background: s.color, opacity: 0.6 }} />
        ))}
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all"
          style={{ left: `calc(${pct}% - 8px)`, background: bmiColor }} />
      </div>
      <div className="flex justify-between mt-1 text-[9px]" style={{ color: "var(--c-sub)" }}>
        {segments.map((s) => <span key={s.label}>{s.label}</span>)}
      </div>
    </div>
  );
}

function ProjectionCard({ label, weeks, currentWeight, deficitPerDay }) {
  const days = weeks * 7;
  const kgChange = (deficitPerDay * days) / 7700;
  const projectedWeight = Math.max(30, currentWeight + kgChange);
  const isLoss = kgChange < -0.05;
  const isGain = kgChange > 0.05;
  const Icon = isLoss ? TrendingDown : isGain ? TrendingUp : Minus;
  const color = isLoss ? "#4ECDC4" : isGain ? "var(--c-warn)" : "var(--c-sub)";

  return (
    <div className="rounded-xl p-3 text-center" style={{ background: "var(--c-card)", border: "1px solid var(--c-border)" }}>
      <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--c-sub)" }}>{label}</p>
      <div className="flex items-center justify-center gap-1 mb-0.5">
        <Icon size={14} style={{ color }} />
        <p className="text-lg font-extrabold" style={{ color: "var(--c-text)" }}>{projectedWeight.toFixed(1)}<span className="text-xs font-normal">kg</span></p>
      </div>
      <p className="text-[10px]" style={{ color }}>
        {kgChange > 0 ? "+" : ""}{kgChange.toFixed(1)} kg
      </p>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const profile = cache.getProfile();
  const plan = cache.getPlan();
  const stats = cache.getStats();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!profile) { navigate("/onboarding", { replace: true }); return null; }

  const bmiCat = bmiCategory(plan?.bmi || 0);
  const streak = dayStreak(stats.startDate);
  const initials = (profile.name || "?").split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2) || "?";
  const conditions = (profile.conditions || []).filter((c) => c !== "None");
  const goalList = Array.isArray(profile.goals) ? profile.goals : [profile.goal || ""].filter(Boolean);
  const planAge = cache.planAge();

  // Projections
  const bmr = calcBMR(profile.weight, profile.height, profile.age, profile.sex);
  const tdee = calcTDEE(bmr, profile.activity);
  const targetCals = plan?.calories || calcTargetCalories(tdee, profile.goals);
  const deficitPerDay = targetCals - tdee; // negative = deficit, positive = surplus

  async function regenerate() {
    setLoading(true); setError("");
    try {
      const bmi2 = calcBMI(profile.weight, profile.height);
      const bmr2 = calcBMR(profile.weight, profile.height, profile.age, profile.sex);
      const tdee2 = calcTDEE(bmr2, profile.activity);
      const calories = calcTargetCalories(tdee2, profile.goals);
      const macros = calcMacros(calories, profile.goals, profile.conditions);
      const hrZones = calcHeartRateZones(profile.age);
      const water = calcWaterIntake(profile.weight);
      const newPlan = await generateWeeklyPlan(profile, { calories, macros, bmi: bmi2, hrZones, water });
      newPlan.calories = calories; newPlan.macros = macros; newPlan.bmi = bmi2; newPlan.water = water;
      cache.savePlan(newPlan);
      navigate("/dashboard", { replace: true });
    } catch (e) { setError(e.message || "Failed to regenerate."); }
    finally { setLoading(false); }
  }

  function reset() {
    if (!confirm("Reset all data and start over?")) return;
    cache.clearAll();
    navigate("/onboarding", { replace: true });
  }

  if (loading) return <PlanLoading />;

  const macroGoals = [
    { label: "Protein", val: plan?.macros?.protein, color: "var(--c-accent)", pct: 35 },
    { label: "Carbs",   val: plan?.macros?.carbs,   color: "var(--c-warn)", pct: 40 },
    { label: "Fat",     val: plan?.macros?.fat,      color: "#FF6B6B", pct: 25 },
  ];

  return (
    <div className="min-h-screen pb-nav" style={{ background: "var(--c-bg)" }}>
      {/* Header */}
      <div className="px-4 pt-safe pt-6 pb-6"
        style={{ background: "linear-gradient(180deg, var(--c-accent-bg) 0%, transparent 100%)", borderBottom: "1px solid var(--c-border)" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-extrabold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--c-accent), #FF6B6B)", color: "#fff", boxShadow: "0 0 30px rgba(var(--c-accent-rgb),0.4)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold" style={{ color: "var(--c-text)" }}>{profile.name}</h1>
            <p className="text-sm" style={{ color: "var(--c-sub)" }}>{profile.age} yrs · {profile.sex}</p>
            <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ background: "var(--c-warn-bg)", border: "1px solid var(--c-warn-border)", color: "var(--c-warn)" }}>
              FREE
            </span>
          </div>
          <REX state="idle" size="sm" />
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Day streak", val: streak, color: "var(--c-warn)" },
            { label: "BMI",        val: plan?.bmi, color: bmiCat.color || "var(--c-accent)" },
            { label: "Workouts",   val: stats.workoutsLogged, color: "#4ECDC4" },
          ].map(({ label, val, color }) => (
            <div key={label} className="rounded-2xl p-3 text-center glass">
              <p className="text-2xl font-extrabold" style={{ color }}>{val ?? "—"}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--c-sub)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* BMI visual */}
        <div className="rounded-2xl p-4 glass">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold" style={{ color: "var(--c-text)" }}>Body Stats</h3>
            {plan?.bmi && <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "var(--c-accent-bg)", color: "var(--c-accent)" }}>{bmiCat.label}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Weight", val: `${profile.weight} kg` },
              { label: "Height", val: `${profile.height} cm` },
              { label: "BMI", val: plan?.bmi ?? "—" },
              { label: "Daily calories", val: `${plan?.calories || "—"} kcal` },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[11px]" style={{ color: "var(--c-sub)" }}>{label}</p>
                <p className="font-semibold text-sm mt-0.5" style={{ color: "var(--c-text)" }}>{val}</p>
              </div>
            ))}
          </div>
          <BMIBar bmi={plan?.bmi} />
        </div>

        {/* Macros visual */}
        {plan?.macros && (
          <div className="rounded-2xl p-4 glass">
            <h3 className="font-bold mb-3" style={{ color: "var(--c-text)" }}>Daily Macro Targets</h3>
            <div className="space-y-2.5">
              {macroGoals.map(({ label, val, color, pct }) => val ? (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--c-sub)" }}>{label}</span>
                    <span className="font-bold" style={{ color }}>{val}g</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--c-border)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }} />
                  </div>
                </div>
              ) : null)}
            </div>
            <p className="text-[10px] mt-2 text-center" style={{ color: "var(--c-sub)" }}>
              TDEE: {tdee} kcal · Target: {targetCals} kcal ·{" "}
              {Math.abs(deficitPerDay)} kcal {deficitPerDay < 0 ? "deficit" : "surplus"}
            </p>
          </div>
        )}

        {/* Weight projections */}
        <div className="rounded-2xl p-4 glass">
          <h3 className="font-bold mb-1" style={{ color: "var(--c-text)" }}>Weight Projections</h3>
          <p className="text-[11px] mb-3" style={{ color: "var(--c-sub)" }}>
            Based on {Math.abs(deficitPerDay)} kcal {deficitPerDay < 0 ? "deficit" : "surplus"}/day
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ProjectionCard label="1 Week"   weeks={1}   currentWeight={profile.weight} deficitPerDay={deficitPerDay} />
            <ProjectionCard label="1 Month"  weeks={4}   currentWeight={profile.weight} deficitPerDay={deficitPerDay} />
            <ProjectionCard label="6 Months" weeks={26}  currentWeight={profile.weight} deficitPerDay={deficitPerDay} />
            <ProjectionCard label="1 Year"   weeks={52}  currentWeight={profile.weight} deficitPerDay={deficitPerDay} />
          </div>
          <p className="text-[9px] mt-2 text-center" style={{ color: "var(--c-sub)" }}>
            Estimates only · actual results depend on adherence and metabolism
          </p>
        </div>

        {/* Goals */}
        {goalList.length > 0 && (
          <div className="rounded-2xl p-4 glass">
            <h3 className="font-bold mb-3" style={{ color: "var(--c-text)" }}>Goals</h3>
            <div className="flex flex-wrap gap-2">
              {goalList.map((g) => (
                <span key={g} className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border-bright)", color: "var(--c-accent)" }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="rounded-2xl p-4 glass">
            <h3 className="font-bold mb-3" style={{ color: "var(--c-text)" }}>Health Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => {
                const s = COND_COLORS[c] || { bg: "var(--c-accent-bg)", border: "var(--c-border)", color: "var(--c-accent)" };
                return <span key={c} className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{c}</span>;
              })}
            </div>
          </div>
        )}

        {/* Plan details */}
        <div className="rounded-2xl p-4 glass">
          <h3 className="font-bold mb-3" style={{ color: "var(--c-text)" }}>Plan Details</h3>
          <div className="space-y-2">
            {[
              { label: "Body focus",    val: profile.bodyFocus || "Full body" },
              { label: "Activity",      val: profile.activity },
              { label: "Workout type",  val: profile.workout },
              { label: "Diet",          val: profile.diet },
              { label: "Fitness level", val: profile.fitnessLevel },
              { label: "Days/week",     val: `${profile.daysPerWeek} days` },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "var(--c-sub)" }}>{label}</span>
                <span className="font-semibold" style={{ color: "var(--c-text)" }}>{val}</span>
              </div>
            ))}
          </div>
          {planAge !== null && (
            <p className="mt-3 text-xs text-center" style={{ color: "var(--c-sub)" }}>
              Plan is {planAge === 0 ? "fresh today" : `${planAge} day${planAge > 1 ? "s" : ""} old`} · refreshes in {Math.max(0, 7 - planAge)} days
            </p>
          )}
        </div>

        {error && <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#FF6B6B" }}>{error}</div>}

        {/* Actions */}
        <div className="space-y-3">
          <ActionBtn onClick={() => navigate("/onboarding")} Icon={Edit3} label="Edit profile"
            style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)", color: "var(--c-accent)" }} />
          <ActionBtn onClick={regenerate} Icon={RefreshCw} label="Regenerate my plan"
            style={{ background: "var(--c-accent)", boxShadow: "0 0 20px rgba(var(--c-accent-rgb),0.3)", color: "#fff" }} />
          <ActionBtn onClick={reset} Icon={Trash2} label="Reset & start over"
            style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", color: "#FF6B6B" }} />
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl p-4" style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)" }}>
          <div className="flex gap-2">
            <AlertCircle size={14} style={{ color: "var(--c-sub)", flexShrink: 0, marginTop: 1 }} />
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--c-sub)" }}>
              FiTAi is a wellness app and does not provide medical advice. Always consult your GP before starting a new exercise or nutrition programme, especially if you have any health conditions.
            </p>
          </div>
          <p className="mt-2 text-center text-[10px]" style={{ color: "var(--c-sub)" }}>FiTAi v2.0 · Powered by Claude</p>
        </div>
      </div>
    </div>
  );
}
