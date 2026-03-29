"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, Trash2, KeyRound, Settings } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "¿Cómo puedo ahorrar más este mes?",
  "¿En qué estoy gastando de más?",
  "Dame un plan para alcanzar mis metas",
  "¿Cómo va mi presupuesto?",
  "Analiza mis finanzas de los últimos 3 meses",
];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexo-ai-chat");
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch { /* ignore */ }
    initialized.current = true;
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (!initialized.current) return;
    if (messages.length > 0) {
      localStorage.setItem("nexo-ai-chat", JSON.stringify(messages));
    } else {
      localStorage.removeItem("nexo-ai-chat");
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("nexo-ai-chat");
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text.trim() }),
      });

      if (!res.ok) throw new Error("Error al conectar con la IA");

      const data = await res.json();
      const aiMsg: Message = { role: "ai", content: data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "⚠️ No pude conectar con el asistente. Verifica tu conexión e intenta de nuevo.", timestamp: new Date() },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: isMobile ? "calc(100vh - 130px)" : "calc(100vh - 100px)",
      maxHeight: isMobile ? "calc(100vh - 130px)" : "calc(100vh - 100px)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: "var(--radius)",
            background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: isMobile ? "1rem" : "1.15rem", fontWeight: 700 }}>Nexo AI</h2>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Asesor financiero personal</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearChat} title="Limpiar chat">
            <Trash2 size={14} /> {!isMobile && "Limpiar"}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="card" style={{
        flex: 1,
        overflow: "auto",
        padding: isMobile ? "0.75rem" : "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        minHeight: 0,
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            textAlign: "center",
            padding: "1rem",
          }}>
            <div style={{
              width: 64, height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={32} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.375rem" }}>¡Hola! Soy Nexo AI 👋</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: 400 }}>
                Analizo tus finanzas y te doy consejos personalizados para ahorrar más y gastar mejor.
              </p>
            </div>

            {/* Suggestions */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "center",
              maxWidth: 500,
            }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.75rem", opacity: 0.85 }}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* API Key Notice */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 1rem",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.25)",
              borderRadius: "var(--radius-sm)",
              maxWidth: 480,
              width: "100%",
            }}>
              <KeyRound size={18} style={{ color: "#3b82f6", flexShrink: 0 }} />
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Para usar Nexo AI, necesitas configurar tu <strong style={{ color: "var(--text-primary)" }}>API Key de Preferencia</strong> en{" "}
                <a
                  href="/settings"
                  style={{
                    color: "#3b82f6",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  <Settings size={12} /> Configuración
                </a>.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                gap: "0.625rem",
                alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}>
                <div style={{
                  width: 30, height: 30,
                  borderRadius: "50%",
                  background: msg.role === "user" ? "var(--accent)" : "linear-gradient(135deg, #8b5cf6, var(--accent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {msg.role === "user" ? <User size={14} color="#fff" /> : <Bot size={14} color="#fff" />}
                </div>
                <div style={{
                  maxWidth: "80%",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  background: msg.role === "user" ? "var(--accent)" : "var(--bg-primary)",
                  color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 30, height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6, var(--accent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  background: "var(--bg-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}>
                  <Loader2 size={14} className="spin" /> Analizando tus finanzas...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        gap: "0.5rem",
        marginTop: "0.75rem",
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          className="input"
          style={{ flex: 1, fontSize: isMobile ? "16px" : "0.9rem" }}
          placeholder="Pregúntale a Nexo AI..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: "0.625rem 1rem" }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
