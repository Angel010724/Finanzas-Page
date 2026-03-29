"use client";

import { useEffect, useState } from "react";
import { Key, Check, Loader2, Trash2, ExternalLink, Globe } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";

const PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    description: "15 req/min gratis",
    url: "https://aistudio.google.com/apikey",
    placeholder: "AIzaSy...",
  },
  {
    id: "openai",
    name: "OpenAI (GPT)",
    description: "$5 crédito al registrarte",
    url: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
  },
  {
    id: "groq",
    name: "Groq (Llama 3)",
    description: "30 req/min gratis",
    url: "https://console.groq.com/keys",
    placeholder: "gsk_...",
  },
];

export default function SettingsPage() {
  const [provider, setProvider] = useState<string>("");
  const [apiKey, setApiKey] = useState("");
  const [keyPreview, setKeyPreview] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [currSaved, setCurrSaved] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        setProvider(data.aiProvider ?? "");
        setHasKey(data.hasApiKey);
        setKeyPreview(data.aiApiKeyPreview);
        setCurrency(data.preferredCurrency ?? "USD");
        setLoading(false);
      });
  }, []);

  const handleCurrencyChange = async (code: string) => {
    setCurrency(code);
    setCurrSaved(false);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferredCurrency: code }),
    });
    setCurrSaved(true);
    setTimeout(() => setCurrSaved(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const body: any = { aiProvider: provider };
    if (apiKey) body.aiApiKey = apiKey;
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setHasKey(!!apiKey || hasKey);
    if (apiKey) setKeyPreview(`...${apiKey.slice(-4)}`);
    setApiKey("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDisconnect = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiProvider: null, aiApiKey: null }),
    });
    setProvider("");
    setHasKey(false);
    setKeyPreview(null);
    setApiKey("");
    setSaving(false);
  };

  if (loading) return <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>Cargando...</p>;

  const selectedProvider = PROVIDERS.find(p => p.id === provider);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1rem" : "1.5rem", maxWidth: 600 }}>
      {/* Currency Section */}
      <div>
        <h2 style={{ fontSize: isMobile ? "1.1rem" : "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Globe size={20} /> Moneda preferida
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Los montos se mostrarán convertidos a esta moneda en el dashboard.
        </p>
      </div>

      <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "0.5rem" }}>
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCurrencyChange(c.code)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                border: `1.5px solid ${currency === c.code ? "var(--accent)" : "var(--border)"}`,
                background: currency === c.code ? "var(--accent-light)" : "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                color: currency === c.code ? "var(--accent)" : "var(--text-primary)",
                fontWeight: currency === c.code ? 600 : 400,
                fontSize: "0.85rem",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{c.flag}</span>
              {c.code}
            </button>
          ))}
        </div>
        {currSaved && (
          <p style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Check size={12} /> Moneda actualizada
          </p>
        )}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.5rem 0" }} />

      {/* AI Section */}
      <div>
        <h2 style={{ fontSize: isMobile ? "1.1rem" : "1.25rem", fontWeight: 700 }}>Configuración de IA</h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Conecta tu propia API key para usar el asistente Nexo AI. Cada proveedor tiene un tier gratuito.
        </p>
      </div>

      {/* Current status */}
      {hasKey && (
        <div className="card" style={{
          padding: "1rem 1.25rem",
          borderLeft: "3px solid var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}>
          <div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Conectado</p>
            <p style={{ fontWeight: 600 }}>
              {selectedProvider?.name ?? provider} <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>({keyPreview})</span>
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleDisconnect} disabled={saving}>
            <Trash2 size={14} style={{ color: "var(--danger)" }} /> Desconectar
          </button>
        </div>
      )}

      {/* Provider selection */}
      <div className="card" style={{ padding: isMobile ? "1rem" : "1.25rem" }}>
        <p style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.95rem" }}>1. Elige tu proveedor</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {PROVIDERS.map(p => (
            <label
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                border: `1.5px solid ${provider === p.id ? "var(--accent)" : "var(--border)"}`,
                background: provider === p.id ? "var(--accent-light)" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={provider === p.id}
                onChange={() => setProvider(p.id)}
                style={{ accentColor: "var(--accent)" }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{p.description}</p>
              </div>
              <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"
                style={{ fontSize: "0.7rem" }}
                onClick={e => e.stopPropagation()}>
                <ExternalLink size={12} /> Obtener key
              </a>
            </label>
          ))}
        </div>
      </div>

      {/* API Key input */}
      {provider && (
        <div className="card" style={{ padding: isMobile ? "1rem" : "1.25rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.95rem" }}>
            2. Pega tu API Key
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Key size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input
                className="input"
                type="password"
                style={{ paddingLeft: "2.25rem", fontSize: isMobile ? "16px" : "0.9rem" }}
                placeholder={selectedProvider?.placeholder ?? "Tu API key..."}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            🔒 Tu key se guarda encriptada y solo se usa para consultar la IA desde tu cuenta.
          </p>

          <button
            className="btn btn-primary"
            style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}
            onClick={handleSave}
            disabled={saving || (!apiKey && !hasKey)}
          >
            {saving ? <Loader2 size={16} className="spin" /> : saved ? <Check size={16} /> : null}
            {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar configuración"}
          </button>
        </div>
      )}
    </div>
  );
}
