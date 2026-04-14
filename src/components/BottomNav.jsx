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

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2"
      style={{
        background: "var(--c-nav)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--c-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch justify-around px-1 py-1">
        {TABS.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 relative transition-all"
              style={{ minHeight: 54 }}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                  style={{
                    height: 3, width: 28,
                    background: "var(--c-accent)",
                    boxShadow: "0 0 10px rgba(var(--c-accent-rgb),0.7)",
                  }}
                />
              )}
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl transition-all"
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}
