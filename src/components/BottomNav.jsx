import { useLocation, useNavigate } from "react-router-dom";
import { Home, Utensils, Dumbbell, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { path: "/dashboard", label: "Home", Icon: Home },
  { path: "/diet", label: "Diet", Icon: Utensils },
  { path: "/exercise", label: "Exercise", Icon: Dumbbell },
  { path: "/coach", label: "REX", Icon: MessageCircle },
  { path: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2"
      style={{
        background: "rgba(18,18,26,0.95)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(108,99,255,0.2)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
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
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{ background: "#6C63FF", boxShadow: "0 0 8px #6C63FF" }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                color={active ? "#6C63FF" : "#8888AA"}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? "#6C63FF" : "#8888AA" }}
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
