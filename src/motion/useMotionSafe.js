// ─────────────────────────────────────────────────────────────────────────────
// useMotionSafe — accessibility-first motion hook.
// Respects prefers-reduced-motion. Components call this to get safe variants.
//
// When reduced motion is preferred:
//   - All y/x translations are zeroed
//   - Scale animations are removed
//   - Opacity transitions are kept (they don't cause vestibular issues)
//   - Durations are shortened to near-instant
// ─────────────────────────────────────────────────────────────────────────────

import { useReducedMotion } from "framer-motion";

// Strips motion from a variants object, keeping only opacity.
function reduceVariants(variants) {
  if (!variants) return variants;
  const safe = {};
  for (const [key, val] of Object.entries(variants)) {
    if (typeof val === "object" && !Array.isArray(val)) {
      const { x: _x, y: _y, scale: _s, rotate: _r, ...rest } = val;
      // Flatten nested transition override
      if (rest.transition) {
        rest.transition = { duration: 0.01 };
      }
      safe[key] = rest;
    } else {
      safe[key] = val;
    }
  }
  return safe;
}

export function useMotionSafe() {
  const reduced = useReducedMotion();

  return {
    reduced,
    // Returns variants with motion stripped if reduced-motion is preferred
    v: (variants) => (reduced ? reduceVariants(variants) : variants),
    // Returns duration as 0 if reduced motion, otherwise the provided value
    d: (duration) => (reduced ? 0.01 : duration),
    // Returns empty object (no animation) or the provided preset if motion OK
    p: (preset) => (reduced ? {} : preset),
  };
}
