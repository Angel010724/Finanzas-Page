import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const { question } = await req.json();

    // Get user's AI settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiProvider: true, aiApiKey: true },
    });

    if (!user?.aiApiKey || !user?.aiProvider) {
      return NextResponse.json(
        { message: "⚙️ Conecta tu API key de IA en Configuración para usar Nexo AI." },
        { status: 400 }
      );
    }

    // Gather user's financial data (last 3 months)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: threeMonthsAgo } },
      orderBy: { date: "desc" },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
    });

    const goals = await prisma.goal.findMany({ where: { userId } });

    // Build financial summary
    const thisMonth = transactions.filter(t => new Date(t.date).getMonth() === now.getMonth());
    const incomeThisMonth = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expensesThisMonth = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    const catSpending: Record<string, number> = {};
    thisMonth.filter(t => t.type === "expense").forEach(t => {
      catSpending[t.category] = (catSpending[t.category] ?? 0) + t.amount;
    });

    const topCategories = Object.entries(catSpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`)
      .join(", ");

    const budgetInfo = budgets.length > 0
      ? budgets.map(b => {
          const spent = catSpending[b.category] ?? 0;
          return `${b.category}: presupuesto $${b.amount}, gastado $${spent.toFixed(2)} (${Math.round((spent / b.amount) * 100)}%)`;
        }).join(". ")
      : "No tiene presupuestos configurados";

    const goalsInfo = goals.length > 0
      ? goals.map(g => `"${g.name}": meta $${g.targetAmount}, ahorrado $${g.savedAmount} (${Math.round((g.savedAmount / g.targetAmount) * 100)}%)`).join(". ")
      : "No tiene metas de ahorro";

    const months = [-2, -1, 0].map(offset => {
      const m = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const mTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      });
      const income = mTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = mTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return `${m.toLocaleDateString("es", { month: "long" })}: ingresos $${income.toFixed(0)}, gastos $${expenses.toFixed(0)}`;
    });

    const recurring = transactions.filter(t => t.recurring && t.type === "expense");
    const recurringTotal = recurring.reduce((s, t) => s + t.amount, 0);

    const systemPrompt = `Eres Nexo AI, un asesor financiero personal inteligente y amigable. El usuario vive en Panamá y cobra quincenal.

DATOS FINANCIEROS DEL USUARIO (mes actual):
- Ingresos este mes: $${incomeThisMonth.toFixed(2)}
- Gastos este mes: $${expensesThisMonth.toFixed(2)}
- Balance: $${(incomeThisMonth - expensesThisMonth).toFixed(2)}
- Top categorías de gasto: ${topCategories || "Sin gastos registrados"}
- Gastos recurrentes mensuales: $${recurringTotal.toFixed(2)}
- Presupuestos: ${budgetInfo}
- Metas de ahorro: ${goalsInfo}
- Tendencia últimos 3 meses: ${months.join(". ")}

INSTRUCCIONES:
- Responde en español, de forma clara y amigable
- Da consejos específicos basados en sus datos reales, no genéricos
- Usa emojis moderadamente para hacer la respuesta más visual
- Si ves patrones preocupantes (gasto excesivo, sin ahorro), adviértelo con tacto
- Sugiere el método 50/30/20 cuando sea relevante
- Si no tiene datos suficientes, anímalo a registrar más transacciones
- Mantén las respuestas concisas (máximo 200 palabras)
- Si preguntan algo no financiero, redirige amablemente al tema de finanzas`;

    const userQuestion = question || "Dame un resumen de mis finanzas y consejos para mejorar";

    let response: string;

    if (user.aiProvider === "gemini") {
      const genAI = new GoogleGenerativeAI(user.aiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userQuestion },
      ]);
      response = result.response.text();
    } else if (user.aiProvider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.aiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuestion },
          ],
          max_tokens: 500,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message ?? `OpenAI error: ${res.status}`);
      }
      const data = await res.json();
      response = data.choices[0].message.content;
    } else if (user.aiProvider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.aiApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuestion },
          ],
          max_tokens: 500,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message ?? `Groq error: ${res.status}`);
      }
      const data = await res.json();
      response = data.choices[0].message.content;
    } else {
      return NextResponse.json({ message: "Proveedor no soportado" }, { status: 400 });
    }

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("AI Error:", error);

    if (error.message?.includes("429") || error.message?.includes("quota") || error.message?.includes("rate")) {
      return NextResponse.json(
        { message: "⏳ Límite de consultas alcanzado. Espera unos segundos e intenta de nuevo." },
        { status: 429 }
      );
    }

    if (error.message?.includes("API key") || error.message?.includes("Unauthorized") || error.message?.includes("401")) {
      return NextResponse.json(
        { message: "🔑 Tu API key parece inválida. Revísala en Configuración." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: error.message ?? "Error al consultar la IA" },
      { status: 500 }
    );
  }
}
