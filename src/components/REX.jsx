import { useId } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   Wall-E style robot — FiTAi coach
   States: idle · thinking · talking · celebrating · warning
   Note: never animate SVG presentation attrs (r, ry, cx, cy)
   directly — use scale/x/y transforms to avoid "undefined" errors.
══════════════════════════════════════════════════════════════ */

const SIZES = { xs: 0.42, sm: 0.58, md: 1, lg: 1.28 };
const BASE_W = 100;
const BASE_H = 120;

const EYE_COLOR = {
  idle:        "#FFB347",
  thinking:    "#4FC3F7",
  talking:     "#7EE8A2",
  celebrating: "#FFE066",
  warning:     "#FF4444",
};

const GLOW_COLOR = {
  idle:        "rgba(255,179,71,0.22)",
  thinking:    "rgba(79,195,247,0.22)",
  talking:     "rgba(126,232,162,0.22)",
  celebrating: "rgba(255,224,102,0.28)",
  warning:     "rgba(255,68,68,0.28)",
};

export default function REX({ state = "idle", size = "md" }) {
  const uid = useId().replace(/:/g, "");
  const scale = SIZES[size] || 1;
  const eyeCol  = EYE_COLOR[state]  || EYE_COLOR.idle;
  const glowCol = GLOW_COLOR[state] || GLOW_COLOR.idle;

  const isThinking    = state === "thinking";
  const isTalking     = state === "talking";
  const isCelebrating = state === "celebrating";
  const isWarning     = state === "warning";

  const W = Math.round(BASE_W * scale);
  const H = Math.round(BASE_H * scale);

  const eyeGlowId   = uid + "eg";
  const metalId     = uid + "mt";
  const darkMetalId = uid + "dm";

  const leftArmAnim = isCelebrating
    ? { rotate: [-25, -65, -25] }
    : isTalking
    ? { rotate: [-10, -28, -10] }
    : { rotate: [-6, -14, -6] };

  const rightArmAnim = isCelebrating
    ? { rotate: [25, 65, 25] }
    : isTalking
    ? { rotate: [10, 28, 10] }
    : { rotate: [6, 14, 6] };

  const armDur = isCelebrating ? 0.45 : isTalking ? 0.65 : 2.8;

  return (
    <div style={{ width: W, height: H, flexShrink: 0 }}>
      <svg viewBox="0 0 100 120" width={W} height={H} overflow="visible">
        <defs>
          <filter id={eyeGlowId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id={metalId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#9C8A6A"/>
            <stop offset="100%" stopColor="#5E4D35"/>
          </linearGradient>
          <linearGradient id={darkMetalId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#4A3A26"/>
            <stop offset="100%" stopColor="#2E2418"/>
          </linearGradient>
        </defs>

        {/* Ambient glow blob — opacity only, no ry animation */}
        <motion.ellipse cx="50" cy="85" rx="42" ry="30"
          fill={glowCol}
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── SHAKE wrapper for warning ── */}
        <motion.g
          animate={isWarning ? { x: [-3, 3, -3, 3, 0] } : undefined}
          transition={isWarning ? { duration: 0.28, repeat: Infinity } : undefined}
        >

          {/* ════ HEAD ════ */}
          <motion.g
            style={{ transformOrigin: "50px 34px" }}
            animate={isThinking
              ? { y: [-1, -4, -1] }
              : isCelebrating
              ? { y: [-2, -6, -2], rotate: [-5, 5, -5] }
              : { y: [0, -1.5, 0] }}
            transition={{ duration: isCelebrating ? 0.48 : 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Antenna stem */}
            <line x1="50" y1="18" x2="50" y2="9" stroke="#7A6647" strokeWidth="2" strokeLinecap="round"/>

            {/* Antenna tip — use scale instead of r animation */}
            <motion.g
              style={{ transformOrigin: "50px 6.5px" }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.28, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle cx="50" cy="6.5" r="2.8" fill={eyeCol} filter={`url(#${eyeGlowId})`}/>
            </motion.g>

            {/* Head body */}
            <rect x="26" y="18" width="48" height="32" rx="6" fill={`url(#${metalId})`}/>
            <rect x="28" y="19" width="44" height="5" rx="3" fill="rgba(255,255,255,0.13)"/>
            <rect x="26" y="46" width="48" height="4" rx="3" fill="#3A2C1A"/>

            {/* Eye sockets */}
            <circle cx="38" cy="32" r="10" fill="#2A1F12"/>
            <circle cx="38" cy="32" r="8"  fill="#1A140C"/>
            <circle cx="62" cy="32" r="10" fill="#2A1F12"/>
            <circle cx="62" cy="32" r="8"  fill="#1A140C"/>
            <rect x="46" y="28" width="8" height="8" rx="2" fill="#2A1F12"/>

            {/* Left eye lens — scale instead of r animation */}
            <motion.g
              style={{ transformOrigin: "38px 32px" }}
              animate={isThinking
                ? { scale: [1, 0.7, 1], opacity: [0.9, 0.55, 0.9] }
                : isCelebrating
                ? { scale: [1, 1.15, 1] }
                : { opacity: [0.75, 1, 0.75] }}
              transition={{ duration: isThinking ? 0.9 : 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle cx="38" cy="32" r="6.5" fill={eyeCol} filter={`url(#${eyeGlowId})`}/>
            </motion.g>

            {/* Left iris — use x offset on g wrapper, not cx on circle */}
            <motion.g
              animate={isThinking
                ? { scale: [1, 1.42, 1] }
                : { x: [0, 1.5, 0, -1.5, 0] }}
              style={{ transformOrigin: "38px 32px" }}
              transition={{ duration: isThinking ? 0.9 : 5.0, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle cx="38" cy="32" r="2.8" fill="rgba(0,0,0,0.55)"/>
            </motion.g>
            <circle cx="35.8" cy="30" r="1.4" fill="rgba(255,255,255,0.75)"/>

            {/* Right eye lens — scale instead of r animation */}
            <motion.g
              style={{ transformOrigin: "62px 32px" }}
              animate={isThinking
                ? { scale: [1, 0.7, 1], opacity: [0.9, 0.55, 0.9] }
                : isCelebrating
                ? { scale: [1, 1.15, 1] }
                : { opacity: [0.75, 1, 0.75] }}
              transition={{ duration: isThinking ? 0.9 : 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            >
              <circle cx="62" cy="32" r="6.5" fill={eyeCol} filter={`url(#${eyeGlowId})`}/>
            </motion.g>

            {/* Right iris */}
            <motion.g
              animate={isThinking
                ? { scale: [1, 1.42, 1] }
                : { x: [0, 1.5, 0, -1.5, 0] }}
              style={{ transformOrigin: "62px 32px" }}
              transition={{ duration: isThinking ? 0.9 : 5.0, repeat: Infinity, ease: "easeInOut", delay: 0.18 }}
            >
              <circle cx="62" cy="32" r="2.8" fill="rgba(0,0,0,0.55)"/>
            </motion.g>
            <circle cx="59.8" cy="30" r="1.4" fill="rgba(255,255,255,0.75)"/>

            {/* Neck connector */}
            <rect x="43" y="50" width="14" height="8" rx="4" fill="#6B5540"/>

            {/* Thinking bubble dots */}
            {isThinking && [0, 1, 2].map(i => (
              <motion.g key={i} style={{ transformOrigin: `${76 + i * 7}px ${22 - i * 5}px` }}
                animate={{ opacity: [0.15, 1, 0.15] }}
                transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.2 }}
              >
                <circle cx={76 + i * 7} cy={22 - i * 5} r={2.4 - i * 0.3} fill={eyeCol}/>
              </motion.g>
            ))}

            {/* Celebrating stars */}
            {isCelebrating && [0, 1, 2, 3].map(i => {
              const angle = (i / 4) * Math.PI * 2;
              const sx = 50 + Math.cos(angle) * 32;
              const sy = 28 + Math.sin(angle) * 22;
              return (
                <motion.text key={i} x={sx} y={sy} fontSize="9" textAnchor="middle"
                  fill={eyeCol}
                  animate={{ opacity: [0, 1, 0], y: [sy, sy - 10, sy - 20] }}
                  transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.2 }}>
                  ★
                </motion.text>
              );
            })}
          </motion.g>

          {/* ════ BODY ════ */}
          <rect x="22" y="58" width="56" height="34" rx="7" fill={`url(#${metalId})`}/>
          <rect x="24" y="59" width="52" height="5" rx="3" fill="rgba(255,255,255,0.10)"/>
          <line x1="50" y1="62" x2="50" y2="90" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2"/>

          {/* Chest light — opacity only */}
          <motion.rect x="42" y="64" width="16" height="9" rx="3.5"
            fill={eyeCol}
            animate={{ opacity: [0.45, 0.85, 0.45] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Solar panel grid */}
          <rect x="26" y="77" width="48" height="12" rx="4" fill={`url(#${darkMetalId})`}/>
          {[33, 41, 49, 57, 65].map(x => (
            <line key={x} x1={x} y1="77" x2={x} y2="89" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
          ))}
          <line x1="26" y1="83" x2="74" y2="83" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

          {/* ════ LEFT ARM ════ */}
          <motion.g style={{ transformOrigin: "22px 64px" }}
            animate={leftArmAnim}
            transition={{ duration: armDur, repeat: Infinity, ease: "easeInOut" }}
          >
            <rect x="10" y="58" width="12" height="22" rx="5" fill="#8B7550"/>
            <rect x="10" y="78" width="12" height="10" rx="4" fill="#7A6440"/>
            <rect x="8"  y="87" width="5" height="8" rx="2.5" fill="#5A4A30"/>
            <rect x="15" y="87" width="5" height="8" rx="2.5" fill="#5A4A30"/>
          </motion.g>

          {/* ════ RIGHT ARM ════ */}
          <motion.g style={{ transformOrigin: "78px 64px" }}
            animate={rightArmAnim}
            transition={{ duration: armDur, repeat: Infinity, ease: "easeInOut", delay: 0.18 }}
          >
            <rect x="78" y="58" width="12" height="22" rx="5" fill="#8B7550"/>
            <rect x="78" y="78" width="12" height="10" rx="4" fill="#7A6440"/>
            <rect x="76" y="87" width="5" height="8" rx="2.5" fill="#5A4A30"/>
            <rect x="83" y="87" width="5" height="8" rx="2.5" fill="#5A4A30"/>
          </motion.g>

          {/* ════ TREADS ════ */}
          {/* Left tread */}
          <rect x="12" y="90" width="30" height="18" rx="9" fill="#3E2E1C"/>
          <rect x="14" y="92" width="26" height="14" rx="7" fill="#2A1E10"/>
          <circle cx="21" cy="99" r="5" fill="#4A3820"/>
          <circle cx="21" cy="99" r="2.5" fill="#3A2A14"/>
          <circle cx="35" cy="99" r="5" fill="#4A3820"/>
          <circle cx="35" cy="99" r="2.5" fill="#3A2A14"/>
          <motion.g animate={{ x: [-4, 4, -4] }} transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}>
            {[17, 22, 27, 32, 37].map(x => (
              <rect key={x} x={x} y="105" width="3" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
            ))}
          </motion.g>

          {/* Right tread */}
          <rect x="58" y="90" width="30" height="18" rx="9" fill="#3E2E1C"/>
          <rect x="60" y="92" width="26" height="14" rx="7" fill="#2A1E10"/>
          <circle cx="65" cy="99" r="5" fill="#4A3820"/>
          <circle cx="65" cy="99" r="2.5" fill="#3A2A14"/>
          <circle cx="79" cy="99" r="5" fill="#4A3820"/>
          <circle cx="79" cy="99" r="2.5" fill="#3A2A14"/>
          <motion.g animate={{ x: [4, -4, 4] }} transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}>
            {[61, 66, 71, 76, 81].map(x => (
              <rect key={x} x={x} y="105" width="3" height="2" rx="1" fill="rgba(255,255,255,0.07)"/>
            ))}
          </motion.g>

        </motion.g>
      </svg>
    </div>
  );
}
