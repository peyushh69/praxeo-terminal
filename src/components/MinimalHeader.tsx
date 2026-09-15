import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketTickerResponse, IndexTickerItem } from '../types';

interface MinimalHeaderProps {
  level: 1 | 2 | 3;
  onNavigateHome: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  currentIndexName?: string;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  level,
  onNavigateHome,
}) => {
  const [tickerData, setTickerData] = useState<MarketTickerResponse | null>(null);

  // Fetch Live Tickers (Nifty 50, Bank Nifty, Sensex, India VIX) from server
  useEffect(() => {
    let isMounted = true;
    const fetchTickers = async () => {
      try {
        const res = await axios.get('/api/ticker', { timeout: 8000 });
        if (isMounted && res.data?.success && res.data?.data) {
          setTickerData(res.data.data);
        }
      } catch (err) {
        if (isMounted) {
          console.debug('Ticker update using baseline values');
        }
      }
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 15000); // 15s refresh for real-time live quotes
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const nifty: IndexTickerItem = tickerData?.nifty || {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50',
    price: 24175.65,
    change: 84.80,
    changePercent: 0.35,
  };

  const niftyNext50: IndexTickerItem = tickerData?.niftyNext50 || {
    symbol: 'NIFTY NEXT 50',
    name: 'NIFTY NEXT 50',
    price: 72880.90,
    change: 114.50,
    changePercent: 0.16,
  };

  const niftyMidcap: IndexTickerItem = tickerData?.niftyMidcap || {
    symbol: 'NIFTY MIDCAP',
    name: 'NIFTY MIDCAP 100',
    price: 20197.30,
    change: 48.20,
    changePercent: 0.24,
  };

  const niftySmallcap: IndexTickerItem = tickerData?.niftySmallcap || {
    symbol: 'NIFTY SMALLCAP',
    name: 'NIFTY SMALLCAP 100',
    price: 20095.45,
    change: -18.70,
    changePercent: -0.09,
  };

  const nifty500: IndexTickerItem = tickerData?.nifty500 || {
    symbol: 'NIFTY 500',
    name: 'NIFTY 500',
    price: 23254.15,
    change: 65.40,
    changePercent: 0.28,
  };

  const bankNifty: IndexTickerItem = tickerData?.bankNifty || {
    symbol: 'BANK NIFTY',
    name: 'NIFTY BANK',
    price: 57496.30,
    change: -13.65,
    changePercent: -0.02,
  };

  const sensex: IndexTickerItem = tickerData?.sensex || {
    symbol: 'SENSEX',
    name: 'BSE SENSEX',
    price: 77264.51,
    change: 330.91,
    changePercent: 0.43,
  };

  const indiaVix: IndexTickerItem = tickerData?.indiaVix || {
    symbol: 'INDIA VIX',
    name: 'INDIA VIX',
    price: 10.68,
    change: -0.39,
    changePercent: -3.50,
  };

  const tickerItems: IndexTickerItem[] = tickerData?.tickersList || [
    nifty,
    niftyNext50,
    niftyMidcap,
    niftySmallcap,
    nifty500,
    bankNifty,
    sensex,
    indiaVix,
  ];

  const isMarketOpen = tickerData?.isMarketOpen ?? false;

  const renderTickerItem = (item: IndexTickerItem, idx: number, prefix: string) => {
    const isPos = item.change >= 0;
    const isVix = item.symbol.includes('VIX');
    
    return (
      <div
        key={`${prefix}-${item.symbol}-${idx}`}
        className="inline-flex items-center gap-2 px-4 py-0.5 border-r border-slate-200 whitespace-nowrap group cursor-default"
      >
        <span className="font-pixel text-[8px] sm:text-[9px] text-slate-700 font-bold tracking-wider">
          {item.symbol}
        </span>
        <span className="font-mono text-[11px] sm:text-xs text-black font-bold tabular-nums">
          {isVix
            ? item.price.toFixed(2)
            : `₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 font-pixel text-[8px] sm:text-[9px] tabular-nums px-1.5 py-0.5 rounded font-semibold ${
            isPos
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}
        >
          {isPos ? <TrendingUp className="w-2.5 h-2.5 text-emerald-700" /> : <TrendingDown className="w-2.5 h-2.5 text-rose-700" />}
          {isPos ? '+' : ''}
          {item.changePercent.toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <div className="w-full select-none font-mono">
      {/* 1. PRIMARY FIXED BRAND HEADER */}
      <header className="border-b border-[#14141d] bg-[#000000] px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          
          {/* Left Side: Brand Logo 'Prexios' (Clean brand name with no extra sub-text) */}
          <button
            onClick={onNavigateHome}
            id="btn-brand-home"
            className="flex items-center gap-2 text-left cursor-pointer group focus:outline-none"
            title="Prexios - Home"
          >
            <span className="font-pixel text-[#bef264] text-lg sm:text-xl tracking-wider group-hover:brightness-125 transition-all">
              Prexios
            </span>
          </button>

          {/* Right Side: Professional HOME Navigation Button on Subpages */}
          <div className="flex items-center">
            {level > 1 && (
              <button
                onClick={onNavigateHome}
                id="btn-header-home"
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0d0d15] border border-[#222234] hover:border-[#bef264] text-slate-300 hover:text-white font-pixel text-[9px] sm:text-[10px] tracking-wider transition-all cursor-pointer group shadow-sm"
                title="Return to Home"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#bef264] group-hover:-translate-x-0.5 transition-transform" />
                <span>HOME</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. RUNNING TICKER TAPE (Continuous infinite scroll on high-contrast white background) */}
      <div className="border-b border-slate-200 bg-white overflow-hidden relative text-xs text-slate-900 shadow-sm h-[26px] flex items-center">
        <div className="flex items-center w-full h-full">

          {/* Running Continuous Marquee Ticker */}
          <div className="overflow-hidden whitespace-nowrap flex-1 flex">
            <div className="animate-ticker flex items-center">
              {/* Primary list */}
              {tickerItems.map((item, idx) => renderTickerItem(item, idx, 't1'))}
              {/* Duplicate list for smooth seamless infinite scroll */}
              {tickerItems.map((item, idx) => renderTickerItem(item, idx, 't2'))}
              {/* Triplicate list to guarantee smooth fill on large wide screens */}
              {tickerItems.map((item, idx) => renderTickerItem(item, idx, 't3'))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
