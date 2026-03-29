"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw, Trash2, Loader2, Calendar, Pause, Play,
  ArrowUpCircle, ArrowDownCircle, Clock, DollarSign, Repeat
} from "lucide-react";
import { CATEGORIES } from "@/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface RecurringTx {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  recurring: boolean;
  recurringFrequency: string | null;
  currency: string;
}

const FREQ_LABELS: Record<string, string> = {
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  yearly: "Anual",
};

export default function RecurringPage() {
  const [transactions, setTransactions] = useState<RecurringTx[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchRecurring = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/recurring");
    if (res.ok) {
      const data = await res.json();
      setTransactions(data.transactions);
      setTotalExpense(data.totalMonthlyExpense);
      setTotalIncome(data.totalMonthlyIncome);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecurring(); }, [fetchRecurring]);

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    fetchRecurring();
  };

  const handleToggle = async (id: string, isRecurring: boolean) => {
    await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recurring: !isRecurring }),
    });
    fetchRecurring();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      alert(`✅ Se generaron ${data.generated} transacciones de este mes.`);
      window.dispatchEvent(new Event("transaction-updated"));
    } else {
      const data = await res.json();
      alert(data.message || "Error al generar");
    }
    setGenerating(false);
  };

  const getCat = (id: string) =>
    CATEGORIES.find(c => c.id === id) ?? { label: id, icon: "📦", color: "#6b7280" };

  const getNextDue = (freq: string | null) => {
    const now = new Date();
    const day = now.getDate();
    switch (freq) {
      case "weekly": {
        const next = new Date(now);
        next.setDate(day + (7 - now.getDay()));
        return next;
      }
      case "biweekly": return day <= 15 ? new Date(now.getFullYear(), now.getMonth(), 15) : new Date(now.getFullYear(), now.getMonth() + 1, 1);
      case "monthly": return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      case "yearly": return new Date(now.getFullYear() + 1, 0, 1);
      default: return null;
    }
  };

  const expenses = transactions.filter(t => t.type === "expense");
  const incomes = transactions.filter(t => t.type === "income");
  const netRecurring = totalIncome - totalExpense;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1rem" : "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: isMobile ? "1.1rem" : "1.25rem", fontWeight: 700 }}>Gastos recurrentes</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {transactions.length} transacción{transactions.length !== 1 ? "es" : ""} recurrente{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className={`btn btn-primary ${isMobile ? "btn-sm" : ""}`}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
          {generating ? "Generando..." : isMobile ? "Generar" : "Generar del mes"}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? "0.5rem" : "1rem" }}>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <ArrowDownCircle size={14} color="var(--danger)" />
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Gastos fijos</p>
          </div>
          <p style={{ fontWeight: 700, color: "var(--danger)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
            ${totalExpense.toLocaleString("es", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <ArrowUpCircle size={14} color="var(--accent)" />
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Ingresos fijos</p>
          </div>
          <p style={{ fontWeight: 700, color: "var(--accent)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
            ${totalIncome.toLocaleString("es", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem", gridColumn: isMobile ? "1 / -1" : undefined }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <DollarSign size={14} color={netRecurring >= 0 ? "var(--accent)" : "var(--danger)"} />
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Balance fijo mensual</p>
          </div>
          <p style={{ fontWeight: 700, color: netRecurring >= 0 ? "var(--accent)" : "var(--danger)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
            ${netRecurring.toLocaleString("es", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>Cargando recurrentes...</p>
      ) : transactions.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <Repeat size={40} style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }} />
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>No tienes gastos recurrentes</p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Marca una transacción como recurrente al crearla para verla aquí
          </p>
        </div>
      ) : (
        <>
          {/* Expenses section */}
          {expenses.length > 0 && (
            <div>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.625rem", letterSpacing: "0.03em" }}>
                💸 GASTOS FIJOS ({expenses.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.5rem" : "0.625rem" }}>
                {expenses.map(tx => <RecurringCard key={tx.id} tx={tx} isMobile={isMobile} getCat={getCat} getNextDue={getNextDue} onToggle={handleToggle} onDelete={setConfirmDeleteId} />)}
              </div>
            </div>
          )}

          {/* Incomes section */}
          {incomes.length > 0 && (
            <div>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.625rem", letterSpacing: "0.03em" }}>
                💰 INGRESOS FIJOS ({incomes.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.5rem" : "0.625rem" }}>
                {incomes.map(tx => <RecurringCard key={tx.id} tx={tx} isMobile={isMobile} getCat={getCat} getNextDue={getNextDue} onToggle={handleToggle} onDelete={setConfirmDeleteId} />)}
              </div>
            </div>
          )}
        </>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Eliminar recurrente"
          message="¿Eliminar esta transacción recurrente? Esto solo elimina la plantilla, no las transacciones ya generadas."
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}

function RecurringCard({ tx, isMobile, getCat, getNextDue, onToggle, onDelete }: {
  tx: RecurringTx;
  isMobile: boolean;
  getCat: (id: string) => { label: string; icon: string; color: string };
  getNextDue: (freq: string | null) => Date | null;
  onToggle: (id: string, isRecurring: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { label, icon, color } = getCat(tx.category);
  const nextDue = getNextDue(tx.recurringFrequency);

  return (
    <div className="card card-hover" style={{
      padding: isMobile ? "0.875rem" : "1rem 1.25rem",
      borderLeft: `3px solid ${tx.type === "expense" ? "var(--danger)" : "var(--accent)"}`,
      display: "flex",
      alignItems: isMobile ? "flex-start" : "center",
      gap: "0.75rem",
      flexDirection: isMobile ? "column" : "row",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flex: 1, width: "100%" }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: "var(--radius-sm)",
          background: `${color}20`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tx.description || label}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{label}</span>
            <span style={{
              fontSize: "0.65rem", padding: "0.125rem 0.5rem",
              background: "var(--bg-primary)", borderRadius: 100,
              color: "var(--text-secondary)",
              display: "flex", alignItems: "center", gap: "0.25rem",
            }}>
              <Clock size={10} />
              {FREQ_LABELS[tx.recurringFrequency ?? ""] ?? "—"}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? "0.5rem" : "0.75rem",
        width: isMobile ? "100%" : "auto",
        justifyContent: isMobile ? "space-between" : "flex-end",
      }}>
        {/* Next due date */}
        {nextDue && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
            <Calendar size={11} />
            {nextDue.toLocaleDateString("es", { day: "numeric", month: "short" })}
          </div>
        )}

        {/* Amount */}
        <p style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color: tx.type === "expense" ? "var(--danger)" : "var(--accent)",
          whiteSpace: "nowrap",
        }}>
          {tx.type === "expense" ? "-" : "+"}${tx.amount.toLocaleString("es", { maximumFractionDigits: 2 })}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.125rem" }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onToggle(tx.id, tx.recurring)}
            title={tx.recurring ? "Pausar" : "Reactivar"}
          >
            {tx.recurring ? <Pause size={14} color="var(--warning)" /> : <Play size={14} color="var(--accent)" />}
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => onDelete(tx.id)} title="Eliminar">
            <Trash2 size={13} style={{ color: "var(--danger)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
