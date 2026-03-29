export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string | null;
  date: Date | string;
  recurring: boolean;
  recurringFrequency?: string | null;
  receiptUrl?: string | null;
  currency: string;
  createdAt: Date | string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: Date | string | null;
}

export interface DashboardMetrics {
  income: number;
  expenses: number;
  balance: number;
  previousMonthExpenses: number;
  monthlyTrend: { month: string; income: number; expenses: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  recentTransactions: Transaction[];
  savingsGoal?: { progress: number; target: number } | null;
}

export const CATEGORIES = [
  { id: "vivienda", label: "Vivienda", icon: "🏠", color: "#6366f1" },
  { id: "comida", label: "Comida", icon: "🛒", color: "#f59e0b" },
  { id: "transporte", label: "Transporte", icon: "🚗", color: "#3b82f6" },
  { id: "salud", label: "Salud", icon: "❤️", color: "#ef4444" },
  { id: "entretenimiento", label: "Entretenimiento", icon: "🎮", color: "#8b5cf6" },
  { id: "ropa", label: "Ropa", icon: "👕", color: "#ec4899" },
  { id: "educacion", label: "Educación", icon: "📚", color: "#06b6d4" },
  { id: "servicios", label: "Servicios", icon: "⚡", color: "#84cc16" },
  { id: "ingreso", label: "Ingreso", icon: "💰", color: "#10b981" },
  { id: "otros", label: "Otros", icon: "📦", color: "#6b7280" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
