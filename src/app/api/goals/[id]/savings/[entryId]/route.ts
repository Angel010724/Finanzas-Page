import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id: goalId, entryId } = await params;

  // Verify goal belongs to user
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) return NextResponse.json({ message: "Meta no encontrada" }, { status: 404 });

  // Find the savings entry
  const entry = await prisma.savingsEntry.findFirst({ where: { id: entryId, goalId } });
  if (!entry) return NextResponse.json({ message: "Entrada no encontrada" }, { status: 404 });

  // Delete entry and subtract from goal's savedAmount
  await prisma.$transaction([
    prisma.savingsEntry.delete({ where: { id: entryId } }),
    prisma.goal.update({
      where: { id: goalId },
      data: { savedAmount: Math.max(0, goal.savedAmount - entry.amount) },
    }),
  ]);

  return NextResponse.json({ message: "Entrada eliminada" });
}
