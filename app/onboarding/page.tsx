"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "../lib/api-client";
import { useTheme } from "../components/ThemeContext";

interface UserForm {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
}

export default function Onboarding() {
  const router = useRouter();
  const { colors } = useTheme();

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
    { name: "name", placeholder: "Your name", type: "text", label: "NAME" },
    { name: "age", placeholder: "e.g. 25", type: "number", label: "AGE" },
    { name: "height", placeholder: "e.g. 180", type: "number", label: "HEIGHT (CM)" },
    { name: "weight", placeholder: "e.g. 75", type: "number", label: "WEIGHT (KG)" },
  ];

  return (
    <div style={{
      background: colors.bg,
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: colors.text,
      fontFamily: "'Inter', sans-serif",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .onboard-card { animation: fadeUp 0.6s ease both; }
        .field-group { animation: fadeUp 0.6s ease both; }
        .onboard-input {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid ${colors.border};
          background: ${colors.card};
          color: ${colors.text};
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .onboard-input::placeholder { color: ${colors.text}; opacity: 0.3; font-weight: 400; }
        .onboard-input:focus {
          border-color: ${colors.accent};
          background: ${colors.accentMuted};
        }
        .gender-btn {
          transition: all 0.2s ease;
        }
        .submit-btn {
          transition: all 0.3s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px ${colors.accentMuted};
        }
      `}</style>

      {/* Modern Bento Form */}
      <div className="onboard-card bento-card" style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        padding: "48px 40px",
        borderRadius: "32px",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 40px 80px rgba(0,0,0,0.3)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: colors.accent, display: "flex",
            alignItems: "center", justifyContent: "center",
            marginBottom: "24px", color: colors.textOnAccent
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: colors.accent, letterSpacing: "1px", margin: "0 0 8px 0" }}>NOURISHFIT</p>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800, fontSize: "32px",
            margin: "0 0 8px 0", letterSpacing: "-0.5px"
          }}>
            Set up your profile
          </h2>
          <p style={{ fontSize: "14px", opacity: 0.6, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            We'll calculate your personal calorie goal based on your stats.
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "grid", gap: "20px" }}>
          {fields.map((f, i) => (
            <div key={f.name} className="field-group" style={{ animationDelay: `${i * 0.07}s` }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, marginBottom: "8px", display: "block", letterSpacing: "1px" }}>{f.label}</label>
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
          <div className="field-group" style={{ animationDelay: "0.28s", marginTop: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, marginBottom: "8px", display: "block", letterSpacing: "1px" }}>GENDER</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGender(g)}
                  className="gender-btn"
                  style={{
                    flex: 1, padding: "14px 8px",
                    borderRadius: "14px",
                    border: user.gender === g
                      ? `1px solid ${colors.accent}`
                      : `1px solid ${colors.border}`,
                    background: user.gender === g
                      ? colors.accentMuted
                      : "transparent",
                    color: user.gender === g ? colors.accent : colors.text,
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: colors.border, margin: "32px 0" }} />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="submit-btn"
          style={{
            width: "100%", padding: "18px",
            background: isFormValid ? colors.accent : colors.border,
            border: "none",
            borderRadius: "16px",
            cursor: isFormValid ? "pointer" : "not-allowed",
            color: isFormValid ? colors.textOnAccent : colors.text,
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "1px",
            opacity: isFormValid ? 1 : 0.5,
          }}
        >
          {isFormValid ? "CALCULATE MY GOAL" : "FILL ALL FIELDS"}
        </button>
      </div>
    </div>
  );
}
