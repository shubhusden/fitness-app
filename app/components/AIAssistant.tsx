"use client";
import { useState } from "react";
import Image from "next/image";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm Joel, how can I help?" },
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Joel is offline right now." },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Joel button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          width: "55px",
          height: "55px",
          borderRadius: "50%",
          overflow: "hidden",
          cursor: "pointer",
          border: "2px solid #d4a853",
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(212,168,83,0.25)",
        }}
      >
        <Image
          src="/joel.webp"
          alt="Joel AI Assistant"
          width={55}
          height={55}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </div>

      {/* Chat box */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "155px",
            right: "20px",
            width: "320px",
            height: "420px",
            background: "linear-gradient(160deg, #1c1b18 0%, #141310 100%)",
            border: "1px solid rgba(212,168,83,0.15)",
            borderRadius: "20px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "scaleIn 0.2s ease both",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              paddingBottom: "10px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#6b9d6b",
                }}
              />
              <span style={{ fontWeight: 600, fontSize: "14px" }}>Joel</span>
              <span style={{ fontSize: "11px", color: "#7a7568" }}>AI Coach</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#7a7568",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  margin: "6px 0",
                  textAlign: m.role === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg, #d4a853, #b8883a)"
                        : "rgba(255,255,255,0.05)",
                    padding: "8px 14px",
                    borderRadius:
                      m.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    display: "inline-block",
                    maxWidth: "85%",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: m.role === "user" ? "#0e0d0b" : "#f0ebe0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Joel anything..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.04)",
                color: "#f0ebe0",
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #d4a853, #b8883a)",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
                color: "#0e0d0b",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}