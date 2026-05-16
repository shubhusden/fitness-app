"use client";
import { foods as allFoods, FoodItem } from "../data/foods";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AIAssistant from "../components/AIAssistant";
import { useTheme, ThemeKey, themes } from "../components/ThemeContext";
import { useToast } from "../components/ToastProvider";
import {
  fetchUser, fetchFoods, addFood as apiAddFood,
  removeFood as apiRemoveFood, clearFoods as apiClearFoods, fetchWorkoutLogs
} from "../lib/api-client";

const QUOTES = [
  "The body achieves what the mind believes.",
  "Take care of your body — it's the only place you have to live.",
  "Small daily improvements lead to stunning long-term results.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your only competition is who you were yesterday.",
  "Eat well. Move daily. Hydrate. Sleep. Repeat.",
];

interface UserData { name?: string; goal?: number; weight?: string; height?: string; gender?: string; }
interface DisplayFood extends FoodItem { image: string; color: string; count?: number; mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'; }

// Accurate unique Unsplash food photos keyed by exact food name
const FOOD_IMAGES: Record<string, string> = {
  Apple:   "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300&q=80",
  Banana:  "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&q=80",
  Orange:  "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&q=80",
  Mango:   "https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&q=80",
  Rice:    "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=300&q=80",
  Chicken: "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=300&q=80",
  Egg:     "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&q=80",
  Milk:    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80",
  Pizza:   "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80",
  Burger:  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80",
  Bread:   "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
  // Indian foods — each with a unique distinct photo
  Dosa:    "https://images.unsplash.com/photo-1668236543090-82eb5eada6a8?w=300&q=80",
  Idli:    "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80",
  Sambar:  "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&q=80",
  Upma:    "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=300&q=80",
  Poha:    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&q=80",
  Paneer:  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80",
  Biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80",
  Dal:     "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80",
  Roti:    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80",
  Paratha: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&q=80",
};
const DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=300&q=80";

const foodDB: DisplayFood[] = [
  { name: "Apple",   calories: 95,  protein: 0.5, carbs: 25,  fat: 0.3,  image: FOOD_IMAGES.Apple,   color: "#1e3326" },
  { name: "Banana",  calories: 105, protein: 1.3, carbs: 27,  fat: 0.4,  image: FOOD_IMAGES.Banana,  color: "#3d3a2a" },
  { name: "Rice",    calories: 200, protein: 4.3, carbs: 45,  fat: 0.4,  image: FOOD_IMAGES.Rice,    color: "#2f2f2f" },
  { name: "Chicken", calories: 165, protein: 31,  carbs: 0,   fat: 3.6,  image: FOOD_IMAGES.Chicken, color: "#3d2f2a" },
  { name: "Egg",     calories: 78,  protein: 6.3, carbs: 0.6, fat: 5.3,  image: FOOD_IMAGES.Egg,     color: "#3a3a2a" },
  { name: "Milk",    calories: 150, protein: 8,   carbs: 12,  fat: 8,    image: FOOD_IMAGES.Milk,    color: "#2a2f3d" },
  { name: "Pizza",   calories: 285, protein: 12,  carbs: 36,  fat: 10,   image: FOOD_IMAGES.Pizza,   color: "#3d2a2a" },
  { name: "Burger",  calories: 354, protein: 20,  carbs: 29,  fat: 17,   image: FOOD_IMAGES.Burger,  color: "#3d2f1f" },
  { name: "Bread",   calories: 80,  protein: 2.7, carbs: 15,  fat: 1,    image: FOOD_IMAGES.Bread,   color: "#3a3528" },
  { name: "Dosa",    calories: 168, protein: 3.9, carbs: 27,  fat: 5,    image: FOOD_IMAGES.Dosa,    color: "#2f2a1f" },
  { name: "Idli",    calories: 58,  protein: 2,   carbs: 12,  fat: 0.4,  image: FOOD_IMAGES.Idli,    color: "#2a2f2a" },
  { name: "Sambar",  calories: 120, protein: 5,   carbs: 18,  fat: 3,    image: FOOD_IMAGES.Sambar,  color: "#3d2a1f" },
  { name: "Upma",    calories: 180, protein: 4.5, carbs: 28,  fat: 5,    image: FOOD_IMAGES.Upma,    color: "#3a3528" },
  { name: "Poha",    calories: 130, protein: 3.5, carbs: 23,  fat: 3,    image: FOOD_IMAGES.Poha,    color: "#3d3a1f" },
  { name: "Paneer",  calories: 265, protein: 18,  carbs: 1.2, fat: 21,   image: FOOD_IMAGES.Paneer,  color: "#3a3528" },
];

function getGreeting(hour: number): string {
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

export default function Dashboard() {
  const router = useRouter();
  const { theme, setTheme, colors } = useTheme();
  const { toast } = useToast();

  const popularMeals = {
    breakfast: ["Egg", "Banana", "Milk", "Bread", "Dosa", "Idli", "Upma", "Poha", "Aloo Paratha"],
    lunch: ["Rice", "Chicken", "Chapati", "Dal Tadka", "Paneer Butter Masala", "Chicken Biryani", "Rajma"],
    dinner: ["Chapati", "Chicken Curry", "Dal Fry", "Palak Paneer", "Fried Rice", "Curd Rice"],
    snack: ["Apple", "Banana", "Samosa", "Pakora", "Burger", "Pizza", "Maggi"]
  };
  const [foods, setFoods] = useState<DisplayFood[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [waterCups, setWaterCups] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeMealAdd, setActiveMealAdd] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | null>(null);
  const [mealSearchQuery, setMealSearchQuery] = useState("");
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedFoods = localStorage.getItem("foods");
    const storedLogs = localStorage.getItem("workoutLogs");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedLogs) setWorkoutLogs(JSON.parse(storedLogs));
    
    // Migration: Any existing food without a mealType becomes a 'snack'
    if (storedFoods) {
      const parsed = JSON.parse(storedFoods);
      const migrated = parsed.map((f: any) => ({ ...f, mealType: f.mealType || 'snack' }));
      setFoods(migrated);
    }

    // Water intake (resets daily)
    const todayKey = new Date().toDateString();
    const storedWater = localStorage.getItem("water_" + todayKey);
    if (storedWater) setWaterCups(parseInt(storedWater));

    // Streak calculation
    const logs = JSON.parse(localStorage.getItem("dailyLogs") || "[]") as string[];
    const today = new Date().toDateString();
    if (!logs.includes(today)) {
      const updated = [...logs.filter((d: string) => {
        const diff = (new Date().getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      }), today];
      localStorage.setItem("dailyLogs", JSON.stringify(updated));
    }
    const sortedLogs = JSON.parse(localStorage.getItem("dailyLogs") || "[]").sort();
    let s = 0;
    for (let i = sortedLogs.length - 1; i >= 0; i--) {
      const expected = new Date();
      expected.setDate(expected.getDate() - (sortedLogs.length - 1 - i));
      if (sortedLogs[i] === expected.toDateString()) s++;
      else break;
    }
    setStreak(s);

    fetchUser().then((u) => { if (u) setUser(u); });
    fetchFoods().then((f) => { 
      if (f.length > 0) {
        const migrated = f.map((item: any) => ({ ...item, mealType: item.mealType || 'snack' }));
        setFoods(migrated as DisplayFood[]); 
      }
    });
    fetchWorkoutLogs().then(logs => {
      if (logs && logs.length > 0) setWorkoutLogs(logs);
    });
  }, []);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const addFood = (food: DisplayFood, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setFoods((prev) => {
      const updated = [...prev, { ...food, mealType }];
      localStorage.setItem("foods", JSON.stringify(updated));
      apiAddFood({ name: food.name, calories: food.calories, color: food.color, mealType });
      return updated;
    });
    setActiveMealAdd(null); // Close inline dropdown
    setMealSearchQuery("");
    toast(`${food.name} added to ${mealType}`, "success");
  };

  const addWater = () => {
    const next = Math.min(waterCups + 1, 8);
    setWaterCups(next);
    localStorage.setItem("water_" + new Date().toDateString(), String(next));
    if (next === 8) toast("Daily water goal reached! 🎉", "success");
  };

  const removeWater = () => {
    const next = Math.max(waterCups - 1, 0);
    setWaterCups(next);
    localStorage.setItem("water_" + new Date().toDateString(), String(next));
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
    toast(`${name} removed`, "info");
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
  
  const todayLogs = workoutLogs.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString());
  const totalBurned = todayLogs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);

  const goal = user?.goal || 2000;
  const remaining = goal - totalCalories + totalBurned;
  const progress = Math.min((totalCalories / (goal + totalBurned)) * 100, 100);
  const over = remaining < 0;

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

  const todayQuote = QUOTES[new Date().getDay() % QUOTES.length];

  return (
    <div className="main-content" style={{ minHeight: "100vh", paddingBottom: "100px", position: "relative" }}>
      <style>{`
        .hide-mobile { display: inline; }
        .macros-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        .meals-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        .dashboard-header { display: flex; gap: 24px; align-items: center; margin-bottom: 48px; }
        @media (min-width: 640px) {
          .macros-grid { grid-template-columns: 1fr 1fr 1fr; }
          .meals-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .hide-mobile { display: none; }
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
      `}</style>


      {/* TOP RIGHT CONTROLS */}
      <div style={{ position: "fixed", top: "20px", right: "24px", display: "flex", gap: "10px", zIndex: 1000, alignItems: "center" }}>
        {/* Theme selector pill */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ position: "absolute", left: "12px", pointerEvents: "none", color: colors.accent, display: "flex" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          </span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeKey)}
            style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "9px 32px 9px 34px", color: colors.text, fontSize: "13px", cursor: "pointer", appearance: "none", backdropFilter: "blur(10px)", fontWeight: 600 }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="strava">Strava (Orange)</option>
            <option value="nike">Nike (Volt)</option>
          </select>
          <span style={{ position: "absolute", right: "10px", pointerEvents: "none", opacity: 0.4, display: "flex" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
          </span>
        </div>

        <button onClick={handleRefresh} title="Clear today's basket" className="btn-premium" style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "9px 14px", cursor: "pointer", color: colors.text, display: "flex", alignItems: "center", gap: "7px", backdropFilter: "blur(10px)", fontSize: "13px", fontWeight: 600 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span className="hide-mobile">Clear Today</span>
        </button>

        <button onClick={handleReset} title="Reset all data" className="btn-premium" style={{ background: "rgba(192,96,96,0.08)", border: "1px solid rgba(192,96,96,0.25)", borderRadius: "12px", padding: "9px 14px", cursor: "pointer", color: "#c06060", display: "flex", alignItems: "center", gap: "7px", backdropFilter: "blur(10px)", fontSize: "13px", fontWeight: 600 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          <span className="hide-mobile">Reset</span>
        </button>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        {/* HEADER */}
        <div className="dashboard-header">
          <div style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}>
            <svg width="80" height="80" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="56" fill="none" stroke={colors.accentMuted} strokeWidth="1.5" />
              <circle cx="60" cy="60" r="52" fill="rgba(0,0,0,0.2)" stroke={colors.accentMuted} strokeWidth="0.5" />
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                return (
                  <line key={i} x1={60 + 44 * Math.cos(angle)} y1={60 + 44 * Math.sin(angle)} x2={60 + (i % 3 === 0 ? 38 : 41) * Math.cos(angle)} y2={60 + (i % 3 === 0 ? 38 : 41) * Math.sin(angle)} stroke={i % 3 === 0 ? colors.accent : "rgba(255,255,255,0.2)"} strokeWidth={i % 3 === 0 ? 2 : 1} strokeLinecap="round" />
                );
              })}
              <line x1="60" y1="60" x2={60 + 28 * Math.cos((hourDeg - 90) * (Math.PI / 180))} y2={60 + 28 * Math.sin((hourDeg - 90) * (Math.PI / 180))} stroke={colors.text} strokeWidth="3" strokeLinecap="round" />
              <line x1="60" y1="60" x2={60 + 36 * Math.cos((minuteDeg - 90) * (Math.PI / 180))} y2={60 + 36 * Math.sin((minuteDeg - 90) * (Math.PI / 180))} stroke={colors.text} strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="60" x2={60 + 40 * Math.cos((secondDeg - 90) * (Math.PI / 180))} y2={60 + 40 * Math.sin((secondDeg - 90) * (Math.PI / 180))} stroke={colors.accent} strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: colors.accent, marginBottom: "4px", fontWeight: 600, letterSpacing: "1px" }}>
              {greeting.toUpperCase()} • {timeStr}
            </p>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 300, margin: 0 }}>
              Welcome back, <span style={{ color: colors.accent }}>{user?.name || "there"}</span>
            </h1>
            <p style={{ fontSize: "14px", opacity: 0.5, marginTop: "4px" }}>{dateStr}</p>
          </div>
        </div>

        {/* DAILY QUOTE BANNER */}
        <div className="bento-card" style={{ marginBottom: "28px", borderRadius: "16px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "14px", animation: "fadeUp 0.4s ease both", borderLeft: `3px solid ${colors.accent}` }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.accent, flexShrink: 0, opacity: 0.7 }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          <p style={{ margin: 0, fontSize: "13px", fontStyle: "italic", opacity: 0.75, lineHeight: 1.5 }}>{todayQuote}</p>
        </div>

        {/* CALORIE RING & MACROS */}
        <div className="bento-card" style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px", borderRadius: "28px", padding: "32px", animation: "fadeUp 0.6s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="70" cy="70" r={radius} fill="none" stroke={over ? "#c06060" : colors.accent} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{totalCalories}</div>
                <div style={{ fontSize: "12px", opacity: 0.5 }}>KCAL</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", opacity: 0.4, fontWeight: 700, letterSpacing: "1px", marginBottom: "8px" }}>CALORIES REMAINING</div>
              
              <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{goal}</div>
                  <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 700, letterSpacing: "0.5px" }}>GOAL</div>
                </div>
                <div style={{ opacity: 0.4, fontWeight: 700 }}>−</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{totalCalories}</div>
                  <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 700, letterSpacing: "0.5px" }}>FOOD</div>
                </div>
                <div style={{ opacity: 0.4, fontWeight: 700 }}>+</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "'Inter', sans-serif", color: colors.accent }}>{totalBurned}</div>
                  <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 700, letterSpacing: "0.5px", color: colors.accent }}>EXERCISE</div>
                </div>
                <div style={{ opacity: 0.4, fontWeight: 700 }}>=</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "26px", fontWeight: 700, fontFamily: "'Inter', sans-serif", color: over ? "#c06060" : colors.text }}>{Math.abs(remaining)}</div>
                  <div style={{ fontSize: "10px", opacity: 0.5, fontWeight: 700, letterSpacing: "0.5px" }}>{over ? "OVER" : "LEFT"}</div>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* MACRO BARS */}
          <div style={{ height: "1px", background: colors.border }} />
          <div className="macros-grid">
            {[
              { label: "PROTEIN", val: totalProtein, g: user?.weight ? parseFloat(user.weight as string) * 1.8 : 120, color: "#60a5fa" },
              { label: "CARBS",   val: totalCarbs,   g: goal * 0.5 / 4,  color: colors.accent },
              { label: "FAT",     val: totalFat,     g: goal * 0.3 / 9,  color: "#f472b6" },
            ].map(({ label, val, g, color }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "10px", opacity: 0.4, fontWeight: 700, letterSpacing: "1px" }}>{label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{val.toFixed(0)}<span style={{ opacity: 0.4, fontSize: "10px" }}>g</span></span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((val / g) * 100, 100)}%`, background: color, borderRadius: "2px", transition: "width 0.8s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WATER + STREAK ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
          {/* Water Intake */}
          <div className="bento-card" style={{ borderRadius: "20px", padding: "22px 24px", position: "relative", overflow: "hidden" }}>
            {/* Background Liquid Fill Effect */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${(waterCups / 8) * 100}%`, background: "linear-gradient(180deg, rgba(96,165,250,0.1) 0%, rgba(96,165,250,0.2) 100%)", transition: "height 0.8s cubic-bezier(0.4, 0, 0.2, 1)", zIndex: 0 }} />
            
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(96,165,250,0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={waterCups > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: 700, opacity: 0.45, letterSpacing: "1px", margin: 0 }}>WATER</p>
                    <p style={{ fontSize: "22px", fontWeight: 700, fontFamily: "'Inter', sans-serif", margin: "0", color: waterCups >= 8 ? "#60a5fa" : colors.text }}>
                      {waterCups}<span style={{ fontSize: "14px", opacity: 0.4, fontWeight: 400 }}> / 8 glasses</span>
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={removeWater} disabled={waterCups === 0} style={{ width: "32px", height: "32px", borderRadius: "10px", border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", opacity: waterCups === 0 ? 0.3 : 1 }}>−</button>
                  <button onClick={addWater} disabled={waterCups === 8} style={{ width: "32px", height: "32px", borderRadius: "10px", border: "none", background: "#60a5fa", color: "#fff", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", opacity: waterCups === 8 ? 0.5 : 1 }}>+</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "5px", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${(waterCups / 8) * 100}%`, height: "100%", background: "#60a5fa", transition: "width 0.5s ease" }} />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bento-card" style={{ borderRadius: "20px", padding: "22px 24px", display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${colors.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.292 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            </div>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, opacity: 0.45, letterSpacing: "1px", margin: 0 }}>DAY STREAK</p>
              <p style={{ fontSize: "28px", fontWeight: 700, fontFamily: "'Inter', sans-serif", margin: "4px 0 0", color: colors.accent }}>{streak}<span style={{ fontSize: "14px", opacity: 0.4, fontWeight: 400, marginLeft: "4px" }}>days</span></p>
              <p style={{ fontSize: "11px", opacity: 0.4, margin: "2px 0 0" }}>{streak > 0 ? "Keep it up!" : "Log food to start your streak"}</p>
            </div>
          </div>
        </div>

        {/* MEALS LOG (MOVED TO TOP) */}
        <div style={{ marginBottom: "48px" }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "28px", marginBottom: "24px" }}>
            Daily Log
          </h3>
          
          <div className="meals-grid">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => {
              const mealFoods = groupedFoods.filter(f => f.mealType === meal);
              
              const mealCalories = mealFoods.reduce((sum, f) => sum + (f.calories * (f.count || 1)), 0);
              const mealTitles = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snacks" };

              return (
                <div key={meal} className="bento-card" style={{ padding: "24px", borderRadius: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", textTransform: "capitalize" }}>
                      <span style={{ color: colors.accent }}>•</span> {mealTitles[meal]}
                    </h4>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: colors.accent }}>{mealCalories} kcal</span>
                  </div>
                  
                  {mealFoods.length === 0 ? (
                    <p style={{ opacity: 0.4, fontSize: "13px", fontStyle: "italic", margin: "0 0 16px 0" }}>No foods logged yet.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
                      {mealFoods.map((f, i) => (
                        <div key={`basket-${f.name}-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: `1px solid ${colors.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <img src={f.image} alt={f.name} style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "14px" }}>{f.name} <span style={{ opacity: 0.4, fontSize: "12px", fontWeight: 400, marginLeft: "6px" }}>×{f.count}</span></div>
                              <div style={{ fontSize: "12px", color: colors.accent, marginTop: "2px" }}>{f.calories * (f.count || 1)} kcal</div>
                            </div>
                          </div>
                          <button onClick={() => removeFood(f.name)} style={{ background: "transparent", border: "none", color: "#c06060", cursor: "pointer", opacity: 0.6, transition: "all 0.2s", padding: "6px" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "1"} onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeMealAdd === meal ? (
                    <div style={{ marginTop: "16px", padding: "16px", background: "rgba(0,0,0,0.15)", borderRadius: "16px", border: `1px solid ${colors.border}`, animation: "fadeIn 0.2s ease" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, opacity: 0.5, letterSpacing: "1px" }}>SEARCH {meal.toUpperCase()}</span>
                        <button onClick={() => { setActiveMealAdd(null); setMealSearchQuery(""); }} style={{ background: "none", border: "none", color: colors.text, opacity: 0.5, cursor: "pointer", padding: "0" }}>✕</button>
                      </div>
                      <input
                        autoFocus
                        placeholder={`Search to add to ${mealTitles[meal]}...`}
                        value={mealSearchQuery}
                        onChange={(e) => setMealSearchQuery(e.target.value)}
                        style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", background: colors.card, border: `1px solid ${colors.border}`, color: colors.text, outline: "none", fontSize: "14px", marginBottom: "12px" }}
                      />
                      <div style={{ display: "grid", gap: "8px", maxHeight: "200px", overflowY: "auto", paddingRight: "4px" }}>
                        {(() => {
                          const defaultFoodsForMeal = allFoods.filter(f => popularMeals[meal as keyof typeof popularMeals]?.includes(f.name));
                          const foodsToDisplay = mealSearchQuery ? allFoods.filter(f => f.name.toLowerCase().includes(mealSearchQuery.toLowerCase())) : defaultFoodsForMeal;
                          return foodsToDisplay.slice(0, 10).map((f, i) => {
                          const img = (f as any).image || FOOD_IMAGES[f.name] || DEFAULT_FOOD_IMAGE;
                          return (
                            <div key={i} onClick={() => addFood({ ...f, image: img, color: FOOD_IMAGES[f.name] ? "#2a2a2a" : "#2a2a2a" }, meal)} className="btn-premium" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: colors.card, borderRadius: "10px", cursor: "pointer", transition: "all 0.2s" }}>
                              <img src={img} alt={f.name} style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "cover" }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "13px", fontWeight: 600 }}>{f.name}</div>
                                <div style={{ fontSize: "11px", color: colors.accent, fontWeight: 700 }}>{f.calories} kcal</div>
                              </div>
                              <span style={{ color: colors.accent, fontSize: "16px", fontWeight: 300 }}>+</span>
                            </div>
                          );
                        })})()}
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setActiveMealAdd(meal); setMealSearchQuery(""); }} className="btn-premium" style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.03)", border: `1px dashed ${colors.border}`, borderRadius: "12px", color: colors.text, cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.text; }}>
                      + ADD FOOD
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AIAssistant userData={user} foods={foods} />
      <Sidebar />

      <style jsx>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}