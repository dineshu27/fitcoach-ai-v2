// ─────────────────────────────────────────────────────────────────────────────
// Motion variants — reusable Framer Motion variant objects.
// Import these instead of defining inline animation config in components.
//
// Amplitude limits (enforced here, not in components):
//   y offset: 8–16px max
//   scale:    0.96–1.02 range
//   opacity:  0 → 1 only
// ─────────────────────────────────────────────────────────────────────────────

import { dur, ease, spring } from "./tokens";

// ── Content reveal ────────────────────────────────────────────────────────────
// Default for most content entering the screen.
// Fade + gentle upward rise. Calm, not theatrical.
export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0,   transition: { duration: dur.standard, ease: ease.out } },
  exit:   { opacity: 0, y: -8,  transition: { duration: dur.fast,     ease: ease.inOut } },
};

// Opacity only — for elements that shift position already (e.g. route wrappers)
export const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: dur.standard, ease: ease.out } },
  exit:   { opacity: 0, transition: { duration: dur.fast,     ease: ease.out } },
};

// Smaller rise — for tight spaces (chips, pills, small cards)
export const fadeUpSm = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0,  transition: { duration: dur.fast, ease: ease.out } },
  exit:   { opacity: 0, y: -6, transition: { duration: dur.micro, ease: ease.out } },
};

// ── Route transition ─────────────────────────────────────────────────────────
// Pure fade — no horizontal travel. Prevents layout jank on mobile.
export const routePage = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: dur.standard, ease: ease.out } },
  exit:   { opacity: 0, transition: { duration: dur.fast,     ease: ease.out } },
};

// ── Chat messages ─────────────────────────────────────────────────────────────
// Calm upward entry. No bounce. Short travel.
export const chatMessage = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0,  transition: { duration: dur.medium, ease: ease.out } },
};

// ── Stagger containers ────────────────────────────────────────────────────────
// Parent variant that drives staggered children.
// Keep stagger tight — hierarchy clarification, not performance.
export const staggerContainer = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

// Child variant for staggered lists
export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: dur.standard, ease: ease.out } },
};

// Tighter stagger for dense lists (exercise cards, meal rows)
export const staggerItemFast = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: dur.fast, ease: ease.out } },
};

// ── Expand / Collapse ─────────────────────────────────────────────────────────
// Used for accordion panels, exercise card detail, meal expand.
// height: 0 → auto is handled by Framer Motion's layout system.
export const expandCollapse = {
  hidden: { height: 0, opacity: 0 },
  show:   { height: "auto", opacity: 1, transition: { duration: dur.medium,  ease: ease.out } },
  exit:   { height: 0,      opacity: 0, transition: { duration: dur.fast,    ease: ease.inOut } },
};

// ── Achievement / Reward ──────────────────────────────────────────────────────
// Used for streak milestones, goal completions, personal bests only.
// Subtle scale-up and settle. Never blocks next action.
export const rewardReveal = {
  hidden: { opacity: 0, scale: 0.94 },
  show:   {
    opacity: 1,
    scale: 1,
    transition: { duration: dur.celebration, ease: ease.out },
  },
  exit:   { opacity: 0, scale: 0.97, transition: { duration: dur.fast, ease: ease.out } },
};

// Checkmark pop — set completion, task done, food logged
export const checkPop = {
  hidden: { scale: 0, opacity: 0 },
  show:   {
    scale: 1, opacity: 1,
    transition: { ...spring.quick, restDelta: 0.001 },
  },
};

// ── Progress ─────────────────────────────────────────────────────────────────
// For SVG ring strokes and bar fills — controlled, satisfying.
// Duration intentionally longer to feel earned.
export const progressFill = {
  hidden: { pathLength: 0, opacity: 0 },
  show:   {
    pathLength: 1, opacity: 1,
    transition: { duration: dur.progress, ease: ease.out, delay: 0.1 },
  },
};

// ── Chat message slide-in ─────────────────────────────────────────────────────
// From a compact, slightly-behind state into the natural position.
// Direction-agnostic: pair with x: 6 or x: -6 in whichever side needs it.
export const messageSlideIn = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { ...spring.gentle } },
  exit:   { opacity: 0, scale: 0.97,    transition: { duration: dur.fast, ease: ease.out } },
};

// ── SVG checkmark draw ────────────────────────────────────────────────────────
// Stroke path draws in, then badge pops to signal completion.
export const checkmarkDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  show:   {
    pathLength: 1, opacity: 1,
    transition: { duration: 0.35, ease: ease.out },
  },
};

export const checkmarkPop = {
  hidden: { scale: 1 },
  show:   {
    scale: [1, 1.15, 1],
    transition: { duration: 0.35, delay: 0.3, ease: ease.inOut },
  },
};

// ── Modal / overlay ───────────────────────────────────────────────────────────
export const modalOverlay = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: dur.fast } },
  exit:   { opacity: 0, transition: { duration: dur.fast } },
};

export const modalPanel = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  show:   { opacity: 1, scale: 1,    y: 0,   transition: { ...spring.gentle } },
  exit:   { opacity: 0, scale: 0.97, y: 12,  transition: { duration: dur.fast, ease: ease.inOut } },
};
