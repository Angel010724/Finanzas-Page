import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "monthly";
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  if (type === "monthly") {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const prevStart = new Date(year, month - 2, 1);
    const prevEnd = new Date(year, month - 1, 1);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lt: endDate } },
      orderBy: { date: "asc" },
    });

    const prevTransactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: prevStart, lt: prevEnd } },
    });

    // Daily breakdown
    const daysInMonth = new Date(year, month, 0).getDate();
    const daily: { day: string; income: number; expenses: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d);
      const dayTxs = transactions.filter(t => new Date(t.date).getDate() === d);
      daily.push({
        day: dayStr,
        income: dayTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expenses: dayTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      });
    }

    // Category breakdown
    const catMap: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      catMap[t.category] = (catMap[t.category] ?? 0) + t.amount;
    });
    const totalExpenses = Object.values(catMap).reduce((s, v) => s + v, 0);
    const categories = Object.entries(catMap)
      .map(([category, amount]) => ({ category, amount, percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);

    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const prevIncome = prevTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const prevExpenses = prevTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    return NextResponse.json({
      daily,
      categories,
      totalIncome,
      totalExpenses,
      prevIncome,
      prevExpenses,
      transactionCount: transactions.length,
    });
  }

  if (type === "yearly") {
    const MONTH_NAMES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: startDate, lt: endDate } },
    });

    const monthly: { month: string; income: number; expenses: number }[] = [];
    let bestMonth = { month: "", balance: -Infinity };
    let worstMonth = { month: "", balance: Infinity };

    for (let m = 0; m < 12; m++) {
      const mTxs = transactions.filter(t => new Date(t.date).getMonth() === m);
      const income = mTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = mTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const balance = income - expenses;

      monthly.push({ month: MONTH_NAMES[m], income, expenses });

      if (balance > bestMonth.balance) bestMonth = { month: MONTH_NAMES[m], balance };
      if (balance < worstMonth.balance && (income > 0 || expenses > 0)) worstMonth = { month: MONTH_NAMES[m], balance };
    }

    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const monthsWithData = monthly.filter(m => m.income > 0 || m.expenses > 0).length;

    return NextResponse.json({
      monthly,
      totalIncome,
      totalExpenses,
      avgMonthlyExpense: monthsWithData > 0 ? Math.round(totalExpenses / monthsWithData) : 0,
      avgMonthlyIncome: monthsWithData > 0 ? Math.round(totalIncome / monthsWithData) : 0,
      bestMonth,
      worstMonth: worstMonth.balance === Infinity ? null : worstMonth,
    });
  }

  return NextResponse.json({ message: "Invalid type" }, { status: 400 });
}
