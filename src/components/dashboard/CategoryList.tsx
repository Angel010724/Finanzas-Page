"use client";

import { useState, useEffect } from "react";
import { CATEGORIES } from "@/types";

interface CategoryListProps {
  data: { category: string; amount: number; percentage: number }[];
}

export default function CategoryList({ data }: CategoryListProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getCatInfo = (id: string) =>
    CATEGORIES.find(c => c.id === id) ?? { label: id, icon: "📦", color: "#6b7280" };

  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: 600, marginBottom: isMobile ? "0.75rem" : "1.125rem" }}>Categorías</h3>
      {data.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>
          Sin gastos este mes
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.625rem" : "0.875rem" }}>
          {data.slice(0, 6).map(({ category, amount, percentage }) => {
            const { label, icon, color } = getCatInfo(category);
            return (
              <div key={category}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden", minWidth: 0 }}>
                    <span style={{ fontSize: isMobile ? "0.9rem" : "1rem", flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
                  </div>
                  <span style={{ fontSize: isMobile ? "0.7rem" : "0.8rem", color: "var(--text-secondary)", fontWeight: 500, flexShrink: 0, marginLeft: "0.5rem" }}>
                    ${amount.toLocaleString("es", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                  <div style={{
                    height: "100%",
                    borderRadius: 2,
                    background: color,
                    width: `${Math.min(percentage, 100)}%`,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

