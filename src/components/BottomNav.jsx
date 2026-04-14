import { useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, Dumbbell, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { path: "/dashboard", label: "Home",    Icon: Home },
  { path: "/log",       label: "Log",     Icon: ClipboardList },
  { path: "/exercise",  label: "Train",   Icon: Dumbbell },
  { path: "/coach",     label: "FiTAi",   Icon: MessageCircle },
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
        backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--c-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {TABS.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-all relative"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] w-10 rounded-full"
                  style={{ background: "var(--c-accent)", boxShadow: "0 0 8px var(--c-accent)" }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                color={active ? "var(--c-accent)" : "var(--c-sub)"}
              />
              <span
                className="text-[10px] font-semibold"
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
