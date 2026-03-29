"use client";

import { TrendingDown, TrendingUp, Wallet, Target } from "lucide-react";
import { useState, useEffect } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  icon: "income" | "expense" | "balance" | "goal";
}

const icons = {
  income: TrendingUp,
  expense: TrendingDown,
  balance: Wallet,
  goal: Target,
};

const colors = {
  income: "var(--accent)",
  expense: "var(--danger)",
  balance: "#3b82f6",
  goal: "#f59e0b",
};

export default function MetricCard({ label, value, sub, trend, trendUp, icon }: MetricCardProps) {
  const Icon = icons[icon];
  const color = colors[icon];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="card card-hover" style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
        <p style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>{label}</p>
        <div style={{
          width: isMobile ? 28 : 32, height: isMobile ? 28 : 32,
          borderRadius: "var(--radius-sm)",
          background: `${color}20`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={isMobile ? 14 : 16} color={color} />
        </div>
      </div>

      <p style={{
        fontSize: isMobile ? "1.25rem" : "1.75rem",
        fontWeight: 700, color, lineHeight: 1.2,
        marginBottom: "0.25rem",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value}
      </p>

      {trend && (
        <p style={{ fontSize: "0.7rem", color: trendUp ? "var(--danger)" : "var(--accent)", fontWeight: 500 }}>
          {trendUp ? "+" : ""}{trend}
        </p>
      )}

      {sub && (
        <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
