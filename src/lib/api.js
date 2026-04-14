const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const API_URL = import.meta.env.DEV ? "/api/claude" : "https://api.anthropic.com/v1/messages";

// Sanitize user-supplied strings before embedding in prompts
function sanitizeInput(str, maxLen = 200) {
  if (typeof str !== "string") return "";
  return str
    .slice(0, maxLen)
    .replace(/[\r\n]+/g, " ")           // collapse newlines
    .replace(/[<>]/g, "")               // strip angle brackets
    .replace(/ignore\s+(all\s+)?previous\s+instructions?/gi, "") // basic injection guard
    .trim();
}

async function claudeCall(messages, system = null, maxTokens = 1000, timeoutMs = 60000, model = "claude-sonnet-4-6") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const body = { model, max_tokens: maxTokens, messages };
  if (system) body.system = system;

  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Request timed out. Please try again.");
    throw new Error("Network error. Check your connection.");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    const err = ct.includes("json") ? await res.json().catch(() => ({})) : {};
    // Return safe generic messages — don't leak API internals to UI
    if (res.status === 401) throw new Error("Invalid API key. Check your settings.");
    if (res.status === 429) throw new Error("Too many requests. Please wait a moment and try again.");
    if (res.status === 402) throw new Error("API credit balance is empty. Please top up at console.anthropic.com.");
    throw new Error(err?.error?.message?.slice(0, 120) || "Something went wrong. Please try again.");
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("json")) throw new Error("Unexpected response from server.");
  const data = await res.json();
  return data.content.map((b) => b.text || "").join("");
}

// Clean up common JSON issues before parsing
function cleanJson(str) {
  return str
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]")
    .replace(/:\s*undefined/g, ": null")
    .replace(/:\s*NaN/g, ": null")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

// Attempt multiple recovery strategies for truncated/malformed JSON
function recoverJson(str) {
  // Strategy 1: find each complete day object by scanning for { "day": ... } blocks
  // and reconstruct the weekPlan from those
  const DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const completeDays = [];
  let searchFrom = 0;
  while (searchFrom < str.length) {
    const dayKeyIdx = str.indexOf('"day"', searchFrom);
    if (dayKeyIdx === -1) break;
    const objStart = str.lastIndexOf("{", dayKeyIdx);
    if (objStart === -1) { searchFrom = dayKeyIdx + 1; continue; }
    // Walk forward to find the matching closing brace
    let depth = 0;
    let objEnd = -1;
    for (let i = objStart; i < str.length; i++) {
      if (str[i] === "{" || str[i] === "[") depth++;
      else if (str[i] === "}" || str[i] === "]") {
        depth--;
        if (depth === 0) { objEnd = i; break; }
      }
    }
    if (objEnd > objStart) {
      const dayStr = cleanJson(str.slice(objStart, objEnd + 1));
      try {
        const dayObj = JSON.parse(dayStr);
        if (dayObj && DAY_NAMES.includes(dayObj.day)) {
          completeDays.push(dayObj);
        }
      } catch {}
      searchFrom = objEnd + 1;
    } else {
      // Incomplete — stop here
      break;
    }
  }
  if (completeDays.length >= 4) {
    // Enough days to be useful — build a minimal valid plan
    const plan = { weekPlan: completeDays };
    // Extract top-level fields from the raw string if possible
    try {
      const summaryMatch = str.match(/"summary"\s*:\s*"([^"]{0,300})"/);
      if (summaryMatch) plan.summary = summaryMatch[1];
    } catch {}
    return plan;
  }

  // Strategy 2: find the last fully closed day object and close the structure around it
  const lastDay = str.lastIndexOf('"day"');
  if (lastDay > 0) {
    const dayObjStart = str.lastIndexOf("{", lastDay);
    let depth = 0;
    let lastCompleteEnd = -1;
    for (let i = dayObjStart; i < str.length; i++) {
      if (str[i] === "{" || str[i] === "[") depth++;
      else if (str[i] === "}" || str[i] === "]") {
        depth--;
        if (depth === 0) lastCompleteEnd = i;
      }
    }
    if (lastCompleteEnd > dayObjStart) {
      const upToLastDay = str.slice(0, lastCompleteEnd + 1).replace(/,\s*$/, "");
      for (const suffix of ["]}}", "]}"]) {
        const fixed = cleanJson(upToLastDay + suffix);
        try { return JSON.parse(fixed); } catch {}
      }
    }
  }

  // Strategy 3: close any open brackets/braces by counting
  let fixed = cleanJson(str);
  const opens = (fixed.match(/\{|\[/g) || []).length;
  const closes = (fixed.match(/\}|\]/g) || []).length;
  const deficit = opens - closes;
  if (deficit > 0) {
    for (let i = 0; i < deficit; i++) fixed += i % 2 === 0 ? "}" : "]";
    try { return JSON.parse(fixed); } catch {}
  }

  throw new Error("Failed to parse plan. Please try again.");
}

// Validate that parsed plan has the minimum required structure
function validatePlan(plan) {
  if (!plan || typeof plan !== "object") throw new Error("Invalid plan returned. Please try again.");
  if (!Array.isArray(plan.weekPlan) || plan.weekPlan.length === 0) throw new Error("Plan is missing workout days. Please try again.");
  return plan;
}

// Exercise libraries — names must match VIDEO_MAP keys exactly (case-insensitive)
const GYM_EXERCISES = {
  Chest:     ["Flat Bench Press", "Incline Bench Press", "Incline Dumbbell Press", "Close Grip Bench Press", "Cable Chest Press", "Dumbbell Floor Fly", "Push-Up"],
  Back:      ["Barbell Row", "Seated Cable Row", "Inverted Row", "Pull-Up", "Lat Pulldown", "Dumbbell Row", "Stiff Leg Cable Deadlift"],
  Shoulders: ["Barbell Shoulder Press", "Dumbbell Shoulder Press", "Dumbbell Lateral Raise", "Barbell Front Raise", "Face Pull", "Cable Y Raise", "Dumbbell Seated Lateral Raise", "Barbell Wide Grip Upright Row"],
  Biceps:    ["Barbell Curl", "Dumbbell Seated Curl", "Hammer Curl", "Incline Dumbbell Curl", "Preacher Curl"],
  Triceps:   ["Cable Pushdown", "Skull Crusher", "Cable Overhead Tricep Extension", "Lying Tricep Extension", "Tricep Kickback", "Dip"],
  Legs:      ["Squat", "Deadlift", "Romanian Deadlift", "Hip Thrust", "Bulgarian Split Squat", "Leg Press", "Dumbbell Walking Lunge", "Barbell Step Up", "Banded Leg Curl", "Standing Barbell Calf Raise", "Donkey Kick"],
  Core:      ["Hanging Leg Raise", "Plank", "Pallof Press", "Ab Wheel", "Crunch", "Reverse Crunch", "Bird Dog", "Dumbbell Side Bend", "Knee Tuck"],
  Traps:     ["Dumbbell Shrug"],
};

const HOME_EXERCISES = {
  Chest:     ["Push-Up", "Close Grip Push Up", "Resistance Band Chest Fly", "Dumbbell Floor Fly"],
  Back:      ["Inverted Row", "Dumbbell Row", "Pull-Up", "Superman"],
  Shoulders: ["Dumbbell Shoulder Press", "Dumbbell Lateral Raise", "Barbell Front Raise"],
  Biceps:    ["Dumbbell Seated Curl", "Hammer Curl", "Incline Dumbbell Curl"],
  Triceps:   ["Tricep Kickback", "Skull Crusher", "Dip"],
  Legs:      ["Squat", "Romanian Deadlift", "Hip Thrust", "Bulgarian Split Squat", "Dumbbell Walking Lunge", "Resistance Tube Squat", "Donkey Kick"],
  Core:      ["Plank", "Bird Dog", "Reverse Crunch", "Shoulder Tap", "Scissors", "Knee Tuck", "Ab Wheel"],
};

function buildExerciseLibrary(workoutPref, bodyFocus) {
  const isHome = workoutPref?.toLowerCase().includes("home") || workoutPref?.toLowerCase().includes("outdoor");
  const lib = isHome ? HOME_EXERCISES : GYM_EXERCISES;
  const focus = (bodyFocus || "").toLowerCase();

  // For focused plans, surface relevant groups first but keep all available
  let groups = Object.entries(lib);
  if (focus.includes("upper")) {
    const order = ["Chest","Back","Shoulders","Biceps","Triceps","Core","Traps","Legs"];
    groups = order.filter(g => lib[g]).map(g => [g, lib[g]]);
  } else if (focus.includes("lower")) {
    const order = ["Legs","Core","Chest","Back","Shoulders","Biceps","Triceps","Traps"];
    groups = order.filter(g => lib[g]).map(g => [g, lib[g]]);
  } else if (focus.includes("core")) {
    const order = ["Core","Legs","Back","Chest","Shoulders","Biceps","Triceps"];
    groups = order.filter(g => lib[g]).map(g => [g, lib[g]]);
  }

  return groups.map(([group, names]) => `  ${group}: ${names.join(", ")}`).join("\n");
}

export async function generateWeeklyPlan(profile, calculations) {
  const { calories, macros, bmi, hrZones, water } = calculations;
  const condList = Array.isArray(profile.conditions) ? profile.conditions.filter((c) => c !== "None") : [];
  const goalStr = Array.isArray(profile.goals) ? profile.goals.join(", ") : profile.goals || "General fitness";
  const bodyFocus = profile.bodyFocus || "Full body";
  // Sanitize free-text user fields before embedding in prompt
  const safeName = sanitizeInput(profile.name, 60);
  const safeNotes = sanitizeInput(profile.notes, 300);

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

  const ethnicityNote = profile.ethnicity && profile.ethnicity !== "Mixed / Other"
    ? `Ethnicity/background: ${profile.ethnicity} — incorporate traditional, culturally familiar foods from this background into meals wherever possible (e.g. rice dishes, lentils, flatbreads, spices, etc.). Blend with UK availability.`
    : "";

  const exerciseLibrary = buildExerciseLibrary(profile.workout, bodyFocus);

  const prompt = `You are an expert UK fitness and nutrition coach. Generate a complete 7-day personalised plan. Return ONLY valid JSON, no markdown, no code fences.

PROFILE:
Name: ${safeName}, Age: ${profile.age}, Sex: ${profile.sex}
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
${ethnicityNote}

${condInstructions ? "MEDICAL ADJUSTMENTS:\n" + condInstructions : ""}

EXERCISE LIBRARY — you MUST use ONLY these exact exercise names. Copy the name character-for-character. Each has an in-app tutorial video tied to this exact spelling:
${exerciseLibrary}

Return this exact JSON schema (no markdown, no code fences):
{
  "summary": string,
  "conditionNote": string,
  "conditionTips": [string, string, string],
  "dietTips": [string, string, string, string],
  "weekPlan": [
    {
      "day": "Monday"|"Tuesday"|...|"Sunday",
      "workout": {
        "focus": string,
        "type": "Gym"|"Home"|"Outdoor"|"Cardio"|"Rest",
        "duration": string,
        "warmup": string,
        "exercises": [{"name":string,"muscleGroup":string,"sets":string,"reps":string,"rest":string,"tip":string}],
        "cooldown": string
      },
      "meals": {
        "breakfast": {"name":string,"foods":[string],"calories":number,"protein":number,"carbs":number,"fat":number},
        "lunch": {"name":string,"foods":[string],"calories":number,"protein":number,"carbs":number,"fat":number},
        "dinner": {"name":string,"foods":[string],"calories":number,"protein":number,"carbs":number,"fat":number},
        "snacks": {"name":string,"foods":[string],"calories":number,"protein":number,"carbs":number,"fat":number}
      }
    }
  ]
}

Rules:
- ALL 7 days required (Monday–Sunday)
- Exactly ${profile.daysPerWeek} workout days, ${7 - profile.daysPerWeek} rest day(s)
- WORKOUT DAYS: pick 5-7 exercises from the EXERCISE LIBRARY above. Use the name exactly as written.
- REST DAYS: type="Rest", exercises = 2-3 light recovery moves from the EXERCISE LIBRARY (light sets, e.g. "2x12").
- Each exercise tip is 1 concise sentence with a key form cue
- Vary meals daily — no repeated meal names
- Culturally appropriate foods based on background, available at UK supermarkets`;

  const text = await claudeCall([{ role: "user", content: prompt }], null, 8000, 120000);
  // Strip markdown fences and extract the JSON object
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);
  cleaned = cleanJson(cleaned);
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("[FitCoach] JSON parse failed:", e.message);
    console.error("[FitCoach] Raw response (first 500 chars):", text.slice(0, 500));
    parsed = recoverJson(cleaned);
  }
  return validatePlan(parsed);
}

export async function rexChat(messages, profile, plan) {
  const condList = Array.isArray(profile.conditions) ? profile.conditions.filter((c) => c !== "None") : [];
  const goalStr = Array.isArray(profile.goals) ? profile.goals.join(", ") : profile.goal || "General fitness";
  // Sanitize the last user message before sending
  const safeMessages = messages.map((m, i) => {
    if (m.role === "user" && i === messages.length - 1) {
      return { role: "user", content: sanitizeInput(m.content, 500) };
    }
    return { role: m.role, content: typeof m.content === "string" ? m.content.slice(0, 2000) : "" };
  });

  const system = `You are FiTAi — an energetic, friendly AI fitness coach built to help people transform their health.

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

  return await claudeCall(safeMessages, system, 1000);
}
