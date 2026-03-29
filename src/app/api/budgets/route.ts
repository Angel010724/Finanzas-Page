import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const budgetSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

// GET — list budgets for a month/year with actual spending
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // Get budgets
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    orderBy: { category: "asc" },
  });

  // Get actual spending per category for the same month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "expense",
      date: { gte: startDate, lt: endDate },
    },
  });

  const spentByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    spentByCategory[tx.category] = (spentByCategory[tx.category] ?? 0) + tx.amount;
  }

  const budgetsWithSpent = budgets.map(b => ({
    ...b,
    spent: spentByCategory[b.category] ?? 0,
    percentage: Math.round(((spentByCategory[b.category] ?? 0) / b.amount) * 100),
  }));

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = Object.values(spentByCategory).reduce((s, v) => s + v, 0);

  return NextResponse.json({
    budgets: budgetsWithSpent,
    totalBudgeted,
    totalSpent,
  });
}

// POST — create or update budget (upsert)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const data = budgetSchema.parse(body);

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId,
          category: data.category,
          month: data.month,
          year: data.year,
        },
      },
      update: { amount: data.amount },
      create: { ...data, userId },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Error al guardar presupuesto" }, { status: 500 });
  }
}
