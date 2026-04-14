import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, X, ChevronDown } from "lucide-react";

// Curated high-view stretching & warm-up videos
export const STRETCH_VIDEOS = {
  preWorkout: [
    {
      id: "HDsW0XCJOX4",
      title: "10-Min Full Body Dynamic Warm-Up",
      desc: "Dynamic warm-up to activate muscles and raise heart rate before lifting",
      duration: "10 min",
      moves: ["Leg swings", "Hip circles", "Arm circles", "High knees", "Jumping jacks", "Bodyweight squats"],
    },
    {
      id: "Eh00BIl1Wh4",
      title: "Pre-Workout Upper Body Warm-Up",
      desc: "Shoulder, chest and back activation for upper body training days",
      duration: "8 min",
      moves: ["Shoulder dislocations", "Band pull-aparts", "Chest openers", "Scapular push-ups"],
    },
    {
      id: "4pKly2JojMw",
      title: "Pre-Workout Lower Body Warm-Up",
      desc: "Hip, quad and glute activation for leg day",
      duration: "8 min",
      moves: ["Hip flexor stretch", "Glute bridges", "Fire hydrants", "Clamshells", "Banded walks"],
    },
  ],
  postWorkout: [
    {
      id: "g_tea8ZNk5A",
      title: "10-Min Full Body Cool-Down Stretch",
      desc: "Static stretching to reduce soreness and improve flexibility after any workout",
      duration: "10 min",
      moves: ["Quad stretch", "Hamstring stretch", "Hip flexor lunge", "Chest stretch", "Child's pose", "Pigeon pose"],
    },
    {
      id: "Wge0Q8lbmIY",
      title: "Post Upper Body Stretch",
      desc: "Chest, shoulder and back stretch after pushing/pulling sessions",
      duration: "8 min",
      moves: ["Cross-body shoulder stretch", "Doorway chest stretch", "Lat stretch", "Tricep stretch"],
    },
    {
      id: "sTxC3J3gQEU",
      title: "Post Leg Day Stretch",
      desc: "Quad, hamstring and glute release after lower body training",
      duration: "8 min",
      moves: ["Standing quad stretch", "Seated hamstring stretch", "Butterfly stretch", "Pigeon pose"],
    },
  ],
};

function VideoPlayer({ videoId, title, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[420px] rounded-2xl overflow-hidden"
          style={{ background: "var(--c-surface)", border: "1px solid rgba(var(--c-accent-rgb),0.3)" }}
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(var(--c-accent-rgb),0.15)" }}>
            <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>{title}</p>
            <button onClick={onClose} className="rounded-full p-1.5"
              style={{ background: "rgba(var(--c-accent-rgb),0.15)" }}>
              <X size={16} style={{ color: "var(--c-sub)" }} />
            </button>
          </div>
          <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function StretchCard({ type, workoutFocus }) {
  const [open, setOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const isPre = type === "pre";
  const videos = isPre ? STRETCH_VIDEOS.preWorkout : STRETCH_VIDEOS.postWorkout;
  const accentColor = isPre ? "#F59E0B" : "#4ECDC4";
  const bgColor = isPre ? "rgba(245,158,11,0.08)" : "var(--c-cool-bg)";
  const borderColor = isPre ? "rgba(245,158,11,0.25)" : "var(--c-cool-border)";

  // Pick the most relevant video based on workout focus
  const focus = (workoutFocus || "").toLowerCase();
  let primary = videos[0];
  if (focus.includes("upper") || focus.includes("chest") || focus.includes("back") || focus.includes("shoulder")) {
    primary = videos[1] || videos[0];
  } else if (focus.includes("lower") || focus.includes("leg") || focus.includes("quad") || focus.includes("glute")) {
    primary = videos[2] || videos[0];
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden transition-all" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
        {/* Header row — outer div handles expand toggle; Watch button is a separate action */}
        <div className="flex w-full items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setOpen((o) => !o)}>
          <div className="flex items-center gap-2">
            <span className="text-base">{isPre ? "🔥" : "🧊"}</span>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: accentColor }}>
                {isPre ? "Pre-Workout Stretch" : "Post-Workout Stretch"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--c-sub)" }}>{primary.duration} · {primary.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveVideo(primary); }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
              style={{ background: accentColor + "22", border: `1px solid ${accentColor}55`, color: accentColor }}
            >
              <PlayCircle size={12} />
              Watch
            </button>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} style={{ color: "var(--c-sub)" }} />
            </motion.div>
          </div>
        </div>

        {/* Expanded: moves list + all videos */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${borderColor}` }}>
                {/* Moves chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {primary.moves.map((m) => (
                    <span key={m} className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                      style={{ background: accentColor + "15", border: `1px solid ${accentColor}33`, color: accentColor }}>
                      {m}
                    </span>
                  ))}
                </div>

                {/* All available videos for this type */}
                <div className="space-y-2">
                  {videos.map((v) => (
                    <button key={v.id} onClick={() => setActiveVideo(v)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all active:scale-95"
                      style={{
                        background: activeVideo?.id === v.id ? accentColor + "15" : "var(--c-card)",
                        border: `1px solid ${activeVideo?.id === v.id ? accentColor + "55" : "rgba(var(--c-accent-rgb),0.1)"}`,
                      }}>
                      <PlayCircle size={18} style={{ color: accentColor, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold" style={{ color: "var(--c-text)" }}>{v.title}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--c-sub)" }}>{v.desc}</p>
                      </div>
                      <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: accentColor }}>{v.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeVideo && <VideoPlayer videoId={activeVideo.id} title={activeVideo.title} onClose={() => setActiveVideo(null)} />}
    </>
  );
}
