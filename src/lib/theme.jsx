import { createContext, useContext, useState, useEffect } from "react";

function resolveAuto() {
  const h = new Date().getHours();
  return h >= 6 && h < 20 ? "light" : "dark";
}

const ThemeCtx = createContext({ mode: "auto", resolved: "dark", cycle: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("fc_theme") || "auto");
  const resolved = mode === "auto" ? resolveAuto() : mode;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  function cycle() {
    // auto → light → dark → auto
    const next = mode === "auto" ? "light" : mode === "light" ? "dark" : "auto";
    localStorage.setItem("fc_theme", next);
    setMode(next);
  }

  return (
    <ThemeCtx.Provider value={{ mode, resolved, cycle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
