"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface YearlyData {
  monthly: { month: string; income: number; expenses: number }[];
  totalIncome: number;
  totalExpenses: number;
  avgMonthlyExpense: number;
  avgMonthlyIncome: number;
  bestMonth: { month: string; balance: number } | null;
  worstMonth: { month: string; balance: number } | null;
}

export default function YearlyReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<YearlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reports?type=yearly&year=${year}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (n: number) => `$${n.toLocaleString("es", { maximumFractionDigits: 0 })}`;

  if (loading) return <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>Cargando reporte...</p>;

  const balance = (data?.totalIncome ?? 0) - (data?.totalExpenses ?? 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1rem" : "1.5rem" }}>
      {/* Year selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setYear(y => y - 1)}>←</button>
        <span style={{ fontWeight: 700, fontSize: isMobile ? "1rem" : "1.25rem", minWidth: 60, textAlign: "center" }}>{year}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setYear(y => y + 1)}>→</button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? "0.5rem" : "1rem" }}>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Ingresos totales</p>
          <p style={{ fontWeight: 700, color: "var(--accent)", fontSize: isMobile ? "1rem" : "1.2rem" }}>{fmt(data?.totalIncome ?? 0)}</p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Gastos totales</p>
          <p style={{ fontWeight: 700, color: "var(--danger)", fontSize: isMobile ? "1rem" : "1.2rem" }}>{fmt(data?.totalExpenses ?? 0)}</p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Balance anual</p>
          <p style={{ fontWeight: 700, color: balance >= 0 ? "var(--accent)" : "var(--danger)", fontSize: isMobile ? "1rem" : "1.2rem" }}>{fmt(balance)}</p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Prom. gasto/mes</p>
          <p style={{ fontWeight: 700, fontSize: isMobile ? "1rem" : "1.2rem" }}>{fmt(data?.avgMonthlyExpense ?? 0)}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card" style={{ minWidth: 0 }}>
        <h3 style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Ingresos vs gastos por mes</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
          <BarChart data={data?.monthly ?? []} barCategoryGap="20%" barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: isMobile ? 10 : 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
            {!isMobile && <YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${v/1000}k` : v}`} />}
            <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.8rem" }} />
            <Bar dataKey="income" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Ingresos" />
            <Bar dataKey="expenses" fill="#2a2a4a" radius={[4, 4, 0, 0]} name="Gastos" />
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

      {/* Best / Worst Month */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "0.75rem" : "1rem" }}>
        {data?.bestMonth && (
          <div className="card" style={{ padding: isMobile ? "1rem" : "1.25rem", borderLeft: "3px solid var(--accent)" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>🏆 Mejor mes</p>
            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{data.bestMonth.month}</p>
            <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>+{fmt(data.bestMonth.balance)} balance</p>
          </div>
        )}
        {data?.worstMonth && (
          <div className="card" style={{ padding: isMobile ? "1rem" : "1.25rem", borderLeft: "3px solid var(--danger)" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>📉 Peor mes</p>
            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{data.worstMonth.month}</p>
            <p style={{ color: "var(--danger)", fontWeight: 600, fontSize: "0.9rem" }}>{fmt(data.worstMonth.balance)} balance</p>
          </div>
        )}
      </div>
    </div>
  );
}
