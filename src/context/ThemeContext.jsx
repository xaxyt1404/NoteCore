/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "theme-preference";
const VALID = ["light", "dark", "system"];
const ThemeContext = createContext(null);

const getStoredPreference = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(getStoredPreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const theme = preference === "system" ? systemTheme : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  }, [theme]);

  const setPreference = useCallback((pref) => {
    if (!VALID.includes(pref)) return;
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      /* sin almacenamiento: el tema dura solo esta visita */
    }
    setPreferenceState(pref);
  }, []);

  const value = useMemo(
    () => ({ preference, theme, setPreference }),
    [preference, theme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
