"use client";

import { useEffect, useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Download, Printer } from "lucide-react";
import { CATEGORIES } from "@/types";

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

interface MonthlyData {
  daily: { day: string; income: number; expenses: number }[];
  categories: { category: string; amount: number; percentage: number }[];
  totalIncome: number;
  totalExpenses: number;
  prevIncome: number;
  prevExpenses: number;
  transactionCount: number;
}

export default function MonthlyReportPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<MonthlyData | null>(null);
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
    const res = await fetch(`/api/reports?type=monthly&month=${month}&year=${year}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getCat = (id: string) => CATEGORIES.find(c => c.id === id) ?? { label: id, icon: "📦", color: "#6b7280" };
  const PIE_COLORS = CATEGORIES.map(c => c.color);

  const diff = (curr: number, prev: number) => {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  };

  if (loading) return <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>Cargando reporte...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1rem" : "1.5rem" }}>
      {/* Month selector + Export */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
          }}>←</button>
          <span style={{ fontWeight: 600, fontSize: isMobile ? "0.9rem" : "1rem", minWidth: isMobile ? 110 : 140, textAlign: "center" }}>
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
          }}>→</button>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.open(`/api/export?type=csv&month=${month}&year=${year}`, "_blank")}>
            <Download size={14} /> {isMobile ? "CSV" : "Exportar CSV"}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> {isMobile ? "PDF" : "Imprimir"}
          </button>
        </div>
      </div>

      {/* Comparison cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? "0.5rem" : "1rem" }}>
        {[
          { label: "Ingresos", val: data?.totalIncome ?? 0, prev: data?.prevIncome ?? 0, color: "var(--accent)" },
          { label: "Gastos", val: data?.totalExpenses ?? 0, prev: data?.prevExpenses ?? 0, color: "var(--danger)" },
          { label: "Balance", val: (data?.totalIncome ?? 0) - (data?.totalExpenses ?? 0), prev: (data?.prevIncome ?? 0) - (data?.prevExpenses ?? 0), color: "#3b82f6" },
          { label: "Transacciones", val: data?.transactionCount ?? 0, prev: 0, color: "var(--text-primary)" },
        ].map(c => {
          const d = c.prev > 0 ? diff(c.val, c.prev) : null;
          return (
            <div key={c.label} className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{c.label}</p>
              <p style={{ fontWeight: 700, color: c.color, fontSize: isMobile ? "1rem" : "1.2rem" }}>
                {c.label === "Transacciones" ? c.val : `$${c.val.toLocaleString("es", { maximumFractionDigits: 0 })}`}
              </p>
              {d !== null && (
                <p style={{ fontSize: "0.7rem", color: d >= 0 ? (c.label === "Gastos" ? "var(--danger)" : "var(--accent)") : (c.label === "Gastos" ? "var(--accent)" : "var(--danger)"), fontWeight: 500 }}>
                  {d >= 0 ? "+" : ""}{d}% vs mes anterior
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "1rem" : "1rem" }}>
        {/* Line chart */}
        <div className="card" style={{ flex: 2, minWidth: 0 }}>
          <h3 style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Tendencia diaria</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
            <LineChart data={data?.daily ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: isMobile ? 9 : 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false}
                interval={isMobile ? 4 : 2} />
              {!isMobile && <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${v/1000}k` : v}`} />}
              <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.8rem" }} />
              <Line type="monotone" dataKey="income" stroke="var(--accent)" strokeWidth={2} dot={false} name="Ingresos" />
              <Line type="monotone" dataKey="expenses" stroke="var(--danger)" strokeWidth={2} dot={false} name="Gastos" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Por categoría</h3>
          {(data?.categories?.length ?? 0) === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", padding: "2rem 0" }}>Sin datos</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={isMobile ? 160 : 180}>
                <PieChart>
                  <Pie data={data?.categories ?? []} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={isMobile ? 35 : 45} outerRadius={isMobile ? 60 : 70} paddingAngle={2}>
                    {(data?.categories ?? []).map((c, i) => (
                      <Cell key={c.category} fill={getCat(c.category).color || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.8rem" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                {(data?.categories ?? []).slice(0, 5).map(c => (
                  <span key={c.category} style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: getCat(c.category).color, display: "inline-block" }} />
                    {getCat(c.category).label} {c.percentage}%
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
