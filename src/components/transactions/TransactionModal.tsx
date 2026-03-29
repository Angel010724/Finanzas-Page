"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/types";

interface TransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  transaction?: {
    id: string;
    type: string;
    amount: number;
    category: string;
    description?: string | null;
    date: string;
    recurring: boolean;
    recurringFrequency?: string | null;
    currency: string;
  };
}

const CURRENCIES = ["USD", "EUR", "PAB", "MXN", "COP", "CRC"];

export default function TransactionModal({ onClose, onSuccess, transaction }: TransactionModalProps) {
  const router = useRouter();
  const isEdit = !!transaction;

  const [form, setForm] = useState({
    type: transaction?.type ?? "expense",
    amount: transaction?.amount?.toString() ?? "",
    category: transaction?.category ?? "comida",
    description: transaction?.description ?? "",
    date: transaction?.date ? transaction.date.split("T")[0] : new Date().toISOString().split("T")[0],
    recurring: transaction?.recurring ?? false,
    recurringFrequency: transaction?.recurringFrequency ?? "biweekly",
    currency: transaction?.currency ?? "USD",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }

    setLoading(true);
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      description: form.description || undefined,
      date: new Date(form.date).toISOString(),
      recurring: form.recurring,
      recurringFrequency: form.recurring ? form.recurringFrequency : null,
      currency: form.currency,
    };

    const res = await fetch(
      isEdit ? `/api/transactions/${transaction!.id}` : "/api/transactions",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Error al guardar");
      setLoading(false);
    } else {
      router.refresh();
      onSuccess();
    }
  };

  const incomeCategories = CATEGORIES.filter(c => c.id === "ingreso");
  const expenseCategories = CATEGORIES.filter(c => c.id !== "ingreso");
  const displayCategories = form.type === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
            {isEdit ? "Editar transacción" : "Nueva transacción"}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: "var(--danger-light)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "var(--radius-sm)",
            padding: "0.625rem 0.875rem",
            color: "var(--danger)",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Type toggle */}
          <div style={{ display: "flex", background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", padding: 4 }}>
            {(["expense", "income"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: t, category: t === "income" ? "ingreso" : "comida" }))}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  background: form.type === t ? (t === "income" ? "var(--accent)" : "var(--danger)") : "transparent",
                  color: form.type === t ? "#fff" : "var(--text-secondary)",
                  transition: "all 0.2s",
                }}
              >
                {t === "income" ? "💰 Ingreso" : "💸 Gasto"}
              </button>
            ))}
          </div>

          {/* Amount + Currency */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Monto</label>
              <input
                className="input"
                type="number"
                name="amount"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
                style={{ fontSize: isMobile ? "16px" : undefined }}
              />
            </div>
            <div className="input-group" style={{ width: 90 }}>
              <label className="input-label">Moneda</label>
              <select className="input" name="currency" value={form.currency} onChange={handleChange}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="input-group">
            <label className="input-label">Categoría</label>
            <select className="input" name="category" value={form.category} onChange={handleChange}>
              {displayCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">Descripción <span style={{ color: "var(--text-secondary)" }}>(opcional)</span></label>
            <input
              className="input"
              type="text"
              name="description"
              placeholder="Ej: Super 99, Renta mensual..."
              value={form.description}
              onChange={handleChange}
              style={{ fontSize: isMobile ? "16px" : undefined }}
            />
          </div>

          {/* Date */}
          <div className="input-group">
            <label className="input-label">Fecha</label>
            <input
              className="input"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Recurring */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              name="recurring"
              checked={form.recurring}
              onChange={handleChange}
              style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
            />
            <span style={{ fontSize: isMobile ? "0.85rem" : "0.875rem" }}>Gasto/ingreso recurrente</span>
          </label>

          {/* Frequency selector — shown when recurring is checked */}
          {form.recurring && (
            <div className="input-group">
              <label className="input-label">Frecuencia</label>
              <select className="input" name="recurringFrequency" value={form.recurringFrequency} onChange={handleChange}>
                <option value="weekly">📅 Semanal</option>
                <option value="biweekly">💰 Quincenal</option>
                <option value="monthly">📆 Mensual</option>
                <option value="yearly">📋 Anual</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: "center" }} disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : null}
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Guardar transacción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
