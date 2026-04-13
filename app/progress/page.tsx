"use client";

import { useState, useEffect, useMemo } from "react";
import BottomNav from "../components/BottomNav";
import { fetchUser } from "../lib/api-client";

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
  emoji: string;
  color: string;
  exercises: { name: string; sets: number; reps: string }[];
}

/* ─── Exercise Pool (same as workout page) ─── */
const exercisePool: Record<string, { exercises: string[]; emoji: string; color: string }> = {
  Cardio:    { exercises: ["Running", "Cycling", "Jump Rope", "HIIT", "Walking", "Swimming"], emoji: "🏃", color: "rgba(96, 165, 250, 0.12)" },
  Abs:       { exercises: ["Crunches", "Plank", "Leg Raises", "Russian Twists", "Mountain Climbers", "Bicycle Crunch"], emoji: "🔥", color: "rgba(251, 146, 60, 0.12)" },
  Chest:     { exercises: ["Bench Press", "Incline Dumbbell Press", "Chest Fly", "Push Ups", "Cable Crossover", "Decline Press"], emoji: "💪", color: "rgba(248, 113, 113, 0.12)" },
  Back:      { exercises: ["Pull Ups", "Lat Pulldown", "Deadlift", "Seated Row", "T-Bar Row", "Hyperextensions"], emoji: "🦅", color: "rgba(52, 211, 153, 0.12)" },
  Biceps:    { exercises: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Cable Curl", "Concentration Curl"], emoji: "💪", color: "rgba(212, 168, 83, 0.12)" },
  Triceps:   { exercises: ["Tricep Pushdown", "Skull Crushers", "Dips", "Overhead Extension", "Close Grip Bench", "Kickbacks"], emoji: "🔱", color: "rgba(167, 139, 250, 0.12)" },
  Shoulders: { exercises: ["Shoulder Press", "Lateral Raise", "Front Raise", "Arnold Press", "Shrugs", "Reverse Fly"], emoji: "🎯", color: "rgba(244, 114, 182, 0.12)" },
  Legs:      { exercises: ["Squats", "Leg Press", "Lunges", "Hamstring Curl", "Calf Raises", "Leg Extension"], emoji: "🦵", color: "rgba(45, 212, 191, 0.12)" },
};

/* ─── Plan templates for different day counts ─── */
function generatePlan(days: number, goalType: string): DayPlan[] {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Decide sets/reps based on goal
  const repScheme = goalType === "lose"
    ? { sets: 4, reps: "12-15" }
    : goalType === "gain"
    ? { sets: 4, reps: "6-10" }
    : { sets: 3, reps: "10-12" };

  const cardioReps = goalType === "lose" ? "30 min" : goalType === "gain" ? "15 min" : "20 min";

  // Day split configurations
  const splits: Record<number, { focus: string; muscles: string[] }[]> = {
    1: [
      { focus: "Full Body + Cardio", muscles: ["Cardio", "Chest", "Back", "Legs", "Abs"] },
    ],
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
    const exercises: { name: string; sets: number; reps: string }[] = [];

    item.muscles.forEach((muscle) => {
      const pool = exercisePool[muscle];
      if (!pool) return;
      // Pick 2-3 exercises from each muscle group
      const count = muscle === "Cardio" ? 1 : item.muscles.length <= 2 ? 4 : 2;
      const shuffled = [...pool.exercises].sort(() => Math.random() - 0.5);
      shuffled.slice(0, count).forEach((ex) => {
        exercises.push({
          name: ex,
          sets: muscle === "Cardio" ? 1 : repScheme.sets,
          reps: muscle === "Cardio" ? cardioReps : repScheme.reps,
        });
      });
    });

    // Pick emoji/color from first non-Cardio muscle
    const primaryMuscle = item.muscles.find((m) => m !== "Cardio") || "Cardio";
    const meta = exercisePool[primaryMuscle] || exercisePool.Cardio;

    return {
      day: dayNames[idx],
      focus: item.focus,
      emoji: meta.emoji,
      color: meta.color,
      exercises,
    };
  });
}

/* ─── BMI helpers ─── */
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

function bmiToArcDeg(bmi: number): number {
  // Map BMI 10-40 → 0°-270°
  const clamped = Math.max(10, Math.min(40, bmi));
  return ((clamped - 10) / 30) * 270;
}

/* ─── Component ─── */
export default function ProgressPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [goalWeight, setGoalWeight] = useState("");
  const [trainingDays, setTrainingDays] = useState(4);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [planSeed, setPlanSeed] = useState(0);

  useEffect(() => {
    // Load from localStorage first for instant display
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored) as UserData;
      setUser(parsed);
      if (parsed.weight) {
        const w = parseFloat(parsed.weight);
        const h = parsed.height ? parseFloat(parsed.height) : 170;
        const currentBMI = calcBMI(w, h);
        if (currentBMI > 25) {
          setGoalWeight(String(Math.round(w * 0.9)));
        } else if (currentBMI < 18.5) {
          setGoalWeight(String(Math.round(w * 1.1)));
        } else {
          setGoalWeight(String(Math.round(w)));
        }
      }
    }

    // Then fetch from backend API
    fetchUser().then((u) => {
      if (u) {
        setUser(u);
        if (u.weight) {
          const w = parseFloat(u.weight);
          const h = u.height ? parseFloat(u.height) : 170;
          const bmi = calcBMI(w, h);
          if (bmi > 25) {
            setGoalWeight(String(Math.round(w * 0.9)));
          } else if (bmi < 18.5) {
            setGoalWeight(String(Math.round(w * 1.1)));
          } else {
            setGoalWeight(String(Math.round(w)));
          }
        }
      }
    });
  }, []);

  const weight = user?.weight ? parseFloat(user.weight) : 70;
  const height = user?.height ? parseFloat(user.height) : 170;
  const currentBMI = calcBMI(weight, height);
  const goalWeightNum = goalWeight ? parseFloat(goalWeight) : weight;
  const goalBMI = calcBMI(goalWeightNum, height);

  const currentCat = bmiCategory(currentBMI);
  const goalCat = bmiCategory(goalBMI);

  const goalType: string = goalWeightNum < weight ? "lose" : goalWeightNum > weight ? "gain" : "maintain";

  const plan = useMemo(
    () => (planGenerated ? generatePlan(trainingDays, goalType) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [planGenerated, trainingDays, goalType, planSeed]
  );

  const handleGeneratePlan = () => {
    setPlanSeed((s) => s + 1);
    setPlanGenerated(true);
    setExpandedDay(0);
  };

  /* ─── SVG Arc for BMI gauge ─── */
  const renderGauge = (bmi: number, label: string, category: { label: string; color: string }) => {
    const cx = 70,
      cy = 70,
      r = 56;
    const startAngle = -225;
    const totalArc = 270;
    const endAngle = startAngle + totalArc;
    const bmiArc = bmiToArcDeg(bmi);
    const filledAngle = startAngle + bmiArc;

    // SVG arc path helper
    const polarToCartesian = (cxP: number, cyP: number, rP: number, deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return { x: cxP + rP * Math.cos(rad), y: cyP + rP * Math.sin(rad) };
    };
    const describeArc = (cxP: number, cyP: number, rP: number, startDeg: number, endDeg: number) => {
      const start = polarToCartesian(cxP, cyP, rP, endDeg);
      const end = polarToCartesian(cxP, cyP, rP, startDeg);
      const largeArc = endDeg - startDeg <= 180 ? "0" : "1";
      return `M ${start.x} ${start.y} A ${rP} ${rP} 0 ${largeArc} 0 ${end.x} ${end.y}`;
    };

    return (
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#7a7568",
            marginBottom: "8px",
          }}
        >
          {label}
        </p>
        <svg width="140" height="120" viewBox="0 0 140 120">
          {/* Background arc */}
          <path
            d={describeArc(cx, cy, r, startAngle, endAngle)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={describeArc(cx, cy, r, startAngle, filledAngle)}
            fill="none"
            stroke={category.color}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ transition: "all 0.8s ease" }}
          />
          {/* BMI value */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill="#f0ebe0"
            fontSize="26"
            fontFamily="'Cormorant Garamond', serif"
            fontWeight="300"
          >
            {bmi.toFixed(1)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#7a7568" fontSize="10">
            BMI
          </text>
        </svg>
        <div
          style={{
            display: "inline-block",
            padding: "4px 14px",
            borderRadius: "999px",
            background: `${category.color}18`,
            border: `1px solid ${category.color}40`,
            fontSize: "11px",
            color: category.color,
            fontWeight: 500,
            marginTop: "2px",
          }}
        >
          {category.label}
        </div>
      </div>
    );
  };

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
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)",
          top: "-150px",
          left: "-100px",
          pointerEvents: "none",
          animation: "floatOrb 10s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 70%)",
          bottom: "-80px",
          right: "-60px",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        {/* ═══ HEADER ═══ */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "14px", color: "#d4a853", marginBottom: "4px", fontWeight: 500 }}>
            📈 Progress Tracker
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 300,
              margin: 0,
            }}
          >
            Your <em style={{ color: "#d4a853" }}>transformation</em> journey
          </h1>
          <p style={{ fontSize: "13px", color: "#7a7568", marginTop: "6px" }}>
            Set your goals and get a personalized workout plan
          </p>
        </div>

        {/* ═══ BMI GAUGES ═══ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "16px",
            alignItems: "center",
            marginBottom: "28px",
            background: "linear-gradient(135deg, rgba(212,168,83,0.06) 0%, rgba(20,19,17,0.95) 100%)",
            border: "1px solid rgba(212,168,83,0.12)",
            borderRadius: "20px",
            padding: "28px 20px",
            animation: "scaleIn 0.5s ease both",
          }}
        >
          {renderGauge(currentBMI, "Current BMI", currentCat)}

          {/* Divider + arrow */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(212,168,83,0.12)",
                border: "1px solid rgba(212,168,83,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              →
            </div>
            <span style={{ fontSize: "10px", color: "#7a7568", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Goal
            </span>
          </div>

          {renderGauge(goalBMI, "Goal BMI", goalCat)}
        </div>

        {/* ═══ GOAL FORM ═══ */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "24px",
            animation: "scaleIn 0.6s ease both",
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: "20px",
              marginBottom: "20px",
              margin: "0 0 20px",
            }}
          >
            🎯 Set Your <span style={{ color: "#d4a853" }}>Target</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {/* Current Weight (readonly) */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "#7a7568",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "8px",
                }}
              >
                Current Weight
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: "16px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "18px" }}>⚖️</span>
                {weight} kg
              </div>
            </div>

            {/* Goal Weight */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "#7a7568",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "8px",
                }}
              >
                Goal Weight (kg)
              </label>
              <input
                id="goal-weight-input"
                type="number"
                value={goalWeight}
                onChange={(e) => {
                  setGoalWeight(e.target.value);
                  setPlanGenerated(false);
                }}
                placeholder="e.g. 65"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#f0ebe0",
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(212,168,83,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>

          {/* Weight change indicator */}
          {goalWeight && (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background:
                  goalType === "lose"
                    ? "rgba(96,165,250,0.08)"
                    : goalType === "gain"
                    ? "rgba(52,211,153,0.08)"
                    : "rgba(212,168,83,0.08)",
                border: `1px solid ${
                  goalType === "lose"
                    ? "rgba(96,165,250,0.2)"
                    : goalType === "gain"
                    ? "rgba(52,211,153,0.2)"
                    : "rgba(212,168,83,0.2)"
                }`,
                marginBottom: "20px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>
                {goalType === "lose" ? "📉" : goalType === "gain" ? "📈" : "✅"}
              </span>
              <span style={{ color: "#f0ebe0" }}>
                {goalType === "lose"
                  ? `You want to lose ${(weight - goalWeightNum).toFixed(1)} kg`
                  : goalType === "gain"
                  ? `You want to gain ${(goalWeightNum - weight).toFixed(1)} kg`
                  : "You want to maintain your current weight"}
              </span>
            </div>
          )}

          {/* Training Days */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "#7a7568",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
              }}
            >
              Training Days Per Week
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  id={`day-btn-${d}`}
                  onClick={() => {
                    setTrainingDays(d);
                    setPlanGenerated(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 0",
                    borderRadius: "12px",
                    border:
                      trainingDays === d
                        ? "1px solid rgba(212,168,83,0.6)"
                        : "1px solid rgba(255,255,255,0.08)",
                    background:
                      trainingDays === d
                        ? "linear-gradient(135deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.08) 100%)"
                        : "rgba(255,255,255,0.03)",
                    color: trainingDays === d ? "#d4a853" : "#7a7568",
                    fontSize: "16px",
                    fontWeight: trainingDays === d ? 700 : 400,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <p style={{ fontSize: "11px", color: "#7a7568", marginTop: "8px", textAlign: "center" }}>
              {trainingDays === 1
                ? "Full body blast"
                : trainingDays <= 3
                ? "Great for beginners"
                : trainingDays <= 5
                ? "Optimal for muscle building"
                : "Advanced split"}
            </p>
          </div>

          {/* Generate button */}
          <button
            id="generate-plan-btn"
            onClick={handleGeneratePlan}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #d4a853 0%, #b8883a 100%)",
              color: "#0e0d0b",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              letterSpacing: "0.03em",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 20px rgba(212,168,83,0.25)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(212,168,83,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(212,168,83,0.25)";
            }}
          >
            {planGenerated ? "🔄 Regenerate Plan" : "⚡ Generate Workout Plan"}
          </button>
        </div>

        {/* ═══ WORKOUT PLAN ═══ */}
        {planGenerated && plan.length > 0 && (
          <div style={{ animation: "fadeUp 0.5s ease both" }}>
            {/* Plan header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontSize: "24px",
                    margin: 0,
                  }}
                >
                  Your <span style={{ color: "#d4a853" }}>{trainingDays}-Day</span> Plan
                </h2>
                <p style={{ fontSize: "12px", color: "#7a7568", marginTop: "4px" }}>
                  {goalType === "lose"
                    ? "High rep, fat-burning focus"
                    : goalType === "gain"
                    ? "Heavy lifting, muscle-building focus"
                    : "Balanced maintenance routine"}
                </p>
              </div>
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: "rgba(212,168,83,0.1)",
                  border: "1px solid rgba(212,168,83,0.2)",
                  fontSize: "11px",
                  color: "#d4a853",
                  fontWeight: 500,
                }}
              >
                {goalType === "lose" ? "🔥 Fat Loss" : goalType === "gain" ? "💪 Muscle Gain" : "⚖️ Maintain"}
              </div>
            </div>

            {/* Day cards */}
            {plan.map((dayPlan, dayIdx) => {
              const isExpanded = expandedDay === dayIdx;
              return (
                <div key={dayIdx} style={{ marginBottom: "10px" }}>
                  {/* Day header */}
                  <div
                    onClick={() => setExpandedDay(isExpanded ? null : dayIdx)}
                    style={{
                      background: isExpanded
                        ? `linear-gradient(135deg, ${dayPlan.color}, rgba(20,19,17,0.95))`
                        : "rgba(255,255,255,0.03)",
                      border: isExpanded
                        ? "1px solid rgba(212,168,83,0.2)"
                        : "1px solid rgba(255,255,255,0.05)",
                      padding: "18px 20px",
                      borderRadius: isExpanded ? "16px 16px 4px 4px" : "16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: isExpanded ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          border: isExpanded ? "1px solid rgba(212,168,83,0.25)" : "1px solid rgba(255,255,255,0.08)",
                          transition: "all 0.25s ease",
                        }}
                      >
                        {dayPlan.emoji}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>
                            Day {dayIdx + 1}
                          </h3>
                          <span style={{ fontSize: "12px", color: "#7a7568" }}>• {dayPlan.day}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "12px", color: "#7a7568", marginTop: "2px" }}>
                          {dayPlan.focus}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "11px", color: "#7a7568" }}>
                        {dayPlan.exercises.length} exercises
                      </span>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: isExpanded ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          color: isExpanded ? "#d4a853" : "#7a7568",
                          transition: "transform 0.25s ease",
                          transform: isExpanded ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                      >
                        +
                      </div>
                    </div>
                  </div>

                  {/* Exercises list */}
                  {isExpanded && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.015)",
                        borderRadius: "0 0 16px 16px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderTop: "none",
                        padding: "4px 12px 12px",
                        animation: "scaleIn 0.25s ease both",
                      }}
                    >
                      {/* Table header */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 60px 70px",
                          padding: "10px 14px 8px",
                          fontSize: "10px",
                          color: "#7a7568",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <span>Exercise</span>
                        <span style={{ textAlign: "center" }}>Sets</span>
                        <span style={{ textAlign: "center" }}>Reps</span>
                      </div>

                      {dayPlan.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 60px 70px",
                            padding: "12px 14px",
                            alignItems: "center",
                            borderBottom:
                              exIdx < dayPlan.exercises.length - 1
                                ? "1px solid rgba(255,255,255,0.03)"
                                : "none",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                          }
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#d4a853",
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: "13px", fontWeight: 500 }}>{ex.name}</span>
                          </div>
                          <span
                            style={{
                              textAlign: "center",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#d4a853",
                            }}
                          >
                            {ex.sets}
                          </span>
                          <span
                            style={{
                              textAlign: "center",
                              fontSize: "13px",
                              color: "#7a7568",
                              fontWeight: 500,
                            }}
                          >
                            {ex.reps}
                          </span>
                        </div>
                      ))}

                      {/* Day summary pill */}
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px 16px",
                          borderRadius: "12px",
                          background: "rgba(212,168,83,0.06)",
                          border: "1px solid rgba(212,168,83,0.12)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                        }}
                      >
                        <span style={{ color: "#7a7568" }}>
                          Total:{" "}
                          <span style={{ color: "#d4a853", fontWeight: 600 }}>
                            {dayPlan.exercises.reduce((s, e) => s + e.sets, 0)} sets
                          </span>
                        </span>
                        <span style={{ color: "#7a7568" }}>
                          Est. time:{" "}
                          <span style={{ color: "#f0ebe0", fontWeight: 500 }}>
                            {Math.round(dayPlan.exercises.length * 5 + 10)} min
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Rest days note */}
            {trainingDays < 7 && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px 20px",
                  borderRadius: "16px",
                  background: "rgba(52,211,153,0.06)",
                  border: "1px solid rgba(52,211,153,0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "20px" }}>😴</span>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#34d399" }}>
                    {7 - trainingDays} Rest Day{7 - trainingDays > 1 ? "s" : ""} per week
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#7a7568", marginTop: "2px" }}>
                    Recovery is essential for muscle growth and injury prevention
                  </p>
                </div>
              </div>
            )}

            {/* Pro tips */}
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h4
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  fontSize: "16px",
                  margin: "0 0 12px",
                  color: "#d4a853",
                }}
              >
                💡 Pro Tips
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  goalType === "lose"
                    ? "Keep rest periods short (30-60s) to maximize calorie burn"
                    : "Rest 90-120 seconds between heavy sets for full recovery",
                  "Always warm up for 5-10 minutes before your workout",
                  "Stay hydrated — drink at least 500ml of water during your session",
                  goalType === "gain"
                    ? "Aim for progressive overload — increase weight by 2-5% weekly"
                    : "Focus on form over weight to prevent injuries",
                ].map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      fontSize: "12px",
                      color: "#7a7568",
                      lineHeight: "1.5",
                    }}
                  >
                    <span style={{ color: "#d4a853", flexShrink: 0, marginTop: "1px" }}>✦</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
