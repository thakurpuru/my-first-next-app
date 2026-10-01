export interface StockHolding {
  id: string;
  particulars: string;       // Stock Name (e.g. "Reliance Industries Ltd")
  symbol: string;            // Base ticker (e.g. "RELIANCE")
  exchangeCode: string;      // NSE/BSE Code (e.g. "RELIANCE.NS" or "TCS.NS")
  exchange: 'NSE' | 'BSE';   // Exchange name
  sector: string;            // Sector (e.g. "Technology", "Financials", "Energy")
  purchasePrice: number;     // Purchase Price per share in INR
  quantity: number;          // Quantity of shares
  
  // Real-time market data
  cmp: number;               // Current Market Price from Yahoo Finance
  previousClose?: number;    // Previous day's close for day change
  peRatio: number | null;    // P/E Ratio from Google Finance
  latestEarnings: string | null; // Latest Earnings from Google Finance (e.g. "₹35.74 EPS")
  
  // Dynamic price flash state
  priceDirection?: 'up' | 'down' | 'same';
  lastUpdated?: string;      // ISO timestamp of last price update
  dataSource?: 'live' | 'cache' | 'simulated';
}

export interface CalculatedHolding extends StockHolding {
  investment: number;        // Purchase Price × Quantity
  presentValue: number;      // CMP × Quantity
  gainLoss: number;          // Present Value - Investment
  gainLossPercentage: number;// ((Present Value - Investment) / Investment) * 100
  portfolioWeight: number;   // (Investment / Total Investment) * 100
  portfolioPvWeight: number; // (Present Value / Total Present Value) * 100
  dayGainLoss?: number;      // (CMP - previousClose) * Quantity
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  stockCount: number;
  holdings: CalculatedHolding[];
  portfolioWeight: number;
}

export interface PortfolioTotals {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  dayGainLoss: number;
  dayGainLossPercentage: number;
  topPerformingSector: string;
  profitableStocksCount: number;
  lossStocksCount: number;
  totalStocksCount: number;
}

export interface LiveQuoteResponse {
  symbol: string;
  cmp: number;
  previousClose: number;
  change: number;
  changePercent: number;
  peRatio: number | null;
  latestEarnings: string | null;
  timestamp: number;
  source: 'live' | 'cache' | 'simulated';
}
