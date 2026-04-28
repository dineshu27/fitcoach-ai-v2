import { useEffect, useRef, useState } from "react";
import { dur } from "./tokens";

const DURATIONS = {
  micro:       dur.micro,
  fast:        dur.fast,
  standard:    dur.standard,
  medium:      dur.medium,
  confident:   dur.confident,
  progress:    dur.progress,
  celebration: dur.celebration,
};

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animates a number from `from` to `to` over the given duration token.
 * Respects prefers-reduced-motion — jumps straight to `to` if motion is reduced.
 * Returns the current animated value (integer or float matching `to`).
 */
export function useCountUp(from, to, durationToken = "confident") {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [value, setValue] = useState(prefersReduced ? to : from);
  const rafRef  = useRef(null);
  const startRef = useRef(null);
  const fromRef  = useRef(from);
  const toRef    = useRef(to);

  useEffect(() => {
    if (prefersReduced) { setValue(to); return; }
    if (fromRef.current === to && toRef.current === to) return;

    const durationMs = (DURATIONS[durationToken] ?? dur.confident) * 1000;
    fromRef.current = from;
    toRef.current   = to;
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(progress);
      // Preserve decimal precision of `to`
      const decimals = String(to).includes(".") ? String(to).split(".")[1].length : 0;
      const current = from + (to - from) * eased;
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [from, to, durationToken, prefersReduced]);

  return value;
}
