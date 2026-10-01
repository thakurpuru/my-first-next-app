import { StockHolding } from "@/app/types/portfolio";

export interface StockData {
  symbol: string;
  price?: number;
  currency?: string;
  change?: number;
  changePercent?: number;
}

export  async function fetchBatchQuotes(holdings: StockHolding[]): Promise<Record<string, StockData>> {
  const symbols=holdings.map((h)=>`${h.symbol}.NS`);
  const response= await fetch(`/api/stocks/batch?symbols=${encodeURIComponent(symbols.join(','))}`);
    if (!response.ok) { 
        throw new Error(`Failed to fetch batch quotes: ${response.statusText}`);
    }
  const result= await response.json();
  return result.data;
}
