import { motion } from "framer-motion";

/* ── EVA-inspired FiTAi character ──────────────────────────────── */
const SIZES = { xs: 0.45, sm: 0.65, md: 1, lg: 1.35 };

/* Bob animation per state */
const BOB = {
  idle:     { y: [0, -10, 0],           transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } },
  talking:  { y: [0, -5, 0],            transition: { duration: 0.75, repeat: Infinity, ease: "easeInOut" } },
  happy:    { y: [0, -16, 4, -10, 0],   transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut" } },
  thinking: { rotate: [-3, 3, -3],       transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  celebrating: { y: [0, -22, 0, -14, 0], transition: { duration: 0.7, repeat: 4, ease: "easeOut" } },
  warning:  { x: [-6, 6, -6, 6, 0],     transition: { duration: 0.45, repeat: 2 } },
};

/* Eye scaleY per state — left and right can differ */
function eyeAnim(state, side) {
  switch (state) {
    case "talking":
      return {
        scaleY: [1, 0.18, 0.85, 0.18, 1],
        transition: { duration: 0.6, repeat: Infinity, delay: side === "right" ? 0.04 : 0 },
      };
    case "happy":
      return { scaleY: 0.5, transition: { duration: 0.35 } };
    case "thinking":
      return side === "left"
        ? { scaleY: [1, 0.5, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
        : { scaleY: [0.5, 1, 0.5], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } };
    case "warning":
      return { scaleY: [1, 0.2, 1], transition: { duration: 0.3, repeat: 4 } };
    default: // idle / celebrating
      return {
        scaleY: 1,
        opacity: [1, 0.65, 1],
        transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: side === "right" ? 0.35 : 0 },
      };
  }
}

export default function REX({ state = "idle", size = "md" }) {
  const scale = SIZES[size] || 1;

  return (
    <div style={{
      width: 120, height: 175,
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: "top center",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 120 175" width={120} height={175} overflow="visible">
        <defs>
          {/* Pearl-white body gradient */}
          <radialGradient id="fitBodyGrad" cx="38%" cy="28%" r="72%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="50%"  stopColor="#DCF2FA" />
            <stop offset="85%"  stopColor="#B8DDED" />
            <stop offset="100%" stopColor="#9ACDE0" />
          </radialGradient>

          {/* Arm gradient */}
          <radialGradient id="fitArmGrad" cx="35%" cy="25%" r="72%">
            <stop offset="0%"   stopColor="#EDFBFF" />
            <stop offset="100%" stopColor="#C2E8F5" />
          </radialGradient>

          {/* Cyan eye glow gradient */}
          <radialGradient id="fitEyeGrad" cx="42%" cy="38%" r="58%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="22%"  stopColor="#80FFFF" />
            <stop offset="60%"  stopColor="#00BFFF" />
            <stop offset="100%" stopColor="#0050A0" stopOpacity="0.85" />
          </radialGradient>

          {/* Sensor glow */}
          <radialGradient id="fitSensorGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="45%"  stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0077CC" stopOpacity="0.8" />
          </radialGradient>

          {/* Eye blur glow filter */}
          <filter id="fitEyeGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Body visibility shadow */}
          <filter id="fitBodyShadow" x="-15%" y="-10%" width="130%" height="125%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#4ECDC4" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* ── Floating ground shadow ─────────────────────────── */}
        <motion.ellipse
          cx="60" cy="165" rx="26" ry="5"
          fill="rgba(0,0,0,0.12)"
          animate={
            state === "idle" || state === "talking"
              ? { rx: [26, 20, 26], opacity: [0.12, 0.07, 0.12], transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } }
              : { rx: 20, opacity: 0.07 }
          }
        />

        {/* ── Main floating group ─────────────────────────────── */}
        <motion.g animate={BOB[state] || BOB.idle}>

          {/* Ambient aura */}
          <ellipse cx="60" cy="88" rx="50" ry="70" fill="rgba(0,229,255,0.045)" />

          {/* ── Left arm ─────────────────────────────────────── */}
          <motion.g
            style={{ transformOrigin: "16px 88px" }}
            animate={
              state === "happy" || state === "celebrating"
                ? { rotate: -40, y: -10, transition: { duration: 0.35 } }
                : { rotate: 0, y: 0, transition: { duration: 0.35 } }
            }
          >
            <ellipse cx="16" cy="102" rx="7.5" ry="24"
              fill="url(#fitArmGrad)"
              stroke="rgba(170,220,240,0.55)" strokeWidth="0.8"
              transform="rotate(-12, 16, 102)"
            />
          </motion.g>

          {/* ── Right arm ──────────────────────────────────────── */}
          <motion.g
            style={{ transformOrigin: "104px 88px" }}
            animate={
              state === "happy" || state === "celebrating"
                ? { rotate: 40, y: -10, transition: { duration: 0.35 } }
                : { rotate: 0, y: 0, transition: { duration: 0.35 } }
            }
          >
            <ellipse cx="104" cy="102" rx="7.5" ry="24"
              fill="url(#fitArmGrad)"
              stroke="rgba(170,220,240,0.55)" strokeWidth="0.8"
              transform="rotate(12, 104, 102)"
            />
          </motion.g>

          {/* ── Main body ──────────────────────────────────────── */}
          <ellipse
            cx="60" cy="90" rx="44" ry="67"
            fill="url(#fitBodyGrad)"
            stroke="rgba(160,210,235,0.75)"
            strokeWidth="1.2"
            filter="url(#fitBodyShadow)"
          />

          {/* Body highlight sheen */}
          <ellipse cx="45" cy="64" rx="17" ry="26" fill="rgba(255,255,255,0.4)" />
          <ellipse cx="40" cy="58" rx="7"  ry="12" fill="rgba(255,255,255,0.22)" />

          {/* ── Dark visor / eye panel ──────────────────────────── */}
          <ellipse cx="60" cy="74" rx="35" ry="24" fill="#060F1A" />
          {/* Visor cyan border */}
          <ellipse cx="60" cy="74" rx="35" ry="24" fill="none"
            stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" />

          {/* ── Left eye ───────────────────────────────────────── */}
          <motion.ellipse
            cx="42" cy="74" rx="13" ry="13"
            fill="url(#fitEyeGrad)"
            filter="url(#fitEyeGlow)"
            style={{ transformOrigin: "42px 74px" }}
            animate={eyeAnim(state, "left")}
          />

          {/* ── Right eye ──────────────────────────────────────── */}
          <motion.ellipse
            cx="78" cy="74" rx="13" ry="13"
            fill="url(#fitEyeGrad)"
            filter="url(#fitEyeGlow)"
            style={{ transformOrigin: "78px 74px" }}
            animate={eyeAnim(state, "right")}
          />

          {/* Happy crescent mask — covers lower half of eyes */}
          {(state === "happy" || state === "celebrating") && (
            <>
              <ellipse cx="42" cy="80" rx="15" ry="9" fill="#060F1A" />
              <ellipse cx="78" cy="80" rx="15" ry="9" fill="#060F1A" />
            </>
          )}

          {/* Eye reflections */}
          <circle cx="37" cy="68" r="3.5" fill="rgba(255,255,255,0.88)" />
          <circle cx="73" cy="68" r="3.5" fill="rgba(255,255,255,0.88)" />
          <circle cx="47" cy="79" r="1.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="83" cy="79" r="1.5" fill="rgba(255,255,255,0.5)" />

          {/* Body lower detail curve */}
          <path d="M26,118 Q60,124 94,118" fill="none"
            stroke="rgba(160,210,230,0.35)" strokeWidth="1" />

          {/* ── Chest sensor ───────────────────────────────────── */}
          <motion.circle
            cx="60" cy="126" r="5.5"
            fill="url(#fitSensorGrad)"
            filter="url(#fitEyeGlow)"
            animate={{ opacity: [1, 0.45, 1], r: [5.5, 7, 5.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Thinking bubbles ───────────────────────────────── */}
          {state === "thinking" && (
            <>
              <motion.circle cx="94" cy="42" r="3"
                fill="#00E5FF" opacity="0.85"
                animate={{ opacity: [0.85, 0.15, 0.85], scale: [1, 1.6, 1] }}
                transition={{ duration: 0.85, repeat: Infinity, delay: 0 }}
                style={{ transformOrigin: "94px 42px" }}
              />
              <motion.circle cx="104" cy="30" r="4.5"
                fill="#00E5FF" opacity="0.85"
                animate={{ opacity: [0.85, 0.15, 0.85], scale: [1, 1.6, 1] }}
                transition={{ duration: 0.85, repeat: Infinity, delay: 0.18 }}
                style={{ transformOrigin: "104px 30px" }}
              />
              <motion.circle cx="116" cy="17" r="6"
                fill="#00E5FF" opacity="0.85"
                animate={{ opacity: [0.85, 0.15, 0.85], scale: [1, 1.6, 1] }}
                transition={{ duration: 0.85, repeat: Infinity, delay: 0.36 }}
                style={{ transformOrigin: "116px 17px" }}
              />
            </>
          )}

          {/* ── Warning indicator ──────────────────────────────── */}
          {state === "warning" && (
            <motion.text
              x="60" y="148"
              textAnchor="middle"
              fontSize="18"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.4, repeat: 5 }}
            >
              ⚠️
            </motion.text>
          )}

        </motion.g>
      </svg>
    </div>
  );
}
