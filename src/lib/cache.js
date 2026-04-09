const PLAN_TTL = 7 * 24 * 60 * 60 * 1000;

const safeGet = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const safeSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

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
  getProfile() { return safeGet("fc_profile"); },
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
  saveChat(msgs) { safeSet("fc_chat", msgs.slice(-50)); },
  getChat() { return safeGet("fc_chat") || []; },
  clearAll() {
    ["fc_plan", "fc_profile", "fc_chat", "fc_chat_count", "fc_stats"].forEach((k) =>
      localStorage.removeItem(k)
    );
  },
};
