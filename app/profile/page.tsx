"use client";
import { useState, useEffect, useRef } from "react";
import { fetchUser, saveUser as apiSaveUser, UserData } from "../lib/api-client";
import { useRouter } from "next/navigation";
import BottomNav from "../components/BottomNav";

export default function Profile() {
  const router = useRouter();
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
    reader.onloadend = () => setUser({ ...user, photo: reader.result });
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
  let bmiColor = "#7a7568";
  if (heightCm > 0 && weightKg > 0) {
    bmi = weightKg / Math.pow(heightCm / 100, 2);
    if (bmi < 18.5) { bmiLabel = "Underweight"; bmiColor = "#87ceeb"; }
    else if (bmi < 25) { bmiLabel = "Normal"; bmiColor = "#6b9d6b"; }
    else if (bmi < 30) { bmiLabel = "Overweight"; bmiColor = "#e8bc6a"; }
    else { bmiLabel = "Obese"; bmiColor = "#c06060"; }
  }

  const inputStyle = { padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", color: "#f0ebe0", fontSize: "14px", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif" };
  const labelStyle = { fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as any, color: "#7a7568", marginBottom: "6px", display: "block" };
  const cardStyle = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", marginBottom: "20px" };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0a08", color: "#f0ebe0", fontFamily: "'DM Sans', sans-serif", paddingBottom: "100px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "40px", animation: "fadeUp 0.5s ease both" }}>
          <div onClick={() => fileInputRef.current?.click()} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} style={{ position: "relative", cursor: "pointer", width: "120px", height: "120px", borderRadius: "50%", background: "linear-gradient(135deg, #d4a853, #8a6530)", padding: "4px", flexShrink: 0 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#1c1b18", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user.photo ? <img src={user.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "40px" }}>👤</span>}
            </div>
            {hovering && <div style={{ position: "absolute", inset: "4px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#d4a853" }}>Change</div>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
          
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", margin: "0 0 8px 0", fontWeight: 400 }}>{user.name || "Your Profile"}</h1>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>{user.age || "--"} yrs</span>
              <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>{user.height || "--"} cm</span>
              <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>{user.weight || "--"} kg</span>
            </div>
          </div>
        </div>

        {/* BMI CARD */}
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeUp 0.6s ease both" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#7a7568", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Body Mass Index</div>
            <div style={{ fontSize: "36px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>{bmi > 0 ? bmi.toFixed(1) : "--"}</div>
          </div>
          {bmi > 0 && (
            <div style={{ background: `${bmiColor}22`, color: bmiColor, padding: "8px 16px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, border: `1px solid ${bmiColor}44` }}>
              {bmiLabel}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>Personal Details</h2>
          {!editing ? (
             <button onClick={() => setEditing(true)} style={{ background: "rgba(212,168,83,0.15)", color: "#d4a853", border: "1px solid rgba(212,168,83,0.3)", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Edit</button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setEditing(false)} style={{ background: "transparent", color: "#7a7568", border: "1px solid #333", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
              <button onClick={handleSave} style={{ background: "#d4a853", color: "#000", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>Save</button>
            </div>
          )}
        </div>
        {saved && <p style={{ color: "#6b9d6b", fontSize: "13px", marginTop: "-10px", marginBottom: "15px" }}>✓ Profile saved successfully</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div><label style={labelStyle}>Name</label><input name="name" value={user.name || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div><label style={labelStyle}>Email</label><input name="email" value={user.email || ""} onChange={handleChange} disabled={!editing} style={inputStyle} placeholder="Optional" /></div>
          <div><label style={labelStyle}>Age</label><input name="age" type="number" value={user.age || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select name="gender" value={user.gender || ""} onChange={handleChange} disabled={!editing} style={{ ...inputStyle, appearance: "none" }}>
              <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
            </select>
          </div>
          <div><label style={labelStyle}>Height (cm)</label><input name="height" type="number" value={user.height || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div><label style={labelStyle}>Weight (kg)</label><input name="weight" type="number" value={user.weight || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
        </div>

        <h2 style={{ fontSize: "20px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, marginBottom: "20px" }}>Fitness Goals</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
          <div><label style={labelStyle}>Daily Calorie Goal</label><input name="goal" type="number" value={user.goal || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div><label style={labelStyle}>Target Weight (kg)</label><input name="targetWeight" type="number" value={user.targetWeight || ""} onChange={handleChange} disabled={!editing} style={inputStyle} /></div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Activity Level</label>
            <select name="activity" value={user.activity || "Moderate"} onChange={handleChange} disabled={!editing} style={{ ...inputStyle, appearance: "none" }}>
              <option value="Sedentary">Sedentary (Little or no exercise)</option>
              <option value="Light">Light (Exercise 1-3 days/week)</option>
              <option value="Moderate">Moderate (Exercise 3-5 days/week)</option>
              <option value="Active">Active (Exercise 6-7 days/week)</option>
            </select>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div style={{ ...cardStyle, border: "1px solid rgba(192,96,96,0.2)" }}>
          <h3 style={{ color: "#c06060", fontSize: "16px", marginBottom: "8px", fontWeight: 500 }}>Danger Zone</h3>
          <p style={{ fontSize: "13px", color: "#7a7568", marginBottom: "16px", lineHeight: 1.5 }}>This will permanently delete all your data including profile, logged foods, and workout history. This action cannot be undone.</p>
          <button onClick={handleReset} style={{ background: "rgba(192,96,96,0.1)", color: "#c06060", border: "1px solid rgba(192,96,96,0.3)", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 500, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(192,96,96,0.2)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(192,96,96,0.1)"}>
            Delete All Data
          </button>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
