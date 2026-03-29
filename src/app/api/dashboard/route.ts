import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Current month transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "desc" },
  });

  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Previous month for comparison
  const prevStart = new Date(year, month - 2, 1);
  const prevEnd = new Date(year, month - 1, 0, 23, 59, 59);
  const prevTransactions = await prisma.transaction.findMany({
    where: { userId, type: "expense", date: { gte: prevStart, lte: prevEnd } },
  });
  const prevExpenses = prevTransactions.reduce((s, t) => s + t.amount, 0);

  // Last 6 months trend
  const monthlyTrend = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, month - 1 - i, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear(), label: d.toLocaleDateString("es", { month: "short" }) };
    }).reverse().map(async ({ month: m, year: y, label }) => {
      const s = new Date(y, m - 1, 1);
      const e = new Date(y, m, 0, 23, 59, 59);
      const txs = await prisma.transaction.findMany({ where: { userId, date: { gte: s, lte: e } } });
      return {
        month: label,
        income: txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expenses: txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    })
  );

  // Category breakdown
  const expensesByCategory: Record<string, number> = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    expensesByCategory[t.category] = (expensesByCategory[t.category] ?? 0) + t.amount;
  });
  const categoryBreakdown = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount, percentage: expenses > 0 ? Math.round((amount / expenses) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);

  // Savings goal progress
  const goals = await prisma.goal.findMany({ where: { userId }, take: 1, orderBy: { createdAt: "desc" } });
  const topGoal = goals[0];

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  return NextResponse.json({
    income,
    expenses,
    balance: income - expenses,
    previousMonthExpenses: prevExpenses,
    monthlyTrend,
    categoryBreakdown,
    recentTransactions: recentTransactions.map(t => ({
      ...t,
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    savingsGoal: topGoal ? { progress: topGoal.savedAmount, target: topGoal.targetAmount } : null,
  });
}
