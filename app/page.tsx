"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{
      height: "100vh",
      background: "#0e0d0b",
      color: "#f0ebe0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'DM Sans', sans-serif",
      textAlign: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Fonts + animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-18px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-8px); }
        }

        .cta-btn {
          transition: all 0.3s ease;
        }

        .cta-btn:hover {
          background: #e8bc6a !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(212, 168, 83, 0.35);
        }

        .fade { animation: fadeUp 0.7s ease both; }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: "absolute", width: "500px", height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,168,83,0.15) 0%, transparent 70%)",
        top: "-100px", right: "-80px",
        animation: "floatOrb 9s ease-in-out infinite",
      }} />

      <div style={{
        position: "absolute", width: "380px", height: "380px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(180,120,60,0.1) 0%, transparent 70%)",
        bottom: "-60px", left: "-60px",
        animation: "floatOrb 12s ease-in-out infinite reverse",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "560px" }}>

        {/* Badge */}
        <div className="fade" style={{
          padding: "6px 14px",
          borderRadius: "999px",
          background: "rgba(212,168,83,0.12)",
          border: "1px solid rgba(212,168,83,0.3)",
          fontSize: "12px",
          color: "#d4a853",
          marginBottom: "28px"
        }}>
          ✦ Your daily nourishment log
        </div>

        {/* Heading */}
        <h1 className="fade" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(38px, 6vw, 60px)",
          fontWeight: 300,
          marginBottom: "20px"
        }}>
          Track what you<br />
          <em style={{ color: "#d4a853" }}>nourish</em> yourself with
        </h1>

        {/* Subtitle */}
        <p className="fade" style={{
          color: "#7a7568",
          marginBottom: "36px"
        }}>
          Your personal calorie companion.<br />
          Mindful eating starts with awareness.
        </p>

        {/* Button */}
        <button
          className="cta-btn fade"
          onClick={() => router.push("/onboarding")}
          style={{
            padding: "14px 32px",
            background: "#d4a853",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
            color: "#0e0d0b"
          }}
        >
          Let's move ahead →
        </button>

      </div>
    </div>
  );
}