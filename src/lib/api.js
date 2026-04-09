const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";

async function claudeCall(messages, system = null, maxTokens = 1000) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages,
  };
  if (system) body.system = system;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-calls": "true",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content.map((b) => b.text || "").join("");
}

export async function generateWeeklyPlan(profile, calculations) {
  const { calories, macros, bmi, hrZones, water } = calculations;
  const condList = Array.isArray(profile.conditions) ? profile.conditions.filter((c) => c !== "None") : [];
  const goalStr = Array.isArray(profile.goals) ? profile.goals.join(", ") : profile.goals || "General fitness";
  const bodyFocus = profile.bodyFocus || "Full body";

  const condInstructions = [
    condList.includes("High LDL / High Cholesterol") &&
      `HIGH LDL: zone 2 cardio priority (HR ${hrZones.zone2[0]}-${hrZones.zone2[1]}bpm), reduce saturated fat, high omega-3/oats/nuts/seeds, more soluble fibre`,
    condList.includes("Type 2 Diabetes") &&
      `TYPE 2 DIABETES: low GI foods only, no refined carbs, post-meal walks, time carbs around exercise, resistance training priority`,
    condList.includes("Hypertension (High Blood Pressure)") &&
      `HYPERTENSION: DASH diet, low sodium <2g/day, avoid heavy isometric holds, aerobic focus`,
    condList.includes("PCOS") &&
      `PCOS: anti-inflammatory foods, low GI, strength+cardio balance, manage cortisol, avoid overtraining`,
    condList.includes("Joint pain / Arthritis") &&
      `JOINT PAIN: low-impact only, swimming/cycling/elliptical, no high-impact jumping`,
  ].filter(Boolean).join("\n");

  const bodyFocusMap = {
    "Upper body": "Prioritise chest, back, shoulders, biceps, triceps on workout days. Compounds: bench press, rows, overhead press, pull-ups.",
    "Lower body": "Prioritise quads, hamstrings, glutes, calves. Compounds: squats, deadlifts, lunges, leg press.",
    "Full body": "Hit all major muscle groups each session. Use squat/deadlift/bench/row as backbone. Alternate push/pull days.",
    "Core & stability": "Centre each session on core strength. Include planks, deadbugs, pallof press, ab wheel, functional patterns.",
  };

  const prompt = `You are an expert UK fitness and nutrition coach. Generate a complete 7-day personalised plan. Return ONLY valid JSON, no markdown, no code fences.

PROFILE:
Name: ${profile.name}, Age: ${profile.age}, Sex: ${profile.sex}
Weight: ${profile.weight}kg, Height: ${profile.height}cm, BMI: ${bmi}
Activity: ${profile.activity}
Goals: ${goalStr}
Body focus: ${bodyFocus}
${bodyFocusMap[bodyFocus] || bodyFocusMap["Full body"]}
Medical conditions: ${condList.join(", ") || "None"}
Diet preference: ${profile.diet}
Workout preference: ${profile.workout}
Fitness level: ${profile.fitnessLevel}
Days available: ${profile.daysPerWeek}/week
Daily calories: ${calories} kcal | Protein: ${macros.protein}g | Carbs: ${macros.carbs}g | Fat: ${macros.fat}g | Fibre: ${macros.fibre}g
Water: ${water}L/day

${condInstructions ? "MEDICAL ADJUSTMENTS:\n" + condInstructions : ""}

Return exactly this JSON structure:
{
  "summary": "2 sentence personalised overview mentioning name, goals, body focus and conditions if any",
  "conditionNote": "2 sentence medical-aware advice specific to their conditions (or general wellness tip if no conditions)",
  "conditionTips": ["tip1","tip2","tip3"],
  "dietTips": ["UK-specific food tip 1","UK-specific tip 2","UK-specific tip 3","UK-specific tip 4"],
  "weekPlan": [
    {
      "day": "Monday",
      "workout": {
        "focus": "Upper body — Chest & Triceps",
        "type": "Gym",
        "duration": "50 min",
        "warmup": "5 min treadmill + arm circles",
        "exercises": [
          {"name":"Barbell Bench Press","muscleGroup":"Chest","sets":"4","reps":"8-10","rest":"90 sec","tip":"Retract shoulder blades, plant feet flat. Lower bar to mid-chest with control, drive up explosively."}
        ],
        "cooldown": "5 min chest + tricep stretches"
      },
      "meals": {
        "breakfast": {"name":"Porridge with berries","foods":["60g oats","200ml oat milk","80g mixed berries","1 tbsp honey","walnuts"],"calories":420,"protein":14,"carbs":65,"fat":10},
        "lunch": {"name":"Grilled chicken salad","foods":["150g chicken breast","mixed leaves","cherry tomatoes","olive oil","wholemeal pitta"],"calories":480,"protein":42,"carbs":38,"fat":12},
        "dinner": {"name":"Salmon & sweet potato","foods":["180g salmon","200g sweet potato","tenderstem broccoli","lemon"],"calories":580,"protein":38,"carbs":52,"fat":18},
        "snacks": {"name":"Protein snack","foods":["Greek yoghurt 150g","banana","30g almonds"],"calories":280,"protein":18,"carbs":28,"fat":10}
      }
    }
  ]
}

Rules:
- Generate ALL 7 days (Monday through Sunday)
- Include exactly ${profile.daysPerWeek} workout days and ${7 - profile.daysPerWeek} rest day(s)
- Rest days: set type to "Rest", include light stretching/mobility as exercises
- VARY meals every single day — no repeated meal names
- Each exercise needs a detailed 2-sentence tip with proper form cues
- Include 5-7 exercises per workout day
- UK food names, UK portions, mention Tesco/Sainsbury's/Waitrose where relevant`;

  const text = await claudeCall([{ role: "user", content: prompt }], null, 8000);
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export async function rexChat(messages, profile, plan) {
  const condList = Array.isArray(profile.conditions) ? profile.conditions.filter((c) => c !== "None") : [];
  const goalStr = Array.isArray(profile.goals) ? profile.goals.join(", ") : profile.goal || "General fitness";

  const system = `You are REX — an energetic, friendly AI fitness coach robot built to help people transform their health.

Your client:
- ${profile.name}, ${profile.age}yo ${profile.sex}, ${profile.weight}kg, ${profile.height}cm
- Goals: ${goalStr}
- Body focus: ${profile.bodyFocus || "Full body"}
- Conditions: ${condList.join(", ") || "None"}
- Diet: ${profile.diet} | Workout: ${profile.workout}
- Daily calories: ${plan?.calories || "N/A"} kcal
- Macros: ${plan?.macros?.protein || 0}g protein, ${plan?.macros?.carbs || 0}g carbs, ${plan?.macros?.fat || 0}g fat

Personality: Energetic, warm, direct. Occasional robot/gym humour (keep it light). Never preachy or condescending.
Rules: UK English always. Use £ not $. Max 3-4 sentences unless specifically asked for more detail. Plain text only — no markdown or bullet points. Medical questions → suggest seeing a GP.`;

  return await claudeCall(messages, system, 1000);
}
