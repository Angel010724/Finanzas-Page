import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const transactions = await prisma.transaction.findMany({
    where: { userId, recurring: true },
    orderBy: { category: "asc" },
  });

  const totalMonthly = transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  return NextResponse.json({
    transactions: transactions.map(t => ({
      ...t,
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    totalMonthlyExpense: totalMonthly,
    totalMonthlyIncome: totalIncome,
    count: transactions.length,
  });
}

// POST — auto-generate current month transactions from recurring templates
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  // Get recurring templates
  const templates = await prisma.transaction.findMany({
    where: { userId, recurring: true },
  });

  if (templates.length === 0) {
    return NextResponse.json({ message: "No hay recurrentes para generar", generated: 0 });
  }

  // Check existing transactions this month to avoid duplicates
  const existing = await prisma.transaction.findMany({
    where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
  });

  let generated = 0;

  for (const template of templates) {
    // Check if there's already a transaction this month with same category, amount, and type
    const alreadyExists = existing.some(
      e => e.category === template.category &&
           e.amount === template.amount &&
           e.type === template.type &&
           e.description === template.description &&
           !e.recurring // only check non-template transactions
    );

    if (!alreadyExists) {
      await prisma.transaction.create({
        data: {
          userId,
          type: template.type,
          amount: template.amount,
          category: template.category,
          description: template.description ? `${template.description} (auto)` : `Recurrente (auto)`,
          date: now,
          recurring: false,
          currency: template.currency,
        },
      });
      generated++;
    }
  }

  return NextResponse.json({
    message: `Se generaron ${generated} transacciones`,
    generated,
  });
}
