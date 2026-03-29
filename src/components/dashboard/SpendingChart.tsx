"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface SpendingChartProps {
  data: { month: string; income: number; expenses: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "0.625rem 0.875rem",
        fontSize: "0.8rem",
      }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.25rem", fontWeight: 500 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
            {p.name === "income" ? "Ingresos" : "Gastos"}: ${p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SpendingChart({ data }: SpendingChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="card" style={{ flex: 2, minWidth: 0 }}>
      <h3 style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: 600, marginBottom: isMobile ? "0.75rem" : "1.25rem" }}>
        Gastos últimos 6 meses
      </h3>
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
        <BarChart data={data} barCategoryGap="30%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: isMobile ? 10 : 12, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          {!isMobile && (
            <YAxis
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v >= 1000 ? `${v / 1000}k` : v}`}
            />
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="income" fill="var(--accent)" radius={[4, 4, 0, 0]} name="income" />
          <Bar dataKey="expenses" fill="#2a2a4a" radius={[4, 4, 0, 0]} name="expenses" />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent)", display: "inline-block" }} /> Ingresos
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "#2a2a4a", display: "inline-block" }} /> Gastos
        </span>
      </div>
    </div>
  );
}
