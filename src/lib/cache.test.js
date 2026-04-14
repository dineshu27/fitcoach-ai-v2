import { describe, it, expect, beforeEach } from "vitest";
import { cache } from "./cache";

beforeEach(() => {
  localStorage.clear();
});

// ─── Plan ────────────────────────────────────────────────────────────────────
describe("cache.savePlan / getPlan", () => {
  it("saves and retrieves a plan", () => {
    const plan = { weekPlan: [{ day: "Monday" }], calories: 2000 };
    cache.savePlan(plan);
    expect(cache.getPlan()).toEqual(plan);
  });

  it("returns null when no plan saved", () => {
    expect(cache.getPlan()).toBeNull();
  });

  it("returns null when plan is older than 7 days", () => {
    const old = JSON.stringify({ data: { weekPlan: [] }, ts: Date.now() - 8 * 24 * 60 * 60 * 1000 });
    localStorage.setItem("fc_plan", old);
    expect(cache.getPlan()).toBeNull();
  });

  it("returns plan within TTL", () => {
    const plan = { weekPlan: [{ day: "Monday" }] };
    cache.savePlan(plan);
    expect(cache.getPlan()).not.toBeNull();
  });
});

// ─── planAge ────────────────────────────────────────────────────────────────
describe("cache.planAge", () => {
  it("returns null when no plan saved", () => {
    expect(cache.planAge()).toBeNull();
  });

  it("returns 0 for a plan saved today", () => {
    cache.savePlan({ weekPlan: [] });
    expect(cache.planAge()).toBe(0);
  });
});

// ─── Profile ────────────────────────────────────────────────────────────────
describe("cache.saveProfile / getProfile", () => {
  const validProfile = { name: "Jane", age: 28, weight: 65, height: 165 };

  it("saves and retrieves a valid profile", () => {
    cache.saveProfile(validProfile);
    expect(cache.getProfile()).toEqual(validProfile);
  });

  it("returns null when no profile saved", () => {
    expect(cache.getProfile()).toBeNull();
  });

  it("returns null for profile missing required fields", () => {
    cache.saveProfile({ name: "Jane" }); // missing age/weight/height
    expect(cache.getProfile()).toBeNull();
  });

  it("returns null for empty name", () => {
    cache.saveProfile({ name: "", age: 28, weight: 65, height: 165 });
    expect(cache.getProfile()).toBeNull();
  });
});

// ─── Stats ──────────────────────────────────────────────────────────────────
describe("cache.saveStats / getStats", () => {
  it("saves and retrieves stats", () => {
    const stats = { startDate: "2024-01-01", workoutsLogged: 5 };
    cache.saveStats(stats);
    expect(cache.getStats()).toEqual(stats);
  });

  it("returns default stats when none saved", () => {
    const stats = cache.getStats();
    expect(stats).toHaveProperty("startDate");
    expect(stats.workoutsLogged).toBe(0);
  });
});

// ─── Chat count / canChat ───────────────────────────────────────────────────
describe("chat rate limiting", () => {
  it("allows chat when count is 0", () => {
    expect(cache.canChat()).toBe(true);
  });

  it("increments chat count correctly", () => {
    cache.incrementChatCount();
    cache.incrementChatCount();
    expect(cache.getChatCount().count).toBe(2);
  });

  it("blocks chat after 5 messages", () => {
    for (let i = 0; i < 5; i++) cache.incrementChatCount();
    expect(cache.canChat()).toBe(false);
  });

  it("chatsRemaining returns 5 when none used", () => {
    expect(cache.chatsRemaining()).toBe(5);
  });

  it("chatsRemaining decrements with usage", () => {
    cache.incrementChatCount();
    cache.incrementChatCount();
    expect(cache.chatsRemaining()).toBe(3);
  });

  it("chatsRemaining never goes below 0", () => {
    for (let i = 0; i < 10; i++) cache.incrementChatCount();
    expect(cache.chatsRemaining()).toBe(0);
  });

  it("resets count for a new day", () => {
    const yesterday = JSON.stringify({ count: 5, date: "Mon Jan 01 2024" });
    localStorage.setItem("fc_chat_count", yesterday);
    expect(cache.canChat()).toBe(true);
    expect(cache.chatsRemaining()).toBe(5);
  });
});

// ─── Chat messages ──────────────────────────────────────────────────────────
describe("cache.saveChat / getChat", () => {
  it("saves and retrieves messages", () => {
    const msgs = [{ role: "user", content: "hi", id: 1 }];
    cache.saveChat(msgs);
    expect(cache.getChat()).toEqual(msgs);
  });

  it("returns empty array when nothing saved", () => {
    expect(cache.getChat()).toEqual([]);
  });

  it("keeps only the last 30 messages", () => {
    const msgs = Array.from({ length: 50 }, (_, i) => ({ role: "user", content: `msg ${i}`, id: i }));
    cache.saveChat(msgs);
    expect(cache.getChat()).toHaveLength(30);
  });

  it("retains the most recent messages when trimmed", () => {
    const msgs = Array.from({ length: 40 }, (_, i) => ({ role: "user", content: `msg ${i}`, id: i }));
    cache.saveChat(msgs);
    const saved = cache.getChat();
    expect(saved[saved.length - 1].content).toBe("msg 39");
  });
});

// ─── clearAll ───────────────────────────────────────────────────────────────
describe("cache.clearAll", () => {
  it("removes all fitcoach keys from localStorage", () => {
    cache.savePlan({ weekPlan: [] });
    cache.saveProfile({ name: "Test", age: 25, weight: 70, height: 175 });
    cache.saveChat([{ role: "user", content: "hi", id: 1 }]);
    cache.clearAll();
    expect(cache.getPlan()).toBeNull();
    expect(cache.getProfile()).toBeNull();
    expect(cache.getChat()).toEqual([]);
  });
});
