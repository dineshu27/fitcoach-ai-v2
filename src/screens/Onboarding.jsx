import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { cache } from "../lib/cache";
import { generateWeeklyPlan } from "../lib/api";
import { calcBMI, calcBMR, calcTDEE, calcTargetCalories, calcMacros, bmiCategory, calcWaterIntake, calcHeartRateZones } from "../lib/calculations";
import PlanLoading from "./PlanLoading";

const CONDITIONS = ["None","High LDL / High Cholesterol","Type 2 Diabetes","Hypertension (High Blood Pressure)","PCOS","Thyroid condition","Obesity (BMI 30+)","Joint pain / Arthritis"];
const GOALS = [
  { emoji: "🔥", label: "Lose weight & burn fat" },
  { emoji: "💪", label: "Build muscle & strength" },
  { emoji: "❤️", label: "Improve heart health" },
  { emoji: "⚡", label: "Increase energy & fitness" },
  { emoji: "🧘", label: "Manage health condition" },
  { emoji: "🏃", label: "Improve endurance" },
];
const BODY_FOCUS = [
  { emoji: "💪", label: "Upper body", desc: "Chest · Back · Shoulders · Arms" },
  { emoji: "🦵", label: "Lower body", desc: "Quads · Hamstrings · Glutes · Calves" },
  { emoji: "⚡", label: "Full body", desc: "Balanced head-to-toe training" },
  { emoji: "🎯", label: "Core & stability", desc: "Abs · Obliques · Lower back" },
];
const DIETS = ["No restriction","Vegetarian","Vegan","Halal","Gluten-free","Dairy-free"];
const WORKOUTS = ["Gym","Outdoor","Home","Mix of all"];
const LEVELS = ["Beginner","Intermediate","Advanced"];
const ACTIVITIES = ["Sedentary","Lightly active","Moderately active","Very active"];
const ACT_DESCS = ["Desk job, little exercise","Light exercise 1–3 days/week","Moderate exercise 3–5 days/week","Hard exercise 6–7 days/week"];

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>{label}</label>
      <input
        {...props}
        className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
        style={{ background: "rgba(26,26,38,0.8)", border: "1px solid rgba(108,99,255,0.2)", color: "#F0F0FF",
          fontFamily: "Space Grotesk, sans-serif" }}
        onFocus={(e) => { e.target.style.borderColor = "#6C63FF"; e.target.style.boxShadow = "0 0 0 3px rgba(108,99,255,0.15)"; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(108,99,255,0.2)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Pill({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
      style={{
        background: selected ? "#6C63FF" : "rgba(26,26,38,0.8)",
        border: selected ? "1px solid #6C63FF" : "1px solid rgba(108,99,255,0.2)",
        color: selected ? "#fff" : "#8888AA",
        boxShadow: selected ? "0 0 12px rgba(108,99,255,0.4)" : "none",
      }}>
      {label}
    </button>
  );
}

const STEP_TITLES = ["Your body stats", "Health profile", "Goals & focus"];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", age: "", weight: "", height: "", sex: "Male", activity: "Moderately active",
    conditions: ["None"], notes: "",
    goals: [], bodyFocus: "",
    diet: "No restriction", workout: "Gym", fitnessLevel: "Beginner", daysPerWeek: 4,
  });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const sv = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleGoal = (l) => set("goals")(form.goals.includes(l) ? form.goals.filter((g) => g !== l) : [...form.goals, l]);

  const bmi = form.weight && form.height ? calcBMI(+form.weight, +form.height) : null;
  const bmiCat = bmi ? bmiCategory(bmi) : null;
  const bmr = form.weight && form.height && form.age ? calcBMR(+form.weight, +form.height, +form.age, form.sex) : null;
  const tdee = bmr ? calcTDEE(bmr, form.activity) : null;

  const canNext = [
    !!(form.name && form.age && form.weight && form.height),
    true,
    !!(form.goals.length > 0 && form.bodyFocus && form.diet && form.workout && form.fitnessLevel),
  ];

  async function generate() {
    setLoading(true); setError("");
    try {
      const profile = { ...form, age: +form.age, weight: +form.weight, height: +form.height, daysPerWeek: +form.daysPerWeek, goal: form.goals.join(", ") };
      const bmi2 = calcBMI(profile.weight, profile.height);
      const bmr2 = calcBMR(profile.weight, profile.height, profile.age, profile.sex);
      const tdee2 = calcTDEE(bmr2, profile.activity);
      const calories = calcTargetCalories(tdee2, profile.goals);
      const macros = calcMacros(calories, profile.goals, profile.conditions);
      const hrZones = calcHeartRateZones(profile.age);
      const water = calcWaterIntake(profile.weight);

      cache.saveProfile(profile);
      const plan = await generateWeeklyPlan(profile, { calories, macros, bmi: bmi2, hrZones, water });
      plan.calories = calories; plan.macros = macros; plan.bmi = bmi2; plan.water = water;
      cache.savePlan(plan);
      cache.saveStats({ startDate: new Date().toISOString(), workoutsLogged: 0 });
      navigate("/dashboard", { replace: true });
    } catch (e) { setError(e.message || "Failed. Check your API key."); }
    finally { setLoading(false); }
  }

  if (loading) return <PlanLoading />;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <div className="px-4 pt-safe pt-6 pb-4" style={{ borderBottom: "1px solid rgba(108,99,255,0.12)" }}>
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="rounded-xl p-2 transition-all"
              style={{ background: "rgba(108,99,255,0.1)" }}>
              <ChevronLeft size={18} style={{ color: "#6C63FF" }} />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs" style={{ color: "#8888AA" }}>Step {step + 1} of 3</p>
            <h2 className="font-bold text-lg" style={{ color: "#F0F0FF" }}>{STEP_TITLES[step]}</h2>
          </div>
        </div>
        {/* Dots progress */}
        <div className="flex gap-2 mt-3">
          {[0,1,2].map((i) => (
            <div key={i} className="rounded-full transition-all" style={{
              height: 4,
              flex: i === step ? 3 : 1,
              background: i <= step ? "#6C63FF" : "rgba(108,99,255,0.2)",
              boxShadow: i === step ? "0 0 8px #6C63FF" : "none",
            }} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-32 space-y-5">
        <AnimatePresence mode="wait">

          {/* STEP 0 */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
              <Input label="Full name" placeholder="Your name" value={form.name} onChange={sv("name")} />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Age" type="number" min="16" max="80" placeholder="30" value={form.age} onChange={sv("age")} />
                <Input label="Weight (kg)" type="number" step="0.1" placeholder="75" value={form.weight} onChange={sv("weight")} />
                <Input label="Height (cm)" type="number" placeholder="175" value={form.height} onChange={sv("height")} />
              </div>

              {/* Sex toggle */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>Sex</label>
                <div className="flex rounded-xl p-1" style={{ background: "rgba(26,26,38,0.8)", border: "1px solid rgba(108,99,255,0.2)" }}>
                  {["Male", "Female"].map((s) => (
                    <button key={s} type="button" onClick={() => set("sex")(s)}
                      className="flex-1 rounded-lg py-2 text-sm font-bold transition-all"
                      style={{ background: form.sex === s ? "#6C63FF" : "transparent", color: form.sex === s ? "#fff" : "#8888AA",
                        boxShadow: form.sex === s ? "0 0 10px rgba(108,99,255,0.4)" : "none" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>Activity level</label>
                <div className="space-y-2">
                  {ACTIVITIES.map((a, i) => (
                    <button key={a} type="button" onClick={() => set("activity")(a)}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                      style={{ background: form.activity === a ? "rgba(108,99,255,0.12)" : "rgba(26,26,38,0.6)",
                        border: form.activity === a ? "1px solid rgba(108,99,255,0.5)" : "1px solid rgba(108,99,255,0.12)",
                        boxShadow: form.activity === a ? "0 0 10px rgba(108,99,255,0.15)" : "none" }}>
                      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ border: form.activity === a ? "2px solid #6C63FF" : "2px solid #8888AA" }}>
                        {form.activity === a && <div className="h-2 w-2 rounded-full" style={{ background: "#6C63FF" }} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: form.activity === a ? "#6C63FF" : "#F0F0FF" }}>{a}</p>
                        <p className="text-xs" style={{ color: "#8888AA" }}>{ACT_DESCS[i]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live BMI card */}
              {bmi && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4" style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.25)" }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: "#6C63FF" }}>Your stats</p>
                  <div className="flex gap-6">
                    <div><p className="text-3xl font-extrabold" style={{ color: bmiCat?.color }}>{bmi}</p><p className="text-xs" style={{ color: "#8888AA" }}>BMI · {bmiCat?.label}</p></div>
                    {tdee && <div><p className="text-3xl font-extrabold" style={{ color: "#F0F0FF" }}>{tdee}</p><p className="text-xs" style={{ color: "#8888AA" }}>TDEE kcal</p></div>}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-3" style={{ color: "#8888AA" }}>
                  Health conditions <span style={{ color: "#6C63FF" }}>(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => {
                    const sel = form.conditions.includes(c);
                    return (
                      <button key={c} type="button"
                        onClick={() => {
                          if (c === "None") return set("conditions")(["None"]);
                          const without = form.conditions.filter((v) => v !== "None");
                          set("conditions")(sel ? without.filter((v) => v !== c) : [...without, c]);
                        }}
                        className="rounded-full px-3 py-2 text-xs font-semibold transition-all"
                        style={{ background: sel ? "#6C63FF" : "rgba(26,26,38,0.8)", border: sel ? "1px solid #6C63FF" : "1px solid rgba(108,99,255,0.2)",
                          color: sel ? "#fff" : "#8888AA", boxShadow: sel ? "0 0 10px rgba(108,99,255,0.35)" : "none" }}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>Anything else? (medications, injuries, allergies)</label>
                <textarea
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                  style={{ background: "rgba(26,26,38,0.8)", border: "1px solid rgba(108,99,255,0.2)", color: "#F0F0FF",
                    fontFamily: "Space Grotesk, sans-serif", minHeight: 90 }}
                  placeholder="Optional..."
                  value={form.notes} onChange={sv("notes")} />
              </div>
              <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(255,230,109,0.06)", border: "1px solid rgba(255,230,109,0.2)", color: "#FFE66D" }}>
                ⚠️ This helps personalise your plan safely. We are not a medical service.
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
              {/* Goals multi-select */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#8888AA" }}>
                  Goals <span style={{ color: "#6C63FF" }}>(select all that apply)</span>
                </label>
                {form.goals.length === 0 && <p className="text-xs mb-2" style={{ color: "#FF6B6B" }}>Select at least one goal</p>}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {GOALS.map(({ emoji, label }) => {
                    const sel = form.goals.includes(label);
                    return (
                      <button key={label} type="button" onClick={() => toggleGoal(label)}
                        className="relative rounded-2xl p-3 text-left transition-all"
                        style={{ background: sel ? "rgba(108,99,255,0.15)" : "rgba(26,26,38,0.8)",
                          border: sel ? "1px solid rgba(108,99,255,0.6)" : "1px solid rgba(108,99,255,0.15)",
                          boxShadow: sel ? "0 0 15px rgba(108,99,255,0.2)" : "none" }}>
                        {sel && <CheckCircle2 size={14} className="absolute top-2 right-2" style={{ color: "#6C63FF" }} />}
                        <span className="text-xl">{emoji}</span>
                        <p className="mt-1 text-xs font-bold leading-tight" style={{ color: sel ? "#6C63FF" : "#F0F0FF" }}>{label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body focus */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>Workout focus</label>
                <div className="space-y-2">
                  {BODY_FOCUS.map(({ emoji, label, desc }) => {
                    const sel = form.bodyFocus === label;
                    return (
                      <button key={label} type="button" onClick={() => set("bodyFocus")(label)}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all"
                        style={{ background: sel ? "rgba(108,99,255,0.12)" : "rgba(26,26,38,0.6)",
                          border: sel ? "1.5px solid #6C63FF" : "1px solid rgba(108,99,255,0.15)",
                          boxShadow: sel ? "0 0 12px rgba(108,99,255,0.2)" : "none" }}>
                        <span className="text-2xl">{emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: sel ? "#6C63FF" : "#F0F0FF" }}>{label}</p>
                          <p className="text-xs" style={{ color: "#8888AA" }}>{desc}</p>
                        </div>
                        {sel && <div className="h-4 w-4 rounded-full flex items-center justify-center" style={{ background: "#6C63FF" }}>
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>Diet preference</label>
                <div className="flex flex-wrap gap-2">{DIETS.map((d) => <Pill key={d} label={d} selected={form.diet === d} onClick={() => set("diet")(d)} />)}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>Workout type</label>
                <div className="flex flex-wrap gap-2">{WORKOUTS.map((w) => <Pill key={w} label={w} selected={form.workout === w} onClick={() => set("workout")(w)} />)}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>Fitness level</label>
                <div className="flex flex-wrap gap-2">{LEVELS.map((l) => <Pill key={l} label={l} selected={form.fitnessLevel === l} onClick={() => set("fitnessLevel")(l)} />)}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#8888AA" }}>
                  Days/week: <span style={{ color: "#6C63FF", fontWeight: 700 }}>{form.daysPerWeek} {form.daysPerWeek >= 5 ? "💪" : form.daysPerWeek <= 2 ? "😅" : "👍"}</span>
                </label>
                <input type="range" min="2" max="7" value={form.daysPerWeek} onChange={(e) => set("daysPerWeek")(+e.target.value)}
                  className="w-full" style={{ accentColor: "#6C63FF" }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#8888AA" }}><span>2 days</span><span>7 days</span></div>
              </div>

              {error && <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#FF6B6B" }}>{error}</div>}

              {/* Summary */}
              {form.goals.length > 0 && form.bodyFocus && (
                <div className="rounded-2xl p-4 space-y-1.5" style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)" }}>
                  <p className="text-xs font-bold" style={{ color: "#4ECDC4" }}>Plan preview</p>
                  <p className="text-xs" style={{ color: "#8888AA" }}>🎯 {form.goals.join(" · ")}</p>
                  <p className="text-xs" style={{ color: "#8888AA" }}>💪 {form.bodyFocus} · {form.workout} · {form.daysPerWeek} days/week</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 px-4 py-4"
        style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(108,99,255,0.12)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}>
        <button
          onClick={() => { if (step < 2) setStep(step + 1); else generate(); }}
          disabled={!canNext[step]}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2">
          {step < 2 ? <>Continue <ChevronRight size={18} /></> : "✨ Generate my plan"}
        </button>
      </div>
    </div>
  );
}
