"use client";
import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();

  const tabs = [
    { name: "Home", icon: "🏠", route: "/dashboard" },
    { name: "Workout", icon: "🏋️", route: "/workout" },
    { name: "Progress", icon: "📈", route: "/progress" },
    { name: "Profile", icon: "👤", route: "/profile" }
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      background: "#141412",
      borderTop: "1px solid #333",
      display: "flex",
      justifyContent: "space-around",
      padding: "10px 0",
      zIndex: 1000
    }}>
      {tabs.map((tab, i) => (
        <div
          key={i}
          onClick={() => router.push(tab.route)}
          style={{
            cursor: "pointer",
            textAlign: "center",
            color: path === tab.route ? "#d4a853" : "#888"
          }}
        >
          <div style={{ fontSize: "20px" }}>{tab.icon}</div>
          <div style={{ fontSize: "12px" }}>{tab.name}</div>
        </div>
      ))}
    </div>
  );
}