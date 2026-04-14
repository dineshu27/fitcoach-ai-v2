import { motion } from "framer-motion";

/* ── Premium AI Orb — FiTAi mascot ──────────────────────────────── */
const SIZES = { xs: 0.45, sm: 0.65, md: 1, lg: 1.35 };

const COLORS = {
  idle:        { core: "#8A7FFF", accent: "#A78BFA", ring: "rgba(138,127,255,0.55)", glow: "#8A7FFF" },
  thinking:    { core: "#38BDF8", accent: "#7DD3FC", ring: "rgba(56,189,248,0.55)",  glow: "#38BDF8" },
  talking:     { core: "#A78BFA", accent: "#C4B5FD", ring: "rgba(167,139,250,0.6)",  glow: "#A78BFA" },
  celebrating: { core: "#34D399", accent: "#6EE7B7", ring: "rgba(52,211,153,0.65)",  glow: "#34D399" },
  warning:     { core: "#F87171", accent: "#FCA5A5", ring: "rgba(248,113,113,0.6)",  glow: "#F87171" },
  happy:       { core: "#A78BFA", accent: "#C4B5FD", ring: "rgba(167,139,250,0.6)",  glow: "#A78BFA" },
};

export default function REX({ state = "idle", size = "md" }) {
  const scale = SIZES[size] || 1;
  const c = COLORS[state] || COLORS.idle;

  const isThinking    = state === "thinking";
  const isTalking     = state === "talking";
  const isCelebrating = state === "celebrating";
  const isWarning     = state === "warning";

  const ring1Speed = isThinking ? 1.1 : 5;
  const ring2Speed = isThinking ? 1.7 : 8;
  const pulseSpeed = isTalking ? 0.45 : isWarning ? 0.55 : 2.8;

  return (
    <div style={{
      width: 120, height: 120,
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: "center",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 120 120" width={120} height={120} overflow="visible">
        <defs>
          <radialGradient id="orbCore" cx="38%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="0.95" />
            <stop offset="20%"  stopColor={c.accent} stopOpacity="0.85" />
            <stop offset="65%"  stopColor={c.core}   stopOpacity="0.78" />
            <stop offset="100%" stopColor={c.core}   stopOpacity="0.45" />
          </radialGradient>
          <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ambientGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* ── Ambient outer glow ──────────────────────── */}
        <motion.circle cx="60" cy="60" r="52"
          fill={c.glow}
          filter="url(#ambientGlow)"
          animate={{
            opacity: isWarning
              ? [0.22, 0.42, 0.22]
              : isCelebrating
              ? [0.2, 0.4, 0.2]
              : [0.1, 0.2, 0.1],
            r: isCelebrating ? [52, 62, 52] : [52, 56, 52],
          }}
          transition={{ duration: pulseSpeed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Orbital ring 1 (fast, horizontal-ish) ──── */}
        <motion.g style={{ transformOrigin: "60px 60px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: ring1Speed, repeat: Infinity, ease: "linear" }}>
          <ellipse cx="60" cy="60" rx="52" ry="13"
            fill="none" stroke={c.ring} strokeWidth="1.5" opacity="0.75" />
          <motion.circle cx="112" cy="60" r="4.5"
            fill={c.core}
            animate={{ opacity: [0.9, 0.5, 0.9] }}
            transition={{ duration: ring1Speed, repeat: Infinity }}
          />
        </motion.g>

        {/* ── Orbital ring 2 (slower, tilted 58°) ────── */}
        <motion.g style={{ transformOrigin: "60px 60px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: ring2Speed, repeat: Infinity, ease: "linear" }}>
          <ellipse cx="60" cy="60" rx="52" ry="13"
            fill="none" stroke={c.ring} strokeWidth="1" opacity="0.45"
            transform="rotate(58, 60, 60)" />
          <circle cx="112" cy="60" r="3" fill={c.accent} opacity="0.8"
            transform="rotate(58, 60, 60)" />
        </motion.g>

        {/* ── Core sphere ─────────────────────────────── */}
        <motion.circle cx="60" cy="60" r="30"
          fill="url(#orbCore)"
          filter="url(#coreGlow)"
          animate={{
            r: isTalking
              ? [30, 33, 30, 27, 30]
              : isWarning
              ? [30, 33, 30]
              : isCelebrating
              ? [30, 36, 30]
              : [30, 32, 30],
          }}
          transition={{ duration: pulseSpeed, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Specular highlights */}
        <ellipse cx="50" cy="49" rx="9" ry="6.5"
          fill="rgba(255,255,255,0.45)" transform="rotate(-22, 50, 49)" />
        <circle cx="46" cy="46" r="3.5" fill="rgba(255,255,255,0.65)" />

        {/* ── Thinking: sequential bounce dots ────────── */}
        {isThinking && [0, 1, 2].map(i => (
          <motion.circle key={i}
            cx={48 + i * 12} cy="60" r="4"
            fill="rgba(255,255,255,0.92)"
            animate={{ y: [0, -11, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
          />
        ))}

        {/* ── Talking: expanding ripple rings ─────────── */}
        {isTalking && [1, 2, 3].map(i => (
          <motion.circle key={i} cx="60" cy="60" r="30"
            fill="none" stroke={c.core} strokeWidth="1.5"
            animate={{ r: [30, 30 + i * 18], opacity: [0.65, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.28, ease: "easeOut" }}
          />
        ))}

        {/* ── Celebrating: burst particles ─────────────── */}
        {isCelebrating && [0,1,2,3,4,5,6,7].map(i => {
          const angle = (i / 8) * Math.PI * 2;
          const sx = 60 + Math.cos(angle) * 36;
          const sy = 60 + Math.sin(angle) * 36;
          const ex = 60 + Math.cos(angle) * 58;
          const ey = 60 + Math.sin(angle) * 58;
          return (
            <motion.circle key={i} cx={sx} cy={sy} r="3"
              fill={i % 2 === 0 ? c.core : "#FFFFFF"}
              animate={{ cx: [sx, ex], cy: [sy, ey], opacity: [1, 0], r: [3, 1.5] }}
              transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.09, ease: "easeOut" }}
            />
          );
        })}

        {/* ── Warning: urgent pulse ring ───────────────── */}
        {isWarning && (
          <motion.circle cx="60" cy="60" r="30"
            fill="none" stroke="#F87171" strokeWidth="2.5"
            animate={{ r: [30, 58], opacity: [0.85, 0] }}
            transition={{ duration: 0.65, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* ── Idle: subtle floating dots (depth) ──────── */}
        {!isThinking && !isTalking && !isCelebrating && !isWarning && (
          <>
            {[0, 1, 2].map(i => {
              const angle = (i / 3) * Math.PI * 2 - 0.5;
              return (
                <motion.circle key={i}
                  cx={60 + Math.cos(angle) * 46}
                  cy={60 + Math.sin(angle) * 46}
                  r="3"
                  fill={c.accent}
                  animate={{ opacity: [0.25, 0.8, 0.25], r: [3, 4.5, 3] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.55 }}
                />
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
}
