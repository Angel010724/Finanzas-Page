import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET — get user's AI settings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiProvider: true, aiApiKey: true, preferredCurrency: true },
  });

  return NextResponse.json({
    aiProvider: user?.aiProvider ?? null,
    hasApiKey: !!user?.aiApiKey,
    aiApiKeyPreview: user?.aiApiKey ? `...${user.aiApiKey.slice(-4)}` : null,
    preferredCurrency: user?.preferredCurrency ?? "USD",
  });
}

// PUT — update AI settings
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { aiProvider, aiApiKey, preferredCurrency } = await req.json();

  const updateData: any = {};
  if (aiProvider !== undefined) updateData.aiProvider = aiProvider || null;
  if (aiApiKey !== undefined) updateData.aiApiKey = aiApiKey || null;
  if (preferredCurrency !== undefined) updateData.preferredCurrency = preferredCurrency;

  await prisma.user.update({ where: { id: userId }, data: updateData });

  return NextResponse.json({ message: "Configuración guardada" });
}
