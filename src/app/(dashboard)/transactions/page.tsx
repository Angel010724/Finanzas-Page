"use client";

import { useEffect, useState, useCallback } from "react";
import { Filter, Search, Download, Printer } from "lucide-react";
import TransactionList from "@/components/transactions/TransactionList";
import type { Transaction } from "@/types";
import { CATEGORIES } from "@/types";

export default function TransactionsPage() {
  const now = new Date();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", category: "", month: String(now.getMonth() + 1), year: String(now.getFullYear()) });
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    if (filters.month) params.set("month", filters.month);
    if (filters.year) params.set("year", filters.year);

    const res = await fetch(`/api/transactions?${params}`);
    if (res.ok) setTransactions(await res.json());
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Listen for transaction updates from header modal
  useEffect(() => {
    const handler = () => fetchTransactions();
    window.addEventListener("transaction-updated", handler);
    return () => window.removeEventListener("transaction-updated", handler);
  }, [fetchTransactions]);

  const handleRefresh = () => {
    fetchTransactions();
    window.dispatchEvent(new Event("transaction-updated"));
  };

  const filtered = transactions.filter(tx =>
    !search || tx.description?.toLowerCase().includes(search.toLowerCase()) || tx.category.includes(search.toLowerCase())
  );

  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const handleExportCSV = () => {
    const params = new URLSearchParams({ type: "csv" });
    if (filters.month) params.set("month", filters.month);
    if (filters.year) params.set("year", filters.year);
    window.open(`/api/export?${params}`, "_blank");
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.75rem" : "1.5rem" }}>
      {/* Summary bar — 2x2 grid on mobile */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: isMobile ? "0.5rem" : "1rem",
      }}>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Ingresos</p>
          <p style={{ fontWeight: 700, color: "var(--accent)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
            +${totalIncome.toLocaleString("es", { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Gastos</p>
          <p style={{ fontWeight: 700, color: "var(--danger)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
            -${totalExpense.toLocaleString("es", { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Balance</p>
          <p style={{ fontWeight: 700, color: totalIncome - totalExpense >= 0 ? "var(--accent)" : "var(--danger)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
            ${(totalIncome - totalExpense).toLocaleString("es", { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Transacciones</p>
          <p style={{ fontWeight: 700, fontSize: isMobile ? "1rem" : "1.2rem" }}>{filtered.length}</p>
        </div>
      </div>

      {/* Export buttons */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
          <Download size={14} /> {isMobile ? "CSV" : "Exportar CSV"}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
          <Printer size={14} /> {isMobile ? "PDF" : "Imprimir / PDF"}
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
        <div style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          {!isMobile && <Filter size={16} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />}

          {/* Search */}
          <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "1 1 200px" }}>
            <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              className="input"
              style={{ paddingLeft: "2.25rem" }}
              placeholder="Buscar transacción..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input"
            style={{ flex: isMobile ? "1 1 calc(50% - 0.25rem)" : "0 1 120px" }}
            value={filters.type}
            onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
          >
            <option value="">Todos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>

          <select
            className="input"
            style={{ flex: isMobile ? "1 1 calc(50% - 0.25rem)" : "0 1 150px" }}
            value={filters.category}
            onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}
          >
            <option value="">Categorías</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>

          <select
            className="input"
            style={{ flex: isMobile ? "1 1 100%" : "0 1 110px" }}
            value={filters.month}
            onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}
          >
            <option value="">Todo el año</option>
            {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, i) => (
              <option key={i} value={String(i + 1)}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="card" style={{ padding: isMobile ? "0.5rem" : "1rem" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem 0" }}>Cargando...</p>
        ) : (
          <TransactionList transactions={filtered} onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
}
