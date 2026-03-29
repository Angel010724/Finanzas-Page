import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  savedAmount: z.number().min(0).optional(),
  addAmount: z.number().positive().optional(), // shortcut to add savings
  note: z.string().nullish(), // note for savings entry
  deadline: z.string().nullish(),
  category: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  description: z.string().nullish(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id } = await params;

  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ message: "No encontrada" }, { status: 404 });

  try {
    const body = await req.json();
    const data = updateGoalSchema.parse(body);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.targetAmount) updateData.targetAmount = data.targetAmount;
    if (data.savedAmount !== undefined) updateData.savedAmount = data.savedAmount;
    if (data.addAmount) {
      updateData.savedAmount = existing.savedAmount + data.addAmount;
      // Record in savings history
      await prisma.savingsEntry.create({
        data: {
          goalId: id,
          amount: data.addAmount,
          note: data.note ?? null,
        },
      });
    }
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.description !== undefined) updateData.description = data.description;

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: { savings: { orderBy: { createdAt: "desc" }, take: 20 } },
    });

    return NextResponse.json({
      ...goal,
      deadline: goal.deadline?.toISOString() ?? null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
      savings: goal.savings.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id } = await params;

  const existing = await prisma.goal.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ message: "No encontrada" }, { status: 404 });

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ message: "Meta eliminada" });
}
