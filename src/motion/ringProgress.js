/**
 * Returns Framer Motion animate/transition props for an SVG ring progress arc.
 * The stroke-dashoffset approach: circle circumference is fully offset at start,
 * then animated toward (1 - pct) * circumference.
 *
 * Usage:
 *   const { strokeDashoffset, transition } = ringProgress({ value: 1200, target: 2000, circumference: circ });
 *   <motion.circle strokeDashoffset={strokeDashoffset} transition={transition} />
 */
export function ringProgress({ value = 0, target = 1, circumference, durationToken = "confident" }) {
  const DURATION_MAP = {
    micro: 0.13, fast: 0.18, standard: 0.22, medium: 0.28,
    confident: 0.40, progress: 0.55, celebration: 0.75,
  };
  const pct = Math.min(1, Math.max(0, value / Math.max(target, 1)));
  const offset = circumference * (1 - pct);
  const atGoal = value >= target;

  return {
    strokeDashoffset: offset,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 22,
    },
    // Glow pulse when goal reached — use as `animate` sequence
    goalPulse: atGoal
      ? {
          filter: [
            "drop-shadow(0 0 0px transparent)",
            "drop-shadow(0 0 8px var(--c-accent))",
            "drop-shadow(0 0 0px transparent)",
          ],
          transition: { duration: DURATION_MAP[durationToken] ?? 0.4, times: [0, 0.5, 1] },
        }
      : null,
  };
}
