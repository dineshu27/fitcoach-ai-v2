import { motion } from "framer-motion";

const ARCS = [
  { r: 10, strokeWidth: 2.5, speed: 0.8,  dashArray: "18 42", opacity: 1 },
  { r: 16, strokeWidth: 2,   speed: 1.2,  dashArray: "24 76", opacity: 0.7 },
  { r: 22, strokeWidth: 1.5, speed: 1.6,  dashArray: "30 108", opacity: 0.45 },
];

function usePrefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * ThinkingRing — 3 concentric arcs that rotate at different speeds.
 * Used to signal REX is processing/thinking outside of the /coach screen.
 * size: pixel diameter of the outermost ring's bounding box.
 */
export default function ThinkingRing({ size = 56 }) {
  const reduced = usePrefersReduced();
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Thinking…"
      role="img"
    >
      {ARCS.map((arc, i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={arc.r}
          fill="none"
          stroke="var(--c-accent)"
          strokeWidth={arc.strokeWidth}
          strokeDasharray={arc.dashArray}
          strokeLinecap="round"
          opacity={arc.opacity}
          animate={
            reduced
              ? {}
              : { rotate: 360 }
          }
          transition={
            reduced
              ? {}
              : {
                  duration: 1 / arc.speed,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                }
          }
          style={{ originX: "50%", originY: "50%", transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
    </svg>
  );
}
