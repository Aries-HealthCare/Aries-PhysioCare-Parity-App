"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

type Theme = "light" | "dark";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    
    const initialTheme = storedTheme || preferredTheme;
    setThemeState(initialTheme);
    document.documentElement.classList.add(initialTheme);

  }, []);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
