"use client";

import { useState, useEffect } from "react";
import { CATEGORIES } from "@/types";
import type { Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getCatInfo = (id: string) =>
    CATEGORIES.find(c => c.id === id) ?? { label: id, icon: "📦", color: "#6b7280" };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es", { day: "numeric", month: "short" });
  };

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? "0.75rem" : "1.25rem" }}>
        <h3 style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: 600 }}>Últimas transacciones</h3>
        <a href="/transactions" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
          Ver todas →
        </a>
      </div>

      {transactions.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textAlign: "center", padding: "1.5rem 0" }}>
          No hay transacciones este mes
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          {transactions.map((tx) => {
            const { label, icon, color } = getCatInfo(tx.category);
            const isIncome = tx.type === "income";
            return (
              <div key={tx.id} style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "0.5rem" : "0.875rem",
                padding: isMobile ? "0.5rem 0.25rem" : "0.75rem",
                borderRadius: "var(--radius-sm)",
                transition: "background 0.15s",
                cursor: "default",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: isMobile ? 34 : 40, height: isMobile ? 34 : 40,
                  borderRadius: "var(--radius-sm)",
                  background: `${color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isMobile ? "0.95rem" : "1.1rem",
                  flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <p style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tx.description ?? label}
                  </p>
                  <p style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {label} · {formatDate(tx.date)}
                  </p>
                </div>
                <p style={{
                  fontWeight: 700,
                  fontSize: isMobile ? "0.85rem" : "0.95rem",
                  color: isIncome ? "var(--accent)" : "var(--danger)",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}>
                  {isIncome ? "+" : "-"}${tx.amount.toLocaleString("es", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

