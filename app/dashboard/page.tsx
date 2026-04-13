"use client";
import { foods as allFoods, FoodItem } from "../data/foods";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import AIAssistant from "../components/AIAssistant";
import {
  fetchUser,
  fetchFoods,
  fetchSettings,
  addFood as apiAddFood,
  removeFood as apiRemoveFood,
  clearFoods as apiClearFoods,
  saveSettings,
  syncFoods,
} from "../lib/api-client";

interface UserData {
  name?: string;
  goal?: number;
  weight?: string;
  height?: string;
  gender?: string;
}

interface DisplayFood extends FoodItem {
  emoji: string;
  color: string;
  count?: number;
}

const foodDB: DisplayFood[] = [
  { name: "Apple", calories: 95, emoji: "🍎", color: "#1e3326" },
  { name: "Banana", calories: 105, emoji: "🍌", color: "#3d3a2a" },
  { name: "Rice", calories: 200, emoji: "🍚", color: "#2f2f2f" },
  { name: "Chicken", calories: 165, emoji: "🍗", color: "#3d2f2a" },
  { name: "Egg", calories: 78, emoji: "🥚", color: "#3a3a2a" },
  { name: "Milk", calories: 150, emoji: "🥛", color: "#2a2f3d" },
  { name: "Pizza", calories: 285, emoji: "🍕", color: "#3d2a2a" },
  { name: "Burger", calories: 354, emoji: "🍔", color: "#3d2f1f" },
  { name: "Bread", calories: 80, emoji: "🍞", color: "#3a3528" },
  { name: "Dosa", calories: 168, emoji: "🫓", color: "#2f2a1f" },
  { name: "Idli", calories: 58, emoji: "⚪", color: "#2a2f2a" },
  { name: "Sambar", calories: 120, emoji: "🍲", color: "#3d2a1f" },
  { name: "Upma", calories: 180, emoji: "🥣", color: "#3a3528" },
  { name: "Poha", calories: 130, emoji: "🌾", color: "#3d3a1f" },
  { name: "Paneer", calories: 265, emoji: "🧀", color: "#3a3528" },
];

type ThemeKey = "dark" | "light" | "cloudy";

const themes: Record<ThemeKey, {
  bg: string; text: string; card: string; border: string; inputBg: string;
}> = {
  dark:   { bg: "#0e0d0b", text: "#f0ebe0", card: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", inputBg: "rgba(255,255,255,0.03)" },
  light:  { bg: "#f7f7f7", text: "#1a1a1a", card: "#ffffff", border: "#e5e5e5", inputBg: "#ffffff" },
  cloudy: { bg: "#dcd9d4", text: "#2a2a2a", card: "#e8e6e2", border: "#c8c5bf", inputBg: "#f0eeea" },
};

function getGreeting(hour: number): string {
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

export default function Dashboard() {
  const router = useRouter();

  const [foods, setFoods] = useState<DisplayFood[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<ThemeKey>("dark");

  // Clock state
  const [now, setNow] = useState<Date | null>(null);

  const currentTheme = themes[theme] || themes.dark;

  useEffect(() => {
    // Load from localStorage first for instant display
    const storedUser = localStorage.getItem("user");
    const storedFoods = localStorage.getItem("foods");
    const savedTheme = localStorage.getItem("theme") as ThemeKey | null;

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedFoods) setFoods(JSON.parse(storedFoods));
    if (savedTheme && themes[savedTheme]) setTheme(savedTheme);

    // Then fetch from backend API
    fetchUser().then((u) => { if (u) setUser(u); });
    fetchFoods().then((f) => { if (f.length > 0) setFoods(f as DisplayFood[]); });
    fetchSettings().then((s) => {
      if (s.theme && themes[s.theme as ThemeKey]) setTheme(s.theme as ThemeKey);
    });
  }, []);

  // Live clock
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const addFood = (food: DisplayFood) => {
    setFoods((prev) => {
      const updated = [...prev, food];
      localStorage.setItem("foods", JSON.stringify(updated));
      // Sync to backend
      apiAddFood({ name: food.name, calories: food.calories, emoji: food.emoji, color: food.color });
      return updated;
    });
  };

  const removeFood = (name: string) => {
    setFoods((prev) => {
      const index = prev.findIndex((f) => f.name === name);
      if (index === -1) return prev;
      const updated = [...prev];
      updated.splice(index, 1);
      localStorage.setItem("foods", JSON.stringify(updated));
      // Sync to backend
      apiRemoveFood(name);
      return updated;
    });
  };

  const changeTheme = (mode: ThemeKey) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    saveSettings({ theme: mode });
  };

  const handleRefresh = () => {
    setFoods([]);
    localStorage.removeItem("foods");
    apiClearFoods();
  };

  const handleReset = () => {
    localStorage.clear();
    router.push("/");
  };

  const groupedFoods = Object.values(
    foods.reduce((acc: Record<string, DisplayFood & { count: number }>, item) => {
      if (!acc[item.name]) acc[item.name] = { ...item, count: 1 };
      else acc[item.name].count++;
      return acc;
    }, {})
  );

  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
  const goal = user?.goal || 2000;
  const progress = Math.min((totalCalories / goal) * 100, 100);
  const over = totalCalories > goal;

  const filteredFoods = search
    ? allFoods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : allFoods.slice(0, 15);

  const displayFoods: DisplayFood[] = filteredFoods.map((f) => {
    const existing = foodDB.find((x) => x.name === f.name);
    return existing ? existing : { ...f, emoji: "🍽️", color: "#2a2a2a" };
  });

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  // Clock calculations
  const hours = now ? now.getHours() : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const secondDeg = seconds * 6;
  const greeting = getGreeting(hours);

  const timeStr = now
    ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
    : "";
  const dateStr = now
    ? now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div
      style={{
        background: currentTheme.bg,
        color: currentTheme.text,
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: "80px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#d4a853", marginBottom: "4px", fontWeight: 500 }}>
              {greeting} ✦
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 300, margin: 0 }}>
              Welcome back, <span style={{ color: "#d4a853" }}>{user?.name || "there"}</span>
            </h1>
            <p style={{ opacity: 0.5, fontSize: "13px", marginTop: "4px" }}>
              Daily Goal: {goal} kcal
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={theme}
              onChange={(e) => changeTheme(e.target.value as ThemeKey)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "6px 8px",
                color: currentTheme.text,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value="dark">🌙</option>
              <option value="light">☀️</option>
              <option value="cloudy">☁️</option>
            </select>
            <button
              onClick={handleRefresh}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: "14px",
                color: currentTheme.text,
              }}
            >
              🔄
            </button>
            <button
              onClick={handleReset}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: "14px",
                color: currentTheme.text,
              }}
            >
              🏠
            </button>
          </div>
        </div>

        {/* ═══ CLOCK WIDGET ═══ */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(20,19,17,0.9) 100%)",
            border: "1px solid rgba(212,168,83,0.15)",
            borderRadius: "20px",
            padding: "28px 24px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "28px",
            animation: "scaleIn 0.5s ease both",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)",
              top: "-60px",
              right: "-40px",
              pointerEvents: "none",
            }}
          />

          {/* Analog clock */}
          <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              {/* Outer ring */}
              <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(212,168,83,0.2)" strokeWidth="1.5" />
              <circle cx="60" cy="60" r="52" fill="rgba(0,0,0,0.3)" stroke="rgba(212,168,83,0.1)" strokeWidth="0.5" />

              {/* Hour markers */}
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x1 = 60 + 44 * Math.cos(angle);
                const y1 = 60 + 44 * Math.sin(angle);
                const x2 = 60 + (i % 3 === 0 ? 38 : 41) * Math.cos(angle);
                const y2 = 60 + (i % 3 === 0 ? 38 : 41) * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={i % 3 === 0 ? "#d4a853" : "rgba(240,235,224,0.3)"}
                    strokeWidth={i % 3 === 0 ? 2 : 1}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Hour hand */}
              <line
                x1="60" y1="60"
                x2={60 + 28 * Math.cos((hourDeg - 90) * (Math.PI / 180))}
                y2={60 + 28 * Math.sin((hourDeg - 90) * (Math.PI / 180))}
                stroke="#f0ebe0"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Minute hand */}
              <line
                x1="60" y1="60"
                x2={60 + 36 * Math.cos((minuteDeg - 90) * (Math.PI / 180))}
                y2={60 + 36 * Math.sin((minuteDeg - 90) * (Math.PI / 180))}
                stroke="#f0ebe0"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Second hand */}
              <line
                x1="60" y1="60"
                x2={60 + 40 * Math.cos((secondDeg - 90) * (Math.PI / 180))}
                y2={60 + 40 * Math.sin((secondDeg - 90) * (Math.PI / 180))}
                stroke="#d4a853"
                strokeWidth="1"
                strokeLinecap="round"
              />

              {/* Center dot */}
              <circle cx="60" cy="60" r="3" fill="#d4a853" />
              <circle cx="60" cy="60" r="1.5" fill="#0e0d0b" />
            </svg>
          </div>

          {/* Digital time & date */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "32px", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "2px", color: "#f0ebe0" }}>
              {timeStr.toUpperCase()}
            </div>
            <div style={{ fontSize: "13px", color: "#7a7568", marginTop: "4px", letterSpacing: "0.5px" }}>
              {dateStr}
            </div>
            <div
              style={{
                marginTop: "10px",
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "rgba(212,168,83,0.1)",
                border: "1px solid rgba(212,168,83,0.2)",
                fontSize: "11px",
                color: "#d4a853",
                fontWeight: 500,
              }}
            >
              🕐 IST — India Standard Time
            </div>
          </div>
        </div>

        {/* ═══ CALORIE RING ═══ */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "28px",
            background: currentTheme.card,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: "20px",
            padding: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <div style={{ position: "relative" }}>
              <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="65" cy="65" r={radius}
                  fill="none"
                  stroke={over ? "#c06060" : "#d4a853"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circumference}`}
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)", textAlign: "center",
              }}>
                <div style={{ fontSize: "22px", fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>
                  {totalCalories}
                </div>
                <div style={{ fontSize: "11px", opacity: 0.5 }}>kcal</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "13px", opacity: 0.5, marginBottom: "6px" }}>Today's Intake</div>
              <div style={{ fontSize: "28px", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif" }}>
                {totalCalories} <span style={{ fontSize: "14px", opacity: 0.5 }}>/ {goal} kcal</span>
              </div>
              <div style={{
                marginTop: "8px", fontSize: "12px", fontWeight: 500,
                color: over ? "#c06060" : totalCalories > goal * 0.8 ? "#e8bc6a" : "#6b9d6b",
              }}>
                {over
                  ? `⚠ ${totalCalories - goal} kcal over limit`
                  : `${goal - totalCalories} kcal remaining`}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ SEARCH ═══ */}
        <input
          id="food-search"
          placeholder="🔍  Search 500+ foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: "14px",
            marginBottom: "20px",
            background: currentTheme.inputBg,
            color: currentTheme.text,
            border: `1px solid ${currentTheme.border}`,
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />

        {/* ═══ FOOD GRID ═══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: "10px",
          }}
        >
          {displayFoods.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              onClick={() => addFood(f)}
              style={{
                background: f.color,
                padding: "16px 10px",
                borderRadius: "14px",
                textAlign: "center",
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.04)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "4px" }}>{f.emoji}</div>
              <div style={{ fontSize: "13px", fontWeight: 500 }}>{f.name}</div>
              <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "2px" }}>{f.calories} kcal</div>
            </div>
          ))}
        </div>

        {/* ═══ BASKET ═══ */}
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            background: currentTheme.card,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: "20px",
          }}
        >
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "20px", marginBottom: "16px" }}>
            🧺 Your Basket
          </h3>

          {groupedFoods.length === 0 && (
            <p style={{ opacity: 0.4, fontSize: "13px" }}>Tap on a food above to add it here</p>
          )}

          {groupedFoods.map((f, i) => (
            <div
              key={`basket-${f.name}-${i}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "10px",
                marginBottom: "6px",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div>
                <span style={{ marginRight: "8px" }}>{f.emoji}</span>
                <span style={{ fontWeight: 500 }}>{f.name}</span>
                <span style={{ marginLeft: "8px", opacity: 0.5, fontSize: "13px" }}>×{f.count}</span>
                <span style={{ marginLeft: "10px", fontSize: "12px", color: "#d4a853" }}>
                  {f.calories * f.count} kcal
                </span>
              </div>
              <button
                onClick={() => removeFood(f.name)}
                style={{
                  background: "rgba(192,96,96,0.15)",
                  border: "1px solid rgba(192,96,96,0.3)",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  color: "#c06060",
                  fontSize: "13px",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <AIAssistant />
      <BottomNav />
    </div>
  );
}