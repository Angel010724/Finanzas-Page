import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const type = searchParams.get("type"); // "csv"

  if (type !== "csv") {
    return NextResponse.json({ message: "Tipo no soportado" }, { status: 400 });
  }

  const where: any = { userId };
  if (month && year) {
    const m = parseInt(month), y = parseInt(year);
    where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) };
  } else if (year) {
    const y = parseInt(year);
    where.date = { gte: new Date(y, 0, 1), lte: new Date(y, 11, 31, 23, 59, 59) };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });

  // BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const headers = ["Fecha", "Tipo", "Categoría", "Descripción", "Monto", "Moneda", "Recurrente"];
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" }),
    t.type === "income" ? "Ingreso" : "Gasto",
    t.category,
    `"${(t.description ?? "").replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.currency,
    t.recurring ? "Sí" : "No",
  ]);

  const csv = BOM + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const filename = month && year
    ? `nexo_${monthNames[parseInt(month) - 1]}_${year}.csv`
    : year
      ? `nexo_${year}.csv`
      : `nexo_transacciones.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
