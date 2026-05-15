"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTheme } from "./ThemeContext";

interface AIAssistantProps {
  userData?: any;
  foods?: any[];
}

export default function AIAssistant({ userData, foods }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { colors } = useTheme();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm Joel, your AI fitness coach. How's your training going today?" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          userData: userData,
          currentLogs: foods
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Joel is offline right now. Check your connection!" },
      ]);
    } finally {
      setIsTyping(false);
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
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          overflow: "hidden",
          cursor: "pointer",
          border: `2px solid ${colors.accent}`,
          zIndex: 1100,
          boxShadow: `0 8px 32px ${colors.accentMuted}`,
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1) rotate(5deg)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
      >
        <Image
          src="/joel.webp"
          alt="Joel AI Assistant"
          width={60}
          height={60}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </div>

      {/* Chat box */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "min(400px, 90vw)",
            height: "500px",
            background: colors.bg,
            backgroundImage: `radial-gradient(circle at top right, ${colors.accentMuted}, transparent)`,
            border: `1px solid ${colors.border}`,
            borderRadius: "24px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            zIndex: 1100,
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            animation: "scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative" }}>
                <Image src="/joel.webp" alt="Joel" width={32} height={32} style={{ borderRadius: "50%", border: `1px solid ${colors.accent}` }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "10px", height: "10px", borderRadius: "50%", background: "#6b9d6b", border: `2px solid ${colors.bg}` }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px", color: colors.text }}>Joel AI</div>
                <div style={{ fontSize: "11px", color: colors.accent, fontWeight: 500 }}>ACTIVE COACH</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: colors.card, border: "none", color: colors.text, cursor: "pointer", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}
            >✕</button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    background: m.role === "user" ? colors.accent : colors.card,
                    padding: "10px 16px",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: m.role === "user" ? "#0e0d0b" : colors.text,
                    border: m.role === "user" ? "none" : `1px solid ${colors.border}`,
                    boxShadow: m.role === "user" ? `0 4px 12px ${colors.accentMuted}` : "none",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: "flex-start", background: colors.card, padding: "10px 16px", borderRadius: "18px 18px 18px 4px", border: `1px solid ${colors.border}` }}>
                <span className="typing-dots" style={{ display: "flex", gap: "4px" }}>
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: colors.accent, animation: "pulseSubtle 1s infinite" }}></span>
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: colors.accent, animation: "pulseSubtle 1s infinite 0.2s" }}></span>
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: colors.accent, animation: "pulseSubtle 1s infinite 0.4s" }}></span>
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", background: colors.card, padding: "6px", borderRadius: "16px", border: `1px solid ${colors.border}` }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for advice or log workout..."
              style={{
                flex: 1,
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                color: colors.text,
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                background: colors.accent,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0e0d0b",
                transition: "opacity 0.2s"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}