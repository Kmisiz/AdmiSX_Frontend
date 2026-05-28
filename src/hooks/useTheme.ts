import { useEffect, createContext, useContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export const useThemeToggle = () => {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return { theme: "light" as const, toggle: () => {} };
};
