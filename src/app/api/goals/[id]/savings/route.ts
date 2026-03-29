import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id } = await params;

  // Verify goal belongs to user
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) return NextResponse.json({ message: "No encontrada" }, { status: 404 });

  const savings = await prisma.savingsEntry.findMany({
    where: { goalId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    savings.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    }))
  );
}
