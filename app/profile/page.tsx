"use client";
import { useState, useEffect, useRef } from "react";
import { fetchUser, saveUser as apiSaveUser } from "../lib/api-client";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import AIAssistant from "../components/AIAssistant";
import { useTheme } from "../components/ThemeContext";

export default function Profile() {
  const router = useRouter();
  const { colors } = useTheme();
  const [user, setUser] = useState<any>({ name: "", age: "", gender: "", height: "", weight: "", goal: "", activity: "Moderate", email: "", targetWeight: "" });
  const [editing, setEditing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser((prev: any) => ({ ...prev, ...JSON.parse(stored) }));
    fetchUser().then((u) => { if (u) setUser((prev: any) => ({ ...prev, ...u })); });
  }, []);

  const handleChange = (e: any) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    apiSaveUser(user);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = { ...user, photo: reader.result };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      apiSaveUser(updatedUser);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all data?")) {
      localStorage.clear();
      router.push("/");
    }
  };

  const heightCm = parseFloat(user.height) || 0;
  const weightKg = parseFloat(user.weight) || 0;
  let bmi = 0;
  let bmiLabel = "Unknown";
  let bmiColor = colors.accent;
  if (heightCm > 0 && weightKg > 0) {
    bmi = weightKg / Math.pow(heightCm / 100, 2);
    if (bmi < 18.5) { bmiLabel = "Underweight"; bmiColor = "#87ceeb"; }
    else if (bmi < 25) { bmiLabel = "Normal"; bmiColor = "#6b9d6b"; }
    else if (bmi < 30) { bmiLabel = "Overweight"; bmiColor = "#e8bc6a"; }
    else { bmiLabel = "Obese"; bmiColor = "#c06060"; }
  }

  const inputStyle = { 
    padding: "12px 16px", 
    background: colors.card, 
    border: `1px solid ${colors.border}`, 
    borderRadius: "12px", 
    color: colors.text, 
    fontSize: "14px", 
    width: "100%", 
    outline: "none", 
    fontFamily: "'DM Sans', sans-serif" 
  };
  const labelStyle = { 
    fontSize: "11px", 
    fontWeight: 700, 
    letterSpacing: "0.1em", 
    textTransform: "uppercase" as any, 
    color: colors.accent, 
    marginBottom: "8px", 
    display: "block" 
  };
  const cardStyle = { 
    background: colors.card, 
    border: `1px solid ${colors.border}`, 
    borderRadius: "24px", 
    padding: "32px", 
    marginBottom: "24px" 
  };

  return (
    <div className="main-content" style={{ minHeight: "100vh", paddingBottom: "100px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "60px 24px" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px", marginBottom: "48px", animation: "fadeUp 0.5s ease both" }}>
          <div 
            onClick={() => fileInputRef.current?.click()} 
            onMouseEnter={() => setHovering(true)} 
            onMouseLeave={() => setHovering(false)} 
            style={{ 
              position: "relative", 
              cursor: "pointer", 
              width: "130px", 
              height: "130px", 
              borderRadius: "50%", 
              background: `linear-gradient(135deg, ${colors.accent}, #8a6530)`, 
              padding: "4px", 
              flexShrink: 0,
              boxShadow: `0 12px 24px ${colors.accentMuted}`
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user.photo ? (
                <img src={user.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
            </div>
            {hovering && (
              <div style={{ position: "absolute", inset: "4px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: colors.accent, backdropFilter: "blur(2px)" }}>
                CHANGE
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
          
          <div>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "42px", margin: "0 0 12px 0", fontWeight: 300 }}>{user.name || "Your Profile"}</h1>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ background: colors.card, padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, border: `1px solid ${colors.border}` }}>{user.age || "--"} YRS</span>
              <span style={{ background: colors.card, padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, border: `1px solid ${colors.border}` }}>{user.height || "--"} CM</span>
              <span style={{ background: colors.card, padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, border: `1px solid ${colors.border}` }}>{user.weight || "--"} KG</span>
            </div>
          </div>
        </div>

        {/* BMI CARD */}
        <div className="bento-card" style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeUp 0.6s ease both" }}>
          <div>
            <div style={labelStyle}>Body Mass Index</div>
            <div style={{ fontSize: "42px", fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>{bmi > 0 ? bmi.toFixed(1) : "--"}</div>
          </div>
          {bmi > 0 && (
            <div style={{ background: `${bmiColor}22`, color: bmiColor, padding: "10px 20px", borderRadius: "14px", fontSize: "14px", fontWeight: 700, border: `1px solid ${bmiColor}44` }}>
              {bmiLabel.toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "24px", fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>Personal Details</h2>
          {!editing ? (
             <button onClick={() => setEditing(true)} className="btn-premium" style={{ background: colors.accentMuted, color: colors.accent, border: `1px solid ${colors.border}`, padding: "8px 18px", borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>Edit Profile</button>
          ) : (
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEditing(false)} style={{ background: "transparent", color: colors.text, border: `1px solid ${colors.border}`, padding: "8px 18px", borderRadius: "12px", cursor: "pointer", fontSize: "14px", opacity: 0.6 }}>Cancel</button>
              <button onClick={handleSave} className="btn-premium" style={{ background: colors.accent, color: "#0e0d0b", border: "none", padding: "8px 18px", borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>Save Changes</button>
            </div>
          )}
        </div>
        {saved && <p style={{ color: "#6b9d6b", fontSize: "14px", marginTop: "-12px", marginBottom: "20px", fontWeight: 500 }}>✓ Changes saved successfully</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
          <div><label style={labelStyle}>Full Name</label><input name="name" value={user.name || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div><label style={labelStyle}>Email Address</label><input name="email" value={user.email || ""} onChange={handleChange} disabled={!editing} style={inputStyle} placeholder="Optional" /></div>
          <div><label style={labelStyle}>Age</label><input name="age" type="number" value={user.age || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Gender</label>
            <div style={{ position: "relative" }}>
              <select name="gender" value={user.gender || ""} onChange={handleChange} disabled={!editing} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
              <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>▼</span>
            </div>
          </div>
          <div><label style={labelStyle}>Height (cm)</label><input name="height" type="number" value={user.height || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div><label style={labelStyle}>Weight (kg)</label><input name="weight" type="number" value={user.weight || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
        </div>

        <h2 style={{ fontSize: "24px", fontFamily: "'Inter', sans-serif", fontWeight: 400, marginBottom: "24px" }}>Fitness Goals</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "48px" }}>
          <div><label style={labelStyle}>Daily Calorie Target</label><input name="goal" type="number" value={user.goal || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div><label style={labelStyle}>Target Weight (kg)</label><input name="targetWeight" type="number" value={user.targetWeight || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Activity Level</label>
            <div style={{ position: "relative" }}>
              <select name="activity" value={user.activity || "Moderate"} onChange={handleChange} disabled={!editing} style={{ ...inputStyle, appearance: "none" }}>
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Light">Light (Exercise 1-3 days/week)</option>
                <option value="Moderate">Moderate (Exercise 3-5 days/week)</option>
                <option value="Active">Active (Exercise 6-7 days/week)</option>
              </select>
              <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>▼</span>
            </div>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div style={{ ...cardStyle, border: "1px solid rgba(192,96,96,0.2)", background: "rgba(192,96,96,0.02)" }}>
          <h3 style={{ color: "#c06060", fontSize: "18px", marginBottom: "12px", fontWeight: 600 }}>Danger Zone</h3>
          <p style={{ fontSize: "14px", opacity: 0.6, marginBottom: "20px", lineHeight: 1.6 }}>Resetting your account will permanently remove all your progress, history, and profile data. This cannot be undone.</p>
          <button onClick={handleReset} className="btn-premium" style={{ background: "rgba(192,96,96,0.1)", color: "#c06060", border: "1px solid rgba(192,96,96,0.3)", padding: "12px 24px", borderRadius: "14px", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>
            Wipe All Data
          </button>
        </div>

      </div>
      <AIAssistant userData={user} />
      <Sidebar />
    </div>
  );
}
