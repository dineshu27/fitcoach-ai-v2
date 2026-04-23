const PLAN_TTL = 30 * 24 * 60 * 60 * 1000;
const MAX_ITEM_BYTES = 400 * 1024; // 400 KB per item

const safeGet = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const safeSet = (key, val) => {
  try {
    const serialized = JSON.stringify(val);
    if (serialized.length > MAX_ITEM_BYTES) {
      console.warn(`[cache] ${key} exceeds size limit, skipping save.`);
      return;
    }
    localStorage.setItem(key, serialized);
  } catch (e) {
    // Quota exceeded — clear chat history as it's the most expendable
    try { localStorage.removeItem("fc_chat"); localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

export const cache = {
  savePlan(plan) { safeSet("fc_plan", { data: plan, ts: Date.now() }); },
  getPlan() {
    const raw = safeGet("fc_plan");
    if (!raw) return null;
    if (Date.now() - raw.ts > PLAN_TTL) return null;
    return raw.data;
  },
  planAge() {
    const raw = safeGet("fc_plan");
    if (!raw) return null;
    return Math.floor((Date.now() - raw.ts) / 86400000);
  },
  saveProfile(p) { safeSet("fc_profile", p); },
  getProfile() {
    const p = safeGet("fc_profile");
    // Validate required fields exist before returning
    if (!p || !p.name || !p.age || !p.weight || !p.height) return null;
    return p;
  },
  saveStats(s) { safeSet("fc_stats", s); },
  getStats() {
    return safeGet("fc_stats") || { startDate: new Date().toISOString(), workoutsLogged: 0 };
  },
  getChatCount() {
    const raw = safeGet("fc_chat_count");
    if (!raw || raw.date !== new Date().toDateString()) return { count: 0, date: new Date().toDateString() };
    return raw;
  },
  incrementChatCount() {
    const today = new Date().toDateString();
    const cur = this.getChatCount();
    const count = cur.date === today ? cur.count + 1 : 1;
    safeSet("fc_chat_count", { count, date: today });
    return count;
  },
  isPremium() { return localStorage.getItem("fc_premium") === "true"; },
  canChat() {
    if (this.isPremium()) return true;
    const { count, date } = this.getChatCount();
    return date !== new Date().toDateString() || count < 5;
  },
  chatsRemaining() {
    if (this.isPremium()) return Infinity;
    const { count, date } = this.getChatCount();
    if (date !== new Date().toDateString()) return 5;
    return Math.max(0, 5 - count);
  },
  saveChat(msgs) { safeSet("fc_chat", msgs.slice(-30)); },
  getChat() { return safeGet("fc_chat") || []; },

  // Exercise session logging — keyed by date → exercise name
  logExerciseSet(exerciseName, sets) {
    const today = new Date().toDateString();
    const all = safeGet("fc_ex_log") || {};
    if (!all[today]) all[today] = {};
    all[today][exerciseName] = sets;
    // Keep only last 30 days
    const dates = Object.keys(all).sort().slice(-30);
    const trimmed = Object.fromEntries(dates.map((d) => [d, all[d]]));
    safeSet("fc_ex_log", trimmed);
  },
  getExerciseLog(exerciseName) {
    const today = new Date().toDateString();
    return safeGet("fc_ex_log")?.[today]?.[exerciseName] || null;
  },
  getPrevExerciseLog(exerciseName) {
    const all = safeGet("fc_ex_log") || {};
    const today = new Date().toDateString();
    const dates = Object.keys(all).sort().reverse();
    for (const d of dates) {
      if (d !== today && all[d]?.[exerciseName]) return { date: d, sets: all[d][exerciseName] };
    }
    return null;
  },

  // Daily food & water log
  getTodayLog() {
    const today = new Date().toDateString();
    return safeGet("fc_daily_log")?.[today] || { calories: 0, water: 0, foods: [], protein: 0, carbs: 0, fat: 0 };
  },
  logCalories(name, calories, macros = {}) {
    const today = new Date().toDateString();
    const all = safeGet("fc_daily_log") || {};
    const existing = all[today] || { calories: 0, water: 0, foods: [], protein: 0, carbs: 0, fat: 0 };
    const { protein = 0, carbs = 0, fat = 0 } = macros;
    existing.foods = [...(existing.foods || []), { name, calories, protein, carbs, fat, ts: Date.now() }];
    existing.calories = (existing.calories || 0) + calories;
    existing.protein = (existing.protein || 0) + protein;
    existing.carbs = (existing.carbs || 0) + carbs;
    existing.fat = (existing.fat || 0) + fat;
    all[today] = existing;
    const dates = Object.keys(all).sort().slice(-30);
    safeSet("fc_daily_log", Object.fromEntries(dates.map((d) => [d, all[d]])));
  },
  removeLastFood() {
    const today = new Date().toDateString();
    const all = safeGet("fc_daily_log") || {};
    const existing = all[today];
    if (!existing || !existing.foods?.length) return;
    const removed = existing.foods[existing.foods.length - 1];
    existing.foods = existing.foods.slice(0, -1);
    existing.calories = Math.max(0, (existing.calories || 0) - (removed.calories || 0));
    existing.protein  = Math.max(0, (existing.protein  || 0) - (removed.protein  || 0));
    existing.carbs    = Math.max(0, (existing.carbs    || 0) - (removed.carbs    || 0));
    existing.fat      = Math.max(0, (existing.fat      || 0) - (removed.fat      || 0));
    all[today] = existing;
    safeSet("fc_daily_log", all);
  },
  markExerciseDone(name) {
    const today = new Date().toDateString();
    const all = safeGet("fc_daily_log") || {};
    const existing = all[today] || { calories: 0, water: 0, foods: [], protein: 0, carbs: 0, fat: 0 };
    existing.doneExercises = [...new Set([...(existing.doneExercises || []), name])];
    all[today] = existing;
    safeSet("fc_daily_log", all);
  },
  unmarkExerciseDone(name) {
    const today = new Date().toDateString();
    const all = safeGet("fc_daily_log") || {};
    const existing = all[today] || { calories: 0, water: 0, foods: [], protein: 0, carbs: 0, fat: 0 };
    existing.doneExercises = (existing.doneExercises || []).filter(n => n !== name);
    all[today] = existing;
    safeSet("fc_daily_log", all);
  },
  addCustomExercise(name) {
    const today = new Date().toDateString();
    const all = safeGet("fc_daily_log") || {};
    const existing = all[today] || { calories: 0, water: 0, foods: [], protein: 0, carbs: 0, fat: 0 };
    existing.customExercises = [...new Set([...(existing.customExercises || []), name])];
    all[today] = existing;
    safeSet("fc_daily_log", all);
  },
  setWater(glasses) {
    const today = new Date().toDateString();
    const all = safeGet("fc_daily_log") || {};
    const existing = all[today] || { calories: 0, water: 0, foods: [], protein: 0, carbs: 0, fat: 0 };
    existing.water = Math.max(0, glasses);
    all[today] = existing;
    const dates = Object.keys(all).sort().slice(-30);
    safeSet("fc_daily_log", Object.fromEntries(dates.map((d) => [d, all[d]])));
  },

  // General daily log access (by date string) — reads same fc_daily_log store
  getDailyLog(dateStr) {
    const all = safeGet("fc_daily_log") || {};
    return all[dateStr] || { calories: 0, water: 0, foods: [], protein: 0, carbs: 0, fat: 0 };
  },
  setDailyLog(dateStr, data) {
    const all = safeGet("fc_daily_log") || {};
    all[dateStr] = data;
    const keys = Object.keys(all).sort().slice(-60);
    safeSet("fc_daily_log", Object.fromEntries(keys.map(k => [k, all[k]])));
  },
  todayKey() { return new Date().toDateString(); },
  updateTodayLog(updates) {
    const current = this.getDailyLog(this.todayKey());
    this.setDailyLog(this.todayKey(), { ...current, ...updates });
  },
  markDaySkipped(dateStr) {
    const all = safeGet("fc_skipped_days") || {};
    all[dateStr] = true;
    safeSet("fc_skipped_days", all);
  },
  isDaySkipped(dateStr) {
    return !!(safeGet("fc_skipped_days") || {})[dateStr];
  },

  clearAll() {
    ["fc_plan", "fc_profile", "fc_chat", "fc_chat_count", "fc_stats", "fc_ex_log", "fc_daily_log", "fc_skipped_days"].forEach((k) =>
      localStorage.removeItem(k)
    );
  },
};
