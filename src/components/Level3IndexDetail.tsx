import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { SECTORAL_INDICES } from '../data/sectoralIndices';
import type { MarketBreadthResponse, StockBreadthItem } from '../types';
import { HistoricalBreadthHeatmap } from './HistoricalBreadthHeatmap';
import { StockTable } from './StockTable';
import { StockDetailModal } from './StockDetailModal';
import {
  ArrowLeft,
  Activity,
  Scale,
  Zap,
  ChevronDown,
  RefreshCw,
  Table,
  LineChart as ChartIcon,
  LayoutGrid,
} from 'lucide-react';

interface Level3IndexDetailProps {
  data: MarketBreadthResponse;
  loading: boolean;
  onRefresh: () => void;
  onBackHome: () => void;
  onSelectIndex: (indexId: string) => void;
}

export const Level3IndexDetail: React.FC<Level3IndexDetailProps> = ({
  data,
  loading,
  onRefresh,
  onBackHome,
  onSelectIndex,
}) => {
  // Historical chart timeframe state: '3M' (approx 65 trading days) or '6M' (approx 130 trading days)
  const [timeframe, setTimeframe] = useState<'3M' | '6M'>('3M');
  // View mode for historical breadth: 'HEATMAP' (table format from photo) vs 'CHART' (line graph) vs 'BOTH'
  const [historicalViewMode, setHistoricalViewMode] = useState<'HEATMAP' | 'CHART' | 'BOTH'>('HEATMAP');
  // Selected line filter for historical chart
  const [activeLineFilter, setActiveLineFilter] = useState<'ALL' | 'EMA9' | 'EMA20' | 'EMA50' | 'EMA100' | 'EMA200'>('ALL');
  // Expanded stock lists for each EMA
  const [expandedEma, setExpandedEma] = useState<string | null>(null);
  // Selected stock for detailed technical analysis modal
  const [selectedStock, setSelectedStock] = useState<StockBreadthItem | null>(null);
  const [activeStockFilter, setActiveStockFilter] = useState<string>('all');
  const [selectedStockSector, setSelectedStockSector] = useState<string>('All Sectors');

  const totalStocks = data.summary.totalStocks || 1;
  const currentIdxDef = SECTORAL_INDICES.find(s => s.id === data.indexId) || SECTORAL_INDICES[0];

  // Slice historical data based on selected timeframe
  const chartData = useMemo(() => {
    const series = data.timeSeriesBreadth || [];
    if (timeframe === '3M') {
      return series.slice(-65);
    }
    return series.slice(-130);
  }, [data.timeSeriesBreadth, timeframe]);

  // Clean EMA Table Rows configuration
  const emaRows = [
    {
      id: 'ema9',
      label: 'EMA 9',
      category: '9D Momentum',
      metric: data.summary.aboveEma9,
      color: '#ff3b00', // Neon Orange
      description: 'Immediate 9-day impulse and momentum flow.',
    },
    {
      id: 'ema20',
      label: 'EMA 20',
      category: '20D Swing',
      metric: data.summary.aboveEma20,
      color: '#38bdf8', // Neon Sky Blue
      description: 'Standard 20-day swing trading trend benchmark.',
    },
    {
      id: 'ema50',
      label: 'EMA 50',
      category: '50D Anchor',
      metric: data.summary.aboveEma50,
      color: '#bef264', // Neon Lime
      description: 'Institutional accumulation & pullback support line.',
    },
    {
      id: 'ema100',
      label: 'EMA 100',
      category: '100D Primary',
      metric: data.summary.aboveEma100,
      color: '#c084fc', // Neon Violet
      description: 'Mid-term macro trend health and structural support.',
    },
    {
      id: 'ema200',
      label: 'EMA 200',
      category: '200D Macro',
      metric: data.summary.aboveEma200,
      color: '#f59e0b', // Neon Amber
      description: 'Long-term structural baseline separating bull & bear markets.',
    },
  ];

  return (
    <div className="w-full bg-[#000000] px-2 sm:px-4 lg:px-6 py-3 sm:py-5 select-none font-mono">
      <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">

        {/* Level Navigation Bar & Sliding Sector Switcher */}
        <div className="bg-[#050508] border border-[#181826] p-2.5 sm:p-3 rounded-xl space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={onBackHome}
                className="flex items-center gap-1 p-1.5 px-2 rounded-lg bg-[#0a0a10] border border-[#222230] hover:border-[#ff3b00] text-slate-300 hover:text-white transition-all cursor-pointer flex-shrink-0 text-[9px] font-pixel"
                title="Return to Home"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#ff3b00]" />
                <span className="hidden xs:inline">HOME</span>
              </button>

              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5 text-[8px] font-pixel text-slate-500">
                  <span className="text-[#bef264]">{currentIdxDef.stocks.length} STOCKS</span>
                  <span>•</span>
                  <span className="text-[#ff3b00] truncate">{currentIdxDef.category}</span>
                </div>
                <h1 className="font-pixel text-xs sm:text-sm text-white tracking-tight truncate mt-0.5">
                  {data.indexName || currentIdxDef.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Quick Sector Dropdown */}
              <div className="relative">
                <select
                  value={data.indexId || 'NIFTY_50'}
                  onChange={(e) => onSelectIndex(e.target.value)}
                  className="appearance-none bg-[#0a0a10] border border-[#20202e] hover:border-[#bef264] text-slate-200 text-[10px] sm:text-xs px-2 sm:px-3 py-1 pr-6 sm:pr-7 rounded-lg font-mono cursor-pointer focus:outline-none focus:border-[#bef264]"
                >
                  {SECTORAL_INDICES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0a0a10] text-slate-200">
                      {s.name} ({s.stocks.length})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 sm:right-2 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Smooth Horizontal Sliding / Scrolling Sector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[#12121e] scrollbar-none font-mono text-[9px] sm:text-[10px]">
            {SECTORAL_INDICES.map((idx) => {
              const isSelected = idx.id === (data.indexId || 'NIFTY_50');
              return (
                <button
                  key={idx.id}
                  onClick={() => onSelectIndex(idx.id)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 border ${
                    isSelected
                      ? 'bg-[#ff3b00] text-black font-bold border-[#ff3b00] shadow-pixel-orange'
                      : 'bg-[#0a0a12] text-slate-400 border-[#1a1a28] hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span className="font-pixel text-[8px] sm:text-[9px]">{idx.name}</span>
                  <span className={`text-[8px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-black/30 text-black' : 'bg-[#141420] text-slate-500'}`}>
                    {idx.stocks.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. TOP CARDS: Advance-Decline (A/D) Ratio & Relative Sector Strength (Compact 2-col) */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          
          {/* Card 1: Advance-Decline (A/D) Ratio */}
          <div className="bg-[#06060a] border border-[#181826] p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Scale className="w-3.5 h-3.5 text-[#ff3b00] flex-shrink-0" />
                <span className="font-pixel text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider truncate">
                  A/D RATIO
                </span>
              </div>
              <span className={`font-pixel text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded uppercase ${
                data.advanceDecline.ratio >= 1
                  ? 'bg-[#bef264]/15 text-[#bef264] border border-[#bef264]/30'
                  : 'bg-[#ff3b00]/15 text-[#ff3b00] border border-[#ff3b00]/30'
              }`}>
                {data.advanceDecline.sentiment}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-pixel text-lg sm:text-2xl text-white">
                {data.advanceDecline.ratio.toFixed(2)}
                <span className="text-[10px] text-slate-500 font-mono ml-0.5">:1</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 font-mono">
                  {data.advanceDecline.advances}:{data.advanceDecline.declines}
                </span>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="space-y-1 pt-1 border-t border-[#12121c]">
              <div className="h-1.5 w-full bg-[#12121a] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(data.advanceDecline.advances / totalStocks) * 100}%` }}
                  className="bg-[#bef264] h-full"
                />
                <div
                  style={{ width: `${(data.advanceDecline.declines / totalStocks) * 100}%` }}
                  className="bg-[#ff3b00] h-full"
                />
              </div>
              <div className="flex justify-between text-[8px] sm:text-[9px] font-mono">
                <span className="text-[#bef264] font-bold">
                  {data.advanceDecline.advances} Adv
                </span>
                <span className="text-[#ff3b00] font-bold">
                  {data.advanceDecline.declines} Dec
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Current Relative Sector Strength */}
          <div className="bg-[#06060a] border border-[#181826] p-2.5 sm:p-3.5 rounded-xl flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Zap className="w-3.5 h-3.5 text-[#bef264] flex-shrink-0" />
                <span className="font-pixel text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider truncate">
                  RS SCORE
                </span>
              </div>
              <span className={`font-pixel text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded uppercase ${
                data.relativeStrength.outperforming
                  ? 'bg-[#bef264]/15 text-[#bef264] border border-[#bef264]/30'
                  : 'bg-[#ff3b00]/15 text-[#ff3b00] border border-[#ff3b00]/30'
              }`}>
                {data.relativeStrength.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-pixel text-lg sm:text-2xl text-white">
                {data.relativeStrength.score}
                <span className="text-[10px] text-slate-500 font-mono ml-0.5">/100</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] sm:text-xs font-bold font-mono text-slate-200">
                  {data.relativeStrength.benchmarkDiffPercent >= 0 ? '+' : ''}
                  {data.relativeStrength.benchmarkDiffPercent}%
                </div>
              </div>
            </div>

            {/* Visual Strength Meter */}
            <div className="space-y-1 pt-1 border-t border-[#12121c]">
              <div className="h-1.5 w-full bg-[#12121a] rounded-full overflow-hidden">
                <div
                  style={{ width: `${data.relativeStrength.score}%` }}
                  className={`h-full transition-all duration-300 ${
                    data.relativeStrength.score >= 50 ? 'bg-[#bef264]' : 'bg-[#ff3b00]'
                  }`}
                />
              </div>
              <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
                <span>Lag</span>
                <span className="text-slate-500">Benchmark</span>
                <span className="text-[#bef264]">Lead</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2. CORE DATA TABLE: % of stocks above EMA 9, EMA 20, EMA 50, EMA 100, EMA 200 */}
        <div className="bg-[#050508] border border-[#181826] rounded-xl overflow-hidden shadow-xl">
          
          <div className="p-2.5 sm:p-3 border-b border-[#141420] flex items-center justify-between gap-2">
            <div>
              <div className="font-pixel text-[8px] sm:text-[9px] text-[#bef264] uppercase tracking-wider">
                TODAY'S BREADTH SNAPSHOT
              </div>
              <h2 className="font-pixel text-[11px] sm:text-xs text-white mt-0.5">
                MOVING AVERAGE PARTICIPATION
              </h2>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              <span className="text-white font-bold">{totalStocks}</span> Equities
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs select-none">
              <thead>
                <tr className="border-b border-[#141420] bg-[#07070d] text-slate-400 text-[9px] uppercase font-pixel tracking-wider">
                  <th className="py-2 px-2.5 sm:px-3">EMA</th>
                  <th className="hidden sm:table-cell py-2 px-3">TIMEFRAME</th>
                  <th className="py-2 px-2 text-center">STOCKS</th>
                  <th className="py-2 px-2 text-center">BREADTH</th>
                  <th className="py-2 px-2.5 sm:px-3 text-right">LIST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#101018]">
                {emaRows.map((row) => {
                  const isExpanded = expandedEma === row.id;
                  const isBullish = row.metric.percentage >= 50;

                  return (
                    <React.Fragment key={row.id}>
                      <tr className="hover:bg-[#090910] transition-colors">
                        
                        {/* Moving Average Label */}
                        <td className="py-2 sm:py-2.5 px-2.5 sm:px-3 font-bold text-white">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: row.color }}
                            />
                            <span className="font-pixel text-[10px] sm:text-xs">{row.label}</span>
                          </div>
                        </td>

                        {/* Category / Role (Hidden on tiny screens) */}
                        <td className="hidden sm:table-cell py-2 sm:py-2.5 px-3 text-slate-300 text-[11px]">
                          <div>{row.category}</div>
                        </td>

                        {/* Passing Count */}
                        <td className="py-2 sm:py-2.5 px-2 text-center text-slate-200 text-[11px] sm:text-xs font-bold">
                          {row.metric.count}<span className="text-slate-500 font-normal">/{totalStocks}</span>
                        </td>

                        {/* Percentage */}
                        <td className="py-2 sm:py-2.5 px-2 text-center">
                          <span
                            className={`font-pixel text-[10px] sm:text-xs px-2 py-0.5 rounded inline-block ${
                              isBullish
                                ? 'bg-[#bef264]/15 text-[#bef264] border border-[#bef264]/40'
                                : 'bg-[#ff3b00]/15 text-[#ff3b00] border border-[#ff3b00]/40'
                            }`}
                          >
                            {Math.round(row.metric.percentage)}%
                          </span>
                        </td>

                        {/* Constituent Expansion Button */}
                        <td className="py-2 sm:py-2.5 px-2.5 sm:px-3 text-right">
                          <button
                            onClick={() => setExpandedEma(isExpanded ? null : row.id)}
                            className="px-2 py-0.5 rounded bg-[#0a0a12] border border-[#1e1e2c] hover:border-[#bef264] text-slate-300 hover:text-white text-[9px] font-pixel transition-colors cursor-pointer"
                          >
                            {isExpanded ? 'HIDE' : `(${row.metric.bullishSymbols.length})`}
                          </button>
                        </td>

                      </tr>

                      {/* Expandable Constituent Ticker Tags */}
                      {isExpanded && (
                        <tr className="bg-[#07070b]">
                          <td colSpan={5} className="py-2.5 px-3 border-b border-[#14141f]">
                            <div className="space-y-1.5">
                              <div className="text-[9px] font-pixel text-[#bef264] uppercase">
                                STOCKS ABOVE {row.label}:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {row.metric.bullishSymbols.length > 0 ? (
                                  row.metric.bullishSymbols.map((sym) => (
                                    <span
                                      key={sym}
                                      className="px-1.5 py-0.5 rounded bg-[#0f0f18] border border-[#222234] text-slate-200 text-[10px] font-mono"
                                    >
                                      {sym}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-500 text-[11px] italic">No stocks currently above {row.label}</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* 3. HISTORICAL MARKET BREADTH SECTION: HEATMAP TABLE MATRIX (FROM PHOTO) & LINE CHART */}
        <div className="space-y-3">
          
          {/* Section Header & Master View Switcher (Heatmap vs Line Chart vs Both) */}
          <div className="bg-[#050508] border border-[#181826] p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#bef264]" />
              <span className="font-pixel text-[10px] sm:text-xs text-white">
                HISTORICAL VIEW
              </span>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center rounded-lg bg-[#000000] border border-[#1e1e2c] p-0.5 text-[9px] font-pixel">
              <button
                onClick={() => setHistoricalViewMode('HEATMAP')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${
                  historicalViewMode === 'HEATMAP'
                    ? 'bg-[#bef264] text-black font-bold shadow-pixel-green'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3 h-3" />
                <span>MATRIX</span>
              </button>

              <button
                onClick={() => setHistoricalViewMode('CHART')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${
                  historicalViewMode === 'CHART'
                    ? 'bg-[#ff3b00] text-black font-bold shadow-pixel-orange'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ChartIcon className="w-3 h-3" />
                <span>CHART</span>
              </button>

              <button
                onClick={() => setHistoricalViewMode('BOTH')}
                className={`hidden xs:flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${
                  historicalViewMode === 'BOTH'
                    ? 'bg-sky-400 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>BOTH</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: HEATMAP TABLE (The Stocks Above Table matching the uploaded image) */}
          {(historicalViewMode === 'HEATMAP' || historicalViewMode === 'BOTH') && (
            <div className="bg-[#050508] border border-[#181826] p-2.5 sm:p-4 rounded-xl shadow-xl">
              <HistoricalBreadthHeatmap
                timeSeries={data.timeSeriesBreadth || []}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                indexName={data.indexName || currentIdxDef.name}
              />
            </div>
          )}

          {/* VIEW 2: HISTORICAL LINE CHART */}
          {(historicalViewMode === 'CHART' || historicalViewMode === 'BOTH') && (
            <div className="bg-[#050508] border border-[#181826] p-2.5 sm:p-4 rounded-xl space-y-3 shadow-xl">
              
              {/* Chart Header & Controls */}
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pb-2 border-b border-[#14141f]">
                <div>
                  <div className="font-pixel text-[8px] sm:text-[9px] text-[#ff3b00] uppercase tracking-wider">
                    TIME-SERIES
                  </div>
                  <h3 className="font-pixel text-[11px] sm:text-xs text-white mt-0.5">
                    HISTORICAL LINE CHART
                  </h3>
                </div>

                {/* Timeframe & Line Toggles */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center rounded-lg bg-[#000000] border border-[#1e1e2c] p-0.5 text-[9px] font-pixel">
                    <button
                      onClick={() => setTimeframe('3M')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        timeframe === '3M'
                          ? 'bg-[#ff3b00] text-black font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      3M
                    </button>
                    <button
                      onClick={() => setTimeframe('6M')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        timeframe === '6M'
                          ? 'bg-[#ff3b00] text-black font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      6M
                    </button>
                  </div>

                  <div className="flex items-center rounded-lg bg-[#000000] border border-[#1e1e2c] p-0.5 text-[8px] font-pixel overflow-x-auto">
                    {(['ALL', 'EMA20', 'EMA50', 'EMA200'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveLineFilter(filter)}
                        className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                          activeLineFilter === filter
                            ? 'bg-[#bef264] text-black font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Rendering Area */}
              <div className="h-56 sm:h-72 w-full pt-1">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#141420" strokeDasharray="3 3" vertical={false} />
                      
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'Space Mono' }}
                        tickFormatter={(d: string) => {
                          if (!d) return '';
                          const parts = d.split('-');
                          return `${parts[1]}/${parts[2]}`;
                        }}
                        minTickGap={25}
                      />

                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        stroke="#475569"
                        tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'Space Mono' }}
                        tickFormatter={(val: number) => `${val}%`}
                      />

                      <ReferenceLine
                        y={50}
                        stroke="#334155"
                        strokeDasharray="4 4"
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#050507',
                          borderColor: '#1e1e2c',
                          borderRadius: '6px',
                          fontFamily: 'Space Mono',
                          fontSize: '10px',
                          color: '#f8fafc',
                        }}
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value: any, name: any) => [`${Math.round(Number(value))}%`, name]}
                      />

                      {(activeLineFilter === 'ALL' || activeLineFilter === 'EMA9') && (
                        <Line
                          type="monotone"
                          dataKey="aboveEma9Percent"
                          name="% > 9 EMA"
                          stroke="#ff3b00"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      )}

                      {(activeLineFilter === 'ALL' || activeLineFilter === 'EMA20') && (
                        <Line
                          type="monotone"
                          dataKey="aboveEma20Percent"
                          name="% > 20 EMA"
                          stroke="#38bdf8"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      )}

                      {(activeLineFilter === 'ALL' || activeLineFilter === 'EMA50') && (
                        <Line
                          type="monotone"
                          dataKey="aboveEma50Percent"
                          name="% > 50 EMA"
                          stroke="#bef264"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}

                      {(activeLineFilter === 'ALL' || activeLineFilter === 'EMA100') && (
                        <Line
                          type="monotone"
                          dataKey="aboveEma100Percent"
                          name="% > 100 EMA"
                          stroke="#c084fc"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      )}

                      {(activeLineFilter === 'ALL' || activeLineFilter === 'EMA200') && (
                        <Line
                          type="monotone"
                          dataKey="aboveEma200Percent"
                          name="% > 200 EMA"
                          stroke="#f59e0b"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    Generating historical candle breadth series...
                  </div>
                )}
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-mono text-slate-400 pt-1 border-t border-[#12121c]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#ff3b00]" />
                  <span>EMA 9</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#38bdf8]" />
                  <span>EMA 20</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#bef264]" />
                  <span>EMA 50</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#c084fc]" />
                  <span>EMA 100</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-[#f59e0b]" />
                  <span>EMA 200</span>
                </span>
              </div>

            </div>
          )}

        </div>

        {/* 4. CONSTITUENT STOCKS TABLE & PERFORMANCE SCREENER */}
        {data.stocks && data.stocks.length > 0 && (
          <div className="pt-2">
            <StockTable
              stocks={data.stocks}
              indexName={data.indexName || currentIdxDef.name}
              activeFilter={activeStockFilter}
              onSelectFilter={setActiveStockFilter}
              selectedSector={selectedStockSector}
              onSelectSector={setSelectedStockSector}
              onSelectStock={(stock) => setSelectedStock(stock)}
            />
          </div>
        )}

        {/* 5. DETAILED STOCK ANALYSIS MODAL (CHART, EMAS & TECHNICALS) */}
        {selectedStock && (
          <StockDetailModal
            stock={selectedStock}
            onClose={() => setSelectedStock(null)}
          />
        )}

      </div>
    </div>
  );
};
