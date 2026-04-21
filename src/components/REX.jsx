import { useId } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   APEX — AI Fitness Energy Core
   A living intelligence orb: pulsing ECG · neural spokes ·
   orbital rings · state-reactive glow. No robot — pure AI energy.
══════════════════════════════════════════════════════════════ */

const SIZES  = { xs: 0.42, sm: 0.58, md: 1, lg: 1.28 };
const BASE_W = 100;
const BASE_H = 100;

const COLORS = {
  idle:        { eye:"#60A5FA", core:"#3B82F6", glow:"#1D4ED8", ring:"rgba(59,130,246,0.38)",  p:"#93C5FD" },
  thinking:    { eye:"#38BDF8", core:"#0EA5E9", glow:"#0369A1", ring:"rgba(14,165,233,0.38)",  p:"#7DD3FC" },
  talking:     { eye:"#A78BFA", core:"#8B5CF6", glow:"#6D28D9", ring:"rgba(139,92,246,0.38)",  p:"#C4B5FD" },
  celebrating: { eye:"#34D399", core:"#10B981", glow:"#047857", ring:"rgba(52,211,153,0.44)",  p:"#6EE7B7" },
  warning:     { eye:"#F87171", core:"#EF4444", glow:"#B91C1C", ring:"rgba(239,68,68,0.46)",   p:"#FCA5A5" },
  happy:       { eye:"#34D399", core:"#10B981", glow:"#047857", ring:"rgba(52,211,153,0.40)",  p:"#6EE7B7" },
};

// 6 neural spokes radiating from core (degrees)
const SPOKES = [0, 60, 120, 180, 240, 300];

export default function REX({ state = "idle", size = "md" }) {
  const uid  = useId().replace(/:/g, "");
  const scale = SIZES[size] || 1;
  const c = COLORS[state] || COLORS.idle;

  const isThinking    = state === "thinking";
  const isTalking     = state === "talking";
  const isCelebrating = state === "celebrating";
  const isWarning     = state === "warning";

  const W = Math.round(BASE_W * scale);
  const H = Math.round(BASE_H * scale);

  // Animation timing — speed up for active states
  const pulse   = isTalking ? 0.30 : isWarning ? 0.38 : 2.2;
  const orbit   = isThinking ? 1.3 : 5.2;
  const ecg     = isTalking ? 0.68 : isThinking ? 0.92 : 1.85;
  const breathe = 3.4;
  const spkSpd  = isThinking ? 0.42 : 1.9;

  const HP  = "var(--rex-hull)";

  // Filter / clip IDs (unique per instance to avoid SVG collisions)
  const gfId   = uid + "gf";
  const bfId   = uid + "bf";
  const afId   = uid + "af";
  const clipId = uid + "oc";
  const orbGId = uid + "orbG";
  const cGId   = uid + "cG";

  return (
    <div style={{ width: W, height: H, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={W} height={H} overflow="visible">
        <defs>
          {/* Node glow */}
          <filter id={gfId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Core bloom */}
          <filter id={bfId} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="7"/>
          </filter>
          {/* Ambient haze */}
          <filter id={afId} x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="18"/>
          </filter>

          {/* Sphere top-left sheen */}
          <radialGradient id={orbGId} cx="36%" cy="30%" r="68%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.22)"/>
            <stop offset="55%"  stopColor="rgba(255,255,255,0.04)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
          </radialGradient>

          {/* Core radial fill */}
          <radialGradient id={cGId} cx="38%" cy="34%" r="65%">
            <stop offset="0%"   stopColor="white"  stopOpacity="1"/>
            <stop offset="35%"  stopColor={c.eye}  stopOpacity="1"/>
            <stop offset="100%" stopColor={c.core} stopOpacity="0.72"/>
          </radialGradient>

          {/* ECG clipped to orb interior */}
          <clipPath id={clipId}>
            <circle cx="50" cy="50" r="29"/>
          </clipPath>
        </defs>

        {/* ── Ambient background haze ────────────── */}
        <motion.circle cx="50" cy="50" r="50"
          fill={c.glow} filter={`url(#${afId})`}
          animate={{ opacity: isWarning?[0.40,0.70,0.40] : isCelebrating?[0.22,0.48,0.22] : [0.07,0.20,0.07] }}
          transition={{ duration: pulse, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Outer orbit ring (slow / fast when thinking) ── */}
        <motion.g style={{ transformOrigin: "50px 50px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: orbit, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="50" cy="50" r="46"
            fill="none" stroke={c.ring} strokeWidth="0.7" strokeDasharray="9 7"/>
          {/* Travelling bright dot */}
          <motion.circle cx="96" cy="50" r="2.8"
            fill={c.eye} filter={`url(#${gfId})`}
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        </motion.g>

        {/* ── Second counter-ring (idle/celebrate only) ───── */}
        {!isThinking && !isWarning && (
          <motion.g style={{ transformOrigin: "50px 50px" }}
            animate={{ rotate: -360 }}
            transition={{ duration: orbit * 1.6, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="39"
              fill="none" stroke={c.ring} strokeWidth="0.5" strokeDasharray="5 12" opacity="0.45"/>
          </motion.g>
        )}

        {/* ── Thinking: fast scan arc ───────────────────── */}
        {isThinking && (
          <motion.g style={{ transformOrigin: "50px 50px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="38"
              fill="none" stroke={c.eye} strokeWidth="2"
              strokeDasharray="28 72" strokeLinecap="round" opacity="0.88"
            />
          </motion.g>
        )}

        {/* ── Main orb body — warning shake wrapper ─────── */}
        <motion.g
          animate={isWarning ? { x: [-4, 4, -4, 4, 0] } : undefined}
          transition={isWarning ? { duration: 0.34, repeat: Infinity } : undefined}
        >
          {/* Orb fill */}
          <circle cx="50" cy="50" r="30" style={{ fill: HP }}
            stroke={c.eye} strokeWidth="1.5" strokeOpacity="0.50"
          />
          {/* Sphere sheen */}
          <circle cx="50" cy="50" r="30" fill={`url(#${orbGId})`}/>

          {/* ── ECG heartbeat line ─────────────────────── */}
          <g clipPath={`url(#${clipId})`}>
            <motion.path
              d="M 12 50 L 26 50 L 31 50 L 36 39 L 42 62 L 47 43 L 52 50 L 88 50"
              fill="none" stroke={c.eye} strokeWidth="1.8" strokeLinecap="round"
              strokeDasharray="92"
              animate={{ strokeDashoffset: [92, 0, -92] }}
              transition={{ duration: ecg, repeat: Infinity, ease: "linear" }}
            />
          </g>

          {/* ── Neural spokes ──────────────────────────── */}
          {SPOKES.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <motion.line key={i}
                x1={50 + Math.cos(rad) * 11} y1={50 + Math.sin(rad) * 11}
                x2={50 + Math.cos(rad) * 22} y2={50 + Math.sin(rad) * 22}
                stroke={c.eye} strokeWidth="0.95" strokeLinecap="round"
                animate={{ opacity: [0.10, 0.80, 0.10] }}
                transition={{ duration: spkSpd, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            );
          })}

          {/* ── Core bloom halo ────────────────────────── */}
          <motion.circle cx="50" cy="50" r="11"
            fill={c.core} filter={`url(#${bfId})`}
            animate={{ opacity: [0.38, 0.88, 0.38], r: [11, 14, 11] }}
            transition={{ duration: pulse, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Core solid ─────────────────────────────── */}
          <circle cx="50" cy="50" r="9" fill={`url(#${cGId})`}/>

          {/* ── Centre point ───────────────────────────── */}
          <circle cx="50" cy="50" r="3.2" fill="white" opacity="0.96"/>

          {/* ── Breathing outer stroke pulse ───────────── */}
          <motion.circle cx="50" cy="50" r="30"
            fill="none" stroke={c.core} strokeWidth="1.2"
            animate={{ opacity: [0.12, 0.50, 0.12] }}
            transition={{ duration: breathe, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* ── Talking: concentric ripple rings ──────────── */}
        {isTalking && [1, 2, 3].map(i => (
          <motion.circle key={i} cx="50" cy="50" r="30"
            fill="none" stroke={c.eye} strokeWidth="1.6"
            animate={{ r: [30, 30 + i * 9], opacity: [0.58, 0] }}
            transition={{ duration: 0.92, repeat: Infinity, delay: i * 0.27, ease: "easeOut" }}
          />
        ))}

        {/* ── Warning: red flash ring ────────────────────── */}
        {isWarning && (
          <motion.circle cx="50" cy="50" r="30"
            fill="none" stroke="#F87171" strokeWidth="3.5"
            animate={{ opacity: [0.92, 0] }}
            transition={{ duration: 0.40, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* ── Celebrating: radial burst particles ─────────── */}
        {isCelebrating && [0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
          const a  = (i / 12) * Math.PI * 2;
          const sx = 50 + Math.cos(a) * 32, sy = 50 + Math.sin(a) * 32;
          const ex = 50 + Math.cos(a) * 60, ey = 50 + Math.sin(a) * 60;
          const r  = i % 3 === 0 ? 3.5 : 2;
          return (
            <motion.circle key={i} cx={sx} cy={sy} r={r}
              fill={i % 2 === 0 ? c.eye : "#FFFFFF"}
              animate={{ cx: [sx, ex], cy: [sy, ey], opacity: [1, 0], r: [r, 0.4] }}
              transition={{ duration: 0.88, repeat: Infinity, delay: i * 0.07, ease: "easeOut" }}
            />
          );
        })}

        {/* ── Idle: 3 soft orbit dots ────────────────────── */}
        {!isThinking && !isTalking && !isCelebrating && !isWarning && [0, 1, 2].map(i => {
          const a = (i / 3) * Math.PI * 2 + 0.6;
          return (
            <motion.circle key={i}
              cx={50 + Math.cos(a) * 44} cy={50 + Math.sin(a) * 44}
              r="2.2" fill={c.p}
              animate={{ opacity: [0.10, 0.65, 0.10], r: [2.2, 3.4, 2.2] }}
              transition={{ duration: 2.7, repeat: Infinity, delay: i * 0.75 }}
            />
          );
        })}

      </svg>
    </div>
  );
}
