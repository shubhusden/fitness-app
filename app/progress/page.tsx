"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import AIAssistant from "../components/AIAssistant";
import { useTheme } from "../components/ThemeContext";
import { fetchUser, fetchWorkoutLogs } from "../lib/api-client";

/* ─── Types ─── */
interface UserData {
  name?: string;
  weight?: string;
  height?: string;
  age?: string;
  gender?: string;
  goal?: number;
}

interface DayPlan {
  day: string;
  focus: string;
  image: string;
  color: string;
  exercises: { name: string; sets: number; reps: string }[];
}

// Accurate Unsplash images per muscle group
const WORKOUT_IMAGES: Record<string, string> = {
  Cardio:    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  Abs:       "https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400&q=80",
  Chest:     "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
  Back:      "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80",
  Biceps:    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80",
  Triceps:   "https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=400&q=80",
  Shoulders: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80",
  Legs:      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80",
};

const exercisePool: Record<string, { exercises: string[]; image: string; color: string }> = {
  Cardio:    { exercises: ["Running", "Cycling", "Jump Rope", "HIIT", "Walking", "Swimming"], image: WORKOUT_IMAGES.Cardio, color: "rgba(96, 165, 250, 0.15)" },
  Abs:       { exercises: ["Crunches", "Plank", "Leg Raises", "Russian Twists", "Mountain Climbers", "Bicycle Crunch"], image: WORKOUT_IMAGES.Abs, color: "rgba(251, 146, 60, 0.15)" },
  Chest:     { exercises: ["Bench Press", "Incline Dumbbell Press", "Chest Fly", "Push Ups", "Cable Crossover", "Decline Press"], image: WORKOUT_IMAGES.Chest, color: "rgba(248, 113, 113, 0.15)" },
  Back:      { exercises: ["Pull Ups", "Lat Pulldown", "Deadlift", "Seated Row", "T-Bar Row", "Hyperextensions"], image: WORKOUT_IMAGES.Back, color: "rgba(52, 211, 153, 0.15)" },
  Biceps:    { exercises: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Cable Curl", "Concentration Curl"], image: WORKOUT_IMAGES.Biceps, color: "rgba(212, 168, 83, 0.15)" },
  Triceps:   { exercises: ["Tricep Pushdown", "Skull Crushers", "Dips", "Overhead Extension", "Close Grip Bench", "Kickbacks"], image: WORKOUT_IMAGES.Triceps, color: "rgba(167, 139, 250, 0.15)" },
  Shoulders: { exercises: ["Shoulder Press", "Lateral Raise", "Front Raise", "Arnold Press", "Shrugs", "Reverse Fly"], image: WORKOUT_IMAGES.Shoulders, color: "rgba(244, 114, 182, 0.15)" },
  Legs:      { exercises: ["Squats", "Leg Press", "Lunges", "Hamstring Curl", "Calf Raises", "Leg Extension"], image: WORKOUT_IMAGES.Legs, color: "rgba(45, 212, 191, 0.15)" },
};

function generatePlan(days: number, goalType: string): DayPlan[] {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const repScheme = goalType === "lose" ? { sets: 4, reps: "12-15" } : goalType === "gain" ? { sets: 4, reps: "6-10" } : { sets: 3, reps: "10-12" };
  const cardioReps = goalType === "lose" ? "30 min" : goalType === "gain" ? "15 min" : "20 min";

  const splits: Record<number, { focus: string; muscles: string[] }[]> = {
    1: [{ focus: "Full Body + Cardio", muscles: ["Cardio", "Chest", "Back", "Legs", "Abs"] }],
    2: [
      { focus: "Upper Body + Cardio", muscles: ["Cardio", "Chest", "Back", "Shoulders", "Biceps", "Triceps"] },
      { focus: "Lower Body + Core", muscles: ["Cardio", "Legs", "Abs"] },
    ],
    3: [
      { focus: "Push (Chest, Shoulders, Triceps)", muscles: ["Chest", "Shoulders", "Triceps", "Abs"] },
      { focus: "Pull (Back, Biceps)", muscles: ["Back", "Biceps", "Cardio"] },
      { focus: "Legs + Cardio", muscles: ["Legs", "Cardio", "Abs"] },
    ],
    4: [
      { focus: "Chest + Triceps", muscles: ["Chest", "Triceps", "Abs"] },
      { focus: "Back + Biceps", muscles: ["Back", "Biceps"] },
      { focus: "Shoulders + Cardio", muscles: ["Shoulders", "Cardio", "Abs"] },
      { focus: "Legs + Core", muscles: ["Legs", "Abs", "Cardio"] },
    ],
    5: [
      { focus: "Chest", muscles: ["Chest", "Abs"] },
      { focus: "Back", muscles: ["Back", "Cardio"] },
      { focus: "Shoulders + Arms", muscles: ["Shoulders", "Biceps", "Triceps"] },
      { focus: "Legs", muscles: ["Legs", "Abs"] },
      { focus: "Cardio + Core", muscles: ["Cardio", "Abs", "Chest"] },
    ],
    6: [
      { focus: "Chest + Abs", muscles: ["Chest", "Abs"] },
      { focus: "Back + Cardio", muscles: ["Back", "Cardio"] },
      { focus: "Shoulders", muscles: ["Shoulders", "Abs"] },
      { focus: "Arms", muscles: ["Biceps", "Triceps"] },
      { focus: "Legs", muscles: ["Legs", "Cardio"] },
      { focus: "Full Body + Cardio", muscles: ["Cardio", "Abs", "Chest", "Back"] },
    ],
    7: [
      { focus: "Chest", muscles: ["Chest", "Abs"] },
      { focus: "Back", muscles: ["Back", "Cardio"] },
      { focus: "Shoulders", muscles: ["Shoulders", "Abs"] },
      { focus: "Biceps + Triceps", muscles: ["Biceps", "Triceps"] },
      { focus: "Legs", muscles: ["Legs", "Abs"] },
      { focus: "Cardio + Core", muscles: ["Cardio", "Abs"] },
      { focus: "Active Recovery + Cardio", muscles: ["Cardio", "Abs"] },
    ],
  };

  const clampedDays = Math.max(1, Math.min(7, days));
  const template = splits[clampedDays];

  return template.map((item, idx) => {
    const exercises: any[] = [];
    item.muscles.forEach((muscle) => {
      const pool = exercisePool[muscle];
      if (!pool) return;
      const count = muscle === "Cardio" ? 1 : item.muscles.length <= 2 ? 4 : 2;
      const shuffled = [...pool.exercises].sort(() => Math.random() - 0.5);
      shuffled.slice(0, count).forEach((ex) => {
        exercises.push({ name: ex, sets: muscle === "Cardio" ? 1 : repScheme.sets, reps: muscle === "Cardio" ? cardioReps : repScheme.reps });
      });
    });
    const primaryMuscle = item.muscles.find((m) => m !== "Cardio") || "Cardio";
    const meta = exercisePool[primaryMuscle] || exercisePool.Cardio;
    return { day: dayNames[idx], focus: item.focus, image: meta.image, color: meta.color, exercises };
  });
}

function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa" };
  if (bmi < 25) return { label: "Normal", color: "#34d399" };
  if (bmi < 30) return { label: "Overweight", color: "#fbbf24" };
  return { label: "Obese", color: "#f87171" };
}

export default function ProgressPage() {
  const { colors } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [goalWeight, setGoalWeight] = useState("");
  const [trainingDays, setTrainingDays] = useState(4);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [planSeed, setPlanSeed] = useState(0);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [readinessScore, setReadinessScore] = useState(88);

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => {
      const isToday = i === (new Date().getDay() + 6) % 7;
      return {
        day,
        food: isToday ? 0 : 1800 + Math.random() * 400 - 200,
        burn: isToday ? 0 : 200 + Math.random() * 200,
        isToday
      };
    });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored) as UserData;
      setUser(parsed);
      if (parsed.weight) {
        const w = parseFloat(parsed.weight);
        const h = parsed.height ? parseFloat(parsed.height) : 170;
        const currentBMI = calcBMI(w, h);
        setGoalWeight(String(Math.round(currentBMI > 25 ? w * 0.9 : currentBMI < 18.5 ? w * 1.1 : w)));
      }
    }
    fetchUser().then((u) => { if (u) setUser(u); });
    fetchWorkoutLogs().then(logs => {
      if (logs) setWorkoutLogs(logs);
      const todayLogs = logs.filter((l: any) => new Date(l.timestamp).toDateString() === new Date().toDateString());
      setReadinessScore(Math.max(10, 88 - (todayLogs.length * 4)));
    });
  }, []);

  const weight = user?.weight ? parseFloat(user.weight) : 70;
  const height = user?.height ? parseFloat(user.height) : 170;
  const currentBMI = calcBMI(weight, height);
  const goalWeightNum = goalWeight ? parseFloat(goalWeight) : weight;
  const goalBMI = calcBMI(goalWeightNum, height);
  const currentCat = bmiCategory(currentBMI);
  const goalCat = bmiCategory(goalBMI);
  const goalType = goalWeightNum < weight ? "lose" : goalWeightNum > weight ? "gain" : "maintain";

  const plan = useMemo(() => (planGenerated ? generatePlan(trainingDays, goalType) : []), [planGenerated, trainingDays, goalType, planSeed]);

  const handleGeneratePlan = () => {
    setPlanSeed((s) => s + 1);
    setPlanGenerated(true);
    setExpandedDay(0);
  };

  return (
    <div className="main-content" style={{ minHeight: "100vh", paddingBottom: "100px", position: "relative" }}>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "14px", color: colors.accent, marginBottom: "8px", fontWeight: 700, letterSpacing: "1px" }}>PROGRESS TRACKER</p>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 300, margin: 0 }}>
            Forge your <span style={{ color: colors.accent }}>ideal</span> self
          </h1>
        </div>

        {/* ELITE ANALYTICS: READINESS & WEEKLY CHART */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", marginBottom: "32px" }}>
          {/* Readiness Score */}
          <div className="bento-card" style={{ borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: `linear-gradient(135deg, ${colors.accentMuted}, transparent)` }}>
            <p style={{ fontSize: "11px", fontWeight: 700, opacity: 0.5, marginBottom: "16px", letterSpacing: "1px" }}>READINESS SCORE</p>
            <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="120" height="120" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={readinessScore > 70 ? "#34d399" : readinessScore > 40 ? "#fbbf24" : "#f87171"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(readinessScore/100) * (2*Math.PI*50)} ${2*Math.PI*50}`} />
              </svg>
              <div style={{ fontSize: "36px", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{readinessScore}</div>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 600, marginTop: "16px", color: readinessScore > 70 ? "#34d399" : readinessScore > 40 ? "#fbbf24" : "#f87171" }}>
              {readinessScore > 70 ? "Primed for action" : readinessScore > 40 ? "Take it easy" : "Rest recommended"}
            </p>
          </div>

          {/* Weekly Calorie Chart */}
          <div className="bento-card" style={{ borderRadius: "24px", padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, opacity: 0.5, letterSpacing: "1px", margin: 0 }}>7-DAY CALORIE TREND</p>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", borderRadius: "2px", background: colors.text }}/> <span style={{ fontSize: "10px", fontWeight: 700, opacity: 0.6 }}>FOOD</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", borderRadius: "2px", background: colors.accent }}/> <span style={{ fontSize: "10px", fontWeight: 700, opacity: 0.6 }}>BURN</span></div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "140px", gap: "8px" }}>
              {weeklyData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "2px", opacity: d.isToday ? 1 : 0.6 }}>
                    <div style={{ width: "100%", background: colors.accent, borderRadius: "4px", height: `${(d.burn / 3000) * 100}%`, minHeight: d.isToday ? "0px" : "4px" }} />
                    <div style={{ width: "100%", background: colors.text, borderRadius: "4px", height: `${(d.food / 3000) * 100}%`, minHeight: d.isToday ? "0px" : "4px" }} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: d.isToday ? 700 : 500, opacity: d.isToday ? 1 : 0.4, color: d.isToday ? colors.accent : colors.text }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BMI GAUGES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "24px", alignItems: "center", marginBottom: "32px" }}>
          <div className="bento-card" style={{ borderRadius: "24px", padding: "32px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, opacity: 0.5, marginBottom: "12px" }}>CURRENT BMI</p>
            <div style={{ fontSize: "42px", fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>{currentBMI.toFixed(1)}</div>
            <div style={{ background: `${currentCat.color}22`, color: currentCat.color, padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, display: "inline-block", marginTop: "12px", border: `1px solid ${currentCat.color}33` }}>{currentCat.label.toUpperCase()}</div>
          </div>
          <div style={{ fontSize: "24px", opacity: 0.2 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
          <div className="bento-card" style={{ borderRadius: "24px", padding: "32px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, opacity: 0.5, marginBottom: "12px" }}>GOAL BMI</p>
            <div style={{ fontSize: "42px", fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>{goalBMI.toFixed(1)}</div>
            <div style={{ background: `${goalCat.color}22`, color: goalCat.color, padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, display: "inline-block", marginTop: "12px", border: `1px solid ${goalCat.color}33` }}>{goalCat.label.toUpperCase()}</div>
          </div>
        </div>

        {/* WEIGHT DELTA INSIGHT CARD */}
        {goalWeight && parseFloat(goalWeight) !== weight && (
          <div className="bento-card" style={{ marginBottom: "28px", borderRadius: "20px", padding: "24px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "20px", animation: "fadeUp 0.5s ease both", borderLeft: `3px solid ${colors.accent}` }}>
            {(() => {
              const diff = Math.abs(goalWeightNum - weight).toFixed(1);
              const weeks = Math.round(Math.abs(goalWeightNum - weight) / 0.5);
              const dailyCal = goalWeightNum < weight ? -500 : 300;
              return (
                <>
                  <div>
                    <p style={{ fontSize: "10px", opacity: 0.45, fontWeight: 700, letterSpacing: "1px", marginBottom: "6px" }}>{goalWeightNum < weight ? "TO LOSE" : "TO GAIN"}</p>
                    <p style={{ fontSize: "26px", fontWeight: 700, fontFamily: "'Inter', sans-serif", margin: 0, color: colors.accent }}>{diff} kg</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", opacity: 0.45, fontWeight: 700, letterSpacing: "1px", marginBottom: "6px" }}>EST. TIME</p>
                    <p style={{ fontSize: "26px", fontWeight: 700, fontFamily: "'Inter', sans-serif", margin: 0 }}>{weeks}w</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", opacity: 0.45, fontWeight: 700, letterSpacing: "1px", marginBottom: "6px" }}>DAILY ADJUST</p>
                    <p style={{ fontSize: "22px", fontWeight: 700, fontFamily: "'Inter', sans-serif", margin: 0, color: dailyCal < 0 ? "#f87171" : "#34d399" }}>{dailyCal > 0 ? "+" : ""}{dailyCal} kcal</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", opacity: 0.45, fontWeight: 700, letterSpacing: "1px", marginBottom: "6px" }}>GOAL TYPE</p>
                    <p style={{ fontSize: "16px", fontWeight: 700, margin: 0, textTransform: "uppercase", color: colors.accent }}>{goalType}</p>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* GOAL SETTINGS */}
        <div className="bento-card" style={{ padding: "40px", borderRadius: "28px", marginBottom: "40px" }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "22px", marginBottom: "24px" }}>Configure Your Journey</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, marginBottom: "8px", display: "block" }}>GOAL WEIGHT (KG)</label>
              <input type="number" value={goalWeight} onChange={(e) => { setGoalWeight(e.target.value); setPlanGenerated(false); }} style={{ width: "100%", padding: "14px 18px", borderRadius: "14px", border: `1px solid ${colors.border}`, background: colors.card, color: colors.text, fontSize: "18px", fontWeight: 600, outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, marginBottom: "8px", display: "block" }}>TRAINING DAYS / WEEK</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button key={d} onClick={() => { setTrainingDays(d); setPlanGenerated(false); }} style={{ flex: 1, minWidth: "38px", padding: "14px 8px", borderRadius: "14px", border: `1px solid ${trainingDays === d ? colors.accent : colors.border}`, background: trainingDays === d ? colors.accentMuted : colors.card, color: trainingDays === d ? colors.accent : colors.text, fontWeight: 700, cursor: "pointer" }}>{d}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleGeneratePlan} className="btn-premium" style={{ width: "100%", padding: "18px", borderRadius: "16px", border: "none", background: colors.accent, color: "#0e0d0b", fontWeight: 700, fontSize: "16px", cursor: "pointer", letterSpacing: "1px" }}>
            {planGenerated ? "REGENERATE SMART PLAN" : "GENERATE PERSONALIZED PLAN"}
          </button>
        </div>

        {/* PLAN DISPLAY */}
        {planGenerated && plan.length > 0 && (
          <div style={{ animation: "fadeUp 0.5s ease both" }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: "28px", marginBottom: "24px" }}>Your <span style={{ color: colors.accent }}>{trainingDays}-Day</span> Routine</h2>
            <div style={{ display: "grid", gap: "16px" }}>
              {plan.map((day, idx) => (
                <div key={idx} className="bento-card" style={{ borderRadius: "20px", overflow: "hidden" }}>
                  <div onClick={() => setExpandedDay(expandedDay === idx ? null : idx)} style={{ padding: "24px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: expandedDay === idx ? colors.card : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "64px", height: "48px", borderRadius: "14px", overflow: "hidden", background: colors.accentMuted }}>
                        <img src={day.image} alt={day.day} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "16px" }}>{day.day}</div>
                        <div style={{ fontSize: "13px", opacity: 0.5 }}>{day.focus}</div>
                      </div>
                    </div>
                    <span style={{ transform: expandedDay === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", opacity: 0.5 }}>▼</span>
                  </div>
                  {expandedDay === idx && (
                    <div style={{ padding: "0 24px 24px 24px", animation: "fadeIn 0.3s ease" }}>
                      <div style={{ height: "1px", background: colors.border, marginBottom: "16px" }} />
                      <div style={{ display: "grid", gap: "12px" }}>
                        {day.exercises.map((ex, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid ${colors.border}` }}>
                            <span style={{ fontWeight: 600, fontSize: "14px" }}>{ex.name}</span>
                            <span style={{ fontSize: "13px", color: colors.accent, fontWeight: 700 }}>{ex.sets} × {ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Sidebar />
      <AIAssistant userData={user} />
    </div>
  );
}
