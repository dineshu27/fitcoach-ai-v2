// ─────────────────────────────────────────────────────────────────────────────
// Motion presets — spread-ready prop objects for common interaction patterns.
// Usage: <motion.button {...pressable} />
// ─────────────────────────────────────────────────────────────────────────────

import { spring, dur, ease } from "./tokens";

// ── Press feedback ────────────────────────────────────────────────────────────
// Tiny scale-down on tap. Instant. Premium feel.
// 0.985 feels responsive without being dramatic.
export const pressable = {
  whileTap: { scale: 0.985 },
  transition: spring.micro,
};

// Slightly more noticeable for primary CTA buttons
export const pressablePrimary = {
  whileTap: { scale: 0.972 },
  transition: spring.micro,
};

// For icon-only buttons (back arrow, clear, etc.)
export const pressableIcon = {
  whileTap: { scale: 0.93 },
  transition: spring.micro,
};

// ── Card interactions ─────────────────────────────────────────────────────────
// Very subtle lift — only use when it clarifies interactivity.
// Disabled on mobile where hover doesn't apply.
export const cardInteractive = {
  whileTap: { scale: 0.988 },
  transition: { duration: dur.micro, ease: ease.sharp },
};

// ── Toggle / active state ─────────────────────────────────────────────────────
// Used for day tabs, filter pills, theme buttons.
export const tabPress = {
  whileTap: { scale: 0.96 },
  transition: spring.micro,
};
