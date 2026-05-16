"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "./ThemeContext";

export default function Sidebar() {
  const router = useRouter();
  const path = usePathname();
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { 
      name: "Dashboard", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      ), 
      route: "/dashboard" 
    },
    { 
      name: "Dictionary", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      ), 
      route: "/dictionary" 
    },
    { 
      name: "Workouts", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5 17.5 17.5"/><path d="M22 17.5 17.5 22"/><path d="m22 22-4.5-4.5"/><path d="m2 6.5 4.5-4.5"/><path d="m2 2 4.5 4.5"/><path d="M18 7c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4 0-.5-.2-1-.6-1.4-.4-.4-.9-.6-1.4-.6-.5 0-1 .2-1.4.6-.4.4-.6.9-.6 1.4 0 .5.2 1 .6 1.4.4.4.9.6 1.4.6Z"/><path d="M6 22c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4 0-.5-.2-1-.6-1.4-.4-.4-.9-.6-1.4-.6-.5 0-1 .2-1.4.6-.4.4-.6.9-.6 1.4 0 .5.2 1 .6 1.4.4.4.9.6 1.4.6Z"/></svg>
      ), 
      route: "/workout" 
    },
    { 
      name: "Progress", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
      ), 
      route: "/progress" 
    },
    { 
      name: "Profile", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      ), 
      route: "/profile" 
    }
  ];

  return (
    <>
      {/* Mobile Hamburger (only visible on mobile) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1100,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: "10px",
          padding: "10px",
          cursor: "pointer",
          display: "none", // Will be shown via CSS media query in globals.css
        }}
        className="mobile-nav-toggle"
      >
        <span style={{ fontSize: "20px", display: "flex", alignItems: "center" }}>
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </span>
      </div>

      {/* Sidebar Desktop */}
      <div 
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: isExpanded ? "240px" : "80px",
          background: colors.bg,
          borderRight: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          zIndex: 1050,
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isExpanded ? "10px 0 30px rgba(0,0,0,0.3)" : "none",
          overflow: "hidden"
        }}
        className="sidebar-container"
      >
        <div style={{ padding: "0 24px 32px 24px", display: "flex", alignItems: "center", gap: "12px", minWidth: "200px" }}>
          {/* NourishFit Logo Mark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="32" height="32" rx="8" fill={colors.accent} />
            {/* Leaf / plant */}
            <path d="M16 26 C16 26 9 20 9 13.5 C9 10 11.5 7 16 7 C20.5 7 23 10 23 13.5 C23 20 16 26 16 26Z" fill="white" fillOpacity="0.15"/>
            <path d="M16 26 C16 26 9 20 9 13.5 C9 10 11.5 7 16 7 C20.5 7 23 10 23 13.5 C23 20 16 26 16 26Z" stroke={colors.bg} strokeWidth="2" strokeLinejoin="round"/>
            {/* Center vein */}
            <path d="M16 24 L16 11" stroke={colors.bg} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
            {/* Left vein */}
            <path d="M16 17 L11.5 13.5" stroke={colors.bg} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
            {/* Right vein */}
            <path d="M16 17 L20.5 13.5" stroke={colors.bg} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
          </svg>
          <span style={{ 
            fontFamily: "'Inter', sans-serif", 
            fontSize: "18px", 
            fontWeight: 800, 
            letterSpacing: "-0.5px",
            whiteSpace: "nowrap",
            opacity: isExpanded ? 1 : 0,
            transition: "opacity 0.2s"
          }}>NourishFit</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", padding: "0 12px" }}>
          {tabs.map((tab, i) => (
            <div
              key={i}
              onClick={() => router.push(tab.route)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: "12px",
                cursor: "pointer",
                background: path === tab.route ? colors.accentMuted : "transparent",
                color: path === tab.route ? colors.accent : colors.text,
                transition: "all 0.2s",
                minWidth: "200px",
                opacity: path === tab.route ? 1 : 0.7
              }}
              onMouseEnter={(e) => {
                if (path !== tab.route) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.opacity = "1";
                }
              }}
              onMouseLeave={(e) => {
                if (path !== tab.route) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.opacity = "0.7";
                }
              }}
            >
              <span style={{ fontSize: "20px", width: "24px", display: "flex", justifyContent: "center", flexShrink: 0 }}>{tab.icon}</span>
              <span style={{ 
                marginLeft: "16px", 
                fontSize: "14px", 
                fontWeight: 500,
                whiteSpace: "nowrap",
                opacity: isExpanded ? 1 : 0,
                transition: "opacity 0.2s"
              }}>{tab.name}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "0 12px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            padding: "12px 16px", 
            borderRadius: "12px",
            opacity: 0.4,
            fontSize: "12px",
            whiteSpace: "nowrap",
            overflow: "hidden"
          }}>
            {isExpanded ? "© 2026 NourishFit v3.0" : "v3.0"}
          </div>
        </div>
      </div>

      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div 
          onClick={() => setIsExpanded(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1040,
            display: "none" // Managed via CSS
          }}
          className="sidebar-overlay"
        />
      )}
    </>
  );
}
