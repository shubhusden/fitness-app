"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "../lib/api-client";

interface UserForm {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
}

export default function Onboarding() {
  const router = useRouter();

  const [user, setUser] = useState<UserForm>({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleGender = (g: string) => {
    setUser({ ...user, gender: g });
  };

  const isFormValid =
    user.name && user.age && user.gender && user.height && user.weight;

  const handleSubmit = () => {
    if (!isFormValid) return;
    const weight = parseFloat(user.weight);
    const height = parseFloat(user.height);
    const age = parseFloat(user.age);
    let bmr: number;
    if (user.gender === "Male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    const calorieGoal = Math.round(bmr * 1.2);
    const updatedUser = { ...user, goal: calorieGoal };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.removeItem("foods");

    // Save to backend (non-blocking)
    saveUser(updatedUser);

    router.push("/dashboard");
  };

  const fields = [
    { name: "name", placeholder: "Your name", type: "text" },
    { name: "age", placeholder: "Age", type: "number" },
    { name: "height", placeholder: "Height (cm)", type: "number" },
    { name: "weight", placeholder: "Weight (kg)", type: "number" },
  ];

  return (
    <div style={{
      background: "#0e0d0b",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .onboard-card { animation: fadeUp 0.6s ease both; }
        .field-group { animation: fadeUp 0.6s ease both; }
        .onboard-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.04);
          color: #f0ebe0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          box-sizing: border-box;
        }
        .onboard-input::placeholder { color: #5a5448; }
        .onboard-input:focus {
          border-color: rgba(212,168,83,0.5);
          background: rgba(212,168,83,0.05);
        }
        .gender-btn {
          transition: all 0.2s ease;
        }
        .gender-btn:hover {
          background: rgba(212,168,83,0.1) !important;
          border-color: rgba(212,168,83,0.4) !important;
        }
        .submit-btn {
          transition: all 0.3s ease;
        }
        .submit-btn:hover:not(:disabled) {
          background: #e8bc6a !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(212,168,83,0.3);
        }
        .step-dot { transition: all 0.3s ease; }
      `}</style>

      {/* BG orb */}
      <div style={{
        position: "absolute", width: "400px", height: "400px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 65%)",
        top: "-80px", right: "-80px", animation: "floatOrb 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      <div className="onboard-card" style={{
        background: "rgba(20,19,17,0.95)",
        border: "1px solid rgba(255,255,255,0.07)",
        padding: "40px 36px",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "400px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        position: "relative",
      }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "rgba(212,168,83,0.15)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "18px", marginBottom: "16px",
            border: "1px solid rgba(212,168,83,0.2)",
          }}>
            🌿
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300, fontSize: "28px",
            color: "#f5f0e8", marginBottom: "6px", margin: "0 0 6px",
          }}>
            Tell us about yourself
          </h2>
          <p style={{ color: "#5a5448", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>
            We&apos;ll calculate your personal calorie goal
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {fields.map((f, i) => (
            <div key={f.name} className="field-group" style={{ animationDelay: `${i * 0.07}s` }}>
              <input
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                onChange={handleChange}
                className="onboard-input"
              />
            </div>
          ))}

          {/* Gender */}
          <div className="field-group" style={{ animationDelay: "0.28s" }}>
            <p style={{ color: "#7a7568", fontSize: "12px", marginBottom: "8px", margin: "0 0 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Gender
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGender(g)}
                  className="gender-btn"
                  style={{
                    flex: 1, padding: "10px 8px",
                    borderRadius: "10px",
                    border: user.gender === g
                      ? "1px solid rgba(212,168,83,0.7)"
                      : "1px solid rgba(255,255,255,0.07)",
                    background: user.gender === g
                      ? "rgba(212,168,83,0.15)"
                      : "rgba(255,255,255,0.03)",
                    color: user.gender === g ? "#d4a853" : "#7a7568",
                    fontSize: "13px",
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                    fontWeight: user.gender === g ? 500 : 300,
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Validation hint */}
        {!isFormValid && Object.values(user).some(v => v !== "") && (
          <p style={{
            color: "#c06060", marginTop: "12px", fontSize: "12px",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <span>○</span> Please fill in all fields to continue
          </p>
        )}

        {/* Divider */}
        <div style={{
          height: "1px", background: "rgba(255,255,255,0.05)",
          margin: "24px 0",
        }} />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="submit-btn"
          style={{
            width: "100%", padding: "14px",
            background: isFormValid ? "#d4a853" : "rgba(255,255,255,0.05)",
            border: isFormValid ? "none" : "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            cursor: isFormValid ? "pointer" : "not-allowed",
            color: isFormValid ? "#0e0d0b" : "#3a3830",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            letterSpacing: "0.04em",
          }}
        >
          {isFormValid ? "Calculate my goal →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
