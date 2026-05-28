import type { ReactNode } from "react";
import { ThemeContext, useThemeToggle } from "../hooks/useTheme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme, toggle } = useThemeToggle();

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
