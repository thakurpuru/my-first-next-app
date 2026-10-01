'use client';

import React, { useState, useMemo , useEffect, useCallback, useRef} from 'react';
import { StockHolding } from '../types/portfolio';
import { INITIAL_HOLDINGS } from '../data/initialHolding'; 
import { fetchBatchQuotes } from '../api/stocks/batch/route'; 
interface SectorSummary {
  sector: string;
  stocks: StockHolding[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPct: number;
  portfolioWeightPct: number;
}
const REFRESH_INTERVAL_SECONDS = 15;
export default function StockSectorTable() {
  // Overall Portfolio Investment total for weight calculations
  const STORAGE_KEY = 'octabyte_portfolio_holdings_v2';
  const [holdings,setHoldings]=useState<StockHolding[]>(() => {
    try{
        const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }catch{

    }
    return INITIAL_HOLDINGS;
  });

    useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
    } catch {
      // Ignore
    }
  }, [holdings]);
    const [countdown,setCountdown]=useState<number>(REFRESH_INTERVAL_SECONDS);
    const [isLoadding,setLoading]=useState<boolean>(false);

    const refreshQuote=useCallback(async()=>{
        setLoading(true);
        try{
            const response = await fetchBatchQuotes(holdings);
            const updatedHoldings =
              holdings.map((h) => {
                const sym=`${h.symbol}.NS`
                const quote =response[sym];

                return {
                  ...h,
                  cmp: quote?.price ?? h.cmp,
                };
              })
            
            setHoldings(updatedHoldings);
        }catch{
            console.log("Loading Failed");
        } finally {
          setLoading(false);
          setCountdown(REFRESH_INTERVAL_SECONDS);
        }
    },[holdings])

    const hasFetchInitial=useRef(false);
    useEffect(()=>{
        if(!hasFetchInitial.current){
            hasFetchInitial.current=true;
            refreshQuote();
        }
    },[refreshQuote])

    useEffect(()=>{
        
        const timer=setInterval(()=>{
            setCountdown((prev)=>{
                if(prev<=1){
                    refreshQuote();
                    return REFRESH_INTERVAL_SECONDS;
                }
                return prev-1;
            })
        },1000)
        return ()=> clearInterval(timer);
    },[refreshQuote]);



  const totalPortfolioInvestment = useMemo(() => {
    return holdings.reduce((sum, stock) => sum + stock.purchasePrice * stock.quantity, 0);
  }, [holdings]);

  // Group holdings by sector and compute sector-level summaries
  const sectorSummaries: SectorSummary[] = useMemo(() => {
    const grouped = holdings.reduce<Record<string, StockHolding[]>>((acc, stock) => {
      if (!acc[stock.sector]) acc[stock.sector] = [];
      acc[stock.sector].push(stock);
      return acc;
    }, {});

    return Object.entries(grouped).map(([sector, stocks]) => {
      const totalInvestment = stocks.reduce((sum, s) => sum + s.purchasePrice * s.quantity, 0);
      const totalPresentValue = stocks.reduce((sum, s) => sum + s.cmp * s.quantity, 0);
      const totalGainLoss = totalPresentValue - totalInvestment;
      const gainLossPct = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
      const portfolioWeightPct = totalPortfolioInvestment > 0 ? (totalInvestment / totalPortfolioInvestment) * 100 : 0;

      return {
        sector,
        stocks,
        totalInvestment,
        totalPresentValue,
        totalGainLoss,
        gainLossPct,
        portfolioWeightPct,
      };
    });
  }, [holdings, totalPortfolioInvestment]);

  // Track expanded accordion sectors (default: all expanded)
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>(() =>
    sectorSummaries.reduce((acc, summary) => ({ ...acc, [summary.sector]: true }), {})
  );

  const toggleSector = (sector: string) => {
    setExpandedSectors((prev) => ({ ...prev, [sector]: !prev[sector] }));
  };
  const totalInvestment = holdings.reduce((acc, stock) => acc + stock.purchasePrice * stock.quantity, 0);
  const totalCurrentValue = holdings.reduce((acc, stock) => acc + stock.cmp * stock.quantity, 0);
  const totalGainLoss = totalCurrentValue - totalInvestment;
  const totalReturnPct = ((totalGainLoss / totalInvestment) * 100).toFixed(2);
  if(isLoadding){
    return <div>Loding....</div>;
  }
  return (

    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
        {/* Portfolio Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 text-white p-6 rounded-xl shadow-lg">
        <div>
          <p className="text-sm text-slate-400">Total Investment</p>
          <p className="text-2xl font-bold">₹{totalInvestment.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Current Value</p>
          <p className="text-2xl font-bold">₹{totalCurrentValue.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Total Gain / Loss</p>
          <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGainLoss >= 0 ? '+' : ''}₹{totalGainLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({totalReturnPct}%)
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3.5">Particulars (Stock Name)</th>
              <th scope="col" className="px-4 py-3.5 text-right">Avg Price</th>
              <th scope="col" className="px-4 py-3.5 text-right">Qty</th>
              <th scope="col" className="px-4 py-3.5 text-right">Investment (₹)</th>
              <th scope="col" className="px-4 py-3.5 text-right">Portfolio (%)</th>
              <th scope="col" className="px-4 py-3.5 text-right">CMP (₹)</th>
              <th scope="col" className="px-4 py-3.5 text-right">Present Value (₹)</th>
              <th scope="col" className="px-4 py-3.5 text-right">Gain / Loss</th>
              <th scope="col" className="px-4 py-3.5 text-right">P/E ratio</th>
              <th scope="col" className="px-4 py-3.5 text-right">latestEarnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sectorSummaries.map((summary) => {
              const isExpanded = expandedSectors[summary.sector];
              const isPositive = summary.totalGainLoss >= 0;

              return (
                <React.Fragment key={summary.sector}>
                  {/* Sector Summary Row */}
                  <tr
                    onClick={() => toggleSector(summary.sector)}
                    className="bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer font-medium transition-colors border-t border-slate-800"
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-100 flex items-center space-x-2">
                      <span className="text-xs text-slate-400 transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        ▶
                      </span>
                      <span>{summary.sector}</span>
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {summary.stocks.length} Stocks
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500">-</td>
                    <td className="px-4 py-3.5 text-right text-slate-500">-</td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-200">
                      ₹{summary.totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                      {summary.portfolioWeightPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500">-</td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-200">
                      ₹{summary.totalPresentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3.5 text-right font-mono font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}₹{summary.totalGainLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      <div className="text-xs font-normal">({isPositive ? '+' : ''}{summary.gainLossPct.toFixed(2)}%)</div>
                    </td>
                  </tr>

                  {/* Individual Stock Rows */}
                  {isExpanded &&
                    summary.stocks.map((stock) => {
                      const investment = stock.purchasePrice * stock.quantity;
                      const presentValue = stock.cmp * stock.quantity;
                      const gainLoss = presentValue - investment;
                      const gainLossPct = investment > 0 ? (gainLoss / investment) * 100 : 0;
                      const stockWeight = totalPortfolioInvestment > 0 ? (investment / totalPortfolioInvestment) * 100 : 0;
                      const stockPositive = gainLoss >= 0;

                      return (
                        <tr key={stock.id} className="bg-slate-950 hover:bg-slate-900/60 transition-colors text-slate-300">
                          <td className="pl-10 pr-4 py-3 font-medium whitespace-nowrap">
                            <div className="text-slate-200">{stock.particulars}</div>
                            <span className="text-xs text-slate-500 font-normal">
                              {stock.symbol} ({stock.exchange})
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">₹{stock.purchasePrice.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-right font-mono">{stock.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono">₹{investment.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-400">{stockWeight.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-100">₹{stock.cmp.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-right font-mono">₹{presentValue.toLocaleString('en-IN')}</td>
                          <td className={`px-4 py-3 text-right font-mono whitespace-nowrap ${stockPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stockPositive ? '+' : ''}₹{gainLoss.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                            <span className="text-xs block text-slate-400">
                              ({stockPositive ? '+' : ''}{gainLossPct.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">{stock.peRatio}</td>
                          <td className="px-4 py-3 text-right font-mono">{stock.latestEarnings}</td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}