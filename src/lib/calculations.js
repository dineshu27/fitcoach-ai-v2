export function calcBMR(weight, height, age, sex) {
  return sex === "Male"
    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    : Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

export function calcTDEE(bmr, activity) {
  const mult = { Sedentary: 1.2, "Lightly active": 1.375, "Moderately active": 1.55, "Very active": 1.725 };
  return Math.round(bmr * (mult[activity] || 1.375));
}

export function calcTargetCalories(tdee, goals) {
  const gl = Array.isArray(goals) ? goals : [goals];
  const wantsLoss = gl.some((g) => g?.toLowerCase().includes("lose") || g?.toLowerCase().includes("burn"));
  const wantsMuscle = gl.some((g) => g?.toLowerCase().includes("muscle") || g?.toLowerCase().includes("build") || g?.toLowerCase().includes("strength"));
  if (wantsLoss) return tdee - 500;
  if (wantsMuscle) return tdee + 300;
  return tdee;
}

export function calcMacros(calories, goals, conditions) {
  const gl = Array.isArray(goals) ? goals : [goals];
  const cl = Array.isArray(conditions) ? conditions : [conditions];
  let proteinPct = 0.30, carbsPct = 0.40, fatPct = 0.30;

  if (gl.some((g) => g?.toLowerCase().includes("muscle") || g?.toLowerCase().includes("build"))) {
    proteinPct = 0.35; carbsPct = 0.45; fatPct = 0.20;
  }
  if (gl.some((g) => g?.toLowerCase().includes("lose"))) {
    proteinPct = 0.40; carbsPct = 0.30; fatPct = 0.30;
  }
  if (cl.includes("Type 2 Diabetes")) { carbsPct = 0.25; proteinPct = 0.35; fatPct = 0.40; }
  if (cl.includes("High LDL / High Cholesterol")) { fatPct = 0.25; carbsPct = 0.45; proteinPct = 0.30; }

  return {
    protein: Math.round((calories * proteinPct) / 4),
    carbs: Math.round((calories * carbsPct) / 4),
    fat: Math.round((calories * fatPct) / 9),
    fibre: cl.includes("High LDL / High Cholesterol") || cl.includes("Type 2 Diabetes") ? 35 : 25,
  };
}

export function calcBMI(weight, height) {
  return +(weight / (height / 100) ** 2).toFixed(1);
}

export function bmiCategory(bmi) {
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "Underweight", color: "#38BDF8" };
  if (b < 25)   return { label: "Healthy",     color: "#22C55E" };
  if (b < 30)   return { label: "Overweight",  color: "#F97316" };
  return               { label: "Obese",        color: "#EF4444" };
}

export function calcWaterIntake(weight) {
  return +(weight * 0.035).toFixed(1);
}

export function calcHeartRateZones(age) {
  const max = 220 - age;
  return {
    zone1: [Math.round(max * 0.5), Math.round(max * 0.6)],
    zone2: [Math.round(max * 0.6), Math.round(max * 0.7)],
    zone3: [Math.round(max * 0.7), Math.round(max * 0.8)],
    zone4: [Math.round(max * 0.8), Math.round(max * 0.9)],
  };
}

export function dayStreak(startDate) {
  if (!startDate) return 1;
  const diff = Math.floor((Date.now() - new Date(startDate)) / 86400000);
  return Math.max(1, diff + 1);
}
