import { useState, useRef, useCallback } from "react";

export function useRexState(initial = "idle") {
  const [state, setState] = useState(initial);
  const timerRef = useRef(null);
  const pendingRef = useRef(null);

  const show = useCallback((newState, durationMs = 2000) => {
    if (timerRef.current) {
      pendingRef.current = { newState, durationMs };
      return;
    }
    setState(newState);
    if (newState !== "idle") {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setState("idle");
        if (pendingRef.current) {
          const { newState: ns, durationMs: dm } = pendingRef.current;
          pendingRef.current = null;
          show(ns, dm);
        }
      }, durationMs);
    }
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    pendingRef.current = null;
    setState("idle");
  }, []);

  return { state, show, reset };
}
