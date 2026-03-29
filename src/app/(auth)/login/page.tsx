"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, TrendingUp, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/dashboard");
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

        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Bienvenido de vuelta
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.75rem", fontSize: "0.9rem" }}>
          Inicia sesión para continuar
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

        <form id="login-form" onSubmit={handleSubmit} autoComplete="on" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{
                position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
                color: "var(--text-secondary)"
              }} />
              <input
                className="input"
                style={{ paddingLeft: "2.5rem" }}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{
                position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)",
                color: "var(--text-secondary)"
              }} />
              <input
                className="input"
                style={{ paddingLeft: "2.5rem" }}
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem", justifyContent: "center" }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <hr className="divider" style={{ margin: "1.5rem 0" }} />

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          ¿No tienes cuenta?{" "}
          <Link href="/register" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
