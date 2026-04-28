import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "./lib/theme";
import { routePage } from "./motion/variants";
import { AchievementProvider } from "./hooks/useAchievement";
import AchievementOverlay from "./components/AchievementOverlay";

import Splash from "./screens/Splash";
import Onboarding from "./screens/Onboarding";
import Dashboard from "./screens/Dashboard";
import DietPlan from "./screens/DietPlan";
import TodayLog from "./screens/TodayLog";
import ExercisePlan from "./screens/ExercisePlan";
import Coach from "./screens/Coach";
import Profile from "./screens/Profile";
import BottomNav from "./components/BottomNav";

const AnimationsGallery = import.meta.env.DEV
  ? lazy(() => import("./screens/AnimationsGallery"))
  : null;

const DevRex = import.meta.env.DEV
  ? lazy(() => import("./screens/DevRex"))
  : null;

const MAIN = ["/dashboard", "/log", "/diet", "/exercise", "/profile"];

function AnimatedRoutes() {
  const location = useLocation();
  const showNav = MAIN.includes(location.pathname);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px]" style={{ background: "var(--c-bg)" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={routePage}
          initial="hidden"
          animate="show"
          exit="exit"
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
            {AnimationsGallery && (
              <Route
                path="/dev/animations"
                element={
                  <Suspense fallback={null}>
                    <AnimationsGallery />
                  </Suspense>
                }
              />
            )}
            {DevRex && (
              <Route path="/dev/rex" element={<Suspense fallback={null}><DevRex /></Suspense>} />
            )}
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
      <AchievementProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
        <AchievementOverlay />
      </AchievementProvider>
    </ThemeProvider>
  );
}
