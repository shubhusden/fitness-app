"use client";
import { useState, useEffect, useRef } from "react";
import { fetchUser, saveUser as apiSaveUser, UserData } from "../lib/api-client";

export default function Profile() {
  const [user, setUser] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load from localStorage first for instant display
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    // Then fetch from backend API
    fetchUser().then((u) => { if (u) setUser(u); });
  }, []);

  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

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

  const fields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "Your name" },
    { name: "age", label: "Age", type: "number", placeholder: "Your age" },
    { name: "height", label: "Height", type: "text", placeholder: "e.g. 5'10\" or 178 cm" },
    { name: "weight", label: "Weight", type: "text", placeholder: "e.g. 70 kg" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0b0a08;
        }

        .profile-page {
          min-height: 100vh;
          background: #0b0a08;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px 80px;
          position: relative;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .bg-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%);
          top: -80px; left: -100px;
        }
        .bg-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%);
          bottom: 0; right: -80px;
        }

        .card {
          position: relative;
          z-index: 1;
          background: linear-gradient(160deg, #181714 0%, #121210 100%);
          border: 1px solid rgba(212,168,83,0.15);
          border-radius: 24px;
          padding: 48px 40px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .avatar-wrapper {
          position: relative;
          cursor: pointer;
          margin-bottom: 8px;
        }

        .avatar-ring {
          width: 110px; height: 110px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #d4a853, #8a6530, #d4a853);
          background-size: 200% 200%;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .avatar-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: #1c1b18;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-inner img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }

        .avatar-overlay {
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .avatar-wrapper:hover .avatar-overlay {
          opacity: 1;
        }

        .avatar-overlay-text {
          font-size: 10px;
          font-weight: 600;
          color: #f0ebe0;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: center;
          line-height: 1.3;
          padding: 0 8px;
        }

        .page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #f0ebe0;
          margin-top: 16px;
          letter-spacing: -0.01em;
        }

        .page-subtitle {
          font-size: 13px;
          color: #6b6456;
          margin-top: 4px;
          letter-spacing: 0.04em;
          margin-bottom: 32px;
        }

        .divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,168,83,0.2), transparent);
          margin-bottom: 28px;
        }

        .fields {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .field-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b6456;
        }

        .field-input {
          padding: 11px 14px;
          background: #0f0e0c;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          color: #f0ebe0;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          -webkit-appearance: none;
        }

        .field-input:focus {
          border-color: rgba(212,168,83,0.5);
          box-shadow: 0 0 0 3px rgba(212,168,83,0.08);
        }

        .field-input:disabled {
          color: #a89880;
          cursor: default;
          border-color: transparent;
          background: rgba(255,255,255,0.03);
        }

        .field-input::placeholder { color: #3d3830; }

        select.field-input option {
          background: #1c1b18;
          color: #f0ebe0;
        }

        .btn-row {
          width: 100%;
          display: flex;
          gap: 10px;
        }

        .btn {
          flex: 1;
          padding: 13px 20px;
          border-radius: 12px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #d4a853, #b8883a);
          color: #0b0a08;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(212,168,83,0.3);
        }

        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          background: rgba(255,255,255,0.05);
          color: #a89880;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          color: #f0ebe0;
        }

        .saved-pill {
          margin-top: 14px;
          font-size: 12px;
          font-weight: 500;
          color: #d4a853;
          letter-spacing: 0.06em;
          opacity: 0;
          transform: translateY(4px);
          transition: all 0.3s ease;
        }
        .saved-pill.show {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="profile-page">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />

        <div className="card">
          {/* Avatar */}
          <div
            className="avatar-wrapper"
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <div className="avatar-ring">
              <div className="avatar-inner">
                {user.photo ? (
                  <img src={user.photo} alt="Profile" />
                ) : (
                  <svg viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg" width="104" height="104">
                    <circle cx="52" cy="40" r="20" fill="#3a3528" />
                    <ellipse cx="52" cy="85" rx="30" ry="20" fill="#3a3528" />
                  </svg>
                )}
              </div>
            </div>
            <div className="avatar-overlay">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="avatar-overlay-text">Change Photo</span>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />

          <h1 className="page-title">{user.name || "Your Profile"}</h1>
          <p className="page-subtitle">{editing ? "Edit your details below" : "Personal information"}</p>

          <div className="divider" />

          <div className="fields">
            {fields.map(({ name, label, type, placeholder }) => (
              <div className="field-group" key={name}>
                <label className="field-label">{label}</label>
                <input
                  className="field-input"
                  name={name}
                  type={type}
                  value={user[name] || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder={editing ? placeholder : "—"}
                />
              </div>
            ))}

            <div className="field-group">
              <label className="field-label">Gender</label>
              <select
                className="field-input"
                name="gender"
                value={user.gender || ""}
                onChange={handleChange}
                disabled={!editing}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="btn-row">
            {editing ? (
              <>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
            )}
          </div>

          <div className={`saved-pill ${saved ? "show" : ""}`}>✓ Profile saved</div>
        </div>
      </div>
    </>
  );
}
