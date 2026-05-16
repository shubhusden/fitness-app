"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings, saveSettings } from "../lib/api-client";

export type ThemeKey = "dark" | "light" | "strava" | "nike";

export interface ThemeColors {
  bg: string;
  text: string;
  card: string;
  border: string;
  inputBg: string;
  accent: string;
  accentMuted: string;
  textOnAccent: string;
}

export const themes: Record<ThemeKey, ThemeColors> = {
  dark: {
    bg: "#000000",
    text: "#ffffff",
    card: "#111111",
    border: "#222222",
    inputBg: "#111111",
    accent: "#ffffff", 
    accentMuted: "rgba(255,255,255,0.15)",
    textOnAccent: "#000000",
  },
  light: {
    bg: "#f4f4f5", 
    text: "#000000", 
    card: "#ffffff",
    border: "#e4e4e7",
    inputBg: "#ffffff",
    accent: "#000000", 
    accentMuted: "rgba(0,0,0,0.05)",
    textOnAccent: "#ffffff",
  },
  strava: {
    bg: "#000000",
    text: "#ffffff",
    card: "#111111",
    border: "#222222",
    inputBg: "#111111",
    accent: "#fc4c02", 
    accentMuted: "rgba(252,76,2,0.15)",
    textOnAccent: "#ffffff",
  },
  nike: {
    bg: "#000000",
    text: "#ffffff",
    card: "#111111",
    border: "#222222",
    inputBg: "#111111",
    accent: "#ccff00", 
    accentMuted: "rgba(204,255,0,0.15)",
    textOnAccent: "#000000",
  },
};

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeKey | null;
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme);
    }
    
    fetchSettings().then((s) => {
      if (s.theme && themes[s.theme as ThemeKey]) {
        setThemeState(s.theme as ThemeKey);
      }
    });
  }, []);

  const setTheme = (newTheme: ThemeKey) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    saveSettings({ theme: newTheme });
    
    // Also update CSS variables for easier global styling
    const colors = themes[newTheme];
    const root = document.documentElement;
    root.style.setProperty("--bg", colors.bg);
    root.style.setProperty("--text", colors.text);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--input-bg", colors.inputBg);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-muted", colors.accentMuted);
  };

  useEffect(() => {
    // Apply initial theme variables
    const colors = themes[theme];
    const root = document.documentElement;
    root.style.setProperty("--bg", colors.bg);
    root.style.setProperty("--text", colors.text);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--input-bg", colors.inputBg);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-muted", colors.accentMuted);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      <div style={{ background: themes[theme].bg, color: themes[theme].text, transition: "background 0.3s ease, color 0.3s ease", minHeight: "100vh" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
