import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";



// Define strict return types for API response
interface StockData {
  symbol: string;
  price?: number;
  currency?: string;
  change?: number;
  changePercent?: number;
}

interface YahooQuote {
  symbol: string;
  regularMarketPrice?: number;
  peratio: number | null;
  latestEarning: string | null;
}

interface SuccessResponse {
  success: true;
  data: StockData;
}

interface ErrorResponse {
  success: false;
  message: string;
}

interface Context {
  params: Promise<{
    symbol: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: Context
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock symbol is required",
        },
        { status: 400 }
      );
    }
    const yahooFinance = new YahooFinance();
    const quote = await yahooFinance.quote(symbol);

    return NextResponse.json({
      success: true,
      data: {
        symbol: quote.symbol,
        price: quote.regularMarketPrice,
        currency: quote.currency,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
      },
    });
  } catch (error) {
    console.error("Yahoo Finance API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stock data",
      },
      { status: 500 }
    );
  }
}