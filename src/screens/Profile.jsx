import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import REX from "../components/REX";
import { cache } from "../lib/cache";
import { generateWeeklyPlan } from "../lib/api";
import { calcBMI, calcBMR, calcTDEE, calcTargetCalories, calcMacros, bmiCategory, calcWaterIntake, calcHeartRateZones, dayStreak } from "../lib/calculations";
import PlanLoading from "./PlanLoading";

const COND_COLORS = {
  "High LDL / High Cholesterol": { bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.3)", color: "#FF6B6B" },
  "Type 2 Diabetes": { bg: "rgba(255,165,0,0.15)", border: "rgba(255,165,0,0.3)", color: "#FFA500" },
  "Hypertension (High Blood Pressure)": { bg: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.25)", color: "#FF6B6B" },
  "PCOS": { bg: "rgba(108,99,255,0.15)", border: "rgba(108,99,255,0.3)", color: "#6C63FF" },
  "Thyroid condition": { bg: "rgba(78,205,196,0.15)", border: "rgba(78,205,196,0.3)", color: "#4ECDC4" },
  "Obesity (BMI 30+)": { bg: "rgba(255,230,109,0.15)", border: "rgba(255,230,109,0.3)", color: "#FFE66D" },
  "Joint pain / Arthritis": { bg: "rgba(78,205,196,0.12)", border: "rgba(78,205,196,0.25)", color: "#4ECDC4" },
};

function ActionBtn({ onClick, Icon, label, style }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl p-4 text-left font-semibold transition-all active:scale-95" style={style}>
      <Icon size={18} />
      {label}
    </button>
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
  const initials = profile.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const conditions = (profile.conditions || []).filter((c) => c !== "None");
  const goalList = Array.isArray(profile.goals) ? profile.goals : [profile.goal || ""].filter(Boolean);
  const planAge = cache.planAge();

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

  return (
    <div className="min-h-screen pb-nav" style={{ background: "#0A0A0F" }}>
      {/* Header with REX + avatar */}
      <div className="px-4 pt-safe pt-6 pb-6"
        style={{ background: "linear-gradient(180deg, rgba(108,99,255,0.1) 0%, transparent 100%)", borderBottom: "1px solid rgba(108,99,255,0.12)" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-extrabold"
            style={{ background: "linear-gradient(135deg, #6C63FF, #FF6B6B)", color: "#fff",
              boxShadow: "0 0 30px rgba(108,99,255,0.4)" }}>
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: "#F0F0FF" }}>{profile.name}</h1>
            <p className="text-sm" style={{ color: "#8888AA" }}>{profile.age} yrs · {profile.sex}</p>
            {/* Free/Premium badge */}
            <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ background: "rgba(255,230,109,0.15)", border: "1px solid rgba(255,230,109,0.3)", color: "#FFE66D" }}>
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
            { label: "Days active", val: streak },
            { label: "BMI", val: plan?.bmi },
            { label: "Workouts", val: stats.workoutsLogged },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-2xl p-3 text-center glass">
              <p className="text-2xl font-extrabold" style={{ color: "#F0F0FF" }}>{val ?? "—"}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#8888AA" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Body stats */}
        <div className="rounded-2xl p-4 glass">
          <h3 className="font-bold mb-3" style={{ color: "#F0F0FF" }}>Body stats</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Weight", val: `${profile.weight} kg` },
              { label: "Height", val: `${profile.height} cm` },
              { label: "BMI", val: `${plan?.bmi} — ${bmiCat.label}` },
              { label: "Daily calories", val: `${plan?.calories || "—"} kcal` },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[11px]" style={{ color: "#8888AA" }}>{label}</p>
                <p className="font-semibold text-sm mt-0.5" style={{ color: "#F0F0FF" }}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        {goalList.length > 0 && (
          <div className="rounded-2xl p-4 glass">
            <h3 className="font-bold mb-3" style={{ color: "#F0F0FF" }}>Goals</h3>
            <div className="flex flex-wrap gap-2">
              {goalList.map((g) => (
                <span key={g} className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "#6C63FF" }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="rounded-2xl p-4 glass">
            <h3 className="font-bold mb-3" style={{ color: "#F0F0FF" }}>Health conditions</h3>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => {
                const s = COND_COLORS[c] || { bg: "rgba(108,99,255,0.1)", border: "rgba(108,99,255,0.2)", color: "#6C63FF" };
                return <span key={c} className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{c}</span>;
              })}
            </div>
          </div>
        )}

        {/* Plan details */}
        <div className="rounded-2xl p-4 glass">
          <h3 className="font-bold mb-3" style={{ color: "#F0F0FF" }}>Plan details</h3>
          <div className="space-y-2">
            {[
              { label: "Body focus", val: profile.bodyFocus || "Full body" },
              { label: "Activity", val: profile.activity },
              { label: "Workout type", val: profile.workout },
              { label: "Diet", val: profile.diet },
              { label: "Fitness level", val: profile.fitnessLevel },
              { label: "Days/week", val: `${profile.daysPerWeek} days` },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "#8888AA" }}>{label}</span>
                <span className="font-semibold" style={{ color: "#F0F0FF" }}>{val}</span>
              </div>
            ))}
          </div>
          {planAge !== null && (
            <p className="mt-3 text-xs text-center" style={{ color: "#8888AA" }}>
              Plan is {planAge === 0 ? "fresh today" : `${planAge} day${planAge > 1 ? "s" : ""} old`} · refreshes in {Math.max(0, 7 - planAge)} days
            </p>
          )}
        </div>

        {error && <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#FF6B6B" }}>{error}</div>}

        {/* Actions */}
        <div className="space-y-3">
          <ActionBtn onClick={() => navigate("/onboarding")} Icon={Edit3} label="Edit profile"
            style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", color: "#6C63FF" }} />
          <ActionBtn onClick={regenerate} Icon={RefreshCw} label="Regenerate my plan"
            style={{ background: "#6C63FF", boxShadow: "0 0 20px rgba(108,99,255,0.3)", color: "#fff" }} />
          <ActionBtn onClick={reset} Icon={Trash2} label="Reset & start over"
            style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", color: "#FF6B6B" }} />
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(136,136,170,0.05)", border: "1px solid rgba(136,136,170,0.1)" }}>
          <div className="flex gap-2">
            <AlertCircle size={14} style={{ color: "#8888AA", flexShrink: 0, marginTop: 1 }} />
            <p className="text-[11px] leading-relaxed" style={{ color: "#8888AA" }}>
              FitCoach AI is a wellness app and does not provide medical advice. Always consult your GP before starting a new exercise or nutrition programme, especially if you have any health conditions.
            </p>
          </div>
          <p className="mt-2 text-center text-[10px]" style={{ color: "#8888AA" }}>FitCoach AI v2.0 · Powered by Claude</p>
        </div>
      </div>
    </div>
  );
}
