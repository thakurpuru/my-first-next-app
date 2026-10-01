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








