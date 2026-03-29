"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, ChevronDown } from "lucide-react";

interface HeaderProps {
  title: string;
  onAddTransaction?: () => void;
  selectedMonth?: number;
  selectedYear?: number;
  onMonthChange?: (month: number, year: number) => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function Header({
  title,
  onAddTransaction,
  selectedMonth,
  selectedYear,
  onMonthChange,
}: HeaderProps) {
  const now = new Date();
  const [month, setMonth] = useState(selectedMonth ?? now.getMonth() + 1);
  const [year, setYear] = useState(selectedYear ?? now.getFullYear());
  const [showPicker, setShowPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMonthSelect = (m: number) => {
    setMonth(m);
    setShowPicker(false);
    onMonthChange?.(m, year);
  };

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "1rem 1rem 1rem 3.5rem" : "1.25rem 2rem",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-secondary)",
      position: "sticky",
      top: 0,
      zIndex: 40,
      gap: "0.5rem",
      flexWrap: isMobile ? "wrap" : "nowrap",
    }}>
      <h1 style={{ fontSize: isMobile ? "1.15rem" : "1.5rem", fontWeight: 700, flex: isMobile ? "1 1 auto" : undefined }}>
        {title}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        {/* Month Picker */}
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPicker(!showPicker)}
            style={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}
          >
            <Calendar size={14} />
            {isMobile ? `${MONTHS[month - 1].slice(0, 3)} ${year}` : `${MONTHS[month - 1]} ${year}`}
            <ChevronDown size={12} />
          </button>

          {showPicker && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem",
              zIndex: 100,
              minWidth: 200,
              boxShadow: "var(--shadow-lg)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setYear(y => y - 1)}>←</button>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{year}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setYear(y => y + 1)}>→</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.25rem" }}>
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    className="btn btn-ghost btn-sm"
                    style={{
                      justifyContent: "center",
                      background: month === i + 1 ? "var(--accent-light)" : "transparent",
                      color: month === i + 1 ? "var(--accent)" : "var(--text-secondary)",
                      borderRadius: "var(--radius-sm)",
                    }}
                    onClick={() => handleMonthSelect(i + 1)}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add transaction button */}
        <button className={`btn btn-primary ${isMobile ? "btn-sm" : ""}`} onClick={onAddTransaction}>
          <Plus size={16} />
          {isMobile ? "Agregar" : "Agregar gasto"}
        </button>
      </div>
    </header>
  );
}
