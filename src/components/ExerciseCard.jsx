import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Info, PlayCircle, ClipboardList, CheckCircle2, Plus } from "lucide-react";
import VideoModal from "./VideoModal";
import AchievementToast from "./AchievementToast";
import { cache } from "../lib/cache";
import { expandCollapse, checkPop } from "../motion/variants";
import { pressable, pressablePrimary, cardInteractive } from "../motion/presets";

const MUSCLE_COLORS = {
  chest: "var(--c-accent-bg)", back: "var(--c-cool-bg)", shoulders: "var(--c-accent-bg)",
  biceps: "var(--c-accent-bg)", triceps: "var(--c-warn-bg)", quads: "var(--c-cool-bg)",
  hamstrings: "var(--c-cool-bg)", glutes: "var(--c-warn-bg)", core: "var(--c-warn-bg)",
  cardio: "var(--c-accent-bg)",
};
const MUSCLE_TEXT = {
  chest: "var(--c-accent)", back: "var(--c-cool)", shoulders: "var(--c-accent)", biceps: "var(--c-accent)",
  triceps: "var(--c-warn)", quads: "var(--c-cool)", hamstrings: "var(--c-cool)", glutes: "var(--c-warn)",
  core: "var(--c-warn)", cardio: "var(--c-accent)",
};

function getMuscleKey(mg = "") {
  const l = mg.toLowerCase();
  for (const key of Object.keys(MUSCLE_COLORS)) {
    if (l.includes(key)) return key;
  }
  return null;
}

function parseSetCount(setsStr = "") {
  const n = parseInt(setsStr);
  return isNaN(n) ? 3 : Math.min(Math.max(n, 1), 8);
}

function SetTracker({ exercise }) {
  const numSets = parseSetCount(exercise.sets);
  const defaultReps = parseInt(exercise.reps) || 10;

  const [logs, setLogs] = useState(() => {
    const saved = cache.getExerciseLog(exercise.name);
    if (saved) return saved;
    return Array.from({ length: numSets }, (_, i) => ({ set: i + 1, weight: "", reps: defaultReps, done: false }));
  });
  const [showPB, setShowPB] = useState(null); // { weight, label }
  const [rpeLog, setRpeLog] = useState({});

  const prev = cache.getPrevExerciseLog(exercise.name);

  function update(idx, field, value) {
    const next = logs.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setLogs(next);
    cache.logExerciseSet(exercise.name, next);
  }

  function toggleDone(idx) {
    const next = logs.map((s, i) => i === idx ? { ...s, done: !s.done } : s);
    setLogs(next);
    cache.logExerciseSet(exercise.name, next);

    const toggled = next[idx];

    if (toggled.done) {
      // Haptic: short pulse on set done
      navigator.vibrate?.(80);

      // Personal best detection
      const weight = parseFloat(toggled.weight);
      if (weight > 0 && prev) {
        const prevBest = Math.max(0, ...prev.sets.map(s => parseFloat(s.weight) || 0));
        if (weight > prevBest) {
          setShowPB({ label: `${exercise.name} — ${weight}kg` });
        }
      }
    }
  }

  function addSet() {
    const next = [...logs, { set: logs.length + 1, weight: "", reps: defaultReps, done: false }];
    setLogs(next);
    cache.logExerciseSet(exercise.name, next);
  }

  const completedCount = logs.filter((s) => s.done).length;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ background: "var(--c-accent-bg)", borderBottom: "1px solid var(--c-border)" }}>
        <div className="flex items-center gap-2">
          <ClipboardList size={13} style={{ color: "var(--c-accent)" }} />
          <span className="text-xs font-bold" style={{ color: "var(--c-accent)" }}>Track Sets</span>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "var(--c-sub)" }}>
          {completedCount}/{logs.length} done
        </span>
      </div>

      {/* Previous session reference */}
      {prev && (
        <div className="px-3 py-1.5 text-[10px]" style={{ color: "var(--c-sub)", background: "var(--c-warn-bg)", borderBottom: "1px solid var(--c-border)" }}>
          Last session ({prev.date}): {prev.sets.filter(s => s.done).length}/{prev.sets.length} sets completed
          {prev.sets[0]?.weight ? ` · ${prev.sets[0].weight}kg` : ""}
        </div>
      )}

      {/* Column headers */}
      <div className="grid grid-cols-[32px_1fr_1fr_36px] gap-1.5 px-3 py-1.5 text-[10px] font-semibold"
        style={{ color: "var(--c-sub)", borderBottom: "1px solid var(--c-border)" }}>
        <span>Set</span>
        <span>Weight (kg)</span>
        <span>Reps</span>
        <span></span>
      </div>

      {/* Set rows */}
      <div className="divide-y" style={{ borderColor: "var(--c-border)" }}>
        {logs.map((s, i) => (
          <div key={i}>
            <div className="grid grid-cols-[32px_1fr_1fr_36px] gap-1.5 items-center px-3 py-2"
              style={{ background: s.done ? "rgba(78,205,196,0.05)" : "transparent" }}>
              <span className="text-xs font-bold" style={{ color: s.done ? "#4ECDC4" : "var(--c-sub)" }}>{s.set}</span>
              <input
                type="number"
                placeholder="—"
                value={s.weight}
                min="0"
                onChange={(e) => update(i, "weight", e.target.value)}
                className="rounded-lg px-2 py-1 text-xs text-center outline-none w-full"
                style={{ background: "var(--c-input, var(--c-card))", border: "1px solid var(--c-border)", color: "var(--c-text)" }}
              />
              <input
                type="number"
                value={s.reps}
                min="1"
                onChange={(e) => update(i, "reps", parseInt(e.target.value) || 1)}
                className="rounded-lg px-2 py-1 text-xs text-center outline-none w-full"
                style={{ background: "var(--c-input, var(--c-card))", border: "1px solid var(--c-border)", color: "var(--c-text)" }}
              />
              <motion.button
                onClick={() => toggleDone(i)}
                {...pressable}
                className="flex items-center justify-center rounded-lg p-1.5"
                style={{ background: s.done ? "rgba(78,205,196,0.2)" : "var(--c-accent-bg)", border: `1px solid ${s.done ? "rgba(78,205,196,0.4)" : "var(--c-border)"}` }}
              >
                <motion.span
                  key={String(s.done)}
                  variants={checkPop}
                  initial="hidden"
                  animate="show"
                  style={{ display: "flex" }}
                >
                  <CheckCircle2 size={14} style={{ color: s.done ? "#4ECDC4" : "var(--c-sub)" }} />
                </motion.span>
              </motion.button>
            </div>
            {s.done && (
              <div style={{ padding: "4px 12px 8px", display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ fontSize: 10, color: "var(--c-sub)", marginRight: 4 }}>RPE:</p>
                {[6, 7, 8, 9, 10].map(rpe => (
                  <button key={rpe} onClick={() => {
                    const next = { ...rpeLog, [i]: rpe };
                    setRpeLog(next);
                    const today = new Date().toISOString().slice(0, 10);
                    localStorage.setItem(`setLog:${exercise.name}:${today}:${i}`, JSON.stringify({ weight: s.weight, reps: s.reps, rpe, timestamp: Date.now() }));
                  }}
                    style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 500, cursor: "pointer", border: "1px solid var(--c-border)",
                      background: rpeLog[i] === rpe ? "var(--c-accent)" : "transparent",
                      color: rpeLog[i] === rpe ? "#fff" : "var(--c-sub)" }}>
                    {rpe}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add set */}
      <button onClick={addSet}
        className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all"
        style={{ color: "var(--c-sub)", borderTop: "1px solid var(--c-border)" }}>
        <Plus size={12} /> Add Set
      </button>

      {/* Personal best toast */}
      <AnimatePresence>
        {showPB && (
          <AchievementToast
            type="personal_best"
            label={showPB.label}
            onDismiss={() => setShowPB(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExerciseCard({ exercise, index }) {
  const [open, setOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  if (!exercise || !exercise.name) return null;
  const mk = getMuscleKey(exercise.muscleGroup || exercise.name || "");
  return (
    <>
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: "var(--c-card)",
        border: open ? "1px solid var(--c-border-bright)" : "1px solid var(--c-border)",
        boxShadow: open ? "var(--c-card-shadow)" : "none",
        transition: "border-color 0.18s, box-shadow 0.18s",
      }}
    >
      <motion.button
        className="flex w-full items-center gap-3 p-3 text-left"
        onClick={() => setOpen((o) => !o)}
        {...cardInteractive}
      >
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "var(--c-accent)", boxShadow: "0 0 10px rgba(var(--c-accent-rgb, 108,99,255),0.5)" }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm" style={{ color: "var(--c-text)" }}>{exercise.name}</p>
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
                style={{ background: "var(--c-accent-bg)", color: "var(--c-accent)" }}>
                {exercise.sets} × {exercise.reps}
              </span>
            )}
            {exercise.duration && !exercise.reps && (
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: "var(--c-accent-bg)", color: "var(--c-accent)" }}>
                {exercise.duration}
              </span>
            )}
            {exercise.rest && (
              <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--c-pill-inactive)", color: "var(--c-sub)" }}>
                Rest {exercise.rest}
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ color: "var(--c-sub)" }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            variants={expandCollapse}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ overflow: "hidden" }}
          >
            <div className="px-3 pb-3 pt-1 space-y-3" style={{ borderTop: "1px solid var(--c-border)" }}>
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: "Sets", val: exercise.sets },
                  { label: "Reps", val: exercise.reps || exercise.duration },
                  { label: "Rest", val: exercise.rest },
                ].filter((x) => x.val).map(({ label, val }) => (
                  <div key={label} className="rounded-xl p-2 text-center"
                    style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)" }}>
                    <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>{val}</p>
                    <p className="text-[10px]" style={{ color: "var(--c-sub)" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Form tip */}
              {exercise.tip && (
                <div className="flex items-start gap-2 rounded-xl p-3"
                  style={{ background: "var(--c-warn-bg)", border: "1px solid var(--c-warn-border)" }}>
                  <Info size={14} style={{ color: "var(--c-warn)", flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs leading-relaxed" style={{ color: "var(--c-warn)" }}>{exercise.tip}</p>
                </div>
              )}

              {/* Set tracker toggle */}
              <motion.button
                onClick={() => setShowTracker((t) => !t)}
                {...pressable}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold"
                style={{ background: "var(--c-accent-bg)", border: "1px solid var(--c-border)", color: "var(--c-accent)" }}
              >
                <ClipboardList size={13} />
                {showTracker ? "Hide Tracker" : "Track This Exercise"}
              </motion.button>

              {showTracker && <SetTracker exercise={exercise} />}

              {/* Video button */}
              <motion.button
                onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
                {...pressablePrimary}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
                style={{
                  background: "var(--c-accent-bg)",
                  color: "var(--c-accent)",
                  border: "1px solid var(--c-border)",
                }}
              >
                <PlayCircle size={16} />
                Search Tutorial
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {showVideo && <VideoModal exercise={exercise} onClose={() => setShowVideo(false)} />}
    </>
  );
}
