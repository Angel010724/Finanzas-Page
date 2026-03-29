"use client";

import { useEffect, useState, useCallback } from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import SpendingChart from "@/components/dashboard/SpendingChart";
import CategoryList from "@/components/dashboard/CategoryList";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import type { DashboardMetrics } from "@/types";

export default function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<DashboardMetrics | null>(null);
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
    const res = await fetch(`/api/dashboard?month=${month}&year=${year}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh when transactions change from header modal or other pages
  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener("transaction-updated", handler);
    return () => window.removeEventListener("transaction-updated", handler);
  }, [fetchData]);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const expenseDiff = data && data.previousMonthExpenses > 0
    ? (((data.expenses - data.previousMonthExpenses) / data.previousMonthExpenses) * 100).toFixed(0)
    : null;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-secondary)" }}>
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1rem" : "1.5rem", minWidth: 0, width: "100%" }}>
      {/* Metric Cards — 2x2 grid on mobile, row on desktop */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
        gap: isMobile ? "0.75rem" : "1rem",
      }}>
        <MetricCard
          label="Ingresos del mes"
          value={formatMoney(data?.income ?? 0)}
          sub={`${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][month-1]} ${year}`}
          icon="income"
        />
        <MetricCard
          label="Gastos del mes"
          value={formatMoney(data?.expenses ?? 0)}
          trend={expenseDiff ? `${expenseDiff}% vs mes ant.` : undefined}
          trendUp={Number(expenseDiff) > 0}
          icon="expense"
        />
        <MetricCard
          label="Balance neto"
          value={formatMoney(data?.balance ?? 0)}
          sub={data && data.income > 0 ? `Ahorro: ${Math.round((data.balance / data.income) * 100)}%` : undefined}
          icon="balance"
        />
        <MetricCard
          label="Meta de ahorro"
          value={data?.savingsGoal ? `${Math.round((data.savingsGoal.progress / data.savingsGoal.target) * 100)}%` : "—"}
          sub={data?.savingsGoal ? `$${data.savingsGoal.target.toLocaleString()} obj.` : "Sin meta activa"}
          icon="goal"
        />
      </div>

      {/* Charts — stacked on mobile, side-by-side on desktop */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "1rem" : "1rem",
        minWidth: 0,
      }}>
        <SpendingChart data={data?.monthlyTrend ?? []} />
        <CategoryList data={data?.categoryBreakdown ?? []} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={data?.recentTransactions ?? []} />
    </div>
  );
}
