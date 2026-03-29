"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/types";
import type { Transaction } from "@/types";
import TransactionModal from "./TransactionModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh?: () => void;
}

export default function TransactionList({ transactions, onRefresh }: TransactionListProps) {
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getCatInfo = (id: string) =>
    CATEGORIES.find(c => c.id === id) ?? { label: id, icon: "📦", color: "#6b7280" };

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeletingId(null);
    onRefresh?.();
  };

  return (
    <>
      {editTx && (
        <TransactionModal
          transaction={{ ...editTx, date: String(editTx.date) }}
          onClose={() => setEditTx(null)}
          onSuccess={() => { setEditTx(null); onRefresh?.(); }}
        />
      )}


      {confirmDeleteId && (
        <ConfirmDialog
          title="Eliminar transacción"
          message="¿Estás seguro de que quieres eliminar esta transacción? No se puede deshacer."
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
        {transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>
            No hay transacciones. Usa "+ Agregar gasto" para comenzar.
          </p>
        ) : (
          transactions.map(tx => {
            const { label, icon, color } = getCatInfo(tx.category);
            const isIncome = tx.type === "income";

            return (
              <div key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "0.5rem" : "1rem",
                  padding: isMobile ? "0.625rem 0.5rem" : "0.75rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* Icon */}
                <div style={{
                  width: isMobile ? 34 : 42, height: isMobile ? 34 : 42, flexShrink: 0,
                  borderRadius: "var(--radius-sm)",
                  background: `${color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isMobile ? "0.95rem" : "1.1rem",
                }}>
                  {icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <p style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tx.description ?? label}
                  </p>
                  <p style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {label} · {formatDate(tx.date)}
                    {tx.recurring && <span style={{ marginLeft: "0.375rem", color: "var(--accent)" }}>🔄</span>}
                  </p>
                </div>

                {/* Amount */}
                <p style={{
                  fontWeight: 700,
                  fontSize: isMobile ? "0.85rem" : "1rem",
                  color: isIncome ? "var(--accent)" : "var(--danger)",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}>
                  {isIncome ? "+" : "-"}${tx.amount.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-icon" onClick={() => setEditTx(tx)} title="Editar">
                    <Pencil size={15} />
                  </button>
                  <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDeleteId(tx.id)} disabled={deletingId === tx.id} title="Eliminar">
                    {deletingId === tx.id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} style={{ color: "var(--danger)" }} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
