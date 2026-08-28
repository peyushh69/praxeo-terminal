import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { Radar, Sparkles, Layers, Activity, TrendingUp, Shield, BarChart2 } from 'lucide-react';
import type { MarketBreadthResponse } from '../types';

interface BreadthVisualsProps {
  data: MarketBreadthResponse;
  onSelectSector?: (sector: string) => void;
}

export const BreadthVisuals: React.FC<BreadthVisualsProps> = ({ data, onSelectSector }) => {
  const [activeTab, setActiveTab] = useState<'hud-radar' | 'trend-series' | 'indicator-bars' | 'sector-matrix'>('hud-radar');
  const [activeTrendLine, setActiveTrendLine] = useState<'all' | 'ema9' | 'ema50' | 'ema200' | 'rsi'>('all');

  const { summary, sectorBreadth, timeSeriesBreadth } = data;

  const indicatorBarData = [
    {
      name: 'EMA 9',
      tag: 'MOMENTUM 9',
      description: 'Ultra-Fast Pullback Support',
      count: summary.aboveEma9.count,
      percentage: summary.aboveEma9.percentage,
      color: '#ff3b00',
    },
    {
      name: 'EMA 20',
      tag: 'SWING 20',
      description: 'Short-Term Mean Reversion',
      count: summary.aboveEma20.count,
      percentage: summary.aboveEma20.percentage,
      color: '#3b82f6',
    },
    {
      name: 'EMA 50',
      tag: 'INSTITUTIONAL 50',
      description: 'Quarterly Benchmark Line',
      count: summary.aboveEma50.count,
      percentage: summary.aboveEma50.percentage,
      color: '#10b981',
    },
    {
      name: 'EMA 100',
      tag: 'STRUCTURAL 100',
      description: 'Intermediate Floor Barrier',
      count: summary.aboveEma100.count,
      percentage: summary.aboveEma100.percentage,
      color: '#64748b',
    },
    {
      name: 'EMA 200',
      tag: 'MACRO 200',
      description: 'Bull / Bear Macro Regime',
      count: summary.aboveEma200.count,
      percentage: summary.aboveEma200.percentage,
      color: '#8b5cf6',
    },
    {
      name: 'RSI > 50',
      tag: 'RSI(14) MOMENTUM',
      description: 'Bullish Oscillator Expansion',
      count: summary.rsiAbove50.count,
      percentage: summary.rsiAbove50.percentage,
      color: '#ec4899',
    },
    {
      name: 'MACD BULL',
      tag: 'MACD > SIGNAL',
      description: 'Positive Trend Acceleration',
      count: summary.macdBullish.count,
      percentage: summary.macdBullish.percentage,
      color: '#f59e0b',
    },
  ];

  const sectorChartData = sectorBreadth.map((s) => ({
    sector: s.sector,
    total: s.totalStocks,
    above9: s.aboveEma9Percent,
    above20: s.aboveEma20Percent,
    above50: s.aboveEma50Percent,
    above200: s.aboveEma200Percent,
    rsiAbove50: s.rsiAbove50Percent,
    macdBullish: s.macdBullishPercent,
    avgChange: s.avgChangePercent,
  }));

  return (
    <div className="praxis-card p-4 sm:p-5 shadow-2xl">
      {/* Header with visual toggles in Praxis Pixel Arcade Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1c2436]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#ff3b00]/10 border border-[#ff3b00]/40 text-[#ff3b00] rounded-lg">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] tracking-widest uppercase font-pixel text-[#ff3b00]">
              PRAXIS // QUANT TELEMETRY
            </div>
            <h2 className="font-pixel text-sm sm:text-base text-white mt-1">
              BREADTH RADAR &amp; MULTI-INDICATOR SUITE
            </h2>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#06080e] border border-[#1c2436] p-1 rounded-xl self-start sm:self-auto font-pixel text-[10px] overflow-x-auto scrollbar-none max-w-full">
          <button
            id="tab-hud-radar"
            onClick={() => setActiveTab('hud-radar')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hud-radar'
                ? 'bg-[#ff3b00] text-black font-bold shadow-pixel-orange'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RADAR HUD
          </button>
          <button
            id="tab-trend-series"
            onClick={() => setActiveTab('trend-series')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'trend-series'
                ? 'bg-[#ff3b00] text-black font-bold shadow-pixel-orange'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BREADTH TIME SERIES
          </button>
          <button
            id="tab-indicator-bars"
            onClick={() => setActiveTab('indicator-bars')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'indicator-bars'
                ? 'bg-[#ff3b00] text-black font-bold shadow-pixel-orange'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            INDICATOR MATRIX
          </button>
          <button
            id="tab-sector-matrix"
            onClick={() => setActiveTab('sector-matrix')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sector-matrix'
                ? 'bg-[#ff3b00] text-black font-bold shadow-pixel-orange'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SECTORS
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="mt-4">
        {/* 1. RADAR HUD VIEW */}
        {activeTab === 'hud-radar' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              
              {/* Left Column: Key Weights */}
              <div className="lg:col-span-3 space-y-2.5">
                <div className="praxis-card p-3">
                  <div className="text-[9px] text-[#ff3b00] font-pixel uppercase mb-1">
                    9 EMA MOMENTUM
                  </div>
                  <div className="text-2xl font-pixel text-white">
                    {summary.aboveEma9.percentage}%
                  </div>
                  <div className="text-[10px] text-emerald-400 font-pixel mt-1">
                    {summary.aboveEma9.count} / 50 OVER 9 EMA
                  </div>
                  <div className="w-full bg-[#06080e] h-1.5 mt-2 rounded-full border border-[#1c2436] overflow-hidden">
                    <div className="h-full bg-[#ff3b00]" style={{ width: `${summary.aboveEma9.percentage}%` }}></div>
                  </div>
                </div>

                <div className="praxis-card p-3">
                  <div className="text-[9px] text-blue-400 font-pixel uppercase mb-1">
                    20 EMA SWING
                  </div>
                  <div className="text-2xl font-pixel text-blue-400">
                    {summary.aboveEma20.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-pixel mt-1">
                    {summary.aboveEma20.count} STOCKS HOLDING
                  </div>
                  <div className="w-full bg-[#06080e] h-1.5 mt-2 rounded-full border border-[#1c2436] overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${summary.aboveEma20.percentage}%` }}></div>
                  </div>
                </div>

                <div className="praxis-card p-3">
                  <div className="text-[9px] text-purple-400 font-pixel uppercase mb-1">
                    200 EMA MACRO
                  </div>
                  <div className="text-2xl font-pixel text-purple-300">
                    {summary.aboveEma200.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-pixel mt-1">
                    {summary.aboveEma200.count} IN MACRO BULL REGIME
                  </div>
                  <div className="w-full bg-[#06080e] h-1.5 mt-2 rounded-full border border-[#1c2436] overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${summary.aboveEma200.percentage}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Center Radar Scope */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 praxis-card relative overflow-hidden">
                <div className="absolute w-72 h-72 rounded-full border border-dashed border-[#1c2436] pointer-events-none"></div>
                <div className="absolute w-56 h-56 rounded-full border border-[#1c2436] pointer-events-none"></div>
                <div className="absolute w-40 h-40 rounded-full border border-[#2d3748] pointer-events-none"></div>
                
                {/* HUD Crosshairs */}
                <div className="absolute w-full h-[1px] bg-[#1c2436]"></div>
                <div className="absolute h-full w-[1px] bg-[#1c2436]"></div>

                {/* Central Radar Circle */}
                <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#06080e] border-2 border-[#ff3b00] flex flex-col items-center justify-center shadow-pixel-orange">
                  <div className="text-[9px] tracking-widest text-[#ff3b00] font-pixel uppercase">
                    COMPOSITE BREADTH
                  </div>
                  <div className="text-4xl sm:text-5xl font-pixel text-white my-2 tracking-tight">
                    {summary.aboveEma9.percentage}%
                  </div>
                  <div className="text-[10px] px-2 py-0.5 bg-[#ff3b00] text-black font-pixel font-bold rounded">
                    {summary.marketStance}
                  </div>
                  <div className="text-[9px] text-slate-400 font-pixel mt-2">
                    50 NSE EQUITIES
                  </div>
                </div>

                <div className="w-full flex justify-between text-[9px] text-slate-500 font-pixel pt-4 z-10">
                  <span>9/20/50/100/200 EMA + RSI(14)</span>
                  <span>SYNC: REAL-TIME</span>
                </div>
              </div>

              {/* Right Column: Oscillators & Institutional */}
              <div className="lg:col-span-3 space-y-2.5">
                <div className="praxis-card p-3">
                  <div className="text-[9px] text-emerald-400 font-pixel uppercase mb-1">
                    50 EMA INSTITUTIONAL
                  </div>
                  <div className="text-2xl font-pixel text-emerald-400">
                    {summary.aboveEma50.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-pixel mt-1">
                    {summary.aboveEma50.count} / 50 STOCKS
                  </div>
                  <div className="w-full bg-[#06080e] h-1.5 mt-2 rounded-full border border-[#1c2436] overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${summary.aboveEma50.percentage}%` }}></div>
                  </div>
                </div>

                <div className="praxis-card p-3">
                  <div className="text-[9px] text-pink-400 font-pixel uppercase mb-1">
                    RSI(14) &gt; 50 MOMENTUM
                  </div>
                  <div className="text-2xl font-pixel text-pink-300">
                    {summary.rsiAbove50.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-pixel mt-1">
                    {summary.rsiAbove50.count} STOCKS IN EXPANSION
                  </div>
                  <div className="w-full bg-[#06080e] h-1.5 mt-2 rounded-full border border-[#1c2436] overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${summary.rsiAbove50.percentage}%` }}></div>
                  </div>
                </div>

                <div className="praxis-card p-3">
                  <div className="text-[9px] text-amber-400 font-pixel uppercase mb-1">
                    MACD BULLISH CROSS
                  </div>
                  <div className="text-2xl font-pixel text-amber-300">
                    {summary.macdBullish.percentage}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-pixel mt-1">
                    {summary.macdBullish.count} / 50 WITH MACD &gt; SIGNAL
                  </div>
                  <div className="w-full bg-[#06080e] h-1.5 mt-2 rounded-full border border-[#1c2436] overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${summary.macdBullish.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Interpretation Strip */}
            <div className="praxis-card p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#ff3b00] font-pixel text-[10px]">[QUANT DIAGNOSIS]</span>
                <span className="text-slate-300">
                  {summary.marketStanceReason}
                </span>
              </div>
              <div className="text-slate-400 font-pixel text-[10px] shrink-0">
                GOLDEN STACKS: <strong className="text-amber-400">{summary.goldenStackCount}</strong> | GOLDEN CROSSES: <strong className="text-purple-400">{summary.goldenCrossCount}</strong>
              </div>
            </div>
          </div>
        )}

        {/* 2. HISTORICAL BREADTH TIME SERIES (Apex / Lightweight Charts style) */}
        {activeTab === 'trend-series' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="text-slate-400">
                Tracking historical % of NIFTY 50 stocks holding above moving averages and RSI:
              </div>
              <div className="flex items-center gap-1.5 bg-[#06080e] p-1 border border-[#1c2436] rounded-lg font-pixel text-[9px]">
                {(['all', 'ema9', 'ema50', 'ema200', 'rsi'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTrendLine(t)}
                    className={`px-2.5 py-1 rounded cursor-pointer ${
                      activeTrendLine === t
                        ? 'bg-[#ff3b00] text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesBreadth} margin={{ top: 15, right: 30, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2436" opacity={0.7} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(d) => d.slice(5)}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-3 bg-[#0a0e17] text-white border border-[#1c2436] rounded-xl shadow-2xl text-xs space-y-1 font-mono">
                            <div className="font-pixel text-[10px] text-[#ff3b00] pb-1 border-b border-[#1c2436]">
                              DATE: {label}
                            </div>
                            {payload.map((entry: any, i: number) => (
                              <div key={i} className="flex justify-between gap-4">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-bold text-white">{entry.value}%</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Overbought (>80%)', fill: '#10b981', fontSize: 9 }} />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Equilibrium (50%)', fill: '#f59e0b', fontSize: 9 }} />
                  <ReferenceLine y={20} stroke="#ff3b00" strokeDasharray="3 3" label={{ value: 'Oversold (<20%)', fill: '#ff3b00', fontSize: 9 }} />

                  {(activeTrendLine === 'all' || activeTrendLine === 'ema9') && (
                    <Line type="monotone" dataKey="aboveEma9Percent" name="% Above 9 EMA" stroke="#ff3b00" strokeWidth={2.5} dot={false} />
                  )}
                  {(activeTrendLine === 'all' || activeTrendLine === 'ema50') && (
                    <Line type="monotone" dataKey="aboveEma50Percent" name="% Above 50 EMA" stroke="#10b981" strokeWidth={2} dot={false} />
                  )}
                  {(activeTrendLine === 'all' || activeTrendLine === 'ema200') && (
                    <Line type="monotone" dataKey="aboveEma200Percent" name="% Above 200 EMA" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  )}
                  {(activeTrendLine === 'all' || activeTrendLine === 'rsi') && (
                    <Line type="monotone" dataKey="rsiAbove50Percent" name="% RSI > 50" stroke="#ec4899" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. MULTI-INDICATOR BAR MATRIX */}
        {activeTab === 'indicator-bars' && (
          <div className="space-y-4">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={indicatorBarData} margin={{ top: 20, right: 30, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1c2436" opacity={0.8} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#1c2436' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 bg-[#0a0e17] text-white border border-[#1c2436] rounded-xl shadow-2xl text-xs space-y-1 font-mono">
                            <div className="font-pixel text-xs text-[#ff3b00]">{d.name} &bull; {d.tag}</div>
                            <div className="text-slate-300 text-[11px]">{d.description}</div>
                            <div className="pt-1.5 border-t border-[#1c2436] flex justify-between gap-4 font-mono">
                              <span className="text-slate-400">Constituents:</span>
                              <span className="font-bold text-white">{d.count} / 50</span>
                            </div>
                            <div className="flex justify-between gap-4 font-mono">
                              <span className="text-slate-400">Pass Ratio:</span>
                              <span className="font-bold text-[#ff3b00]">{d.percentage}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'BULL OVERBOUGHT [>80%]', fill: '#10b981', fontSize: 9, position: 'right' }} />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'NEUTRAL [50%]', fill: '#f59e0b', fontSize: 9, position: 'right' }} />
                  <ReferenceLine y={20} stroke="#ff3b00" strokeDasharray="4 4" label={{ value: 'PANIC BEAR [<20%]', fill: '#ff3b00', fontSize: 9, position: 'right' }} />
                  <Bar dataKey="percentage" maxBarSize={44} radius={[4, 4, 0, 0]}>
                    {indicatorBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. SECTOR MATRIX VIEW */}
        {activeTab === 'sector-matrix' && (
          <div className="space-y-4">
            <div className="h-72 w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1c2436" opacity={0.8} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={10} stroke="#64748b" />
                  <YAxis type="category" dataKey="sector" fontSize={10} stroke="#64748b" width={90} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 bg-[#0a0e17] text-white border border-[#1c2436] rounded-xl shadow-2xl text-xs space-y-1.5 font-mono">
                            <div className="font-pixel text-xs text-[#ff3b00]">{d.sector} ({d.total} Stocks)</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-[#1c2436]">
                              <span className="text-[#ff3b00]">&gt; EMA 9:</span>
                              <span className="font-bold text-white">{d.above9}%</span>
                              <span className="text-blue-400">&gt; EMA 20:</span>
                              <span className="font-bold text-white">{d.above20}%</span>
                              <span className="text-emerald-400">&gt; EMA 50:</span>
                              <span className="font-bold text-emerald-400">{d.above50}%</span>
                              <span className="text-purple-400">&gt; EMA 200:</span>
                              <span className="font-bold text-white">{d.above200}%</span>
                              <span className="text-pink-400">RSI &gt; 50:</span>
                              <span className="font-bold text-pink-400">{d.rsiAbove50}%</span>
                              <span className="text-amber-400">MACD Bull:</span>
                              <span className="font-bold text-amber-400">{d.macdBullish}%</span>
                            </div>
                            <div className="pt-1 text-[10px] text-slate-400 border-t border-[#1c2436]">
                              Avg Day Change: {d.avgChange >= 0 ? `+${d.avgChange}%` : `${d.avgChange}%`}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="above20" name="% Above EMA 20" fill="#3b82f6" maxBarSize={14} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="above50" name="% Above EMA 50" fill="#10b981" maxBarSize={14} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="above200" name="% Above EMA 200" fill="#8b5cf6" maxBarSize={14} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sector cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
              {sectorBreadth.map((s, idx) => (
                <div
                  key={s.sector}
                  onClick={() => onSelectSector && onSelectSector(s.sector)}
                  className="praxis-card p-3 hover:border-[#ff3b00] cursor-pointer transition-all text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-pixel">
                    <span>RANK #{idx + 1}</span>
                    <span className="text-[#ff3b00]">{s.totalStocks} STOCKS</span>
                  </div>
                  <div className="font-pixel text-xs text-white truncate mt-1">
                    {s.sector}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                    <span>EMA 9: <strong className="text-white">{s.aboveEma9}/{s.totalStocks}</strong></span>
                    <span className={`font-pixel text-[9px] ${s.avgChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.avgChangePercent >= 0 ? `+${s.avgChangePercent}%` : `${s.avgChangePercent}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
