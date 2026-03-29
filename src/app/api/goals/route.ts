import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const goalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  targetAmount: z.number().positive("El monto debe ser positivo"),
  savedAmount: z.number().min(0).default(0),
  deadline: z.string().nullish(),
  category: z.string().optional().default("general"),
  priority: z.enum(["high", "medium", "low"]).optional().default("medium"),
  description: z.string().nullish(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals.map(g => ({
    ...g,
    deadline: g.deadline?.toISOString() ?? null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const data = goalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        savedAmount: data.savedAmount,
        deadline: data.deadline ? new Date(data.deadline) : null,
        category: data.category,
        priority: data.priority,
        description: data.description ?? null,
      },
    });

    return NextResponse.json({
      ...goal,
      deadline: goal.deadline?.toISOString() ?? null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ message: "Error al crear meta" }, { status: 500 });
  }
}
