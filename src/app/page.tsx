"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3, Target, Sparkles, Shield, TrendingUp,
  ArrowRight, Repeat, Download,
} from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Control total",
    desc: "Visualiza ingresos, gastos y balance en tiempo real.",
    color: "#10b981",
  },
  {
    icon: BarChart3,
    title: "Reportes claros",
    desc: "Gráficos mensuales y anuales para entender tu dinero.",
    color: "#3b82f6",
  },
  {
    icon: Target,
    title: "Metas de ahorro",
    desc: "Define objetivos y sigue tu progreso quincena a quincena.",
    color: "#f59e0b",
  },
  {
    icon: Sparkles,
    title: "Asesor IA",
    desc: "Consejos personalizados basados en tus hábitos financieros.",
    color: "#8b5cf6",
  },
  {
    icon: Repeat,
    title: "Gastos recurrentes",
    desc: "Automatiza pagos fijos y nunca pierdas de vista tus compromisos.",
    color: "#ec4899",
  },
  {
    icon: Download,
    title: "Exporta tus datos",
    desc: "Descarga reportes en CSV o imprime en PDF cuando quieras.",
    color: "#06b6d4",
  },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // If logged in, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-secondary)" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden" }}>
      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "1rem 1.25rem" : "1.25rem 3rem",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(15, 15, 26, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(42, 42, 74, 0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: "var(--radius-sm)",
            overflow: "hidden", flexShrink: 0,
          }}>
            <img src="/favicon.png" alt="Nexo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Nexo</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/login" className="btn btn-ghost btn-sm" style={{ textDecoration: "none", fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
            Iniciar sesión
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm" style={{ textDecoration: "none", fontSize: isMobile ? "0.8rem" : "0.875rem" }}>
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: isMobile ? "7rem 1.5rem 3rem" : "9rem 3rem 4rem",
        position: "relative",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: isMobile ? 300 : 500,
          height: isMobile ? 300 : 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div className="landing-fade-in landing-float landing-glow" style={{
          width: isMobile ? 180 : 280,
          marginBottom: isMobile ? "1.5rem" : "2rem",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          <img src="/landing.png" alt="Nexo" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        <h1 className="landing-fade-in-d1" style={{
          fontSize: isMobile ? "1.75rem" : "3rem",
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: 700,
          marginBottom: "1rem",
        }}>
          Tus finanzas,{" "}
          <span className="landing-gradient-text">bajo control</span>
        </h1>

        <p className="landing-fade-in-d2" style={{
          fontSize: isMobile ? "0.95rem" : "1.15rem",
          color: "var(--text-secondary)",
          maxWidth: 520,
          lineHeight: 1.6,
          marginBottom: isMobile ? "1.5rem" : "2rem",
        }}>
          Organiza ingresos, gastos y metas de ahorro en un solo lugar.
          Con inteligencia artificial que te guía hacia mejores decisiones.
        </p>

        <div className="landing-fade-in-d3" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/register" className="btn btn-primary" style={{
            textDecoration: "none",
            padding: isMobile ? "0.75rem 1.5rem" : "0.875rem 2rem",
            fontSize: isMobile ? "0.9rem" : "1rem",
            fontWeight: 600,
          }}>
            Comenzar gratis <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{
            textDecoration: "none",
            padding: isMobile ? "0.75rem 1.5rem" : "0.875rem 2rem",
            fontSize: isMobile ? "0.9rem" : "1rem",
          }}>
            Ya tengo cuenta
          </Link>
        </div>

        {/* Trust badges */}
        <div className="landing-fade-in-d4" style={{
          display: "flex",
          gap: isMobile ? "1rem" : "2rem",
          marginTop: isMobile ? "2rem" : "3rem",
          color: "var(--text-secondary)",
          fontSize: isMobile ? "0.7rem" : "0.8rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Shield size={14} color="var(--accent)" /> 100% seguro
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <TrendingUp size={14} color="var(--accent)" /> Gratis para siempre
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Sparkles size={14} color="var(--accent)" /> IA incluida
          </span>
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: isMobile ? "2rem 1.25rem 3rem" : "3rem 3rem 5rem",
        maxWidth: 1000,
        margin: "0 auto",
      }}>
        <h2 className="landing-fade-in-d3" style={{
          textAlign: "center",
          fontSize: isMobile ? "1.25rem" : "1.75rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}>
          Todo lo que necesitas
        </h2>
        <p className="landing-fade-in-d4" style={{
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: isMobile ? "0.85rem" : "0.95rem",
          maxWidth: 450,
          margin: `0 auto ${isMobile ? "1.5rem" : "2.5rem"}`,
        }}>
          Herramientas simples y poderosas para dominar tus finanzas personales.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: isMobile ? "0.75rem" : "1.25rem",
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`landing-fade-in-d${Math.min(i + 1, 6)}`}
              style={{
                padding: isMobile ? "1.25rem" : "1.5rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = f.color;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${f.color}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 40, height: 40,
                borderRadius: "var(--radius-sm)",
                background: `${f.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "0.75rem",
              }}>
                <f.icon size={20} color={f.color} />
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{
        padding: isMobile ? "2rem 1.25rem 3rem" : "3rem 3rem 5rem",
        textAlign: "center",
      }}>
        <div className="landing-fade-in" style={{
          maxWidth: 550,
          margin: "0 auto",
          padding: isMobile ? "2rem 1.5rem" : "3rem 2.5rem",
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(139,92,246,0.1))",
          border: "1px solid rgba(16,185,129,0.2)",
        }}>
          <h2 style={{ fontSize: isMobile ? "1.15rem" : "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            ¿Listo para tomar el control?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: isMobile ? "0.85rem" : "0.95rem", marginBottom: "1.5rem" }}>
            Crea tu cuenta en segundos. Sin tarjeta de crédito.
          </p>
          <Link href="/register" className="btn btn-primary" style={{
            textDecoration: "none",
            padding: "0.875rem 2rem",
            fontSize: "1rem",
            fontWeight: 600,
          }}>
            Crear cuenta gratis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: isMobile ? "1.5rem 1.25rem" : "2rem 3rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
        fontSize: "0.75rem",
        color: "var(--text-secondary)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, overflow: "hidden" }}>
            <img src="/favicon.png" alt="Nexo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span>Nexo · Finanzas Inteligentes</span>
        </div>
        <span>© {new Date().getFullYear()} Nexo. Todos los derechos reservados.</span>
      </footer>
    </div>
  );
}
