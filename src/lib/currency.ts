// Fixed exchange rates relative to USD
// These can be updated periodically
export const CURRENCIES = [
  { code: "USD", name: "Dólar (USD)", symbol: "$", flag: "🇺🇸" },
  { code: "PAB", name: "Balboa (PAB)", symbol: "B/.", flag: "🇵🇦" },
  { code: "EUR", name: "Euro (EUR)", symbol: "€", flag: "🇪🇺" },
  { code: "MXN", name: "Peso Mexicano (MXN)", symbol: "$", flag: "🇲🇽" },
  { code: "COP", name: "Peso Colombiano (COP)", symbol: "$", flag: "🇨🇴" },
  { code: "CRC", name: "Colón (CRC)", symbol: "₡", flag: "🇨🇷" },
] as const;

// Rates: how much 1 USD is worth in each currency
const RATES_TO_USD: Record<string, number> = {
  USD: 1,
  PAB: 1,       // Balboa is pegged 1:1 to USD
  EUR: 0.92,
  MXN: 17.15,
  COP: 3950,
  CRC: 510,
};

export function convert(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const fromRate = RATES_TO_USD[from] ?? 1;
  const toRate = RATES_TO_USD[to] ?? 1;
  // Convert to USD first, then to target
  const inUSD = amount / fromRate;
  return inUSD * toRate;
}

export function formatCurrency(amount: number, currencyCode: string = "USD"): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  const symbol = currency?.symbol ?? "$";

  if (currencyCode === "COP") {
    return `${symbol}${Math.round(amount).toLocaleString("es")}`;
  }

  return `${symbol}${amount.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? "$";
}

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
