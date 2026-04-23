import { useId } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   FitCoach — Animated human coach SVG
   States: idle · thinking · talking · celebrating · warning
══════════════════════════════════════════════════════════════ */

const SIZES = { xs: 0.42, sm: 0.58, md: 1, lg: 1.28 };
const BASE_W = 100;
const BASE_H = 120;

const COLORS = {
  idle:        { shirt: "#FC4C02", glow: "rgba(252,76,2,0.25)",  skin: "#F5C5A0", hair: "#3D2B1F" },
  thinking:    { shirt: "#0EA5E9", glow: "rgba(14,165,233,0.28)", skin: "#F5C5A0", hair: "#3D2B1F" },
  talking:     { shirt: "#8B5CF6", glow: "rgba(139,92,246,0.28)", skin: "#F5C5A0", hair: "#3D2B1F" },
  celebrating: { shirt: "#10B981", glow: "rgba(16,185,129,0.30)", skin: "#F5C5A0", hair: "#3D2B1F" },
  warning:     { shirt: "#EF4444", glow: "rgba(239,68,68,0.32)",  skin: "#F5C5A0", hair: "#3D2B1F" },
};

export default function REX({ state = "idle", size = "md" }) {
  const uid = useId().replace(/:/g, "");
  const scale = SIZES[size] || 1;
  const c = COLORS[state] || COLORS.idle;

  const isThinking    = state === "thinking";
  const isTalking     = state === "talking";
  const isCelebrating = state === "celebrating";
  const isWarning     = state === "warning";

  const W = Math.round(BASE_W * scale);
  const H = Math.round(BASE_H * scale);

  const glowId = uid + "gl";
  const bgId   = uid + "bg";

  // Arm animation for different states
  const leftArmAnim  = isCelebrating
    ? { rotate: [-30, -70, -30] }
    : isTalking
    ? { rotate: [-15, -30, -15] }
    : { rotate: [-15, -20, -15] };

  const rightArmAnim = isCelebrating
    ? { rotate: [30, 70, 30] }
    : isTalking
    ? { rotate: [15, 30, 15] }
    : { rotate: [15, 20, 15] };

  const armDuration = isCelebrating ? 0.5 : isTalking ? 0.7 : 2.4;

  return (
    <div style={{ width: W, height: H, flexShrink: 0 }}>
      <svg viewBox="0 0 100 120" width={W} height={H} overflow="visible">
        <defs>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient id={bgId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.glow} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Background glow blob */}
        <motion.ellipse cx="50" cy="75" rx="42" ry="38"
          fill={`url(#${bgId})`}
          animate={{ opacity: [0.6, 1, 0.6], ry: [38, 42, 38] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Body (shirt) ──────────────────────────────── */}
        <motion.g
          animate={isWarning ? { x: [-3, 3, -3, 3, 0] } : undefined}
          transition={isWarning ? { duration: 0.3, repeat: Infinity } : undefined}
        >
          {/* Torso */}
          <rect x="34" y="66" width="32" height="34" rx="8"
            fill={c.shirt} />

          {/* Shirt collar V */}
          <path d="M 45 66 L 50 75 L 55 66" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

          {/* FitCoach text on shirt — only md/lg sizes */}
          {scale >= 0.9 && (
            <text x="50" y="88" textAnchor="middle" fontSize="6.5" fontWeight="800"
              fontFamily="Space Grotesk, sans-serif" fill="rgba(255,255,255,0.90)"
              letterSpacing="0.3">FitCoach</text>
          )}

          {/* Shorts */}
          <rect x="34" y="96" width="14" height="10" rx="4" fill={c.shirt} opacity="0.7"/>
          <rect x="52" y="96" width="14" height="10" rx="4" fill={c.shirt} opacity="0.7"/>

          {/* ── Left arm (viewer's right) ─────────────── */}
          <motion.g style={{ transformOrigin: "34px 72px" }}
            animate={leftArmAnim}
            transition={{ duration: armDuration, repeat: Infinity, ease: "easeInOut" }}
          >
            <rect x="22" y="66" width="12" height="22" rx="6" fill={c.shirt}/>
            {/* Hand */}
            <circle cx="28" cy="90" r="5.5" fill={c.skin}/>
          </motion.g>

          {/* ── Right arm ─────────────────────────────── */}
          <motion.g style={{ transformOrigin: "66px 72px" }}
            animate={rightArmAnim}
            transition={{ duration: armDuration, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          >
            <rect x="66" y="66" width="12" height="22" rx="6" fill={c.shirt}/>
            {/* Hand */}
            <circle cx="72" cy="90" r="5.5" fill={c.skin}/>
          </motion.g>

          {/* Legs */}
          <rect x="36" y="106" width="11" height="12" rx="5" fill="#2D2520"/>
          <rect x="53" y="106" width="11" height="12" rx="5" fill="#2D2520"/>
          {/* Shoes */}
          <ellipse cx="42" cy="118" rx="8" ry="4" fill="#1A1410"/>
          <ellipse cx="58" cy="118" rx="8" ry="4" fill="#1A1410"/>
        </motion.g>

        {/* ── Head ──────────────────────────────────────── */}
        <motion.g
          animate={isThinking
            ? { y: [-1, -3, -1] }
            : isCelebrating
            ? { y: [-2, -5, -2], rotate: [-5, 5, -5] }
            : { y: [0, -1, 0] }}
          transition={{ duration: isCelebrating ? 0.5 : 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "50px 50px" }}
        >
          {/* Neck */}
          <rect x="45" y="56" width="10" height="12" rx="4" fill={c.skin}/>

          {/* Head shape */}
          <ellipse cx="50" cy="44" rx="18" ry="19" fill={c.skin}/>

          {/* Hair */}
          <ellipse cx="50" cy="28" rx="18" ry="10" fill={c.hair}/>
          <ellipse cx="34" cy="40" rx="5" ry="12" fill={c.hair}/>
          <ellipse cx="66" cy="40" rx="5" ry="12" fill={c.hair}/>

          {/* Eyes */}
          <motion.ellipse cx="42" cy="44" rx="3.5" ry={isThinking ? 1.5 : 3}
            fill="#2D1A0A"
            animate={{ ry: isThinking ? [3, 1, 3] : isCelebrating ? [3, 3.5, 3] : [3, 0.4, 3] }}
            transition={{ duration: isThinking ? 1.2 : 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse cx="58" cy="44" rx="3.5" ry={isThinking ? 1.5 : 3}
            fill="#2D1A0A"
            animate={{ ry: isThinking ? [3, 1, 3] : isCelebrating ? [3, 3.5, 3] : [3, 0.4, 3] }}
            transition={{ duration: isThinking ? 1.2 : 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
          />

          {/* Eye shine dots */}
          <circle cx="43.5" cy="42.5" r="1" fill="white" opacity="0.85"/>
          <circle cx="59.5" cy="42.5" r="1" fill="white" opacity="0.85"/>

          {/* Eyebrows */}
          <motion.path d="M 39 38 Q 42 36.5 45 38"
            fill="none" stroke={c.hair} strokeWidth="2" strokeLinecap="round"
            animate={isThinking ? { d: ["M 39 38 Q 42 36 45 38", "M 39 37 Q 42 36 45 38", "M 39 38 Q 42 36 45 38"] } : undefined}
            transition={{ duration: 1.0, repeat: Infinity }}
          />
          <motion.path d="M 55 38 Q 58 36.5 61 38"
            fill="none" stroke={c.hair} strokeWidth="2" strokeLinecap="round"
            animate={isThinking ? { d: ["M 55 38 Q 58 36 61 38", "M 55 37 Q 58 36 61 38", "M 55 38 Q 58 36 61 38"] } : undefined}
            transition={{ duration: 1.0, repeat: Infinity, delay: 0.1 }}
          />

          {/* Mouth */}
          <motion.path
            d={isCelebrating
              ? "M 44 52 Q 50 57 56 52"
              : isWarning
              ? "M 44 54 Q 50 51 56 54"
              : isTalking
              ? "M 44 52 Q 50 55 56 52"
              : "M 44 52 Q 50 55 56 52"}
            fill="none" stroke="#8B4A2A" strokeWidth="1.8" strokeLinecap="round"
            animate={isTalking ? { d: ["M 44 52 Q 50 55 56 52", "M 44 52 Q 50 57 56 52", "M 44 52 Q 50 55 56 52"] } : undefined}
            transition={{ duration: 0.55, repeat: Infinity }}
          />

          {/* Thinking bubble dots */}
          {isThinking && [0, 1, 2].map(i => (
            <motion.circle key={i}
              cx={62 + i * 6} cy={28 - i * 4} r={2 - i * 0.4}
              fill={c.shirt}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.22 }}
            />
          ))}

          {/* Celebrating stars */}
          {isCelebrating && [0, 1, 2, 3].map(i => {
            const angle = (i / 4) * Math.PI * 2;
            const sx = 50 + Math.cos(angle) * 28;
            const sy = 30 + Math.sin(angle) * 20;
            return (
              <motion.text key={i} x={sx} y={sy} fontSize="8" textAnchor="middle"
                animate={{ opacity: [0, 1, 0], y: [sy, sy - 10, sy - 18] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}>
                ★
              </motion.text>
            );
          })}
        </motion.g>

        {/* Whistle / coach detail */}
        {(state === "idle" || state === "talking") && scale >= 0.9 && (
          <motion.ellipse cx="50" cy="63" rx="3.5" ry="2.5"
            fill="#FFD700" stroke="#C9A800" strokeWidth="0.8"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.0, repeat: Infinity }}
          />
        )}
      </svg>
    </div>
  );
}
