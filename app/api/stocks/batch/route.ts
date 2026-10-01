import { StockHolding } from "@/app/types/portfolio";

interface StockData {
  symbol: string;
  price?: number;
  currency?: string;
  change?: number;
  changePercent?: number;
}

export async function fetchBatchQuotes(holdings: StockHolding[]): Promise<Record<string, StockData>> {
  const results: Record<string, StockData> = {};

  await Promise.all(
    holdings.map(async (h) => {
      const sym = `${h.symbol}.NS`;
      const response = await fetch(`api/stocks/${sym}`);
      const quote = await response.json();
      results[h.symbol] = quote.data;
    })
  );

  return results;
}
