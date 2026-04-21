import { useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, Dumbbell, User, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";

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
  // Center of each tab in % of total width
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
      {/* Single sliding indicator at top — avoids layoutId positioning bugs */}
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
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}

      <div className="flex items-stretch justify-around px-1">
        {TABS.map(({ path, label, Icon }, idx) => {
          const active = idx === activeIdx;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-all"
              style={{ minHeight: 54 }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl transition-all"
                style={{
                  background: active ? "var(--c-accent-bg)" : "transparent",
                  transform: active ? "scale(1.05)" : "scale(1)",
                }}
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}
