import { useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, Dumbbell, User, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { spring } from "../motion/tokens";
import { pressable } from "../motion/presets";

const TABS = [
  { path: "/dashboard", label: "Home",    Icon: Home },
  { path: "/log",       label: "Log",     Icon: ClipboardList },
  { path: "/diet",      label: "Diet",    Icon: UtensilsCrossed },
  { path: "/exercise",  label: "Train",   Icon: Dumbbell },
  { path: "/profile",   label: "Profile", Icon: User },
];

const N = TABS.length;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeIdx = TABS.findIndex(t => t.path === location.pathname);
  const indicatorLeft = activeIdx >= 0
    ? `calc(${activeIdx} * (100% / ${N}) + (100% / ${N} / 2))`
    : "-100px";

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2"
      style={{
        background: "var(--c-nav)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--c-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
        position: "fixed",
      }}
    >
      {/* Sliding active indicator — spring matches nav token */}
      {activeIdx >= 0 && (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            height: 3,
            width: 28,
            borderRadius: "0 0 6px 6px",
            background: "var(--c-accent)",
            boxShadow: "0 0 10px rgba(var(--c-accent-rgb),0.7)",
            x: "-50%",
          }}
          animate={{ left: indicatorLeft }}
          transition={spring.nav}
        />
      )}

      <div className="flex items-stretch justify-around px-1">
        {TABS.map(({ path, label, Icon }, idx) => {
          const active = idx === activeIdx;
          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              {...pressable}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
              style={{ minHeight: 54 }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl transition-colors"
                style={{ background: active ? "var(--c-accent-bg)" : "transparent" }}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.5 : 1.8}
                  color={active ? "var(--c-accent)" : "var(--c-sub)"}
                />
              </div>
              <span
                className="text-[9px] font-bold tracking-wide"
                style={{ color: active ? "var(--c-accent)" : "var(--c-sub)" }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
