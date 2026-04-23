import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { modalOverlay, modalPanel } from "../motion/variants";
import { pressableIcon } from "../motion/presets";

export default function VideoModal({ exercise, onClose }) {
  const query = encodeURIComponent((exercise?.name || "") + " exercise tutorial proper form");
  const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1&rel=0&modestbranding=1`;

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}
        variants={modalOverlay}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[420px] rounded-2xl overflow-hidden"
          style={{ background: "var(--c-card)", border: "1px solid var(--c-border-bright)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          variants={modalPanel}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--c-border)" }}>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--c-text)" }}>{exercise?.name}</p>
              <p className="text-[11px]" style={{ color: "var(--c-sub)" }}>Exercise tutorial</p>
            </div>
            <motion.button
              onClick={onClose}
              {...pressableIcon}
              className="rounded-xl p-1.5"
              style={{ background: "var(--c-pill-inactive)" }}
            >
              <X size={16} style={{ color: "var(--c-sub)" }} />
            </motion.button>
          </div>

          <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
            <iframe
              src={embedUrl}
              title={`${exercise?.name} tutorial`}
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
