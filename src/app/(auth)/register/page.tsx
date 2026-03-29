"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, TrendingUp, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Error al crear cuenta");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: "var(--radius-sm)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <img src="/favicon.png" alt="Nexo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Nexo</h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Finanzas Inteligentes</p>
          </div>
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Crear cuenta</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.75rem", fontSize: "0.9rem" }}>
          Empieza a controlar tus finanzas hoy
        </p>

        {error && (
          <div style={{
            background: "var(--danger-light)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            color: "var(--danger)",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}>
            {error}
          </div>
        )}

        <form id="register-form" onSubmit={handleSubmit} autoComplete="on" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Nombre completo</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input className="input" style={{ paddingLeft: "2.5rem" }} type="text" name="name" autoComplete="name" placeholder="Juan Rodríguez" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input className="input" style={{ paddingLeft: "2.5rem" }} type="email" name="email" autoComplete="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input className="input" style={{ paddingLeft: "2.5rem" }} type="password" name="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirmar contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
              <input className="input" style={{ paddingLeft: "2.5rem" }} type="password" name="confirm" autoComplete="new-password" placeholder="Repite tu contraseña" value={form.confirm} onChange={handleChange} required />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <hr className="divider" style={{ margin: "1.5rem 0" }} />

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
