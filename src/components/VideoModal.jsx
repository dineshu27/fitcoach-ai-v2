import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ── Playlist: youtube.com/playlist?list=PLnHahrV4FtBCyDcR3utvDfdPkvUZnuDWl ──
// Primary source — playlist videos used first, external fallbacks for missing exercises
const VIDEO_MAP = [
  // ── CHEST ───────────────────────────────────────────────────────────────────
  { keys: ["flat bench press", "barbell bench press", "bench press"],    id: "Za8y2Ve3rco" }, // playlist
  { keys: ["incline dumbbell press", "incline bench press", "incline barbell"], id: "yAbzqcjGnLs" }, // playlist
  { keys: ["close grip bench press"],                                    id: "A2pk32zcocA" }, // playlist
  { keys: ["incline push up", "incline push"],                          id: "Zev745CHMMQ" }, // playlist incline push-up
  { keys: ["cable chest press", "cable one arm chest"],                  id: "FtabXZBhN9o" }, // playlist
  { keys: ["cable twisting chest press"],                                id: "ahyJaj1_Jtk" }, // playlist
  { keys: ["dumbbell floor fly", "dumbbell fly", "chest fly"],           id: "rqYoDd_A2ic" }, // playlist
  { keys: ["resistance band chest fly", "band chest fly"],               id: "oo0C5Gp0XnA" }, // playlist
  { keys: ["push-up", "push up", "pushup"],                              id: "M6f7Ef-5JkQ" }, // playlist
  { keys: ["spider man push", "spiderman push"],                         id: "H6LpYAX7518" }, // playlist
  { keys: ["bridge push up"],                                            id: "8UpoEzBN-wc" }, // playlist
  { keys: ["close grip push up"],                                        id: "BwW-tyvs6JY" }, // playlist

  // ── BACK ────────────────────────────────────────────────────────────────────
  { keys: ["barbell row", "bent over row"],                              id: "RJubxsDiRzs" }, // playlist
  { keys: ["incline bent over barbell row"],                             id: "hbRlrsXzbjk" }, // playlist
  { keys: ["inverted row"],                                              id: "KOv41bfWDqQ" }, // playlist
  { keys: ["seated cable row", "cable seated row", "cable row", "cable upper back row", "cable back row"], id: "DTKD8GXSQiQ" }, // playlist
  { keys: ["cable twisting high arm row"],                               id: "DzR3tIuUqZ4" }, // playlist
  { keys: ["cable standing rear delt row", "rear delt row"],             id: "PUkPy_QZKTs" }, // playlist
  { keys: ["low one arm standing row"],                                  id: "OFwWLlDVqHk" }, // playlist
  { keys: ["barbell lying rear delt row"],                               id: "I9QDN-MWm-A" }, // playlist
  { keys: ["dumbbell lying rear delt raise", "rear delt raise"],         id: "vwn-HOgn3bM" }, // playlist
  { keys: ["seated cable rear fly", "rear fly"],                         id: "Y0NEXmmi6jo" }, // playlist
  { keys: ["stiff leg cable deadlift"],                                  id: "1yxuas6MQ24" }, // playlist
  { keys: ["pull-up", "pull up", "chin-up", "chin up"],                 id: "eGo4IYlbE5g" }, // external (not in playlist)
  { keys: ["lat pulldown"],                                              id: "CAwf7n6Luuc" }, // external
  { keys: ["dumbbell row", "single arm row"],                            id: "pYcpY20QaE8" }, // external

  // ── SHOULDERS ───────────────────────────────────────────────────────────────
  { keys: ["dumbbell shoulder press", "seated dumbbell press", "dumbbell overhead press"], id: "RTXCZffj1kQ" }, // map dumbbell OH press to same tutorial
  { keys: ["barbell shoulder press", "overhead press", "military press", "ohp"], id: "RTXCZffj1kQ" }, // playlist
  { keys: ["barbell front raise", "front raise"],                        id: "65cPYGqasP4" }, // playlist
  { keys: ["barbell wide grip upright row", "upright row"],              id: "GlOpvsoCzeU" }, // playlist
  { keys: ["dumbbell lateral raise", "lateral raise", "side raise"],     id: "LQ24zKjsWoQ" }, // playlist
  { keys: ["dumbbell seated lateral raise"],                             id: "7DxOuW-VRm8" }, // playlist
  { keys: ["cable y raise"],                                             id: "TQDHuV__cDg" }, // playlist
  { keys: ["cable one arm upright row"],                                 id: "btmV2LFJ5SI" }, // playlist
  { keys: ["resistance tube shoulder press"],                            id: "p03StPfWmWY" }, // playlist
  { keys: ["resistance tube lateral raise"],                             id: "LeQNVmpJptQ" }, // playlist
  { keys: ["water bottle shoulder press"],                               id: "K54u0InhmzU" }, // playlist
  { keys: ["shoulder dumbbell rotation", "shoulder rotation"],           id: "XU-EUnhCaC4" }, // playlist
  { keys: ["external rotation", "internal rotation"],                    id: "3lykYcUcWNo" }, // playlist
  { keys: ["face pull"],                                                 id: "rep-qVOkqgk" }, // external (not in playlist)

  // ── BICEPS ──────────────────────────────────────────────────────────────────
  { keys: ["barbell curl", "ez bar curl", "ez curl", "standing curl"],   id: "pJn4P4xkJWs" }, // map barbell/ez curls to curl tutorial
  { keys: ["dumbbell seated curl", "dumbbell curl", "bicep curl"],       id: "pJn4P4xkJWs" }, // playlist
  { keys: ["hammer curl", "seated hammer curl"],                         id: "zfhBvlQRxyM" }, // playlist
  { keys: ["incline dumbbell curl", "incline curl"],                     id: "v-GeX_PcF8o" }, // playlist
  { keys: ["preacher curl", "lever curl"],                               id: "HDfJOTZNdK8" }, // playlist

  // ── TRICEPS ─────────────────────────────────────────────────────────────────
  { keys: ["cable overhead tricep extension", "overhead tricep"],        id: "e3f9Ybbik8o" }, // playlist
  { keys: ["cable bent over tricep", "cable tricep"],                    id: "_0h4kA-80yg" }, // playlist
  { keys: ["cable pushdown", "tricep pushdown"],                         id: "iGBnvy8_47I" }, // playlist
  { keys: ["resistance tube tricep", "band tricep"],                     id: "kDysoNbFkFE" }, // playlist
  { keys: ["skull crusher", "barbell skull crusher", "lying tricep"],    id: "kkrGmKmtjxk" }, // playlist
  { keys: ["lying tricep extension", "tricep extension"],                id: "K9Yd_4QJSMo" }, // playlist
  { keys: ["tricep kickback", "dumbbell kickback"],                      id: "_vYANzPTsqo" }, // playlist
  { keys: ["water bottle tricep extension"],                             id: "s2AedZoi9O0" }, // playlist
  { keys: ["dip", "tricep dip"],                                         id: "2z8JmcrW-As" }, // external

  // ── LEGS ────────────────────────────────────────────────────────────────────
  { keys: ["lever squat", "machine squat"],                              id: "R5lnJfN0ZL8" }, // playlist
  { keys: ["resistance tube squat"],                                     id: "EUmcsU8tQF4" }, // playlist
  { keys: ["backpack squat"],                                            id: "Yo5ZDgQ4sJA" }, // playlist
  { keys: ["smith machine sumo squat", "sumo squat"],                    id: "RSONeDwJsbQ" }, // playlist
  { keys: ["pulse squat"],                                               id: "rMFPxOQg4Ik" }, // playlist
  { keys: ["squat plus toe touch"],                                      id: "t7aT6ktztNc" }, // playlist
  { keys: ["ball sumo squat"],                                           id: "34lZBUdmr4U" }, // playlist
  { keys: ["dumbbell walking lunge", "walking lunge"],                   id: "zp4TDUB4O8g" }, // playlist
  { keys: ["ball lunge"],                                                id: "b-OM_OLKCVk" }, // playlist
  { keys: ["pulse lunge"],                                               id: "0dx4B30Q-xo" }, // playlist
  { keys: ["barbell step up", "step up"],                                id: "dh8YvQ6sY30" }, // playlist
  { keys: ["resistance band leg extension", "leg extension"],            id: "JV2uj8lYssA" }, // playlist
  { keys: ["banded leg curl", "lying leg curl", "leg curl"],             id: "eqELW6aYnps" }, // playlist
  { keys: ["lying unilateral leg curl"],                                 id: "JdApfXGVaS4" }, // playlist
  { keys: ["standing cable hip extensor", "hip extensor"],               id: "YBL9A-Hwku4" }, // playlist
  { keys: ["donkey kick"],                                               id: "xYSR_Qt6BZo" }, // playlist
  { keys: ["squat", "barbell squat", "back squat", "goblet squat"],      id: "ultWZbUMPL8" }, // external Jeff Nippard
  { keys: ["deadlift", "conventional deadlift"],                         id: "op9kVnSso6Q" }, // external Jeff Nippard
  { keys: ["romanian deadlift", "rdl"],                                  id: "jEy_czb3RKA" }, // external Jeff Nippard
  { keys: ["hip thrust", "glute bridge"],                                id: "SEdqd9HpWYs" }, // external Jeff Nippard
  { keys: ["bulgarian split squat", "split squat"],                      id: "2C-uNgKwPLE" }, // external Jeff Nippard
  { keys: ["leg press"],                                                 id: "IZxyjW7MPJQ" }, // external Jeff Nippard

  // ── CALVES ──────────────────────────────────────────────────────────────────
  { keys: ["standing barbell calf raise", "calf raise", "calf"],        id: "KCqbD19B4iI" }, // playlist
  { keys: ["standing single leg calf raise"],                            id: "6rc1AyINmc0" }, // playlist
  { keys: ["standing incline calf raise"],                               id: "uhGBb1mrSgk" }, // playlist
  { keys: ["standing cable calf raise"],                                 id: "13l-dA66AiA" }, // playlist
  { keys: ["seated inversion calf press"],                               id: "4QQ-54IVzn4" }, // playlist
  { keys: ["seated eversion calf press"],                                id: "MJ7rEpVTRJg" }, // playlist

  // ── TRAPS / SHRUGS ──────────────────────────────────────────────────────────
  { keys: ["dumbbell shrug", "shrug"],                                   id: "4v3XqwPD6zM" }, // playlist
  { keys: ["lever shrug"],                                               id: "EutdYpXRWdU" }, // playlist

  // ── CORE / ABS ──────────────────────────────────────────────────────────────
  { keys: ["hanging leg raise"],                                         id: "K8JTfUmdn3k" }, // playlist
  { keys: ["reverse crunch"],                                            id: "QGBSupXZGCg" }, // playlist
  { keys: ["knee crunch"],                                               id: "fyEIAToAbKs" }, // playlist
  { keys: ["knee tuck"],                                                 id: "oKvKs6CnjRM" }, // playlist
  { keys: ["pallof press"],                                              id: "GjLObcZW3cY" }, // playlist
  { keys: ["plank with lateral raise"],                                  id: "aXQbbEj1HCg" }, // playlist
  { keys: ["around the world plank"],                                    id: "LTN_JoNzays" }, // playlist
  { keys: ["star plank"],                                                id: "jgM-umx_0TY" }, // playlist
  { keys: ["plank"],                                                     id: "aXQbbEj1HCg" }, // playlist
  { keys: ["bird dog"],                                                  id: "JCtiKiaHep8" }, // playlist
  { keys: ["superman"],                                                  id: "_EfxvxpCgqA" }, // playlist
  { keys: ["scissors"],                                                  id: "co-5r7YiWlc" }, // playlist
  { keys: ["shoulder tap"],                                              id: "E77KirOKodQ" }, // playlist
  { keys: ["hand to toe touch"],                                         id: "PT2AWrcacKk" }, // playlist
  { keys: ["dumbbell side bend", "side bend"],                           id: "7hp6omsUDVg" }, // playlist
  { keys: ["rotation hiit", "rotational"],                               id: "Q5OaJzRHc-A" }, // playlist
  { keys: ["ab wheel", "rollout"],                                       id: "AGeyGJkOqRs" }, // external
  { keys: ["crunch", "cable crunch"],                                    id: "Xyd_fa5zoEU" }, // external

  // ── FUNCTIONAL / OTHER ──────────────────────────────────────────────────────
  { keys: ["single arm linear jammer"],                                  id: "bPp26Jpxzlg" }, // playlist
  { keys: ["band bridge", "glute bridge band"],                          id: "gCq7ew9bPds" }, // playlist
  { keys: ["kettlebell swing", "swing"],                                 id: "sSESeQAir2M" }, // external
  { keys: ["box jump", "jump"],                                          id: "9PgHH5T5jMI" }, // external
  { keys: ["battle rope"],                                               id: "P3sPCPODPow" }, // external
  { keys: ["farmer's walk", "farmer walk"],                              id: "Fab9RNmHMsE" }, // external
];

export function getVideoId(exerciseName) {
  if (!exerciseName) return null;
  const lower = exerciseName.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const inputWords = new Set(lower.split(" ").filter(w => w.length > 2));

  // Pass 1: longest substring match (exact)
  let bestId = null;
  let bestKeyLen = 0;
  for (const entry of VIDEO_MAP) {
    for (const k of entry.keys) {
      if (lower.includes(k) && k.length > bestKeyLen) {
        bestId = entry.id;
        bestKeyLen = k.length;
      }
    }
  }
  if (bestId) return bestId;

  // Pass 2: word-overlap scoring — fraction of key words present in exercise name
  let bestScore = 0;
  for (const entry of VIDEO_MAP) {
    for (const k of entry.keys) {
      const kWords = k.split(" ").filter(w => w.length > 2);
      if (kWords.length === 0) continue;
      const matched = kWords.filter(w => inputWords.has(w)).length;
      const score = matched / Math.max(kWords.length, inputWords.size);
      if (score > bestScore && score >= 0.6) {
        bestScore = score;
        bestId = entry.id;
      }
    }
  }

  return bestId;
}

export default function VideoModal({ exercise, onClose }) {
  const videoId = getVideoId(exercise?.name);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[420px] rounded-2xl overflow-hidden"
          style={{ background: "var(--c-surface)", border: "1px solid rgba(var(--c-accent-rgb),0.3)" }}
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(var(--c-accent-rgb),0.15)" }}>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>{exercise?.name}</p>
              <p className="text-xs" style={{ color: "var(--c-sub)" }}>
                {videoId ? "Strength training tutorial" : "Search on YouTube"}
              </p>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5"
              style={{ background: "rgba(var(--c-accent-rgb),0.15)" }}>
              <X size={16} style={{ color: "var(--c-sub)" }} />
            </button>
          </div>

          {/* Video */}
          {videoId ? (
            <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={exercise?.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-4">
              <p className="text-sm" style={{ color: "var(--c-sub)" }}>
                No in-app tutorial available for this exercise yet.
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise?.name + " strength training tutorial")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                style={{ background: "#FF0000" }}
              >
                Search on YouTube
              </a>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
