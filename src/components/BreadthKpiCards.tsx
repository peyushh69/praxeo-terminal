import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Layers,
  Shield,
  Sparkles,
  Activity,
  Maximize2,
  Calendar,
  Compass,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import type { MarketBreadthResponse } from '../types';

interface BreadthKpiCardsProps {
  summary: MarketBreadthResponse['summary'] | undefined;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  indexName?: string;
}

export const BreadthKpiCards: React.FC<BreadthKpiCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter,
  indexName = 'NIFTY 50',
}) => {
  const [selectedIndicatorTab, setSelectedIndicatorTab] = useState<
    '9' | '20' | '50' | '100' | '200' | 'rsi' | 'macd'
  >('9');

  if (!summary) return null;

  const {
    totalStocks,
    aboveEma9,
    aboveEma20,
    aboveEma50,
    aboveEma100,
    aboveEma200,
    rsiAbove50,
    macdBullish,
    goldenCrossCount,
    aboveAllEmasCount,
    belowAllEmasCount,
    goldenStackCount,
  } = summary;

  // Active indicator metric resolution
  const activeMetric =
    selectedIndicatorTab === '9'
      ? aboveEma9
      : selectedIndicatorTab === '20'
      ? aboveEma20
      : selectedIndicatorTab === '50'
      ? aboveEma50
      : selectedIndicatorTab === '100'
      ? aboveEma100
      : selectedIndicatorTab === '200'
      ? aboveEma200
      : selectedIndicatorTab === 'rsi'
      ? rsiAbove50
      : macdBullish;

  const activeTitle =
    selectedIndicatorTab === '9'
      ? '9 EMA MOMENTUM TRIGGER'
      : selectedIndicatorTab === '20'
      ? '20 EMA SWING BENCHMARK'
      : selectedIndicatorTab === '50'
      ? '50 EMA INSTITUTIONAL BASE'
      : selectedIndicatorTab === '100'
      ? '100 EMA STRUCTURAL FLOOR'
      : selectedIndicatorTab === '200'
      ? '200 EMA MACRO BULL-BEAR LINE'
      : selectedIndicatorTab === 'rsi'
      ? 'RSI(14) > 50 MOMENTUM OSCILLATOR'
      : 'MACD (12,26,9) BULLISH CROSSOVER';

  const filterKeyMap: Record<string, string> = {
    '9': 'above-ema9',
    '20': 'above-ema20',
    '50': 'above-ema50',
    '100': 'above-ema100',
    '200': 'above-ema200',
    'rsi': 'rsi-above50',
    'macd': 'macd-bullish',
  };

  const currentTabFilterKey = filterKeyMap[selectedIndicatorTab];

  const primaryCards = [
    {
      id: 'ema9',
      filterKey: 'above-ema9',
      tag: 'EMA 9',
      title: '9 EMA TRIGGER',
      label: 'Ultra-Fast Momentum',
      metric: aboveEma9,
      color: '#ff3b00',
      icon: Zap,
    },
    {
      id: 'ema20',
      filterKey: 'above-ema20',
      tag: 'EMA 20',
      title: '20 EMA BENCHMARK',
      label: 'Swing Mean Reversion',
      metric: aboveEma20,
      color: '#3b82f6',
      icon: TrendingUp,
    },
    {
      id: 'ema50',
      filterKey: 'above-ema50',
      tag: 'EMA 50',
      title: '50 EMA BASELINE',
      label: 'Institutional Quarterly Base',
      metric: aboveEma50,
      color: '#10b981',
      icon: Target,
    },
    {
      id: 'ema200',
      filterKey: 'above-ema200',
      tag: 'EMA 200',
      title: '200 EMA MACRO',
      label: 'Long-Term Regime Line',
      metric: aboveEma200,
      color: '#8b5cf6',
      icon: Shield,
    },
    {
      id: 'rsi',
      filterKey: 'rsi-above50',
      tag: 'RSI > 50',
      title: 'RSI(14) MOMENTUM',
      label: 'Bullish Oscillator Force',
      metric: rsiAbove50,
      color: '#ec4899',
      icon: Activity,
    },
    {
      id: 'macd',
      filterKey: 'macd-bullish',
      tag: 'MACD BULL',
      title: 'MACD CROSSOVER',
      label: 'Trend Acceleration',
      metric: macdBullish,
      color: '#f59e0b',
      icon: BarChart2,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. PRAXIS HERO CARD with 50-DOT BEAD MATRIX */}
      <div className="praxis-card p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            {/* Big Retro Digital Counter */}
            <div className="flex items-baseline gap-2">
              <span className="font-pixel text-4xl sm:text-5xl text-white tracking-tight">
                {activeMetric.count}
              </span>
              <span className="font-pixel text-2xl sm:text-3xl text-[#ff3b00]">
                S
              </span>
              <span className="font-pixel text-xs sm:text-sm text-slate-400">
                PASSING {activeTitle.split(' ')[0]}
              </span>
            </div>

            {/* Tag line in Praxis arcade styling */}
            <div className="flex items-center gap-2 mt-2">
              <span className="font-pixel text-xs sm:text-sm text-[#ff3b00] tracking-wide">
                [{indexName.toUpperCase()} BREADTH MATRIX]
              </span>
              <span className="text-slate-500">&bull;</span>
              <span className="font-pixel text-[10px] sm:text-xs text-slate-300">
                DAILY 1D QUANT ENGINE
              </span>
            </div>

            {/* Explanatory description */}
            <p className="text-xs text-slate-400 font-mono mt-2 max-w-2xl leading-relaxed">
              <span className="text-[#ff3b00] font-bold font-pixel text-[10px]">
                {activeMetric.count} OF {totalStocks}
              </span>{' '}
              {indexName.toUpperCase()} CONSTITUENTS HOLDING ABOVE CRITICAL TECHNICAL THRESHOLD (
              {activeMetric.percentage}% PARTICIPATION RATE). REAL-TIME YFINANCE
              QUANT ENGINE.
            </p>

            {/* Action pill button */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <button
                id="btn-filter-active-metric"
                onClick={() =>
                  onSelectFilter(
                    activeFilter === currentTabFilterKey ? 'all' : currentTabFilterKey
                  )
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#ff3b00] bg-[#0c1017] text-[#ff3b00] hover:bg-[#ff3b00] hover:text-black font-pixel text-[10px] rounded-lg transition-all cursor-pointer shadow-pixel-orange"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {activeFilter === currentTabFilterKey
                    ? `SHOW ALL ${totalStocks} STOCKS`
                    : `FILTER ${selectedIndicatorTab.toUpperCase()} PASSING STOCKS`}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Signal Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 shrink-0">
            <div className="p-3 border border-[#1c2436] bg-[#070a12] rounded-xl flex items-center gap-3">
              <div className="p-2 bg-amber-950/60 border border-amber-500/50 text-amber-400 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-pixel text-[9px] text-amber-400">GOLDEN STACK</div>
                <div className="font-pixel text-sm text-white mt-0.5">
                  {goldenStackCount} / {totalStocks} STOCKS
                </div>
              </div>
            </div>

            <div className="p-3 border border-[#1c2436] bg-[#070a12] rounded-xl flex items-center gap-3">
              <div className="p-2 bg-purple-950/60 border border-purple-500/50 text-purple-400 rounded-lg">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="font-pixel text-[9px] text-purple-300">GOLDEN CROSS</div>
                <div className="font-pixel text-sm text-white mt-0.5">
                  {goldenCrossCount} / {totalStocks} (50&gt;200)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual 50-Dot Bead Matrix */}
        <div className="mt-6 pt-5 border-t border-[#1c2436]">
          <div className="p-4 bg-[#06080e] border border-[#1c2436] rounded-xl">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 py-2">
              {Array.from({ length: totalStocks }).map((_, idx) => {
                const isHolding = idx < activeMetric.count;
                return (
                  <div
                    key={idx}
                    className={`dot-bead relative transition-all duration-200 cursor-pointer ${
                      isHolding
                        ? 'bg-[#ff3b00] shadow-[0_0_8px_rgba(255,59,0,0.8)] border border-[#ff7744]'
                        : 'bg-[#94a3b8] border border-slate-300/40 opacity-60'
                    }`}
                    title={`Constituent #${idx + 1}: ${
                      isHolding ? 'Passing Criteria' : 'Failing Criteria'
                    }`}
                  >
                    {idx === 0 && (
                      <div className="absolute -inset-1 rounded-full border border-[#ff3b00] animate-ping opacity-60"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dot Matrix Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-[#1c2436] text-[10px] font-pixel text-slate-400">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b00] shadow-[0_0_6px_#ff3b00]"></span>
                  <span className="text-slate-300">
                    PASSING ({activeMetric.count} STOCKS)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]"></span>
                  <span className="text-slate-400">
                    LAGGING ({totalStocks - activeMetric.count} STOCKS)
                  </span>
                </div>
              </div>
              <div className="text-[#ff3b00]">
                BULLISH THRESHOLD: &gt;60% ({Math.round(totalStocks * 0.6)} STOCKS)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRAXIS INTERACTIVE CARD WITH ORANGE SOLID HIGHLIGHT PANEL */}
      <div className="praxis-card p-4 sm:p-5 shadow-2xl">
        {/* Indicator Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1c2436]">
          <div className="flex items-center gap-1.5 bg-[#06080e] p-1 border border-[#1c2436] rounded-xl font-pixel text-[10px] overflow-x-auto scrollbar-none">
            {[
              { id: '9', label: 'EMA 9' },
              { id: '20', label: 'EMA 20' },
              { id: '50', label: 'EMA 50' },
              { id: '100', label: 'EMA 100' },
              { id: '200', label: 'EMA 200' },
              { id: 'rsi', label: 'RSI(14)' },
              { id: 'macd', label: 'MACD' },
            ].map((tab) => {
              const isActive = selectedIndicatorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedIndicatorTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-pixel whitespace-nowrap ${
                    isActive
                      ? 'bg-[#ff3b00] text-black font-bold shadow-pixel-orange'
                      : 'text-slate-400 hover:text-white hover:bg-[#141b2a]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 font-pixel text-[10px]">
            <button
              onClick={() => onSelectFilter(currentTabFilterKey)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1422] border border-[#ff3b00] text-[#ff3b00] hover:bg-[#ff3b00] hover:text-black rounded-lg transition-all cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>ISOLATE IN TABLE</span>
            </button>
          </div>
        </div>

        {/* Giant Bright Orange Focus Card */}
        <div className="mt-4 praxis-card-orange p-5 sm:p-6 shadow-pixel-orange">
          <div className="flex items-center justify-between font-pixel text-[10px] text-black border-b border-black/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-black"></span>
              <span className="font-bold tracking-wider uppercase">
                {activeTitle}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-black text-[#ff3b00] rounded font-bold uppercase">
                ACTIVE
              </span>
              <span className="text-black/80 font-bold hidden sm:inline">
                P-01
              </span>
            </div>
          </div>

          {/* Giant Digital Pixel Number */}
          <div className="py-5 sm:py-6 text-center">
            <div className="font-pixel text-4xl sm:text-6xl text-black tracking-wider drop-shadow-[2px_2px_0px_rgba(255,255,255,0.4)]">
              {activeMetric.count.toString().padStart(2, '0')} : {totalStocks}
            </div>
            <div className="font-pixel text-xs sm:text-sm text-black/90 mt-2 tracking-wide font-bold">
              {activeMetric.percentage}% CONSTITUENTS PASSING {activeTitle.split(' ')[0]}
            </div>
          </div>

          {/* 3-Column Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-black/20 text-center font-pixel text-black">
            <div>
              <div className="text-[9px] text-black/70 uppercase">TIMEFRAME</div>
              <div className="text-xs sm:text-sm font-bold mt-1">1 DAY</div>
            </div>
            <div className="border-x border-black/20">
              <div className="text-[9px] text-black/70 uppercase">PASSING</div>
              <div className="text-xs sm:text-sm font-bold mt-1">
                {activeMetric.count} / {totalStocks}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-black/70 uppercase">BREADTH %</div>
              <div className="text-xs sm:text-sm font-bold mt-1">
                {activeMetric.percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Segmented Battery Track */}
        <div className="mt-4 p-2 bg-[#06080e] border border-[#1c2436] rounded-xl flex items-center gap-1 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => {
            const filled = (i / 25) * 100 < activeMetric.percentage;
            return (
              <div
                key={i}
                className={`flex-1 h-2 rounded-xs transition-all ${
                  filled ? 'bg-[#ff3b00] shadow-[0_0_4px_#ff3b00]' : 'bg-[#141b2a]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 3. MULTI-INDICATOR CARDS GRID IN PRAXIS STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
        {primaryCards.map((card) => {
          const isSelected = activeFilter === card.filterKey;
          const pct = card.metric.percentage;
          const count = card.metric.count;

          return (
            <div
              key={card.id}
              onClick={() =>
                onSelectFilter(isSelected ? 'all' : card.filterKey)
              }
              className={`praxis-card p-3.5 transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? 'border-[#ff3b00] bg-[#101624] shadow-pixel-orange'
                  : 'hover:border-slate-500 bg-[#0a0e17]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2436]">
                <span className="font-pixel text-[10px] text-[#ff3b00] truncate">
                  {card.tag}
                </span>
                <span className="font-pixel text-[9px] px-1.5 py-0.5 bg-[#141b2a] text-slate-300 rounded border border-[#1c2436]">
                  1D
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2.5">
                <span className="font-pixel text-xl sm:text-2xl text-white">
                  {pct}%
                </span>
                <span className="font-pixel text-xs text-slate-400">
                  {count}/{totalStocks}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#06080e] h-1.5 rounded-full mt-2.5 overflow-hidden border border-[#1c2436]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: card.color || '#ff3b00',
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-2 pt-2 border-t border-[#1c2436]">
                <span className="truncate">{card.label}</span>
                <span className="font-pixel text-[9px] text-[#ff3b00] shrink-0 ml-1">
                  {isSelected ? '[ON]' : '[FILTER]'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. QUANT STRATEGY SIGNALS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Golden Stack */}
        <div
          onClick={() =>
            onSelectFilter(activeFilter === 'golden-stack' ? 'all' : 'golden-stack')
          }
          className={`praxis-card p-3.5 transition-all cursor-pointer flex items-center justify-between ${
            activeFilter === 'golden-stack'
              ? 'border-amber-500 bg-[#16140b] shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-950 border border-amber-500/50 text-amber-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel text-[10px] text-amber-300">GOLDEN STACK</div>
              <div className="text-[10px] text-slate-400 font-mono">
                PRICE &gt; 9 &gt; 20 &gt; 50 &gt; 100 &gt; 200
              </div>
            </div>
          </div>
          <div className="font-pixel text-lg text-amber-400">{goldenStackCount}</div>
        </div>

        {/* Golden Cross (50 > 200) */}
        <div
          onClick={() =>
            onSelectFilter(activeFilter === 'golden-cross' ? 'all' : 'golden-cross')
          }
          className={`praxis-card p-3.5 transition-all cursor-pointer flex items-center justify-between ${
            activeFilter === 'golden-cross'
              ? 'border-purple-500 bg-[#140b1e] shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              : 'hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-950 border border-purple-500/50 text-purple-400 rounded-lg">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel text-[10px] text-purple-300">GOLDEN CROSS</div>
              <div className="text-[10px] text-slate-400 font-mono">
                50 EMA &gt; 200 EMA REGIME
              </div>
            </div>
          </div>
          <div className="font-pixel text-lg text-purple-400">{goldenCrossCount}</div>
        </div>

        {/* 5/5 Full Bullish */}
        <div
          onClick={() =>
            onSelectFilter(activeFilter === 'above-all' ? 'all' : 'above-all')
          }
          className={`praxis-card p-3.5 transition-all cursor-pointer flex items-center justify-between ${
            activeFilter === 'above-all'
              ? 'border-emerald-500 bg-[#091711] shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 border border-emerald-500/50 text-emerald-400 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel text-[10px] text-emerald-300">5/5 BULLISH</div>
              <div className="text-[10px] text-slate-400 font-mono">
                ABOVE ALL 5 KEY EMAS
              </div>
            </div>
          </div>
          <div className="font-pixel text-lg text-emerald-400">
            {aboveAllEmasCount}
          </div>
        </div>

        {/* 0/5 Breakdown */}
        <div
          onClick={() =>
            onSelectFilter(activeFilter === 'below-all' ? 'all' : 'below-all')
          }
          className={`praxis-card p-3.5 transition-all cursor-pointer flex items-center justify-between ${
            activeFilter === 'below-all'
              ? 'border-[#ff3b00] bg-[#1a0b08] shadow-pixel-orange'
              : 'hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff3b00]/20 border border-[#ff3b00]/50 text-[#ff3b00] rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel text-[10px] text-[#ff3b00]">FULL BREAKDOWN</div>
              <div className="text-[10px] text-slate-400 font-mono">
                BELOW ALL 5 KEY EMAS
              </div>
            </div>
          </div>
          <div className="font-pixel text-lg text-[#ff3b00]">
            {belowAllEmasCount}
          </div>
        </div>
      </div>
    </div>
  );
};
