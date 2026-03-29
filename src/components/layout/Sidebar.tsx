"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Star,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  Repeat,
} from "lucide-react";

const navItems = [
  {
    section: "PRINCIPAL",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
      { href: "/budgets", label: "Presupuestos", icon: Star },
      { href: "/recurring", label: "Recurrentes", icon: Repeat },
    ],
  },
  {
    section: "ANÁLISIS",
    links: [
      { href: "/reports/monthly", label: "Por mes", icon: TrendingUp },
      { href: "/reports/yearly", label: "Por año", icon: BarChart3 },
      { href: "/goals", label: "Metas", icon: Target },
    ],
  },
  {
    section: "IA",
    links: [
      { href: "/ai-advisor", label: "Nexo AI", icon: Sparkles },
      { href: "/settings", label: "Configuración", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const initial = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{
        padding: "1.5rem",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 38, height: 38,
            borderRadius: "var(--radius-sm)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}>
            <img src="/favicon.png" alt="Nexo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Nexo</span>
        </div>
        {isMobile && (
          <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
        {navItems.map((group) => (
          <div key={group.section} style={{ marginBottom: "1.5rem" }}>
            <p style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              letterSpacing: "0.08em",
              padding: "0 0.75rem",
              marginBottom: "0.4rem",
            }}>
              {group.section}
            </p>
            {group.links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "0.125rem",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    background: active ? "var(--accent-light)" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{
        padding: "1rem 0.75rem",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}>
        <div style={{
          width: 36, height: 36,
          background: "var(--accent)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem",
          fontWeight: 700,
          color: "#fff",
          flexShrink: 0,
        }}>
          {session?.user?.image
            ? <img src={session.user.image} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            : initial}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {session?.user?.name ?? "Usuario"}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {session?.user?.email}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn btn-ghost btn-icon"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </>
  );

  // Mobile: hamburger button + slide-in drawer
  if (isMobile) {
    return (
      <>
        {/* Hamburger Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="btn btn-ghost btn-icon"
          style={{
            position: "fixed",
            top: "0.75rem",
            left: "0.75rem",
            zIndex: 48,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "0.5rem",
          }}
        >
          <Menu size={22} />
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside style={{
          width: 280,
          minHeight: "100vh",
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}>
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside style={{
      width: "var(--sidebar-width)",
      minHeight: "100vh",
      background: "var(--bg-sidebar)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
    }}>
      {sidebarContent}
    </aside>
  );
}
