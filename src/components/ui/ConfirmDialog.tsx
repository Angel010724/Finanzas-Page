"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title = "Confirmar",
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 380, padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: "var(--radius-sm)",
            background: danger ? "var(--danger-light)" : "var(--accent-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <AlertTriangle size={20} color={danger ? "var(--danger)" : "var(--accent)"} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.375rem" }}>{title}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.625rem", marginTop: "1.25rem", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>{cancelText}</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"} btn-sm`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
