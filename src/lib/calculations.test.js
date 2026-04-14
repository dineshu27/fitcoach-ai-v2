import { describe, it, expect } from "vitest";
import {
  calcBMI, calcBMR, calcTDEE, calcTargetCalories,
  calcMacros, bmiCategory, calcWaterIntake,
  calcHeartRateZones, dayStreak,
} from "./calculations";

// ─── calcBMI ────────────────────────────────────────────────────────────────
describe("calcBMI", () => {
  it("returns correct BMI for 75 kg / 175 cm", () => {
    expect(calcBMI(75, 175)).toBe(24.5);
  });
  it("returns correct BMI for 90 kg / 180 cm", () => {
    expect(calcBMI(90, 180)).toBe(27.8);
  });
  it("returns correct BMI for 50 kg / 160 cm", () => {
    expect(calcBMI(50, 160)).toBe(19.5);
  });
  it("rounds to 1 decimal place", () => {
    const bmi = calcBMI(70, 173);
    expect(bmi.toString().split(".")[1]?.length ?? 0).toBeLessThanOrEqual(1);
  });
});

// ─── calcBMR ────────────────────────────────────────────────────────────────
describe("calcBMR", () => {
  it("calculates male BMR correctly", () => {
    // 10*75 + 6.25*175 - 5*30 + 5 = 1698.75 → 1699
    expect(calcBMR(75, 175, 30, "Male")).toBe(1699);
  });
  it("calculates female BMR correctly", () => {
    // 10*65 + 6.25*165 - 5*28 - 161 = 1380.25 → 1380
    expect(calcBMR(65, 165, 28, "Female")).toBe(1380);
  });
  it("female BMR is always lower than male for same stats", () => {
    expect(calcBMR(70, 170, 30, "Female")).toBeLessThan(calcBMR(70, 170, 30, "Male"));
  });
  it("returns a positive number", () => {
    expect(calcBMR(60, 160, 25, "Male")).toBeGreaterThan(0);
  });
});

// ─── calcTDEE ───────────────────────────────────────────────────────────────
describe("calcTDEE", () => {
  it("applies sedentary multiplier (1.2)", () => {
    expect(calcTDEE(1700, "Sedentary")).toBe(Math.round(1700 * 1.2));
  });
  it("applies lightly active multiplier (1.375)", () => {
    expect(calcTDEE(1700, "Lightly active")).toBe(Math.round(1700 * 1.375));
  });
  it("applies moderately active multiplier (1.55)", () => {
    expect(calcTDEE(1700, "Moderately active")).toBe(Math.round(1700 * 1.55));
  });
  it("applies very active multiplier (1.725)", () => {
    expect(calcTDEE(1700, "Very active")).toBe(Math.round(1700 * 1.725));
  });
  it("defaults to lightly active (1.375) for unknown activity", () => {
    expect(calcTDEE(1700, "Unknown")).toBe(Math.round(1700 * 1.375));
  });
  it("TDEE is always greater than BMR", () => {
    expect(calcTDEE(1699, "Sedentary")).toBeGreaterThan(1699);
  });
});

// ─── calcTargetCalories ─────────────────────────────────────────────────────
describe("calcTargetCalories", () => {
  it("subtracts 500 kcal for weight loss goal", () => {
    expect(calcTargetCalories(2000, ["Lose weight & burn fat"])).toBe(1500);
  });
  it("adds 300 kcal for muscle building goal", () => {
    expect(calcTargetCalories(2000, ["Build muscle & strength"])).toBe(2300);
  });
  it("returns TDEE unchanged for general fitness", () => {
    expect(calcTargetCalories(2000, ["Improve endurance"])).toBe(2000);
  });
  it("weight loss takes priority when both lose and build goals selected", () => {
    expect(calcTargetCalories(2000, ["Lose weight & burn fat", "Build muscle & strength"])).toBe(1500);
  });
  it("handles string goal (non-array)", () => {
    expect(calcTargetCalories(2000, "Lose weight & burn fat")).toBe(1500);
  });
  it("handles empty goals array", () => {
    expect(calcTargetCalories(2000, [])).toBe(2000);
  });
});

// ─── calcMacros ─────────────────────────────────────────────────────────────
describe("calcMacros", () => {
  it("returns protein/carbs/fat/fibre for muscle goal", () => {
    const m = calcMacros(2000, ["Build muscle & strength"], ["None"]);
    expect(m.protein).toBe(Math.round(2000 * 0.35 / 4));
    expect(m.carbs).toBe(Math.round(2000 * 0.45 / 4));
    expect(m.fat).toBe(Math.round(2000 * 0.20 / 9));
    expect(m.fibre).toBe(25);
  });
  it("returns higher protein for weight loss goal", () => {
    const m = calcMacros(2000, ["Lose weight & burn fat"], ["None"]);
    expect(m.protein).toBe(Math.round(2000 * 0.40 / 4));
  });
  it("overrides carbs for Type 2 Diabetes", () => {
    const m = calcMacros(2000, ["Improve endurance"], ["Type 2 Diabetes"]);
    expect(m.carbs).toBe(Math.round(2000 * 0.25 / 4));
    expect(m.fibre).toBe(35);
  });
  it("sets fibre to 35 for High LDL condition", () => {
    const m = calcMacros(2000, ["Improve endurance"], ["High LDL / High Cholesterol"]);
    expect(m.fibre).toBe(35);
  });
  it("default fibre is 25 for no conditions", () => {
    const m = calcMacros(2000, ["Improve endurance"], ["None"]);
    expect(m.fibre).toBe(25);
  });
  it("all macro values are positive numbers", () => {
    const m = calcMacros(1800, ["Lose weight & burn fat"], ["None"]);
    expect(m.protein).toBeGreaterThan(0);
    expect(m.carbs).toBeGreaterThan(0);
    expect(m.fat).toBeGreaterThan(0);
  });
});

// ─── bmiCategory ────────────────────────────────────────────────────────────
describe("bmiCategory", () => {
  it("returns Underweight for BMI < 18.5", () => {
    expect(bmiCategory(17.5).label).toBe("Underweight");
  });
  it("returns Healthy for BMI 18.5–24.9", () => {
    expect(bmiCategory(22).label).toBe("Healthy");
    expect(bmiCategory(24.9).label).toBe("Healthy");
  });
  it("returns Overweight for BMI 25–29.9", () => {
    expect(bmiCategory(27).label).toBe("Overweight");
  });
  it("returns Obese for BMI >= 30", () => {
    expect(bmiCategory(31).label).toBe("Obese");
  });
  it("returns a color string for every category", () => {
    [16, 22, 27, 35].forEach((bmi) => {
      expect(typeof bmiCategory(bmi).color).toBe("string");
    });
  });
  it("handles string bmi input", () => {
    expect(bmiCategory("22.5").label).toBe("Healthy");
  });
});

// ─── calcWaterIntake ────────────────────────────────────────────────────────
describe("calcWaterIntake", () => {
  it("returns 2.6L for 75 kg", () => {
    expect(calcWaterIntake(75)).toBe(2.6);
  });
  it("returns 1 decimal place", () => {
    const val = calcWaterIntake(80);
    expect(val.toString().split(".")[1]?.length ?? 0).toBeLessThanOrEqual(1);
  });
  it("heavier person needs more water", () => {
    expect(calcWaterIntake(100)).toBeGreaterThan(calcWaterIntake(60));
  });
});

// ─── calcHeartRateZones ─────────────────────────────────────────────────────
describe("calcHeartRateZones", () => {
  it("calculates zone1 for age 30 (max HR = 190)", () => {
    const zones = calcHeartRateZones(30);
    expect(zones.zone1).toEqual([95, 114]);
  });
  it("calculates zone2 correctly", () => {
    const zones = calcHeartRateZones(30);
    expect(zones.zone2).toEqual([114, 133]);
  });
  it("returns all 4 zones", () => {
    const zones = calcHeartRateZones(25);
    expect(zones).toHaveProperty("zone1");
    expect(zones).toHaveProperty("zone2");
    expect(zones).toHaveProperty("zone3");
    expect(zones).toHaveProperty("zone4");
  });
  it("zones are lower for older person", () => {
    const young = calcHeartRateZones(25);
    const older = calcHeartRateZones(55);
    expect(older.zone2[1]).toBeLessThan(young.zone2[1]);
  });
  it("each zone is a [min, max] pair with min < max", () => {
    const zones = calcHeartRateZones(30);
    Object.values(zones).forEach(([min, max]) => {
      expect(min).toBeLessThan(max);
    });
  });
});

// ─── dayStreak ──────────────────────────────────────────────────────────────
describe("dayStreak", () => {
  it("returns 1 for null startDate", () => {
    expect(dayStreak(null)).toBe(1);
  });
  it("returns at least 1", () => {
    expect(dayStreak(new Date().toISOString())).toBeGreaterThanOrEqual(1);
  });
  it("returns 1 for today's start date", () => {
    expect(dayStreak(new Date().toISOString())).toBe(1);
  });
  it("returns correct streak for past date", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(dayStreak(threeDaysAgo)).toBe(4);
  });
});
