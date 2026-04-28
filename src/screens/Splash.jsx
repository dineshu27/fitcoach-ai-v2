import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import REX from "../components/REX";
import { cache } from "../lib/cache";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Splash() {
  const navigate = useNavigate();
  const reduced = prefersReduced();

  useEffect(() => {
    const delay = reduced ? 800 : 1400;
    const t = setTimeout(() => {
      const profile = cache.getProfile();
      const plan = cache.getPlan();
      navigate(profile && plan ? "/dashboard" : "/onboarding", { replace: true });
    }, delay);
    return () => clearTimeout(t);
  }, [navigate, reduced]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100svh",
        background: "#141210",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* REX card + pulse ring */}
      <div style={{ position: "relative", display: "inline-flex" }}>
        {/* Accent ring — single pulse on mount */}
        <motion.div
          initial={{ scale: 1, opacity: 0.35 }}
          animate={
            reduced
              ? { scale: 1, opacity: 0.35 }
              : {
                  scale: [1, 1.08, 1],
                  opacity: [0.35, 0.55, 0.35],
                }
          }
          transition={
            reduced
              ? {}
              : { duration: 1.5, ease: "easeInOut", times: [0, 0.5, 1] }
          }
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 20,
            border: "2px solid #FC4C02",
            pointerEvents: "none",
          }}
        />

        {/* REX card */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 16,
            background: "#1F1B17",
            border: "1px solid #2A241F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <REX state="idle" size="md" />
        </div>
      </div>

      {/* Title */}
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: 32,
            fontWeight: 500,
            letterSpacing: "-0.5px",
            color: "#F5F0EB",
            margin: 0,
            lineHeight: 1,
          }}
        >
          FiTAi
        </h1>
        <p
          style={{
            marginTop: 6,
            fontSize: 13,
            color: "#8A7D70",
            fontWeight: 400,
          }}
        >
          Your AI fitness coach
        </p>
      </div>

      {/* Loading dots */}
      <div
        style={{
          marginTop: 32,
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {[1, 0.5, 0.25].map((baseOpacity, i) => (
          <motion.div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#FC4C02",
            }}
            animate={
              reduced
                ? { opacity: baseOpacity }
                : { opacity: [baseOpacity, 1, baseOpacity] }
            }
            transition={
              reduced
                ? {}
                : {
                    duration: 0.6,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
            initial={{ opacity: baseOpacity }}
          />
        ))}
      </div>

      {/* Bottom tagline */}
      <p
        style={{
          position: "absolute",
          bottom: 28,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 11,
          color: "#8A7D70",
          letterSpacing: "0.02em",
        }}
      >
        Calm · Intelligent · Encouraging
      </p>
    </div>
  );
}
