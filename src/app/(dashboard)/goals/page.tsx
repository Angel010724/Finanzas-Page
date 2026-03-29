"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, DollarSign, Loader2, Target, TrendingUp, Calendar, Edit3, Filter, History } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const GOAL_CATEGORIES = [
  { id: "general", label: "General", icon: "🎯", color: "#6366f1" },
  { id: "viaje", label: "Viaje", icon: "✈️", color: "#06b6d4" },
  { id: "emergencia", label: "Fondo de emergencia", icon: "🛡️", color: "#f59e0b" },
  { id: "educacion", label: "Educación", icon: "📚", color: "#8b5cf6" },
  { id: "auto", label: "Auto / Vehículo", icon: "🚗", color: "#ec4899" },
  { id: "casa", label: "Casa / Hogar", icon: "🏠", color: "#10b981" },
  { id: "tecnologia", label: "Tecnología", icon: "💻", color: "#3b82f6" },
  { id: "salud", label: "Salud", icon: "🏥", color: "#ef4444" },
  { id: "inversion", label: "Inversión", icon: "📈", color: "#14b8a6" },
  { id: "otro", label: "Otro", icon: "💡", color: "#a855f7" },
];

const PRIORITIES = [
  { id: "high", label: "Alta", color: "#ef4444", icon: "🔴" },
  { id: "medium", label: "Media", color: "#f59e0b", icon: "🟡" },
  { id: "low", label: "Baja", color: "#22c55e", icon: "🟢" },
];

interface GoalData {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string | null;
  category: string | null;
  priority: string | null;
  description: string | null;
  createdAt: string;
}

function CircleProgress({ percentage, size = 80, color = "var(--accent)" }: { percentage: number; size?: number; color?: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percentage, 100) / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill="var(--text-primary)" fontSize={size * 0.2} fontWeight={700}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

function MilestoneBar({ percentage }: { percentage: number }) {
  const milestones = [25, 50, 75, 100];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.375rem" }}>
      {milestones.map(m => (
        <div key={m} style={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          background: percentage >= m ? "var(--accent)" : "var(--border)",
          transition: "background 0.4s ease",
          position: "relative",
        }}>
          {percentage >= m && m < 100 && (
            <div style={{
              position: "absolute",
              right: -1,
              top: -3,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--accent)",
              border: "2px solid var(--bg-card)",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<GoalData | null>(null);
  const [addAmountId, setAddAmountId] = useState<string | null>(null);
  const [addAmountVal, setAddAmountVal] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [historyGoalId, setHistoryGoalId] = useState<string | null>(null);
  const [savingsHistory, setSavingsHistory] = useState<{ id: string; amount: number; note: string | null; createdAt: string }[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/goals");
    if (res.ok) setGoals(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    fetchGoals();
  };

  const handleAddSaving = async (id: string) => {
    const amount = Number(addAmountVal);
    if (!amount || amount <= 0) return;
    await fetch(`/api/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addAmount: amount }),
    });
    setAddAmountId(null);
    setAddAmountVal("");
    fetchGoals();
    // Refresh history if it was open for this goal
    if (historyGoalId === id) fetchHistory(id);
  };

  const fetchHistory = async (goalId: string) => {
    setLoadingHistory(true);
    const res = await fetch(`/api/goals/${goalId}/savings`);
    if (res.ok) setSavingsHistory(await res.json());
    setLoadingHistory(false);
  };

  const toggleHistory = (goalId: string) => {
    if (historyGoalId === goalId) {
      setHistoryGoalId(null);
      setSavingsHistory([]);
    } else {
      setHistoryGoalId(goalId);
      fetchHistory(goalId);
    }
  };

  const handleDeleteEntry = async (goalId: string, entryId: string) => {
    await fetch(`/api/goals/${goalId}/savings/${entryId}`, { method: "DELETE" });
    fetchHistory(goalId);
    fetchGoals();
  };

  const getCat = (id: string | null) =>
    GOAL_CATEGORIES.find(c => c.id === id) ?? GOAL_CATEGORIES[0];

  const getPriority = (id: string | null) =>
    PRIORITIES.find(p => p.id === id) ?? PRIORITIES[1];

  const daysLeft = (d: string | null) => {
    if (!d) return null;
    return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const biweeklySaving = (goal: GoalData) => {
    if (!goal.deadline) return null;
    const remaining = goal.targetAmount - goal.savedAmount;
    if (remaining <= 0) return 0;
    const days = daysLeft(goal.deadline);
    if (!days || days <= 0) return remaining;
    // Calculate months remaining, then multiply by 2 for biweekly periods
    const months = days / 30;
    const biweeks = Math.max(1, Math.round(months * 2));
    return remaining / biweeks;
  };

  // Filters
  const filtered = goals.filter(g => {
    if (filterCat && g.category !== filterCat) return false;
    if (filterPriority && g.priority !== filterPriority) return false;
    return true;
  });

  // Summary
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const completedGoals = goals.filter(g => g.savedAmount >= g.targetAmount).length;
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "1rem" : "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ fontSize: isMobile ? "1.1rem" : "1.25rem", fontWeight: 700 }}>Metas de ahorro</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {goals.length} {goals.length === 1 ? "meta activa" : "metas activas"} · {completedGoals} completada{completedGoals !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> {isMobile ? "" : "Filtros"}
          </button>
          <button className={`btn btn-primary ${isMobile ? "btn-sm" : ""}`} onClick={() => { setEditGoal(null); setShowModal(true); }}>
            <Plus size={16} /> {isMobile ? "Nueva" : "Nueva meta"}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem", animation: "slideUp 0.2s ease" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <select className="input" style={{ flex: isMobile ? "1 1 100%" : "0 1 160px", fontSize: "0.85rem" }}
              value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Todas las categorías</option>
              {GOAL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
            <select className="input" style={{ flex: isMobile ? "1 1 100%" : "0 1 140px", fontSize: "0.85rem" }}
              value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">Todas las prioridades</option>
              {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
            </select>
            {(filterCat || filterPriority) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCat(""); setFilterPriority(""); }}>Limpiar</button>
            )}
          </div>
        </div>
      )}

      {/* Summary cards */}
      {goals.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? "0.5rem" : "1rem" }}>
          <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Meta total</p>
            <p style={{ fontWeight: 700, fontSize: isMobile ? "1rem" : "1.2rem" }}>
              ${totalTarget.toLocaleString("es", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Ahorrado</p>
            <p style={{ fontWeight: 700, color: "var(--accent)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
              ${totalSaved.toLocaleString("es", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="card" style={{ padding: isMobile ? "0.75rem" : "1rem 1.25rem", gridColumn: isMobile ? "1 / -1" : undefined }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Progreso global</p>
            <p style={{ fontWeight: 700, color: overallPct >= 100 ? "var(--accent)" : "var(--warning)", fontSize: isMobile ? "1rem" : "1.2rem" }}>
              {Math.round(overallPct)}%
            </p>
            {/* Overall progress bar */}
            <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: "0.375rem" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: overallPct >= 100 ? "var(--accent)" : `linear-gradient(90deg, var(--accent), ${overallPct >= 50 ? "var(--accent)" : "var(--warning)"})`,
                width: `${Math.min(overallPct, 100)}%`,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Goals */}
      {loading ? (
        <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>Cargando metas...</p>
      ) : goals.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <Target size={40} style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }} />
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>Crea tu primera meta de ahorro</p>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditGoal(null); setShowModal(true); }}>
            <Plus size={14} /> Crear meta
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>No hay metas que coincidan con los filtros</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "0.75rem" : "1rem" }}>
          {filtered.map(goal => {
            const pct = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
            const days = daysLeft(goal.deadline);
            const cat = getCat(goal.category);
            const pri = getPriority(goal.priority);
            const bwSaving = biweeklySaving(goal);
            const isCompleted = pct >= 100;

            return (
              <div key={goal.id} className="card card-hover" style={{
                padding: isMobile ? "1rem" : "1.25rem",
                borderLeft: `3px solid ${isCompleted ? "var(--accent)" : cat.color}`,
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Completion overlay */}
                {isCompleted && (
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: "var(--accent)", color: "#fff",
                    fontSize: "0.65rem", fontWeight: 700,
                    padding: "0.2rem 0.5rem", borderRadius: 100,
                    letterSpacing: "0.02em",
                  }}>
                    ✓ COMPLETADA
                  </div>
                )}

                {/* Top row: category icon + name + priority + actions */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flex: 1, overflow: "hidden" }}>
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: "var(--radius-sm)",
                      background: `${cat.color}20`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.2rem", flexShrink: 0,
                    }}>
                      {cat.icon}
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {goal.name}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.125rem" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{cat.label}</span>
                        <span style={{
                          fontSize: "0.6rem", padding: "0.1rem 0.4rem",
                          background: `${pri.color}18`, borderRadius: 100,
                          color: pri.color, fontWeight: 600,
                        }}>
                          {pri.icon} {pri.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.125rem", flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => { setEditGoal(goal); setShowModal(true); }} title="Editar">
                      <Edit3 size={13} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDeleteId(goal.id)} title="Eliminar">
                      <Trash2 size={13} style={{ color: "var(--danger)" }} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {goal.description && (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                    {goal.description}
                  </p>
                )}

                {/* Progress circle + stats */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <CircleProgress percentage={pct} size={isMobile ? 65 : 75} color={isCompleted ? "var(--accent)" : cat.color} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      ${goal.savedAmount.toLocaleString("es", { maximumFractionDigits: 0 })}
                      <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}> / ${goal.targetAmount.toLocaleString("es", { maximumFractionDigits: 0 })}</span>
                    </p>

                    {/* Milestones */}
                    <MilestoneBar percentage={pct} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.125rem" }}>
                      {[25, 50, 75, 100].map(m => (
                        <span key={m} style={{ fontSize: "0.6rem", color: pct >= m ? "var(--accent)" : "var(--text-secondary)" }}>{m}%</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info row: deadline + biweekly plan */}
                <div style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                  flexWrap: "wrap",
                }}>
                  {goal.deadline && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.375rem",
                      fontSize: "0.75rem",
                      color: days !== null && days < 0 ? "var(--danger)" : "var(--text-secondary)",
                      background: days !== null && days < 0 ? "var(--danger-light)" : "var(--bg-primary)",
                      padding: "0.3rem 0.625rem",
                      borderRadius: "var(--radius-sm)",
                    }}>
                      <Calendar size={12} />
                      {new Date(goal.deadline).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                      {days !== null && days >= 0 && <span style={{ color: "var(--accent)", fontWeight: 600 }}>({days}d)</span>}
                      {days !== null && days < 0 && <span style={{ fontWeight: 600 }}>vencida</span>}
                    </div>
                  )}
                  {bwSaving !== null && bwSaving > 0 && !isCompleted && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.375rem",
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      background: "var(--accent-light)",
                      padding: "0.3rem 0.625rem",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 600,
                    }}>
                      <TrendingUp size={12} />
                      ${bwSaving.toFixed(0)} por quincena
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isCompleted && (
                  <div style={{ marginTop: "0.75rem" }}>
                    {addAmountId === goal.id ? (
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <input className="input" type="number" placeholder="$0" min="1" value={addAmountVal}
                          onChange={e => setAddAmountVal(e.target.value)}
                          style={{ padding: "0.375rem 0.5rem", fontSize: "0.8rem", flex: 1 }}
                          autoFocus
                          onKeyDown={e => e.key === "Enter" && handleAddSaving(goal.id)}
                        />
                        <button className="btn btn-primary btn-sm" onClick={() => handleAddSaving(goal.id)}>✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setAddAmountId(null); setAddAmountVal(""); }}>✕</button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => setAddAmountId(goal.id)}>
                        <DollarSign size={13} /> Ahorrar
                      </button>
                    )}
                  </div>
                )}

                {/* History button */}
                <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.375rem" }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1, justifyContent: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}
                    onClick={() => toggleHistory(goal.id)}
                  >
                    <History size={13} />
                    {historyGoalId === goal.id ? "Ocultar historial" : "Ver historial"}
                  </button>
                </div>

                {/* Savings history panel */}
                {historyGoalId === goal.id && (
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem 0.625rem",
                    background: "var(--bg-primary)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    maxHeight: 200,
                    overflowY: "auto",
                  }}>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.375rem" }}>
                      Historial de aportes
                    </p>
                    {loadingHistory ? (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", padding: "0.5rem 0" }}>Cargando...</p>
                    ) : savingsHistory.length === 0 ? (
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "center", padding: "0.5rem 0" }}>Sin aportes registrados</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {savingsHistory.map(s => (
                          <div key={s.id} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.375rem 0.5rem",
                            borderRadius: 6,
                            background: "var(--bg-secondary)",
                            fontSize: "0.75rem",
                          }}>
                            <div>
                              <span style={{ color: "var(--accent)", fontWeight: 600 }}>+${s.amount.toLocaleString("es", { minimumFractionDigits: 2 })}</span>
                              {s.note && <span style={{ color: "var(--text-secondary)", marginLeft: "0.5rem" }}>— {s.note}</span>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
                              <span style={{ color: "var(--text-secondary)", fontSize: "0.65rem" }}>
                                {new Date(s.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <button
                                className="btn btn-ghost"
                                onClick={() => handleDeleteEntry(goal.id, s.id)}
                                title="Eliminar aporte"
                                style={{
                                  padding: "0.2rem",
                                  minWidth: 0,
                                  color: "var(--text-secondary)",
                                  borderRadius: 4,
                                  lineHeight: 1,
                                }}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <GoalModal
          editGoal={editGoal}
          onClose={() => { setShowModal(false); setEditGoal(null); }}
          onSuccess={() => { setShowModal(false); setEditGoal(null); fetchGoals(); }}
        />
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Eliminar meta"
          message="¿Estás seguro de que quieres eliminar esta meta de ahorro?"
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}

// --- Goal Modal (Create/Edit) ---
function GoalModal({ editGoal, onClose, onSuccess }: {
  editGoal: GoalData | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!editGoal;
  const [name, setName] = useState(editGoal?.name ?? "");
  const [target, setTarget] = useState(editGoal?.targetAmount?.toString() ?? "");
  const [deadline, setDeadline] = useState(editGoal?.deadline ? editGoal.deadline.split("T")[0] : "");
  const [category, setCategory] = useState(editGoal?.category ?? "general");
  const [priority, setPriority] = useState(editGoal?.priority ?? "medium");
  const [description, setDescription] = useState(editGoal?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || Number(target) <= 0) {
      setError("Nombre y monto objetivo son requeridos");
      return;
    }
    setSaving(true);

    const payload: any = {
      name,
      targetAmount: Number(target),
      deadline: deadline || null,
      category,
      priority,
      description: description || undefined,
    };

    if (isEdit) {
      const res = await fetch(`/api/goals/${editGoal!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Error al actualizar");
        setSaving(false);
      } else {
        onSuccess();
      }
    } else {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Error al crear");
        setSaving(false);
      } else {
        onSuccess();
      }
    }
  };

  // Preview biweekly
  const previewBiweekly = () => {
    if (!target || !deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return null;
    const months = days / 30;
    const biweeks = Math.max(1, Math.round(months * 2));
    const remaining = isEdit ? (Number(target) - (editGoal?.savedAmount ?? 0)) : Number(target);
    return (remaining / biweeks).toFixed(0);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>
            {isEdit ? "Editar meta" : "Nueva meta de ahorro"}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{ background: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "0.625rem 0.875rem", color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Show current progress when editing */}
        {isEdit && editGoal && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.75rem", background: "var(--bg-primary)",
            borderRadius: "var(--radius-sm)", marginBottom: "1rem",
          }}>
            <CircleProgress percentage={editGoal.targetAmount > 0 ? (editGoal.savedAmount / editGoal.targetAmount) * 100 : 0} size={50} />
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                ${editGoal.savedAmount.toLocaleString("es", { maximumFractionDigits: 0 })} ahorrado
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                de ${editGoal.targetAmount.toLocaleString("es", { maximumFractionDigits: 0 })} objetivo
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {/* Name */}
          <div className="input-group">
            <label className="input-label">Nombre de la meta</label>
            <input className="input" placeholder="Ej: Viaje a Japón, Fondo de emergencia..."
              value={name} onChange={e => setName(e.target.value)} required
              style={{ fontSize: isMobile ? "16px" : undefined }}
            />
          </div>

          {/* Category grid */}
          <div className="input-group">
            <label className="input-label">Categoría</label>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(56px, 1fr))" : "repeat(5, 1fr)",
              gap: "0.375rem",
            }}>
              {GOAL_CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.125rem",
                    padding: "0.5rem 0.25rem",
                    borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${category === c.id ? c.color : "var(--border)"}`,
                    background: category === c.id ? `${c.color}15` : "transparent",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    transition: "all 0.15s",
                  }}
                  title={c.label}
                >
                  {c.icon}
                  <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)", lineHeight: 1.1, textAlign: "center" }}>{c.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Deadline row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="input-group">
              <label className="input-label">Monto objetivo ($)</label>
              <input className="input" type="number" min="1" step="0.01" placeholder="0.00"
                value={target} onChange={e => setTarget(e.target.value)} required
                style={{ fontSize: isMobile ? "16px" : undefined }}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Fecha límite</label>
              <input className="input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>

          {/* Biweekly preview */}
          {previewBiweekly() && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              background: "var(--accent-light)",
              fontSize: "0.8rem",
              color: "var(--accent)",
              fontWeight: 600,
            }}>
              <TrendingUp size={14} />
              Debes ahorrar ${previewBiweekly()} por quincena para llegar a tiempo
            </div>
          )}

          {/* Priority */}
          <div className="input-group">
            <label className="input-label">Prioridad</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.375rem",
                    padding: "0.5rem",
                    borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${priority === p.id ? p.color : "var(--border)"}`,
                    background: priority === p.id ? `${p.color}15` : "transparent",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: priority === p.id ? p.color : "var(--text-secondary)",
                    transition: "all 0.15s",
                  }}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="input-group">
            <label className="input-label">Descripción <span style={{ color: "var(--text-secondary)" }}>(opcional)</span></label>
            <textarea
              className="input"
              placeholder="¿Por qué esta meta es importante para ti?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              style={{ resize: "vertical", fontSize: isMobile ? "16px" : undefined }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: "center" }} disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : null}
              {saving ? (isEdit ? "Actualizando..." : "Creando...") : (isEdit ? "Actualizar meta" : "Crear meta")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
