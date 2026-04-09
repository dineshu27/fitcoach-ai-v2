import { motion } from "framer-motion";

export default function MacroRing({ consumed = 0, target = 2000, size = 150, color = "#6C63FF" }) {
  const r = (size / 2) * 0.78;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, consumed / target));
  const dash = pct * circ;
  const cx = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(108,99,255,0.12)" strokeWidth="10" />
      {/* Progress */}
      <motion.circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${cx} ${cx})`}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ}` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      {/* Center */}
      <text x={cx} y={cx - 8} textAnchor="middle" fontSize="20" fontWeight="800" fill="#F0F0FF" fontFamily="Space Grotesk, sans-serif">
        {consumed}
      </text>
      <text x={cx} y={cx + 10} textAnchor="middle" fontSize="10" fill="#8888AA" fontFamily="Space Grotesk, sans-serif">
        of {target} kcal
      </text>
      <text x={cx} y={cx + 24} textAnchor="middle" fontSize="9" fill="#6C63FF" fontFamily="Space Grotesk, sans-serif">
        {Math.round(pct * 100)}% tracked
      </text>
    </svg>
  );
}
