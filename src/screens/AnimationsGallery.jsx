import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "../components/Skeleton";
import ThinkingRing from "../components/ThinkingRing";
import { confettiBurst } from "../motion/confetti";
import { useCountUp } from "../motion/useCountUp";
import { ringProgress } from "../motion/ringProgress";
import {
  fadeUp, fadeIn, fadeUpSm, chatMessage, staggerContainer, staggerItem,
  rewardReveal, checkPop, checkmarkDraw, checkmarkPop, messageSlideIn,
  modalOverlay, modalPanel,
} from "../motion/variants";
import {
  pressable, pressablePrimary, pressableIcon, cardInteractive, tabPress, cardLift,
} from "../motion/presets";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--c-sub)", textTransform: "uppercase", marginBottom: 16 }}>
      {title}
    </p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
      {children}
    </div>
  </div>
);

function CountUpDemo() {
  const [key, setKey] = useState(0);
  const val = useCountUp(0, 1337, "confident");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <p style={{ fontSize: 32, fontWeight: 800, color: "var(--c-accent)", fontVariantNumeric: "tabular-nums" }}>{val}</p>
      <button
        onClick={() => setKey(k => k + 1)}
        key={key}
        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--c-card)", color: "var(--c-sub)", border: "1px solid var(--c-border)" }}
      >
        Replay
      </button>
    </div>
  );
}

function RingDemo() {
  const [value, setValue] = useState(600);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const props = ringProgress({ value, target: 1000, circumference: circ });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={80} height={80} viewBox="0 0 80 80">
        <circle cx={40} cy={40} r={r} fill="none" stroke="var(--c-border)" strokeWidth={6} />
        <motion.circle
          cx={40} cy={40} r={r}
          fill="none"
          stroke="var(--c-accent)"
          strokeWidth={6}
          strokeDasharray={circ}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          animate={{ strokeDashoffset: props.strokeDashoffset }}
          transition={props.transition}
        />
        <text x={40} y={45} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--c-text)">{Math.round(value / 10)}</text>
      </svg>
      <input
        type="range" min={0} max={1000} value={value}
        onChange={e => setValue(Number(e.target.value))}
        style={{ width: 80 }}
      />
    </div>
  );
}

function CheckmarkDemo() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <motion.svg
        width={48} height={48} viewBox="0 0 48 48"
        variants={checkmarkPop}
        initial="hidden"
        animate={show ? "show" : "hidden"}
      >
        <circle cx={24} cy={24} r={20} fill="var(--c-accent)" opacity={0.15} />
        <motion.path
          d="M14 24 L21 31 L34 17"
          stroke="var(--c-accent)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={checkmarkDraw}
          initial="hidden"
          animate={show ? "show" : "hidden"}
        />
      </motion.svg>
      <button
        onClick={() => setShow(s => !s)}
        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--c-card)", color: "var(--c-sub)", border: "1px solid var(--c-border)" }}
      >
        {show ? "Reset" : "Draw"}
      </button>
    </div>
  );
}

function TypingDotsDemo() {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "12px 16px", background: "var(--c-card)", borderRadius: 16 }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-accent)" }}
          animate={reduced ? {} : { y: [0, -6, 0] }}
          transition={reduced ? {} : {
            duration: 0.6,
            delay: i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function FadeVariantDemo({ variant, label }) {
  const [visible, setVisible] = useState(true);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key="box"
            variants={variant}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ width: 64, height: 64, background: "var(--c-accent)", borderRadius: 12, opacity: 0.8 }}
          />
        )}
      </AnimatePresence>
      <button
        onClick={() => setVisible(v => !v)}
        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--c-card)", color: "var(--c-sub)", border: "1px solid var(--c-border)" }}
      >
        {label}
      </button>
    </div>
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        {...pressable}
        onClick={() => setOpen(true)}
        style={{ padding: "10px 18px", borderRadius: 12, background: "var(--c-accent)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}
      >
        Open Modal
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            variants={modalOverlay}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={e => e.stopPropagation()}
              style={{ background: "var(--c-card)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 320, textAlign: "center" }}
            >
              <p style={{ fontWeight: 700, marginBottom: 8, color: "var(--c-text)" }}>Modal panel</p>
              <p style={{ fontSize: 13, color: "var(--c-sub)", marginBottom: 20 }}>spring.gentle entrance, tap outside to close</p>
              <motion.button {...pressablePrimary} onClick={() => setOpen(false)}
                style={{ padding: "10px 24px", borderRadius: 12, background: "var(--c-accent)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AnimationsGallery() {
  return (
    <div style={{ padding: "24px 20px 80px", background: "var(--c-bg)", minHeight: "100vh" }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: "var(--c-text)", marginBottom: 4 }}>Animation Primitives</p>
      <p style={{ fontSize: 12, color: "var(--c-sub)", marginBottom: 32 }}>DEV only — /dev/animations</p>

      <Section title="Skeletons">
        <Skeleton variant="line" width={180} />
        <Skeleton variant="circle" />
        <Skeleton variant="card" width={160} height={80} />
      </Section>

      <Section title="ThinkingRing">
        <ThinkingRing size={56} />
        <ThinkingRing size={40} />
      </Section>

      <Section title="Typing Dots">
        <TypingDotsDemo />
      </Section>

      <Section title="Count Up">
        <CountUpDemo />
      </Section>

      <Section title="Ring Progress">
        <RingDemo />
      </Section>

      <Section title="Checkmark Draw + Pop">
        <CheckmarkDemo />
      </Section>

      <Section title="Fade Variants">
        <FadeVariantDemo variant={fadeUp} label="fadeUp" />
        <FadeVariantDemo variant={fadeIn} label="fadeIn" />
        <FadeVariantDemo variant={fadeUpSm} label="fadeUpSm" />
      </Section>

      <Section title="Message Variants">
        <FadeVariantDemo variant={chatMessage} label="chatMessage" />
        <FadeVariantDemo variant={messageSlideIn} label="messageSlideIn" />
      </Section>

      <Section title="Reward / Check Pop">
        <FadeVariantDemo variant={rewardReveal} label="rewardReveal" />
        <FadeVariantDemo variant={checkPop} label="checkPop" />
      </Section>

      <Section title="Stagger">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <motion.div key={i} variants={staggerItem}
              style={{ width: 40, height: 40, background: "var(--c-accent)", borderRadius: 10, opacity: 0.7 + i * 0.07 }} />
          ))}
        </motion.div>
      </Section>

      <Section title="Press Presets">
        {[
          { label: "pressable", props: pressable },
          { label: "pressablePrimary", props: pressablePrimary },
          { label: "pressableIcon", props: pressableIcon },
          { label: "tabPress", props: tabPress },
          { label: "cardInteractive", props: cardInteractive },
        ].map(({ label, props }) => (
          <motion.button key={label} {...props}
            style={{ padding: "10px 14px", borderRadius: 12, background: "var(--c-card)", color: "var(--c-text)", fontWeight: 600, fontSize: 12, border: "1px solid var(--c-border)", cursor: "pointer" }}>
            {label}
          </motion.button>
        ))}
      </Section>

      <Section title="Card Lift (hover/focus)">
        <motion.div {...cardLift}
          style={{ padding: "16px 20px", borderRadius: 16, background: "var(--c-card)", color: "var(--c-text)", fontWeight: 600, fontSize: 13, border: "1px solid var(--c-border)", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          Hover me
        </motion.div>
      </Section>

      <Section title="Modal">
        <ModalDemo />
      </Section>

      <Section title="Confetti">
        <motion.button {...pressable}
          onClick={() => confettiBurst("soft")}
          style={{ padding: "10px 18px", borderRadius: 12, background: "var(--c-card)", color: "var(--c-accent)", fontWeight: 700, fontSize: 13, border: "1px solid var(--c-border)", cursor: "pointer" }}>
          Soft burst
        </motion.button>
        <motion.button {...pressable}
          onClick={() => confettiBurst("celebration")}
          style={{ padding: "10px 18px", borderRadius: 12, background: "var(--c-accent)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
          Celebration 🎉
        </motion.button>
      </Section>
    </div>
  );
}
