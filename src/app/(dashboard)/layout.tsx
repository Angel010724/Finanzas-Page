"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TransactionModal from "@/components/transactions/TransactionModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{
        flex: 1,
        minWidth: 0,
        marginLeft: isMobile ? 0 : "var(--sidebar-width)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        transition: "margin-left 0.3s ease",
        overflow: "hidden",
      }}>
        <Header
          title="Nexo"
          onAddTransaction={() => setShowModal(true)}
        />
        <main style={{
          flex: 1,
          padding: isMobile ? "1rem" : "1.5rem 2rem",
          overflowY: "auto",
          overflowX: "hidden",
        }}>
          {children}
        </main>
      </div>

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            window.dispatchEvent(new Event("transaction-updated"));
          }}
        />
      )}
    </div>
  );
}
