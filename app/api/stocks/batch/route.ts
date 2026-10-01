import { StockHolding } from "@/app/types/portfolio";
import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';


interface StockData {
  symbol: string;
  price?: number;
  currency?: string;
  change?: number;
  changePercent?: number;
}

export async function GET(request: Request){

try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    if(!symbolsParam) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "symbols" is required' },
        { status: 400 }
      );
    }
    const symbols = symbolsParam
      .split(",")
      .map((symbol) => symbol.trim())
      .filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid symbols provided",
        },
        { status: 400 }
      );
    }
    const yahooFinance = new YahooFinance();
    const quotes = await yahooFinance.quote(symbols);
    const results: Record<string, StockData> = {};

    const quoteList = Array.isArray(quotes) ? quotes : [quotes];

    quoteList.forEach((quote) => {
      if (quote && quote.symbol) {
        results[quote.symbol] = {
          symbol: quote.symbol,
          price: quote.regularMarketPrice ?? 0,
          currency: quote.currency ?? 'INR',
          change: quote.regularMarketChange ?? 0,
          changePercent: quote.regularMarketChangePercent ?? 0,
        };
      }
    });
    return NextResponse.json({
        success: true,
        data: results,
    });
  }catch (error) {
    console.error('Error fetching batch quotes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batch quotes' },
      { status: 500 }
    );
  }
}
