// ─────────────────────────────────────────────────────────────────────────────
// Motion tokens — single source of truth for all timing and easing in the app.
// Every animation duration and curve is defined here.
// Rule: if it's not here, it shouldn't exist.
// ─────────────────────────────────────────────────────────────────────────────

// Duration scale (seconds)
// Micro  → immediate feedback (button press, toggle)
// Fast   → short transitions (message bubble, icon swap)
// Standard → default content reveal
// Medium → panel expand, modal open
// Progress → bar fills, ring draws
// Celebration → achievement reveal (reward moments only)
export const dur = {
  micro:       0.13,
  fast:        0.18,
  standard:    0.22,
  medium:      0.28,
  confident:   0.40, // purposeful actions — ring fills, count-ups
  progress:    0.55,
  celebration: 0.75,
};

// Cubic-bezier easing curves
// out       → fast start, soft landing (default for reveals)
// inOut     → symmetric ease (transitions between states)
// sharp     → instant start, precise settle (feedback)
export const ease = {
  out:   [0.0, 0.0, 0.2, 1.0],
  inOut: [0.4, 0.0, 0.2, 1.0],
  sharp: [0.2, 0.0, 0.0, 1.0],
};

// Spring configs — low bounce, high damping, fast settle.
// Never elastic. Overshoot should be near-zero.
export const spring = {
  // General purpose: snappy with soft settle
  quick:  { type: "spring", stiffness: 300, damping: 26, mass: 0.8 },
  // Gentle: slow reveal, soft settle
  gentle: { type: "spring", stiffness: 200, damping: 22, mass: 0.9 },
  // Nav indicator: fast, precise
  nav:    { type: "spring", stiffness: 380, damping: 32 },
  // Minimal: near-instant, just removes abruptness
  micro:  { type: "spring", stiffness: 500, damping: 35, mass: 0.6 },
};
