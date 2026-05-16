"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "./components/ThemeContext";

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      color: colors.text,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Inter', sans-serif",
      textAlign: "center",
      overflow: "hidden",
      position: "relative",
      padding: "24px"
    }}>
      {/* Fonts + animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cta-btn {
          transition: all 0.3s ease;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px ${colors.accentMuted};
        }

        .fade { animation: fadeUp 0.7s ease both; }
      `}</style>

      {/* Modern ambient glow instead of orbs */}
      <div style={{
        position: "absolute", width: "600px", height: "600px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.accentMuted} 0%, transparent 60%)`,
        top: "-200px", right: "-200px",
        pointerEvents: "none"
      }} />

      <div style={{
        position: "absolute", width: "600px", height: "600px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.accentMuted} 0%, transparent 60%)`,
        bottom: "-200px", left: "-200px",
        pointerEvents: "none"
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Logo Icon */}
        <div className="fade" style={{
          width: "56px", height: "56px", borderRadius: "16px",
          background: colors.accent, display: "flex",
          alignItems: "center", justifyContent: "center",
          marginBottom: "32px", color: colors.textOnAccent
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </div>

        {/* Badge */}
        <div className="fade" style={{
          padding: "8px 16px",
          borderRadius: "999px",
          background: colors.accentMuted,
          border: `1px solid ${colors.border}`,
          fontSize: "12px",
          fontWeight: 700,
          color: colors.accent,
          marginBottom: "28px",
          letterSpacing: "1px"
        }}>
          NOURISHFIT PREMIUM
        </div>

        {/* Heading */}
        <h1 className="fade" style={{
          fontSize: "clamp(42px, 8vw, 64px)",
          fontWeight: 800,
          letterSpacing: "-1px",
          marginBottom: "24px",
          lineHeight: 1.1
        }}>
          Track what you<br />
          <em style={{ color: colors.accent, fontStyle: "italic" }}>nourish</em> yourself with.
        </h1>

        {/* Subtitle */}
        <p className="fade" style={{
          color: colors.text,
          opacity: 0.6,
          fontSize: "18px",
          fontWeight: 500,
          marginBottom: "40px",
          maxWidth: "400px",
          lineHeight: 1.6
        }}>
          Your personal calorie companion. Mindful eating starts with awareness.
        </p>

        {/* Button */}
        <button
          className="cta-btn fade"
          onClick={() => router.push("/onboarding")}
          style={{
            padding: "16px 36px",
            background: colors.accent,
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
            color: colors.textOnAccent,
            fontSize: "16px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          Let's move ahead
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>

      </div>
    </div>
  );
}