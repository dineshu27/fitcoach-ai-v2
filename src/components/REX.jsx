import { motion } from "framer-motion";

const VISOR_COLORS = {
  idle: { bg: "rgba(108,99,255,0.15)", glow: "#6C63FF", scan: "#6C63FF" },
  talking: { bg: "rgba(108,99,255,0.25)", glow: "#6C63FF", scan: "#8880FF" },
  thinking: { bg: "rgba(78,205,196,0.15)", glow: "#4ECDC4", scan: "#4ECDC4" },
  celebrating: { bg: "rgba(255,230,109,0.2)", glow: "#FFE66D", scan: "#FFE66D" },
  warning: { bg: "rgba(255,107,107,0.2)", glow: "#FF6B6B", scan: "#FF6B6B" },
};

const SIZES = { sm: 0.65, md: 1, lg: 1.35 };

// Body-level animation variants
const bodyAnim = {
  idle: { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  talking: { y: [0, -4, 0], transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" } },
  thinking: { rotate: [-4, 4, -4], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
  celebrating: { y: [0, -22, 0, -14, 0], transition: { duration: 0.7, repeat: 4, ease: "easeOut" } },
  warning: { x: [-6, 6, -6, 6, 0], transition: { duration: 0.5, repeat: 2 } },
};

// Head-level animation variants
const headAnim = {
  idle: {},
  talking: { rotateX: [0, 10, 0, -5, 0], transition: { duration: 0.45, repeat: Infinity } },
  thinking: { rotate: [-8, 8, -8], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
  celebrating: { rotate: [0, -12, 12, -6, 0], transition: { duration: 0.4, repeat: 4 } },
  warning: { rotate: [-6, 6, -4, 4, 0], transition: { duration: 0.35, repeat: 3 } },
};

// Left arm variants — celebrating raises arms
const armLAnim = {
  idle: { rotate: 0 },
  talking: {},
  thinking: {},
  celebrating: { rotate: [-80, -80], transition: { duration: 0.3 } },
  warning: {},
};
const armRAnim = {
  idle: { rotate: 0 },
  talking: {},
  thinking: {},
  celebrating: { rotate: [80, 80], transition: { duration: 0.3 } },
  warning: {},
};

export default function REX({ state = "idle", size = "md" }) {
  const scale = SIZES[size] || 1;
  const vc = VISOR_COLORS[state] || VISOR_COLORS.idle;

  return (
    <motion.div
      className="rex-wrap"
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
      animate={bodyAnim[state]}
    >
      {/* Antenna */}
      <div className="rex-antenna-wrap">
        <motion.div
          className="rex-antenna-tip"
          style={{ background: vc.glow, boxShadow: `0 0 10px ${vc.glow}, 0 0 20px ${vc.glow}66` }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="rex-antenna-pole" style={{ background: vc.glow }} />
      </div>

      {/* Head */}
      <motion.div className="rex-head" animate={headAnim[state]}>
        <div className="rex-ear rex-ear-l" />
        <div className="rex-ear rex-ear-r" />

        {/* Visor */}
        <div
          className="rex-visor"
          style={{ background: vc.bg, borderColor: vc.glow, boxShadow: `0 0 12px ${vc.glow}CC, inset 0 0 8px ${vc.glow}44` }}
        >
          <div className="rex-visor-inner" style={{ color: vc.scan }} />
        </div>

        {/* Mouth grille */}
        <div className="rex-grille">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="rex-grille-line"
              animate={state === "talking" ? { opacity: [0.5, 1, 0.3, 0.8, 0.5] } : { opacity: 0.5 }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Neck */}
      <div className="rex-neck" />

      {/* Torso + Arms wrapper */}
      <div className="rex-body-wrap" style={{ width: 140 }}>
        {/* Left arm */}
        <motion.div className="rex-arm rex-arm-l" animate={armLAnim[state]} style={{ transformOrigin: "top center" }}>
          <div className="rex-upper-arm" />
          <div className="rex-forearm" />
          <div className="rex-hand" style={{ background: vc.glow, boxShadow: `0 0 8px ${vc.glow}88` }} />
        </motion.div>

        {/* Torso */}
        <div className="rex-torso">
          <div className="rex-shoulder rex-shoulder-l" />
          <div className="rex-shoulder rex-shoulder-r" />

          {/* Energy core (SVG hexagon) */}
          <div className="rex-core-wrap">
            <svg viewBox="0 0 60 60" width="48" height="48">
              <polygon
                points="30,5 52,17 52,43 30,55 8,43 8,17"
                fill="none"
                stroke={vc.glow}
                strokeWidth="2"
                opacity="0.8"
              />
              <motion.polygon
                points="30,15 45,38 15,38"
                fill={`${vc.glow}44`}
                stroke={vc.glow}
                strokeWidth="1.5"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "30px 30px" }}
              />
              <motion.circle
                cx="30" cy="30" r="6"
                fill={vc.glow}
                animate={{ r: [6, 8, 6], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {/* Abs grid */}
          <div className="rex-abs">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rex-ab" />
            ))}
          </div>
        </div>

        {/* Right arm */}
        <motion.div className="rex-arm rex-arm-r" animate={armRAnim[state]} style={{ transformOrigin: "top center" }}>
          <div className="rex-upper-arm" />
          <div className="rex-forearm" />
          <div className="rex-hand" style={{ background: vc.glow, boxShadow: `0 0 8px ${vc.glow}88` }} />
        </motion.div>
      </div>

      {/* Base / legs */}
      <div className="rex-base">
        <div className="rex-leg" />
        <div className="rex-leg" />
      </div>
    </motion.div>
  );
}
