"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings, saveSettings } from "../lib/api-client";

export type ThemeKey = "dark" | "light" | "cloudy" | "forest" | "ocean";

export interface ThemeColors {
  bg: string;
  text: string;
  card: string;
  border: string;
  inputBg: string;
  accent: string;
  accentMuted: string;
}

export const themes: Record<ThemeKey, ThemeColors> = {
  dark: {
    bg: "#000000",
    text: "#ffffff",
    card: "#111111",
    border: "#222222",
    inputBg: "#111111",
    accent: "#ccff00", // Neon Lime (Top-tier athletic aesthetic)
    accentMuted: "rgba(204,255,0,0.15)",
  },
  light: {
    bg: "#f4f4f5", // Very light cool grey
    text: "#000000", 
    card: "#ffffff",
    border: "#e4e4e7",
    inputBg: "#ffffff",
    accent: "#000000", // Bold black accent in light mode for extreme contrast
    accentMuted: "rgba(0,0,0,0.05)",
  },
  cloudy: {
    bg: "#ffffff",
    text: "#18181b",
    card: "#fafafa",
    border: "#f4f4f5",
    inputBg: "#fafafa",
    accent: "#3b82f6", // Clean Tech Blue
    accentMuted: "rgba(59,130,246,0.1)",
  },
  forest: {
    bg: "#ffffff",
    text: "#000000",
    card: "#f7fee7", // Extremely light lime tint
    border: "#ecfccb",
    inputBg: "#ffffff",
    accent: "#65a30d", // Organic Green
    accentMuted: "rgba(101,163,13,0.1)",
  },
  ocean: {
    bg: "#0f172a", // Slate 900
    text: "#f8fafc",
    card: "#1e293b",
    border: "#334155",
    inputBg: "#1e293b",
    accent: "#38bdf8", // Sky blue
    accentMuted: "rgba(56,189,248,0.15)",
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
