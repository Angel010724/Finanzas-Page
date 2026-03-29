"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, AlertTriangle, Loader2, Edit3, TrendingUp, ShieldAlert } from "lucide-react";
import { CATEGORIES } from "@/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface BudgetWithSpent {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  percentage: number;
}

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState<BudgetWithSpent | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
    if (res.ok) {
      const data = await res.json();
      setBudgets(data.budgets);
      setTotalBudgeted(data.totalBudgeted);
      setTotalSpent(data.totalSpent);
    }
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    fetchBudgets();
  };

  const getBarGradient = (pct: number) => {
    if (pct >= 100) return "linear-gradient(90deg, #ef4444, #dc2626)";
    if (pct >= 90) return "linear-gradient(90deg, #f59e0b, #ef4444)";
    if (pct >= 70) return "linear-gradient(90deg, #10b981, #f59e0b)";
    return "linear-gradient(90deg, #10b981, #34d399)";
  };

  const getAlertClass = (pct: number) => {
    if (pct >= 100) return "pulse-danger";
    if (pct >= 90) return "pulse-warning";
    return "";
  };

  const getCat = (id: string) =>
    CATEGORIES.find(c => c.id === id) ?? { label: id, icon: "📦", color: "#6b7280" };

  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const totalPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  // Alerts
  const overBudgetCategories = budgets.filter(b => b.percentage >= 100);
  const nearLimitCategories = budgets.filter(b => b.percentage >= 80 && b.percentage < 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1rem" : "1.5rem" }}>
      {/* Month selector + Add button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
          }}>←</button>
          <span style={{ fontWeight: 600, fontSize: isMobile ? "0.9rem" : "1rem", minWidth: isMobile ? 100 : 130, textAlign: "center" }}>
            {MONTHS[month - 1]} {year}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
          }}>→</button>
        </div>
        <button className={`btn btn-primary ${isMobile ? "btn-sm" : ""}`} onClick={() => { setEditBudget(null); setShowModal(true); }}>
          <Plus size={16} /> {isMobile ? "Agregar" : "Agregar presupuesto"}
        </button>
      </div>

      {/* Alert banners */}
      {overBudgetCategories.length > 0 && (
        <div className="alert-banner alert-banner-danger">
          <ShieldAlert size={18} />
          <span>
            <strong>⚠️ {overBudgetCategories.length} categoría{overBudgetCategories.length > 1 ? "s" : ""} excedida{overBudgetCategories.length > 1 ? "s" : ""}:</strong>{" "}
            {overBudgetCategories.map(b => getCat(b.category).label).join(", ")}
          </span>
        </div>
      )}
      {nearLimitCategories.length > 0 && (
        <div className="alert-banner alert-banner-warning">
          <AlertTriangle size={18} />
          <span>
            {nearLimitCategories.length} categoría{nearLimitCategories.length > 1 ? "s" : ""} cerca del límite ({nearLimitCategories.map(b => `${getCat(b.category).label} ${b.percentage}%`).join(", ")})
          </span>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? "0.5rem" : "1rem" }}>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Presupuestado</p>
          <p style={{ fontWeight: 700, fontSize: isMobile ? "1rem" : "1.2rem" }}>
            ${totalBudgeted.toLocaleString("es", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Gastado</p>
          <p style={{ fontWeight: 700, color: totalPct >= 90 ? "var(--danger)" : totalPct >= 70 ? "var(--warning)" : "var(--accent)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
            ${totalSpent.toLocaleString("es", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem", gridColumn: isMobile ? "1 / -1" : undefined }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Disponible</p>
          <p style={{ fontWeight: 700, color: totalBudgeted - totalSpent >= 0 ? "var(--accent)" : "var(--danger)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
            ${(totalBudgeted - totalSpent).toLocaleString("es", { maximumFractionDigits: 0 })}
          </p>
          {/* Overall progress bar */}
          <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: "0.5rem" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: getBarGradient(totalPct),
              width: `${Math.min(totalPct, 100)}%`,
              transition: "width 0.6s ease",
            }} />
          </div>
          <p style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{totalPct}% del presupuesto total</p>
        </div>
      </div>

      {/* Budget cards */}
      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>Cargando presupuestos...</p>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>No tienes presupuestos para este mes</p>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditBudget(null); setShowModal(true); }}>
            <Plus size={14} /> Crear primer presupuesto
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "0.75rem" : "1rem" }}>
          {budgets.map(b => {
            const { label, icon, color } = getCat(b.category);
            const overBudget = b.percentage > 100;
            const alertClass = getAlertClass(b.percentage);
            return (
              <div key={b.id} className={`card card-hover ${alertClass}`} style={{
                padding: isMobile ? "1rem" : "1.25rem",
                borderLeft: overBudget ? "3px solid var(--danger)" : b.percentage >= 80 ? "3px solid var(--warning)" : `3px solid ${color}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: "var(--radius-sm)",
                      background: `${color}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem",
                    }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        ${b.spent.toLocaleString("es", { maximumFractionDigits: 0 })} / ${b.amount.toLocaleString("es", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    {b.percentage >= 90 && (
                      <AlertTriangle size={16} color={b.percentage >= 100 ? "var(--danger)" : "var(--warning)"} />
                    )}
                    <button className="btn btn-ghost btn-icon" onClick={() => { setEditBudget(b); setShowModal(true); }} title="Editar">
                      <Edit3 size={13} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDeleteId(b.id)} title="Eliminar">
                      <Trash2 size={13} style={{ color: "var(--danger)" }} />
                    </button>
                  </div>
                </div>

                {/* Progress bar with gradient */}
                <div style={{ height: 8, background: "var(--border)", borderRadius: 4 }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 4,
                    background: getBarGradient(b.percentage),
                    width: `${Math.min(b.percentage, 100)}%`,
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.375rem" }}>
                  <span style={{
                    fontSize: "0.75rem",
                    color: b.percentage >= 100 ? "var(--danger)" : b.percentage >= 80 ? "var(--warning)" : "var(--accent)",
                    fontWeight: 600,
                  }}>
                    {b.percentage}%
                  </span>
                  {overBudget && (
                    <span style={{ fontSize: "0.7rem", color: "var(--danger)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <TrendingUp size={12} />
                      Excedido ${(b.spent - b.amount).toLocaleString("es", { maximumFractionDigits: 0 })}
                    </span>
                  )}
                  {!overBudget && b.percentage >= 80 && (
                    <span style={{ fontSize: "0.7rem", color: "var(--warning)", fontWeight: 500 }}>
                      Quedan ${(b.amount - b.spent).toLocaleString("es", { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <BudgetModal
          month={month}
          year={year}
          existingCategories={editBudget ? budgets.filter(b => b.id !== editBudget.id).map(b => b.category) : budgets.map(b => b.category)}
          editData={editBudget}
          onClose={() => { setShowModal(false); setEditBudget(null); }}
          onSuccess={() => { setShowModal(false); setEditBudget(null); fetchBudgets(); }}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Eliminar presupuesto"
          message="¿Estás seguro de que quieres eliminar este presupuesto?"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}

// --- Budget Modal (Create/Edit) ---
function BudgetModal({ month, year, existingCategories, editData, onClose, onSuccess }: {
  month: number; year: number; existingCategories: string[];
  editData: BudgetWithSpent | null;
  onClose: () => void; onSuccess: () => void;
}) {
  const [category, setCategory] = useState(editData?.category ?? "");
  const [amount, setAmount] = useState(editData?.amount?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const available = CATEGORIES.filter(c => c.id !== "ingreso" && !existingCategories.includes(c.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || Number(amount) <= 0) {
      setError("Selecciona una categoría y monto válido");
      return;
    }
    setSaving(true);

    if (editData) {
      // Update existing budget
      const res = await fetch(`/api/budgets/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Error al actualizar");
        setSaving(false);
      } else {
        onSuccess();
      }
    } else {
      // Create new budget
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount: Number(amount), month, year }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Error al guardar");
        setSaving(false);
      } else {
        onSuccess();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
            {editData ? "Editar presupuesto" : "Nuevo presupuesto"}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{ background: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "0.625rem 0.875rem", color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {editData ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", background: "var(--bg-primary)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: "1.2rem" }}>{CATEGORIES.find(c => c.id === editData.category)?.icon ?? "📦"}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{CATEGORIES.find(c => c.id === editData.category)?.label ?? editData.category}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Gastado: ${editData.spent.toLocaleString("es", { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label">Categoría</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {available.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Límite mensual ($)</label>
            <input className="input" type="number" min="1" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: "center" }} disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : null}
              {saving ? "Guardando..." : editData ? "Actualizar" : "Crear presupuesto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
