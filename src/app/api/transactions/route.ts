import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("El monto debe ser positivo"),
  category: z.string().min(1, "La categoría es requerida"),
  description: z.string().optional(),
  date: z.string(),
  recurring: z.boolean().optional().default(false),
  recurringFrequency: z.enum(["weekly", "biweekly", "monthly", "yearly"]).nullish(),
  currency: z.string().optional().default("USD"),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: any = { userId };
  if (type) where.type = type;
  if (category) where.category = category;

  if (month && year) {
    const m = parseInt(month), y = parseInt(year);
    where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json(transactions.map(t => ({
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const data = transactionSchema.parse(body);

    const transaction = await prisma.transaction.create({
      data: { ...data, userId, date: new Date(data.date) },
    });

    return NextResponse.json({
      ...transaction,
      date: transaction.date.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Error al crear transacción" }, { status: 500 });
  }
}
