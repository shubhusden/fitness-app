"use client";

import { useState, useEffect, useRef } from "react";
import BottomNav from "../components/BottomNav";
import {
  fetchUser,
  fetchWorkoutLogs,
  logWorkout as apiLogWorkout,
  syncWorkoutLogs,
} from "../lib/api-client";

interface UserData {
  name?: string;
  weight?: string;
  height?: string;
  goal?: number;
}

interface WorkoutLog {
  exercise: string;
  sets: number;
  reps: number;
  timestamp: number;
}

const sectionMeta: Record<string, { emoji: string; color: string }> = {
  Cardio:    { emoji: "🏃", color: "rgba(96, 165, 250, 0.12)" },
  Abs:       { emoji: "🔥", color: "rgba(251, 146, 60, 0.12)" },
  Chest:     { emoji: "💪", color: "rgba(248, 113, 113, 0.12)" },
  Back:      { emoji: "🦅", color: "rgba(52, 211, 153, 0.12)" },
  Biceps:    { emoji: "💪", color: "rgba(212, 168, 83, 0.12)" },
  Triceps:   { emoji: "🔱", color: "rgba(167, 139, 250, 0.12)" },
  Shoulders: { emoji: "🎯", color: "rgba(244, 114, 182, 0.12)" },
  Legs:      { emoji: "🦵", color: "rgba(45, 212, 191, 0.12)" },
};

const videoMap: Record<string, string> = {
  Running: "brFHyOtTwH4",
  Cycling: "V8Xz6c5g9nQ",
  "Jump Rope": "1BZM7z6F2cQ",
  HIIT: "UBMk30rjy0o",
  Walking: "kZ2xW8n2Yw0",
  Swimming: "7V2y9cYH9X8",

  Crunches: "Xyd_fa5zoEU",
  Plank: "ASdvN_XEl_c",
  "Leg Raises": "JB2oyawG9KI",
  "Russian Twists": "wkD8rjkodUI",
  "Mountain Climbers": "nmwgirgXLYM",
  "Bicycle Crunch": "9FGilxCbdz8",

  "Bench Press": "gRVjAtPip0Y",
  "Incline Dumbbell Press": "8iPEnn-ltC8",
  "Chest Fly": "eozdVDA78K0",
  "Push Ups": "IODxDxX7oi4",
  "Cable Crossover": "taI4XduLpTk",
  "Decline Press": "LfyQBUKR8SE",

  "Pull Ups": "eGo4IYlbE5g",
  "Lat Pulldown": "CAwf7n6Luuc",
  Deadlift: "op9kVnSso6Q",
  "Seated Row": "GZbfZ033f74",
  "T-Bar Row": "j3Igk5nyZE4",
  Hyperextensions: "ph3pddpKzzw",

  "Barbell Curl": "kwG2ipFRgfo",
  "Dumbbell Curl": "ykJmrZ5v0Oo",
  "Hammer Curl": "zC3nLlEvin4",
  "Preacher Curl": "fIWP-FRFNU0",
  "Cable Curl": "av7-8igSXTs",
  "Concentration Curl": "soxrZlIl35U",

  "Tricep Pushdown": "2-LAMcpzODU",
  "Skull Crushers": "d_KZxkY_0cM",
  Dips: "2z8JmcrW-As",
  "Overhead Extension": "YbX7Wd8jQ-Q",
  "Close Grip Bench": "nEF0bv2FW94",
  Kickbacks: "ZO81bExngMI",

  "Shoulder Press": "B-aVuyhvLHU",
  "Lateral Raise": "3VcKaXpzqRo",
  "Front Raise": "hRJ6tR5-if0",
  "Arnold Press": "v_jhP6Jr9bQ",
  Shrugs: "cJRVVxmytaM",
  "Reverse Fly": "ea0P6p8N5kQ",

  Squats: "aclHkVaku9U",
  "Leg Press": "IZxyjW7MPJQ",
  Lunges: "QOVaHwm-Q6U",
  "Hamstring Curl": "1Tq3QdYUuHs",
  "Calf Raises": "YMmgqO8Jo-k",
  "Leg Extension": "YyvSfVjQeL0",
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

export default function WorkoutPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  // Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set/Rep tracker
  const [logSets, setLogSets] = useState(3);
  const [logReps, setLogReps] = useState(12);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [logSaved, setLogSaved] = useState(false);

  // Load user data and workout logs
  useEffect(() => {
    // Load from localStorage first for instant display
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const storedLogs = localStorage.getItem("workoutLogs");
    if (storedLogs) setWorkoutLogs(JSON.parse(storedLogs));

    // Then fetch from backend API
    fetchUser().then((u) => { if (u) setUser(u); });
    fetchWorkoutLogs().then((logs) => { if (logs.length > 0) setWorkoutLogs(logs); });
  }, []);

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h.toString().padStart(2, "0") + ":" : ""}${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const logExercise = () => {
    if (!selectedExercise) return;
    const entry: WorkoutLog = {
      exercise: selectedExercise,
      sets: logSets,
      reps: logReps,
      timestamp: Date.now(),
    };
    const updated = [...workoutLogs, entry];
    setWorkoutLogs(updated);
    localStorage.setItem("workoutLogs", JSON.stringify(updated));

    // Sync to backend
    apiLogWorkout(entry);

    setLogSaved(true);
    setTimeout(() => setLogSaved(false), 2000);
  };

  const weight = user?.weight ? parseFloat(user.weight) : 70;
  const targetWeight = Math.round(weight * 0.93);
  const todayLogs = workoutLogs.filter(
    (l) => new Date(l.timestamp).toDateString() === new Date().toDateString()
  );
  const todayTotalSets = todayLogs.reduce((sum, l) => sum + l.sets, 0);

  return (
    <div
      style={{
        background: "#0e0d0b",
        color: "#f0ebe0",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: "80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orb */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)",
          top: "-100px",
          right: "-80px",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "14px", color: "#d4a853", marginBottom: "4px", fontWeight: 500 }}>
            🏋️ Workout Zone
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 300,
              margin: 0,
            }}
          >
            Train <em style={{ color: "#d4a853" }}>smarter</em>, not harder
          </h1>
        </div>

        {/* ═══ STATS CARDS ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Your Weight", value: `${weight} kg`, icon: "⚖️" },
            { label: "Target Weight", value: `${targetWeight} kg`, icon: "🎯" },
            { label: "Today's Sets", value: `${todayTotalSets}`, icon: "📊" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px",
                padding: "18px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>{stat.icon}</div>
              <p style={{ fontSize: "11px", color: "#7a7568", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                {stat.label}
              </p>
              <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* ═══ WORKOUT TIMER ═══ */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(20,19,17,0.9) 100%)",
            border: "1px solid rgba(212,168,83,0.15)",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#7a7568", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            ⏱ Workout Timer
          </p>
          <div
            style={{
              fontSize: "48px",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              letterSpacing: "4px",
              color: timerActive ? "#d4a853" : "#f0ebe0",
              transition: "color 0.3s ease",
            }}
          >
            {formatTime(timerSeconds)}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
            <button
              onClick={() => setTimerActive(!timerActive)}
              style={{
                padding: "10px 28px",
                borderRadius: "12px",
                border: "none",
                background: timerActive
                  ? "rgba(192,96,96,0.2)"
                  : "linear-gradient(135deg, #d4a853, #b8883a)",
                color: timerActive ? "#c06060" : "#0e0d0b",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {timerActive ? "⏸ Pause" : "▶ Start"}
            </button>
            <button
              onClick={() => {
                setTimerActive(false);
                setTimerSeconds(0);
              }}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#7a7568",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              ↻ Reset
            </button>
          </div>
        </div>

        {/* ═══ VIDEO PLAYER ═══ */}
        {selectedVideo && (
          <div
            style={{
              marginBottom: "24px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(212,168,83,0.15)",
              animation: "scaleIn 0.3s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                background: "rgba(20,19,17,0.95)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d4a853" }} />
                <span style={{ fontWeight: 500, fontSize: "14px" }}>
                  {selectedExercise || "Tutorial"}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setSelectedExercise(null);
                }}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  cursor: "pointer",
                  color: "#7a7568",
                  fontSize: "13px",
                }}
              >
                ✕ Close
              </button>
            </div>
            <iframe
              key={selectedVideo}
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{
                width: "100%",
                height: "280px",
                border: "none",
                display: "block",
              }}
            />
            {/* Fallback search link in case video is unavailable */}
            <div
              style={{
                padding: "10px 20px",
                background: "rgba(20,19,17,0.95)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
                color: "#7a7568",
              }}
            >
              <span>Video not loading?</span>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent((selectedExercise || "exercise") + " form tutorial")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#d4a853",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Search on YouTube →
              </a>
            </div>
          </div>
        )}

        {/* ═══ SET/REP TRACKER ═══ */}
        {selectedExercise && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "24px",
              marginBottom: "24px",
              animation: "scaleIn 0.3s ease both",
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: "18px",
                marginBottom: "16px",
              }}
            >
              📝 Log: <span style={{ color: "#d4a853" }}>{selectedExercise}</span>
            </h3>
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#7a7568", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Sets
                </label>
                <input
                  type="number"
                  value={logSets}
                  onChange={(e) => setLogSets(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: "70px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#f0ebe0",
                    fontSize: "16px",
                    fontWeight: 600,
                    textAlign: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ fontSize: "18px", color: "#7a7568", alignSelf: "center", paddingBottom: "6px" }}>×</div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "#7a7568", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Reps
                </label>
                <input
                  type="number"
                  value={logReps}
                  onChange={(e) => setLogReps(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: "70px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#f0ebe0",
                    fontSize: "16px",
                    fontWeight: 600,
                    textAlign: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                  }}
                />
              </div>
              <button
                onClick={logExercise}
                style={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #d4a853, #b8883a)",
                  color: "#0e0d0b",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                ✓ Log Set
              </button>
              {logSaved && (
                <span style={{ fontSize: "13px", color: "#d4a853", animation: "fadeUp 0.3s ease" }}>
                  ✓ Saved!
                </span>
              )}
            </div>

            {/* Today's logs for this exercise */}
            {todayLogs.filter((l) => l.exercise === selectedExercise).length > 0 && (
              <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                <p style={{ fontSize: "11px", color: "#7a7568", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                  Today's Log
                </p>
                {todayLogs
                  .filter((l) => l.exercise === selectedExercise)
                  .map((l, i) => (
                    <div
                      key={i}
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "8px",
                        background: "rgba(212,168,83,0.1)",
                        border: "1px solid rgba(212,168,83,0.15)",
                        marginRight: "6px",
                        marginBottom: "6px",
                        fontSize: "12px",
                        color: "#d4a853",
                      }}
                    >
                      {l.sets}×{l.reps}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ EXERCISE SECTIONS ═══ */}
        {Object.entries(sections).map(([section, exercises]) => {
          const meta = sectionMeta[section] || { emoji: "🏋️", color: "rgba(255,255,255,0.05)" };
          const isActive = activeSection === section;

          return (
            <div key={section} style={{ marginBottom: "10px" }}>
              {/* Section header */}
              <div
                onClick={() => setActiveSection(isActive ? null : section)}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${meta.color}, rgba(20,19,17,0.95))`
                    : "rgba(255,255,255,0.03)",
                  border: isActive
                    ? "1px solid rgba(212,168,83,0.2)"
                    : "1px solid rgba(255,255,255,0.05)",
                  padding: "18px 20px",
                  borderRadius: isActive ? "16px 16px 4px 4px" : "16px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.25s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "22px" }}>{meta.emoji}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{section}</h3>
                    <p style={{ margin: 0, fontSize: "12px", color: "#7a7568" }}>
                      {exercises.length} exercises
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: isActive ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    color: isActive ? "#d4a853" : "#7a7568",
                    transition: "transform 0.25s ease",
                    transform: isActive ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </div>
              </div>

              {/* Exercises grid */}
              {isActive && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "8px",
                    padding: "12px",
                    background: "rgba(255,255,255,0.015)",
                    borderRadius: "0 0 16px 16px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderTop: "none",
                    animation: "scaleIn 0.25s ease both",
                  }}
                >
                  {exercises.map((ex, i) => {
                    const isSelected = selectedExercise === ex;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedVideo(videoMap[ex] || "");
                          setSelectedExercise(ex);
                        }}
                        style={{
                          background: isSelected
                            ? "rgba(212,168,83,0.12)"
                            : "rgba(255,255,255,0.03)",
                          border: isSelected
                            ? "1px solid rgba(212,168,83,0.3)"
                            : "1px solid rgba(255,255,255,0.05)",
                          padding: "14px",
                          borderRadius: "12px",
                          textAlign: "center",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? "#d4a853" : "#f0ebe0",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)";
                            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                          }
                        }}
                      >
                        {ex}
                        {/* Show badge if logged today */}
                        {todayLogs.some((l) => l.exercise === ex) && (
                          <span
                            style={{
                              display: "inline-block",
                              marginLeft: "6px",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#d4a853",
                              verticalAlign: "middle",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* ═══ TODAY'S WORKOUT SUMMARY ═══ */}
        {todayLogs.length > 0 && (
          <div
            style={{
              marginTop: "28px",
              padding: "24px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: "20px",
                marginBottom: "16px",
              }}
            >
              📋 Today&apos;s Workout Summary
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
              {Object.entries(
                todayLogs.reduce(
                  (acc: Record<string, { sets: number; reps: number[] }>, l) => {
                    if (!acc[l.exercise]) acc[l.exercise] = { sets: 0, reps: [] };
                    acc[l.exercise].sets += l.sets;
                    acc[l.exercise].reps.push(l.reps);
                    return acc;
                  },
                  {}
                )
              ).map(([ex, data]) => (
                <div
                  key={ex}
                  style={{
                    padding: "12px 16px",
                    background: "rgba(212,168,83,0.06)",
                    border: "1px solid rgba(212,168,83,0.1)",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>{ex}</span>
                  <span style={{ fontSize: "12px", color: "#d4a853" }}>
                    {data.sets} sets
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}