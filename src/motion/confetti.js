import confetti from "canvas-confetti";

const BRAND_COLORS = ["#FC4C02", "#FBBF24", "#34D399"];

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * confettiBurst(intensity)
 * - 'soft':        30 particles, single burst — set complete, small win
 * - 'celebration': 80 particles + secondary burst at 200ms — milestone, PR
 */
export function confettiBurst(intensity = "soft") {
  if (prefersReduced()) return;

  const base = {
    colors: BRAND_COLORS,
    disableForReducedMotion: true,
    startVelocity: intensity === "celebration" ? 28 : 18,
    spread: intensity === "celebration" ? 70 : 50,
    ticks: intensity === "celebration" ? 80 : 50,
    gravity: 1.1,
    scalar: 0.8,
    shapes: ["square", "circle"],
    origin: { y: 0.6 },
  };

  confetti({ ...base, particleCount: intensity === "soft" ? 30 : 80 });

  if (intensity === "celebration") {
    setTimeout(() => {
      confetti({
        ...base,
        particleCount: 40,
        startVelocity: 22,
        origin: { y: 0.5, x: 0.4 },
      });
    }, 200);
  }
}
