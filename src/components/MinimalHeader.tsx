import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
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
  onRefresh,
  loading = false,
}) => {
  const [time, setTime] = useState<string>('');
  const [tickerData, setTickerData] = useState<MarketTickerResponse | null>(null);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const tickerItems: IndexTickerItem[] = [
    nifty,
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
        className="inline-flex items-center gap-2 px-4 py-0.5 border-r border-[#1a1a24]/60 whitespace-nowrap group cursor-default"
      >
        <span className="font-pixel text-[8px] sm:text-[9px] text-slate-300 tracking-wider">
          {item.symbol}
        </span>
        <span className="font-mono text-[11px] sm:text-xs text-white font-bold tabular-nums">
          {isVix
            ? item.price.toFixed(2)
            : `₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 font-pixel text-[8px] sm:text-[9px] tabular-nums px-1.5 py-0.5 rounded ${
            isPos
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
              : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
          }`}
        >
          {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
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
          
          {/* Left Side: Brand Logo 'praxeo' (Clean brand name with no extra sub-text) */}
          <button
            onClick={onNavigateHome}
            id="btn-brand-home"
            className="flex items-center gap-2 text-left cursor-pointer group focus:outline-none"
            title="praxeo - Home"
          >
            <span className="font-pixel text-[#bef264] text-lg sm:text-xl tracking-wider group-hover:brightness-125 transition-all">
              praxeo
            </span>
          </button>

          {/* Right Side: TIME BOX (White background, cross/angled box, black text) & Navigation Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Time Box: Cross/Slanted Box with Pure White Background and Pure Black Text */}
            <div
              id="header-time-box"
              className="transform -skew-x-12 px-3 py-1 bg-white border border-white rounded-[2px] shadow-sm flex items-center justify-center"
              title="Current Indian Standard Time (IST)"
            >
              <div className="transform skew-x-12 flex items-center gap-1.5 text-black">
                <Clock className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span className="font-pixel text-[9px] sm:text-[10px] font-bold tracking-wider text-black tabular-nums">
                  {time || '--:--:--'}
                </span>
                <span className="font-pixel text-[8px] font-bold text-slate-800 hidden xs:inline">
                  IST
                </span>
              </div>
            </div>

            {/* Sub-page Navigation & Refresh Controls */}
            {level > 1 && (
              <button
                onClick={onNavigateHome}
                id="btn-header-home"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0a0a10] border border-[#222230] hover:border-[#ff3b00] text-slate-300 hover:text-white font-pixel text-[8px] sm:text-[9px] transition-all cursor-pointer group shadow-sm"
                title="Return to Home"
              >
                <ArrowLeft className="w-3 h-3 text-[#ff3b00] group-hover:-translate-x-0.5 transition-transform" />
                <span>HOME</span>
              </button>
            )}

            {onRefresh && level === 3 && (
              <button
                onClick={onRefresh}
                disabled={loading}
                id="btn-header-sync"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0a0a10] border border-[#222230] hover:border-[#bef264] text-slate-300 hover:text-[#bef264] font-pixel text-[8px] sm:text-[9px] transition-all disabled:opacity-50 cursor-pointer"
                title="Refresh Market Data"
              >
                <RefreshCw className={`w-3 h-3 text-[#bef264] ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">SYNC</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. RUNNING TICKER TAPE (Continuous infinite scroll for Nifty, Nifty Bank, Sensex, and India VIX) */}
      <div className="border-b border-[#12121c] bg-[#040407] overflow-hidden relative py-1 text-xs">
        <div className="flex items-center">
          
          {/* Market Status Static Indicator on left of ticker */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 sm:pl-6 pr-3 z-10 bg-[#040407] border-r border-[#151520] flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-pixel text-[8px] text-slate-400 whitespace-nowrap">
              {isMarketOpen ? 'NSE LIVE' : 'NSE CLOSED'}
            </span>
          </div>

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
