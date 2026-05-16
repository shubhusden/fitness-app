"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import AIAssistant from "../components/AIAssistant";
import { useTheme } from "../components/ThemeContext";
import { useToast } from "../components/ToastProvider";
import {
  fetchUser,
  fetchWorkoutLogs,
  logWorkout as apiLogWorkout,
} from "../lib/api-client";

interface UserData { name?: string; weight?: string; height?: string; goal?: number; }
interface WorkoutLog { exercise: string; sets: number; reps: number; timestamp: number; duration?: number; caloriesBurned?: number; intensity?: "Low" | "Moderate" | "High"; }

// Accurate Unsplash images per muscle group
const sectionMeta: Record<string, { image: string; color: string; accent: string; desc: string }> = {
  Cardio:    { image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80", color: "rgba(96,165,250,0.12)", accent: "#60a5fa", desc: "Endurance & Fat Burn" },
  Abs:       { image: "https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400&q=80", color: "rgba(251,146,60,0.12)",  accent: "#fb923c", desc: "Core Strength" },
  Chest:     { image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", color: "rgba(248,113,113,0.12)", accent: "#f87171", desc: "Push Power" },
  Back:      { image: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80", color: "rgba(52,211,153,0.12)",  accent: "#34d399", desc: "Pull Strength" },
  Biceps:    { image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80", color: "rgba(212,168,83,0.12)",  accent: "#d4a853", desc: "Peak & Volume" },
  Triceps:   { image: "https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&q=80", color: "rgba(167,139,250,0.12)", accent: "#a78bfa", desc: "Extension & Lock" },
  Shoulders: { image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80", color: "rgba(244,114,182,0.12)", accent: "#f472b6", desc: "Width & Definition" },
  Legs:      { image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80", color: "rgba(45,212,191,0.12)",  accent: "#2dd4bf", desc: "Power Base" },
};

// Real verified YouTube video IDs from top fitness channels
const videoMap: Record<string, string> = {
  // Cardio - verified IDs
  Running:             "kVnyY17VS9Y",
  Cycling:             "jHJBRxc6OMg",  // Indoor Cycling Technique
  "Jump Rope":         "u3zgHI8QnqE",
  HIIT:                "ml6cT4AZdqI",
  Walking:             "pBqFpme33cQ",
  Swimming:            "c_BBBPHCqwc",  // Freestyle Swimming Tutorial
  // Abs
  Crunches:            "Xyd_fa5zoEU",
  Plank:               "ASdvN_XEl_c",
  "Leg Raises":        "l4kQd9eWclE",
  "Russian Twists":    "wkD8rjkodUI",
  "Mountain Climbers": "cnyTQDSE884",
  "Bicycle Crunch":    "9FGilxCbdz8",  // Bicycle Crunch - Scott Herman
  // Chest
  "Bench Press":             "4Y2ZdHCOXok",
  "Incline Dumbbell Press":  "DbFgADa2PL8",
  "Chest Fly":               "eozdVDA78K0",
  "Push Ups":                "IODxDxX7oi4",
  "Cable Crossover":         "taI4XduLpTk",
  "Decline Press":           "LfyQBUKR8SE",  // Decline Bench Press Tutorial
  // Back
  "Pull Ups":      "eGo4IYlbE5g",
  "Lat Pulldown":  "CAwf7n6Luuc",
  Deadlift:        "op9kVnSso6Q",
  "Seated Row":    "GZbfZ033f74",
  "T-Bar Row":     "j3Igk5nyZE4",
  Hyperextensions: "ph3pddpKzzw",
  // Biceps
  "Barbell Curl":       "kwG2ipFRgfo",
  "Dumbbell Curl":      "ykJmrZ5v0Oo",
  "Hammer Curl":        "TwD-YGVP4Bk",
  "Preacher Curl":      "fIWP-FRFNU0",
  "Cable Curl":         "av7-8igSXTs",
  "Concentration Curl": "soxrZlIl35U",
  // Triceps
  "Tricep Pushdown":    "2-LAMcpzODU",
  "Skull Crushers":     "d_KZxkY_0cM",
  Dips:                 "2z8JmcrW-As",
  "Overhead Extension": "YbX7Wd8jQ-Q",
  "Close Grip Bench":   "nEF0bv2FW94",
  Kickbacks:            "ZO81bExngMI",
  // Shoulders
  "Shoulder Press": "B-aVuyhvLHU",
  "Lateral Raise":  "3VcKaXpzqRo",
  "Front Raise":    "hRJ6tR5-if0",
  "Arnold Press":   "68UKQyMF3vo",  // Arnold Press - full tutorial
  Shrugs:           "cJRVVxmytaM",
  "Reverse Fly":    "0GSh-OqqA58",  // Reverse Fly / Rear Delt Fly
  // Legs
  Squats:           "aclHkVaku9U",
  "Leg Press":      "IZxyjW7MPJQ",
  Lunges:           "QOVaHwm-Q6U",
  "Hamstring Curl": "1Tq3QdYUuHs",
  "Calf Raises":    "YMmgqO8Jo-k",
  "Leg Extension":  "YyvSfVjQeL0",
};


const sections: Record<string, string[]> = {
  Cardio: ["Running", "Cycling", "Jump Rope", "HIIT", "Walking", "Swimming"],
  Abs: ["Crunches", "Plank", "Leg Raises", "Russian Twists", "Mountain Climbers", "Bicycle Crunch"],
  Chest: ["Bench Press", "Incline Dumbbell Press", "Chest Fly", "Push Ups", "Cable Crossover", "Decline Press"],
  Back: ["Pull Ups", "Lat Pulldown", "Deadlift", "Seated Row", "T-Bar Row", "Hyperextensions"],
  Biceps: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Cable Curl", "Concentration Curl"],
  Triceps: ["Tricep Pushdown", "Skull Crushers", "Dips", "Overhead Extension", "Close Grip Bench", "Kickbacks"],
  Shoulders: ["Shoulder Press", "Lateral Raise", "Front Raise", "Arnold Press", "Shrugs", "Reverse Fly"],
  Legs: ["Squats", "Leg Press", "Lunges", "Hamstring Curl", "Calf Raises", "Leg Extension"],
};

const IconPlay = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const IconChevron = ({ up }: { up: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: up ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}><path d="m6 9 6 6 6-6"/></svg>
);

export default function WorkoutPage() {
  const { colors } = useTheme();
  const [activeSection, setActiveSection] = useState<string | null>("Chest");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [logSets, setLogSets] = useState(3);
  const [logReps, setLogReps] = useState(12);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const { toast } = useToast();
  const [activePlan, setActivePlan] = useState<any>(null);
  const [restTimer, setRestTimer] = useState(0);

  // Rest Timer Effect
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (restTimer > 0) {
      t = setTimeout(() => setRestTimer(r => r - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [restTimer]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    const storedLogs = localStorage.getItem("workoutLogs");
    if (storedLogs) setWorkoutLogs(JSON.parse(storedLogs));
    fetchUser().then((u) => { if (u) setUser(u); });
    fetchWorkoutLogs().then((logs) => { if (logs.length > 0) setWorkoutLogs(logs); });

    // Load Plan
    const storedPlan = localStorage.getItem("workoutPlan");
    const activeDay = localStorage.getItem("activeWorkoutDay");
    if (storedPlan) {
      const parsedPlan = JSON.parse(storedPlan);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const targetDay = activeDay || dayNames[new Date().getDay()];
      const todaysPlan = parsedPlan.find((p: any) => p.day === targetDay);
      if (todaysPlan) setActivePlan(todaysPlan);
      
      // Clear activeDay so it defaults to real current day next time
      if (activeDay) localStorage.removeItem("activeWorkoutDay");
    }
  }, []);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h.toString().padStart(2, "0") + ":" : ""}${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const logExercise = () => {
    if (!selectedExercise) return;
    const estDuration = logSets * 1.5; // 1.5 mins per set
    const calBurned = Math.round(estDuration * 6); // ~6 kcal per min for lifting
    const entry: WorkoutLog = { 
      exercise: selectedExercise, 
      sets: logSets, 
      reps: logReps, 
      timestamp: Date.now(),
      duration: estDuration,
      caloriesBurned: calBurned,
      intensity: "Moderate"
    };
    const updated = [...workoutLogs, entry];
    setWorkoutLogs(updated);
    localStorage.setItem("workoutLogs", JSON.stringify(updated));
    apiLogWorkout(entry);
    toast("Set logged successfully", "success");
    setRestTimer(60); // Start 60s rest timer
  };

  const selectPrescribedExercise = (ex: any) => {
    setSelectedVideo(videoMap[ex.name] || "");
    setSelectedExercise(ex.name);
    setLogSets(ex.sets);
    
    if (typeof ex.reps === "string") {
      if (ex.reps.includes("-")) {
        setLogReps(parseInt(ex.reps.split("-")[0]));
      } else if (ex.reps.includes("min")) {
        setLogReps(parseInt(ex.reps.replace(" min", "")));
      } else {
        setLogReps(parseInt(ex.reps) || 10);
      }
    } else {
      setLogReps(ex.reps || 10);
    }
    
    // Auto-scroll to the log section
    setTimeout(() => {
      document.getElementById("log-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const lastSession = useMemo(() => {
    if (!selectedExercise) return null;
    const pastLogs = workoutLogs
      .filter(l => l.exercise === selectedExercise && new Date(l.timestamp).toDateString() !== new Date().toDateString())
      .sort((a, b) => b.timestamp - a.timestamp);
    return pastLogs.length > 0 ? pastLogs[0] : null;
  }, [selectedExercise, workoutLogs]);

  const clearLog = () => {
    if (!window.confirm("Clear all today's workout logs?")) return;
    const updated = workoutLogs.filter(
      (l) => new Date(l.timestamp).toDateString() !== new Date().toDateString()
    );
    setWorkoutLogs(updated);
    localStorage.setItem("workoutLogs", JSON.stringify(updated));
    toast("Logs cleared", "info");
  };

  const todayLogs = workoutLogs.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString());
  const todayTotalSets = todayLogs.reduce((sum, l) => sum + l.sets, 0);
  const todayCalsBurned = todayLogs.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);
  const todayDuration = todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0);

  const stats = [
    { label: "CALS BURNED", value: `${todayCalsBurned} kcal`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.292 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> },
    { label: "EST. DURATION", value: `${Math.round(todayDuration)} min`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "SETS TODAY", value: `${todayTotalSets}`, icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5 17.5 17.5"/><path d="M22 17.5 17.5 22"/><path d="m22 22-4.5-4.5"/><path d="m2 6.5 4.5-4.5"/><path d="m2 2 4.5 4.5"/></svg> },
  ];

  return (
    <div className="main-content" style={{ minHeight: "100vh", paddingBottom: "100px", position: "relative" }}>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "60px 24px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "13px", color: colors.accent, marginBottom: "8px", fontWeight: 700, letterSpacing: "2px" }}>WORKOUT HUB</p>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 300, margin: 0 }}>
            Master your <span style={{ color: colors.accent }}>technique</span>
          </h1>
        </div>

        {/* STATS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", opacity: 0.4, fontWeight: 700, letterSpacing: "1px", margin: 0 }}>TODAY'S SESSION</p>
          {todayTotalSets > 0 && (
            <button
              onClick={clearLog}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "10px", border: "1px solid rgba(192,96,96,0.3)", background: "rgba(192,96,96,0.08)", color: "#c06060", cursor: "pointer", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(192,96,96,0.18)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(192,96,96,0.08)"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              CLEAR LOG
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {stats.map((stat, i) => (
            <div key={i} className="bento-card" style={{ borderRadius: "20px", padding: "24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{ color: colors.accent }}>{stat.icon}</div>
              <p style={{ fontSize: "10px", opacity: 0.5, fontWeight: 700, letterSpacing: "1px", margin: 0 }}>{stat.label}</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0, fontFamily: "'Inter', sans-serif" }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* TIMER */}
        <div className="bento-card" style={{ borderRadius: "24px", padding: "28px 32px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", background: `linear-gradient(135deg, ${colors.accentMuted}, transparent)` }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "8px", opacity: 0.5 }}>SESSION TIMER</p>
            <div style={{ fontSize: "52px", fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: "4px", color: timerActive ? colors.accent : colors.text, lineHeight: 1 }}>
              {formatTime(timerSeconds)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setTimerActive(!timerActive)} className="btn-premium" style={{ padding: "12px 28px", borderRadius: "14px", border: "none", background: timerActive ? "rgba(192,96,96,0.2)" : colors.accent, color: timerActive ? "#c06060" : "#0e0d0b", fontWeight: 700, fontSize: "13px", cursor: "pointer", letterSpacing: "1px" }}>
              {timerActive ? "PAUSE" : "START"}
            </button>
            <button onClick={() => { setTimerActive(false); setTimerSeconds(0); }} style={{ padding: "12px 20px", borderRadius: "14px", border: `1px solid ${colors.border}`, background: "transparent", color: colors.text, fontWeight: 600, fontSize: "13px", cursor: "pointer", opacity: 0.6 }}>
              RESET
            </button>
          </div>
        </div>

        {/* PRESCRIBED PLAN (If exists) */}
        {activePlan && (
          <div className="bento-card" style={{ marginBottom: "28px", borderRadius: "24px", padding: "32px", border: `1px solid ${colors.accent}40`, animation: "fadeUp 0.3s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: colors.accent, margin: "0 0 4px 0" }}>TODAY'S PLAN</p>
                <h3 style={{ fontSize: "22px", margin: 0, fontFamily: "'Inter', sans-serif" }}>{activePlan.focus}</h3>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", overflow: "hidden", background: colors.accentMuted }}>
                <img src={activePlan.image} alt={activePlan.focus} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            
            <div style={{ display: "grid", gap: "12px" }}>
              {activePlan.exercises.map((ex: any, i: number) => {
                const isSelected = selectedExercise === ex.name;
                const isLoggedToday = workoutLogs.some(l => l.exercise === ex.name && new Date(l.timestamp).toDateString() === new Date().toDateString());
                
                return (
                  <div 
                    key={i} 
                    onClick={() => selectPrescribedExercise(ex)}
                    className="btn-premium"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "16px", background: isSelected ? `${colors.accent}15` : colors.card, border: `1px solid ${isSelected ? colors.accent : colors.border}`, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: isLoggedToday ? colors.accent : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: isLoggedToday ? "#0e0d0b" : colors.text }}>
                        {isLoggedToday ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "15px", color: isSelected ? colors.accent : colors.text }}>{ex.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, opacity: 0.6 }}>{ex.sets} × {ex.reps}</span>
                      <span style={{ color: colors.accent, opacity: isSelected ? 1 : 0.4 }}><IconPlay /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIDEO PLAYER */}
        {selectedVideo && (
          <div className="bento-card" style={{ marginBottom: "28px", borderRadius: "24px", overflow: "hidden", animation: "scaleIn 0.3s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulseSubtle 1.5s infinite" }} />
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{selectedExercise}</span>
                <span style={{ fontSize: "11px", opacity: 0.4, fontWeight: 600, letterSpacing: "1px" }}>· TUTORIAL</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "12px", color: colors.accent, textDecoration: "none", fontWeight: 600, opacity: 0.7 }}
                >
                  Watch on YouTube ↗
                </a>
                <button onClick={() => { setSelectedVideo(null); setSelectedExercise(null); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: colors.text, cursor: "pointer", width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconClose />
                </button>
              </div>
            </div>
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", background: "#000" }}>
              <iframe
                key={selectedVideo}
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        )}

        {/* LOG TRACKER */}
        {selectedExercise && (
          <div id="log-section" className="bento-card" style={{ padding: "28px", marginBottom: "28px", borderRadius: "24px", animation: "fadeUp 0.4s ease both", border: `1px solid ${colors.accentMuted}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px", margin: "0 0 6px 0" }}>
                  Log: <span style={{ color: colors.accent }}>{selectedExercise}</span>
                </h3>
                {lastSession ? (
                  <p style={{ fontSize: "12px", margin: 0, opacity: 0.5, fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Last time: {lastSession.sets} sets × {lastSession.reps} reps ({new Date(lastSession.timestamp).toLocaleDateString()})
                  </p>
                ) : (
                  <p style={{ fontSize: "12px", margin: 0, opacity: 0.4, fontWeight: 600 }}>First time logging this exercise!</p>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "90px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, marginBottom: "8px", display: "block", letterSpacing: "1px" }}>SETS</label>
                <input type="number" value={logSets} onChange={(e) => setLogSets(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, textAlign: "center", fontSize: "20px", fontWeight: 700, outline: "none" }} />
              </div>
              <div style={{ fontSize: "22px", opacity: 0.3, paddingBottom: "12px", fontWeight: 300 }}>×</div>
              <div style={{ flex: 1, minWidth: "90px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, marginBottom: "8px", display: "block", letterSpacing: "1px" }}>REPS</label>
                <input type="number" value={logReps} onChange={(e) => setLogReps(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, textAlign: "center", fontSize: "20px", fontWeight: 700, outline: "none" }} />
              </div>
              <button onClick={logExercise} className="btn-premium" style={{ flex: 2, minWidth: "120px", padding: "14px", borderRadius: "12px", border: "none", background: colors.accent, color: "#0e0d0b", fontWeight: 700, cursor: "pointer", fontSize: "14px", letterSpacing: "1px" }}>LOG SET</button>
            </div>
          </div>
        )}

        {/* SECTIONS */}
        <div style={{ display: "grid", gap: "12px" }}>
          {Object.entries(sections).map(([section, exercises]) => {
            const meta = sectionMeta[section];
            const isActive = activeSection === section;
            return (
              <div key={section} style={{ borderRadius: "20px", overflow: "hidden", border: `1px solid ${isActive ? meta.accent + "40" : colors.border}`, transition: "all 0.3s" }}>
                {/* Section Header */}
                <div
                  onClick={() => setActiveSection(isActive ? null : section)}
                  style={{ display: "flex", alignItems: "center", gap: "0", cursor: "pointer", background: isActive ? colors.card : "rgba(255,255,255,0.02)", transition: "background 0.3s" }}
                >
                  {/* Image thumbnail */}
                  <div style={{ width: "80px", height: "72px", flexShrink: 0, overflow: "hidden" }}>
                    <img src={meta.image} alt={section} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, padding: "16px 20px" }}>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>{section}</div>
                    <div style={{ fontSize: "12px", opacity: 0.45, marginTop: "2px" }}>{meta.desc} · {exercises.length} exercises</div>
                  </div>
                  {/* Accent bar + chevron */}
                  <div style={{ padding: "0 20px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "3px", height: "28px", borderRadius: "2px", background: isActive ? meta.accent : "transparent", transition: "background 0.3s" }} />
                    <span style={{ color: colors.text, opacity: 0.4 }}><IconChevron up={isActive} /></span>
                  </div>
                </div>

                {/* Exercise Grid */}
                {isActive && (
                  <div style={{ padding: "16px 20px 20px", background: "rgba(0,0,0,0.15)", animation: "fadeIn 0.25s ease both" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
                      {exercises.map((ex) => {
                        const isSelected = selectedExercise === ex;
                        return (
                          <div
                            key={ex}
                            onClick={() => { setSelectedVideo(videoMap[ex] || ""); setSelectedExercise(ex); }}
                            className="btn-premium"
                            style={{
                              background: isSelected ? meta.accent + "20" : colors.card,
                              border: `1px solid ${isSelected ? meta.accent : colors.border}`,
                              borderRadius: "14px",
                              padding: "12px 14px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? meta.accent : colors.text,
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              transition: "all 0.2s",
                            }}
                          >
                            <span style={{ opacity: isSelected ? 1 : 0.35, color: meta.accent, flexShrink: 0 }}><IconPlay /></span>
                            {ex}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REST TIMER POPUP */}
      {restTimer > 0 && (
        <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 2000, background: colors.card, border: `2px solid ${colors.accent}`, borderRadius: "100px", padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.accent }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px" }}>REST</span>
          </div>
          <div style={{ fontSize: "24px", fontFamily: "'Inter', sans-serif", fontWeight: 700, minWidth: "60px", textAlign: "center" }}>
            0:{restTimer.toString().padStart(2, "0")}
          </div>
          <button onClick={() => setRestTimer(0)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: colors.text, borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0.6 }}>✕</button>
        </div>
      )}

      <Sidebar />
      <AIAssistant userData={user} />
    </div>
  );
}