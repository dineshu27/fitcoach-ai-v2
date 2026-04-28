import { motion } from "framer-motion";

const SWEEP = {
  initial: { x: "-100%" },
  animate: { x: "100%" },
};

const SWEEP_TRANSITION = {
  duration: 1.4,
  ease: "linear",
  repeat: Infinity,
};

const REDUCED_TRANSITION = {
  duration: 0,
  repeat: 0,
};

function usePrefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Skeleton loader with shimmer sweep.
 * variant: "line" | "circle" | "card"
 * Uses CSS vars so it adapts to light/dark theme automatically.
 */
export default function Skeleton({ variant = "line", width, height, className = "" }) {
  const reduced = usePrefersReduced();

  const base = {
    position: "relative",
    overflow: "hidden",
    background: "var(--c-skeleton, var(--c-card))",
    flexShrink: 0,
  };

  const shapes = {
    line: {
      width: width ?? "100%",
      height: height ?? 16,
      borderRadius: 8,
    },
    circle: {
      width: width ?? 48,
      height: height ?? 48,
      borderRadius: "50%",
    },
    card: {
      width: width ?? "100%",
      height: height ?? 96,
      borderRadius: 16,
    },
  };

  return (
    <div style={{ ...base, ...shapes[variant] }} className={className} aria-hidden>
      {!reduced && (
        <motion.div
          variants={SWEEP}
          initial="initial"
          animate="animate"
          transition={SWEEP_TRANSITION}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent 0%, var(--c-skeleton-shine, rgba(255,255,255,0.06)) 50%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
