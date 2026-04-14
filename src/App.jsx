import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./lib/theme";

import Splash from "./screens/Splash";
import Onboarding from "./screens/Onboarding";
import Dashboard from "./screens/Dashboard";
import DietPlan from "./screens/DietPlan";
import TodayLog from "./screens/TodayLog";
import ExercisePlan from "./screens/ExercisePlan";
import Coach from "./screens/Coach";
import Profile from "./screens/Profile";
import BottomNav from "./components/BottomNav";

const MAIN = ["/dashboard", "/log", "/diet", "/exercise", "/profile"];

function AnimatedRoutes() {
  const location = useLocation();
  const showNav = MAIN.includes(location.pathname);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px]" style={{ background: "var(--c-bg)" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="min-h-screen"
        >
          <Routes location={location}>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/diet" element={<DietPlan />} />
            <Route path="/log" element={<TodayLog />} />
            <Route path="/exercise" element={<ExercisePlan />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
