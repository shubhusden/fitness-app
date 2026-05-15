"use client";
import { foods as allFoods, FoodItem } from "../data/foods";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";
import AIAssistant from "../components/AIAssistant";
import {
  fetchUser, fetchFoods, fetchSettings, addFood as apiAddFood,
  removeFood as apiRemoveFood, clearFoods as apiClearFoods, saveSettings
} from "../lib/api-client";

interface UserData { name?: string; goal?: number; weight?: string; height?: string; gender?: string; }
interface DisplayFood extends FoodItem { emoji: string; color: string; count?: number; }

const foodDB: DisplayFood[] = [
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, emoji: "🍎", color: "#1e3326" },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, emoji: "🍌", color: "#3d3a2a" },
  { name: "Rice", calories: 200, protein: 4.3, carbs: 45, fat: 0.4, emoji: "🍚", color: "#2f2f2f" },
  { name: "Chicken", calories: 165, protein: 31, carbs: 0, fat: 3.6, emoji: "🍗", color: "#3d2f2a" },
  { name: "Egg", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, emoji: "🥚", color: "#3a3a2a" },
  { name: "Milk", calories: 150, protein: 8, carbs: 12, fat: 8, emoji: "🥛", color: "#2a2f3d" },
  { name: "Pizza", calories: 285, protein: 12, carbs: 36, fat: 10, emoji: "🍕", color: "#3d2a2a" },
  { name: "Burger", calories: 354, protein: 20, carbs: 29, fat: 17, emoji: "🍔", color: "#3d2f1f" },
  { name: "Bread", calories: 80, protein: 2.7, carbs: 15, fat: 1, emoji: "🍞", color: "#3a3528" },
  { name: "Dosa", calories: 168, protein: 3.9, carbs: 27, fat: 5, emoji: "🫓", color: "#2f2a1f" },
  { name: "Idli", calories: 58, protein: 2, carbs: 12, fat: 0.4, emoji: "⚪", color: "#2a2f2a" },
  { name: "Sambar", calories: 120, protein: 5, carbs: 18, fat: 3, emoji: "🍲", color: "#3d2a1f" },
  { name: "Upma", calories: 180, protein: 4.5, carbs: 28, fat: 5, emoji: "🥣", color: "#3a3528" },
  { name: "Poha", calories: 130, protein: 3.5, carbs: 23, fat: 3, emoji: "🌾", color: "#3d3a1f" },
  { name: "Paneer", calories: 265, protein: 18, carbs: 1.2, fat: 21, emoji: "🧀", color: "#3a3528" },
];

type ThemeKey = "dark" | "light" | "cloudy";
const themes: Record<ThemeKey, { bg: string; text: string; card: string; border: string; inputBg: string; }> = {
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
  const [now, setNow] = useState<Date | null>(null);

  const currentTheme = themes[theme] || themes.dark;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedFoods = localStorage.getItem("foods");
    const savedTheme = localStorage.getItem("theme") as ThemeKey | null;
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedFoods) setFoods(JSON.parse(storedFoods));
    if (savedTheme && themes[savedTheme]) setTheme(savedTheme);

    fetchUser().then((u) => { if (u) setUser(u); });
    fetchFoods().then((f) => { if (f.length > 0) setFoods(f as DisplayFood[]); });
    fetchSettings().then((s) => {
      if (s.theme && themes[s.theme as ThemeKey]) setTheme(s.theme as ThemeKey);
    });
  }, []);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const addFood = (food: DisplayFood) => {
    setFoods((prev) => {
      const updated = [...prev, food];
      localStorage.setItem("foods", JSON.stringify(updated));
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
  const totalProtein = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
  const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
  const totalFat = foods.reduce((sum, f) => sum + (f.fat || 0), 0);

  const goal = user?.goal || 2000;
  const progress = Math.min((totalCalories / goal) * 100, 100);
  const over = totalCalories > goal;

  const filteredFoods = search
    ? allFoods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : allFoods.slice(0, 15);

  const displayFoods: DisplayFood[] = filteredFoods.map((f) => {
    const existing = foodDB.find((x) => x.name === f.name);
    return existing ? { ...f, emoji: existing.emoji, color: existing.color } : { ...f, emoji: "🍽️", color: "#2a2a2a" };
  });

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  const hours = now ? now.getHours() : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const secondDeg = seconds * 6;
  const greeting = getGreeting(hours);

  const timeStr = now ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";
  const dateStr = now ? now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";

  return (
    <div style={{ background: currentTheme.bg, color: currentTheme.text, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {/* Compact Clock */}
            <div style={{ position: "relative", width: "70px", height: "70px", flexShrink: 0 }}>
              <svg width="70" height="70" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(212,168,83,0.2)" strokeWidth="1.5" />
                <circle cx="60" cy="60" r="52" fill="rgba(0,0,0,0.3)" stroke="rgba(212,168,83,0.1)" strokeWidth="0.5" />
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  return (
                    <line key={i} x1={60 + 44 * Math.cos(angle)} y1={60 + 44 * Math.sin(angle)} x2={60 + (i % 3 === 0 ? 38 : 41) * Math.cos(angle)} y2={60 + (i % 3 === 0 ? 38 : 41) * Math.sin(angle)} stroke={i % 3 === 0 ? "#d4a853" : "rgba(240,235,224,0.3)"} strokeWidth={i % 3 === 0 ? 2 : 1} strokeLinecap="round" />
                  );
                })}
                <line x1="60" y1="60" x2={60 + 28 * Math.cos((hourDeg - 90) * (Math.PI / 180))} y2={60 + 28 * Math.sin((hourDeg - 90) * (Math.PI / 180))} stroke="#f0ebe0" strokeWidth="3" strokeLinecap="round" />
                <line x1="60" y1="60" x2={60 + 36 * Math.cos((minuteDeg - 90) * (Math.PI / 180))} y2={60 + 36 * Math.sin((minuteDeg - 90) * (Math.PI / 180))} stroke="#f0ebe0" strokeWidth="2" strokeLinecap="round" />
                <line x1="60" y1="60" x2={60 + 40 * Math.cos((secondDeg - 90) * (Math.PI / 180))} y2={60 + 40 * Math.sin((secondDeg - 90) * (Math.PI / 180))} stroke="#d4a853" strokeWidth="1" strokeLinecap="round" />
                <circle cx="60" cy="60" r="3" fill="#d4a853" />
                <circle cx="60" cy="60" r="1.5" fill="#0e0d0b" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "14px", color: "#d4a853", marginBottom: "4px", fontWeight: 500 }}>
                {greeting} ✦ <span style={{ color: "#7a7568", marginLeft: "8px" }}>{timeStr} • {dateStr}</span>
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 300, margin: 0 }}>
                Welcome back, <span style={{ color: "#d4a853" }}>{user?.name || "there"}</span>
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
               <select
                value={theme}
                onChange={(e) => changeTheme(e.target.value as ThemeKey)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", color: currentTheme.text, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", outline: "none", appearance: "none" }}
              >
                <option value="dark">🌙 Dark Mode</option>
                <option value="light">☀️ Light Mode</option>
                <option value="cloudy">☁️ Cloudy</option>
              </select>
              <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "10px", opacity: 0.5 }}>▼</span>
            </div>
            
            <button onClick={handleRefresh} title="Clear today's basket" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "14px", color: currentTheme.text, display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
              🔄 Clear Today
            </button>
            <button onClick={handleReset} title="Reset all data and start over" style={{ background: "rgba(192,96,96,0.1)", border: "1px solid rgba(192,96,96,0.2)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "14px", color: "#c06060", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(192,96,96,0.2)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(192,96,96,0.1)"}>
              🏠 Reset App
            </button>
          </div>
        </div>

        {/* CALORIE RING & MACROS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px", background: currentTheme.card, border: `1px solid ${currentTheme.border}`, borderRadius: "20px", padding: "28px", animation: "slideInRight 0.5s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="65" cy="65" r={radius} fill="none" stroke={over ? "#c06060" : "#d4a853"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} style={{ transition: "stroke-dasharray 0.5s ease" }} />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>{totalCalories}</div>
                <div style={{ fontSize: "11px", opacity: 0.5 }}>kcal</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", opacity: 0.5, marginBottom: "6px" }}>Today's Intake</div>
              <div style={{ fontSize: "28px", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif" }}>
                {totalCalories} <span style={{ fontSize: "14px", opacity: 0.5 }}>/ {goal} kcal</span>
              </div>
              <div style={{ marginTop: "8px", fontSize: "12px", fontWeight: 500, color: over ? "#c06060" : totalCalories > goal * 0.8 ? "#e8bc6a" : "#6b9d6b" }}>
                {over ? `⚠ ${totalCalories - goal} kcal over limit` : `${goal - totalCalories} kcal remaining`}
              </div>
            </div>
          </div>
          
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />
          
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
             <div><span style={{ fontSize: "12px", opacity: 0.5, display: "block" }}>Protein</span><span style={{ fontSize: "16px", fontWeight: 500 }}>{totalProtein.toFixed(1)}g</span></div>
             <div><span style={{ fontSize: "12px", opacity: 0.5, display: "block" }}>Carbs</span><span style={{ fontSize: "16px", fontWeight: 500 }}>{totalCarbs.toFixed(1)}g</span></div>
             <div><span style={{ fontSize: "12px", opacity: 0.5, display: "block" }}>Fat</span><span style={{ fontSize: "16px", fontWeight: 500 }}>{totalFat.toFixed(1)}g</span></div>
          </div>
        </div>

        {/* SEARCH */}
        <input
          id="food-search"
          placeholder="🔍  Search 500+ foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "14px 18px", borderRadius: "14px", marginBottom: "20px", background: currentTheme.inputBg, color: currentTheme.text, border: `1px solid ${currentTheme.border}`, fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s" }}
        />

        {/* FOOD GRID */}
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "20px", marginBottom: "16px", color: currentTheme.text }}>Food Catalog</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
          {displayFoods.map((f, i) => (
            <div
              key={`${f.name}-${i}`}
              onClick={() => addFood(f)}
              style={{ background: currentTheme.card, borderRadius: "14px", overflow: "hidden", cursor: "pointer", border: `1px solid ${currentTheme.border}`, transition: "transform 0.2s ease, box-shadow 0.2s ease", display: "flex", flexDirection: "column" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 24px rgba(0,0,0,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              {f.image ? (
                <div style={{ width: "100%", height: "100px", backgroundImage: `url(${f.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              ) : (
                <div style={{ width: "100%", height: "100px", background: f.color || "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>{f.emoji}</div>
              )}
              <div style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: currentTheme.text }}>{f.name}</div>
                <div style={{ fontSize: "12px", opacity: 0.6, marginTop: "4px", color: currentTheme.text }}>{f.calories} kcal</div>
              </div>
            </div>
          ))}
        </div>

        {/* BASKET */}
        <div style={{ marginTop: "40px", padding: "24px", background: currentTheme.card, border: `1px solid ${currentTheme.border}`, borderRadius: "20px" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "20px", marginBottom: "16px" }}>🧺 Your Basket</h3>
          {groupedFoods.length === 0 && <p style={{ opacity: 0.4, fontSize: "13px" }}>Tap on a food above to add it here</p>}
          {groupedFoods.map((f, i) => (
            <div key={`basket-${f.name}-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {f.image ? (
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundImage: `url(${f.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                ) : (
                  <span style={{ fontSize: "20px" }}>{f.emoji}</span>
                )}
                <div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>{f.name} <span style={{ opacity: 0.5, fontSize: "12px", marginLeft: "4px" }}>×{f.count}</span></div>
                  <div style={{ fontSize: "12px", color: "#d4a853", marginTop: "2px" }}>{f.calories * f.count} kcal</div>
                </div>
              </div>
              <button onClick={() => removeFood(f.name)} style={{ background: "rgba(192,96,96,0.1)", border: "none", borderRadius: "8px", width: "28px", height: "28px", cursor: "pointer", color: "#c06060", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(192,96,96,0.2)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(192,96,96,0.1)"}>✕</button>
            </div>
          ))}
        </div>
      </div>
      <AIAssistant />
      <BottomNav />
    </div>
  );
}