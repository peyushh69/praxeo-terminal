import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ChevronDown,
  ArrowLeft,
  Smartphone,
  Settings,
} from 'lucide-react';
import type { MarketBreadthResponse } from '../types';
import { SECTORAL_INDICES } from '../data/sectoralIndices';

interface HeaderProps {
  data: MarketBreadthResponse | null;
  loading: boolean;
  onRefresh: () => void;
  autoRefreshCountdown: number;
  currentIndexId: string;
  onSelectIndex: (indexId: string) => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  loading,
  onRefresh,
  autoRefreshCountdown,
  currentIndexId,
  onSelectIndex,
  onNavigateHome,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalConstituents = data?.summary.totalStocks || 50;
  const stance = data?.summary.marketStance || 'Neutral';
  const activeIndexDef = SECTORAL_INDICES.find(s => s.id === currentIndexId) || SECTORAL_INDICES[0];

  const tickerItems = [
    {
      code: activeIndexDef.shortName.toUpperCase(),
      label: activeIndexDef.name,
      price: data ? `₹${data.indexInfo.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹24,780.60',
      change: data ? `${data.indexInfo.change >= 0 ? '+' : ''}${data.indexInfo.changePercent.toFixed(2)}%` : '+0.55%',
      isPos: data ? data.indexInfo.change >= 0 : true,
    },
    {
      code: 'EMA9',
      label: '9 EMA PASS',
      price: data ? `${data.summary.aboveEma9.count}/${totalConstituents}` : `38/${totalConstituents}`,
      change: data ? `${data.summary.aboveEma9.percentage}%` : '76.0%',
      isPos: data ? data.summary.aboveEma9.percentage >= 50 : true,
    },
    {
      code: 'EMA20',
      label: '20 EMA PASS',
      price: data ? `${data.summary.aboveEma20.count}/${totalConstituents}` : `34/${totalConstituents}`,
      change: data ? `${data.summary.aboveEma20.percentage}%` : '68.0%',
      isPos: data ? data.summary.aboveEma20.percentage >= 50 : true,
    },
    {
      code: 'EMA50',
      label: '50 EMA PASS',
      price: data ? `${data.summary.aboveEma50.count}/${totalConstituents}` : `30/${totalConstituents}`,
      change: data ? `${data.summary.aboveEma50.percentage}%` : '60.0%',
      isPos: data ? data.summary.aboveEma50.percentage >= 50 : true,
    },
    {
      code: 'EMA200',
      label: '200 EMA PASS',
      price: data ? `${data.summary.aboveEma200.count}/${totalConstituents}` : `42/${totalConstituents}`,
      change: data ? `${data.summary.aboveEma200.percentage}%` : '84.0%',
      isPos: data ? data.summary.aboveEma200.percentage >= 50 : true,
    },
    {
      code: 'GOLDEN',
      label: 'GOLDEN STACK',
      price: data ? `${data.summary.goldenStackCount} STOCKS` : '18 STOCKS',
      change: 'BULLISH',
      isPos: true,
    },
  ];

  return (
    <header className="border-b border-[#18181f] bg-[#000000] text-slate-200 select-none">
      
      {/* Top Navigation Bar: Back to Terminal Hub + Sector Selector + Controls */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Hub Home Back button + Active Index */}
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-hub"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08080c] hover:bg-[#14141c] border border-[#22222e] hover:border-[#ff3b00] text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer group shadow-sm"
            title="Return to Terminal Homepage"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#ff3b00] group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono">TERMINAL HUB</span>
          </button>

          <div className="h-4 w-px bg-[#20202c]"></div>

          <div className="flex items-baseline gap-2">
            <span className="font-pixel text-xl sm:text-2xl text-[#bef264] tracking-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:text-[#d9f99d] transition-colors">
              praxis
            </span>
            <span className="font-pixel text-[9px] text-[#ff3b00] tracking-widest hidden sm:inline">
              // BREADTH MATRIX
            </span>
          </div>
        </div>

        {/* Center/Right: Dropdown Sector Selector + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          
          {/* Index Selector Dropdown */}
          <div className="relative">
            <button
              id="btn-index-selector-dropdown"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#09090e] border border-[#2a2a3a] hover:border-[#ff3b00] rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#ff3b00] animate-pulse"></span>
              <span className="text-[#ff3b00] font-pixel text-[10px]">ACTIVE:</span>
              <span className="max-w-[140px] truncate">{activeIndexDef.name}</span>
              <span className="text-[10px] text-slate-400 font-normal">({totalConstituents})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 max-h-80 overflow-y-auto bg-[#07070b] border border-[#252535] rounded-xl shadow-2xl z-50 p-1.5 flex flex-col gap-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-[#181822]">
                  Select Market / Sector Index
                </div>
                {SECTORAL_INDICES.map(idx => (
                  <button
                    key={idx.id}
                    onClick={() => {
                      onSelectIndex(idx.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-all cursor-pointer ${
                      idx.id === currentIndexId
                        ? 'bg-[#ff3b00] text-black font-bold'
                        : 'text-slate-300 hover:bg-[#151520] hover:text-white'
                    }`}
                  >
                    <div className="truncate">
                      <div>{idx.name}</div>
                      <div className={`text-[10px] ${idx.id === currentIndexId ? 'text-black/80' : 'text-slate-500'}`}>
                        {idx.category}
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      idx.id === currentIndexId ? 'bg-black/20 text-black' : 'bg-[#12121c] text-slate-400'
                    }`}>
                      {idx.stocks.length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sync Feed Button */}
          <button
            id="btn-sync-action"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08080c] border border-[#ff3b00] text-[#ff3b00] hover:bg-[#ff3b00] hover:text-black rounded-lg transition-all cursor-pointer shadow-pixel-orange text-[11px] font-bold"
            title="Refresh live breadth data"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'SYNCING...' : 'SYNC FEED'}</span>
          </button>

          <div className="p-1.5 border border-[#18181f] bg-[#08080c] text-[#ff3b00] rounded-lg">
            <Smartphone className="w-4 h-4" />
          </div>

          <div className="p-1.5 border border-[#18181f] bg-[#08080c] text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <Settings className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Sector Quick Pills Horizontal Scroller */}
      <div className="border-t border-[#18181f] bg-[#050508] px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
          <span className="text-[10px] font-pixel text-slate-500 uppercase mr-1">QUICK SECTORS:</span>
          {SECTORAL_INDICES.map(idx => {
            const isActive = idx.id === currentIndexId;
            return (
              <button
                key={idx.id}
                id={`pill-sector-${idx.id}`}
                onClick={() => onSelectIndex(idx.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#ff3b00] text-black font-bold shadow-sm'
                    : 'bg-[#0a0a10] hover:bg-[#161622] text-slate-300 hover:text-white border border-[#1e1e2c]'
                }`}
              >
                <span>{idx.shortName}</span>
                <span className={`text-[9px] px-1 rounded ${isActive ? 'bg-black/20 text-black' : 'bg-[#181824] text-slate-400'}`}>
                  {idx.stocks.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Mini Stats Widgets row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Box 1: 9 EMA Ratio */}
          <div className="praxis-card p-2.5 sm:p-3 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-[#ff3b00] border-t-transparent animate-spin-slow"></div>
              <span className="font-pixel text-[11px] sm:text-xs text-white">
                {data ? `${data.summary.aboveEma9.count}` : '0'}<span className="text-[#ff3b00]">/{totalConstituents}</span>
              </span>
              <span className="text-[9px] font-pixel text-slate-400 hidden sm:inline ml-auto">9 EMA</span>
            </div>
            <div className="w-full bg-[#141b2a] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#ff3b00] h-full rounded-full transition-all duration-500"
                style={{ width: `${data ? data.summary.aboveEma9.percentage : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Box 2: Swing 20 EMA */}
          <div className="praxis-card p-2.5 sm:p-3 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#0a0e17] rounded-full"></div>
              </div>
              <span className="font-pixel text-[11px] sm:text-xs text-white">
                {data ? `${data.summary.aboveEma20.count}` : '0'}<span className="text-slate-400">/{totalConstituents}</span>
              </span>
              <span className="text-[9px] font-pixel text-slate-400 hidden sm:inline ml-auto">20 EMA</span>
            </div>
            <div className="w-full bg-[#141b2a] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#3b82f6] h-full rounded-full transition-all duration-500"
                style={{ width: `${data ? data.summary.aboveEma20.percentage : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Box 3: Market Stance */}
          <div className="praxis-card p-2.5 sm:p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[9px] text-slate-400">BIAS:</span>
              <span className={`font-pixel text-[10px] px-1.5 py-0.5 rounded ${
                stance.includes('Bullish') ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-[#ff3b00]/20 text-[#ff3b00] border border-[#ff3b00]/40'
              }`}>
                {stance}
              </span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 mt-1 truncate">
              {data?.summary.goldenStackCount || 0} Golden Stacks
            </div>
          </div>

          {/* Box 4: Auto countdown & clock */}
          <div className="praxis-card p-2.5 sm:p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[9px] text-[#ff3b00]">AUTO SYNC</span>
              <span className="font-pixel text-[10px] text-white tabular-nums">{autoRefreshCountdown}S</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>IST</span>
              <span className="text-slate-200 font-bold">{currentTimeStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retro Ticker Tape */}
      <div className="bg-[#04060a] border-y border-[#18181f] px-3 sm:px-6 py-1.5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-[760px] text-xs font-mono">
          <div className="flex items-center gap-1.5 font-pixel text-[9px] text-[#ff3b00] shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ff3b00] animate-ping"></span>
            <span>FEED</span>
            <span className="text-slate-600">|</span>
          </div>

          <div className="flex items-center justify-between flex-1 gap-4">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 border-r border-[#18181f] pr-4 last:border-r-0">
                <span className="text-slate-400 text-[10px] font-pixel">
                  {item.label}
                </span>
                <span className="text-white font-bold font-mono">
                  {item.price}
                </span>
                <span className={`text-[10px] font-pixel px-1 rounded ${
                  item.isPos ? 'text-emerald-400 bg-emerald-950/60' : 'text-[#ff3b00] bg-[#ff3b00]/10'
                }`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
