import { createContext, useContext, useState, useCallback, useRef } from "react";

const AchievementContext = createContext(null);

export function AchievementProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const queueRef = useRef([]);

  const show = useCallback(({ type, payload }) => {
    const id = type === "personal_best"
      ? `${payload?.slug || "ex"}:${payload?.weight}:${payload?.reps}`
      : type === "streak_milestone"
      ? `${payload?.days}`
      : `${payload?.weekNumber || ""}`;
    const key = `achievements:${type}:${id}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");

    const item = { type, payload, id: Date.now() };
    if (current) {
      queueRef.current.push(item);
    } else {
      setCurrent(item);
    }
  }, [current]);

  const dismiss = useCallback(() => {
    setCurrent(null);
    setTimeout(() => {
      if (queueRef.current.length > 0) {
        setCurrent(queueRef.current.shift());
      }
    }, 400);
  }, []);

  return (
    <AchievementContext.Provider value={{ show, dismiss, current }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievement() {
  const ctx = useContext(AchievementContext);
  if (!ctx) return { show: () => {}, dismiss: () => {}, current: null };
  return ctx;
}
