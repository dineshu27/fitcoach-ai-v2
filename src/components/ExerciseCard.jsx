import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

function YtIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const MUSCLE_COLORS = {
  chest: "rgba(255,107,107,0.2)", back: "rgba(78,205,196,0.2)", shoulders: "rgba(108,99,255,0.2)",
  biceps: "rgba(255,182,193,0.2)", triceps: "rgba(255,165,0,0.2)", quads: "rgba(78,205,196,0.2)",
  hamstrings: "rgba(78,205,196,0.15)", glutes: "rgba(144,238,144,0.2)", core: "rgba(255,230,109,0.2)",
  cardio: "rgba(108,99,255,0.15)",
};
const MUSCLE_TEXT = {
  chest: "#FF6B6B", back: "#4ECDC4", shoulders: "#6C63FF", biceps: "#FFB6C1",
  triceps: "#FFA500", quads: "#4ECDC4", hamstrings: "#4ECDC4", glutes: "#90EE90",
  core: "#FFE66D", cardio: "#8880FF",
};

function getMuscleKey(mg = "") {
  const l = mg.toLowerCase();
  for (const key of Object.keys(MUSCLE_COLORS)) {
    if (l.includes(key)) return key;
  }
  return null;
}

export default function ExerciseCard({ exercise, index }) {
  const [open, setOpen] = useState(false);
  const mk = getMuscleKey(exercise.muscleGroup || exercise.name || "");

  return (
    <div
      className="overflow-hidden rounded-xl transition-all"
      style={{
        background: open ? "rgba(108,99,255,0.06)" : "rgba(26,26,38,0.8)",
        border: open ? "1px solid rgba(108,99,255,0.4)" : "1px solid rgba(108,99,255,0.15)",
      }}
    >
      <button className="flex w-full items-center gap-3 p-3 text-left" onClick={() => setOpen((o) => !o)}>
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "#6C63FF", boxShadow: "0 0 10px rgba(108,99,255,0.5)" }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm" style={{ color: "#F0F0FF" }}>{exercise.name}</p>
            {mk && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: MUSCLE_COLORS[mk], color: MUSCLE_TEXT[mk] }}>
                {exercise.muscleGroup || mk}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {exercise.sets && exercise.reps && (
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: "rgba(108,99,255,0.2)", color: "#6C63FF" }}>
                {exercise.sets} × {exercise.reps}
              </span>
            )}
            {exercise.duration && !exercise.reps && (
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: "rgba(108,99,255,0.2)", color: "#6C63FF" }}>
                {exercise.duration}
              </span>
            )}
            {exercise.rest && (
              <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#8888AA" }}>
                Rest {exercise.rest}
              </span>
            )}
          </div>
        </div>
        <div style={{ color: "#8888AA" }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-3 pb-3 pt-1 space-y-3" style={{ borderTop: "1px solid rgba(108,99,255,0.15)" }}>
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: "Sets", val: exercise.sets },
                  { label: "Reps", val: exercise.reps || exercise.duration },
                  { label: "Rest", val: exercise.rest },
                ].filter((x) => x.val).map(({ label, val }) => (
                  <div key={label} className="rounded-xl p-2 text-center"
                    style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)" }}>
                    <p className="font-bold text-sm" style={{ color: "#F0F0FF" }}>{val}</p>
                    <p className="text-[10px]" style={{ color: "#8888AA" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Form tip */}
              {exercise.tip && (
                <div className="flex items-start gap-2 rounded-xl p-3"
                  style={{ background: "rgba(255,230,109,0.06)", border: "1px solid rgba(255,230,109,0.2)" }}>
                  <Info size={14} style={{ color: "#FFE66D", flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "#FFE66D" }}>{exercise.tip}</p>
                </div>
              )}

              {/* YouTube button */}
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " exercise proper form tutorial")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: "#FF0000", boxShadow: "0 0 15px rgba(255,0,0,0.3)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <YtIcon />
                Watch demo on YouTube
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
