import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart2,
  ExternalLink,
  Zap,
  Compass,
  Activity,
  Shield,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import type { StockBreadthItem } from '../types';

interface StockDetailModalProps {
  stock: StockBreadthItem | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const [activeChartTab, setActiveChartTab] = useState<'ema' | 'rsi' | 'macd'>('ema');

  if (!stock) return null;

  const isPositive = stock.change >= 0;
  const { emas, rsi, macd } = stock;

  const emaRows = [
    {
      period: 'EMA 9 (1D)',
      code: 'MOMENTUM 9',
      value: emas.ema9,
      isAbove: emas.isAboveEma9,
      diffPercent: emas.diffEma9Percent,
      color: '#ff3b00',
      description: 'Ultra-fast momentum pullback trigger',
    },
    {
      period: 'EMA 20 (1D)',
      code: 'SWING 20',
      value: emas.ema20,
      isAbove: emas.isAboveEma20,
      diffPercent: emas.diffEma20Percent,
      color: '#3b82f6',
      description: 'Short-term mean reversion base',
    },
    {
      period: 'EMA 50 (1D)',
      code: 'INSTITUTIONAL 50',
      value: emas.ema50,
      isAbove: emas.isAboveEma50,
      diffPercent: emas.diffEma50Percent,
      color: '#10b981',
      description: 'Institutional quarterly trend floor',
    },
    {
      period: 'EMA 100 (1D)',
      code: 'STRUCTURAL 100',
      value: emas.ema100,
      isAbove: emas.isAboveEma100,
      diffPercent: emas.diffEma100Percent,
      color: '#64748b',
      description: 'Intermediate cycle benchmark',
    },
    {
      period: 'EMA 200 (1D)',
      code: 'MACRO 200',
      value: emas.ema200,
      isAbove: emas.isAboveEma200,
      diffPercent: emas.diffEma200Percent,
      color: '#8b5cf6',
      description: 'Long-term bull/bear regime dividing line',
    },
  ];

  // 52-week position calculation
  const week52Range = stock.week52High - stock.week52Low;
  const week52PosPct =
    week52Range > 0
      ? Math.min(100, Math.max(0, ((stock.currentPrice - stock.week52Low) / week52Range) * 100))
      : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0a0e17] border-2 border-[#1c2436] rounded-2xl praxis-card shadow-[0_0_50px_rgba(0,0,0,0.9)] p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 border border-[#1c2436] rounded-xl text-slate-400 hover:text-white hover:border-[#ff3b00] hover:bg-[#ff3b00]/10 bg-[#06080e] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stock Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2436]">
          <div>
            <div className="text-[9px] tracking-widest uppercase font-pixel text-[#ff3b00]">
              PRAXIS // QUANT TELEMETRY &bull; {stock.sector}
            </div>
            <div className="flex items-center gap-2.5 flex-wrap mt-1">
              <h3 className="text-2xl sm:text-3xl font-pixel text-white">
                {stock.symbol}
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 border border-[#ff3b00] rounded-lg font-pixel bg-[#ff3b00]/20 text-[#ff3b00]">
                NSE: {stock.ticker}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{stock.name}</p>
          </div>

          {/* Price badge */}
          <div className="flex items-baseline gap-3">
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
                ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div
                className={`flex items-center sm:justify-end gap-1 text-xs font-pixel tabular-nums mt-0.5 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Signal Badges */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* EMA Health Score */}
          <div className="p-3 border border-[#1c2436] rounded-xl bg-[#06080e] flex items-center gap-3">
            <div className="p-2 bg-[#ff3b00]/10 border border-[#ff3b00]/40 text-[#ff3b00] rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel text-xs text-white">
                SCORE: {stock.bullishScore} / 5 EMAs
              </div>
              <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                {stock.bullishScore === 5
                  ? 'All 5 EMAs Bullish (9/20/50/100/200)'
                  : `Holding above ${stock.bullishScore} of 5 moving averages`}
              </div>
            </div>
          </div>

          {/* Golden Stack & Golden Cross */}
          <div className="p-3 border border-[#1c2436] rounded-xl bg-[#06080e] flex items-center gap-3">
            <div className="p-2 bg-amber-950 border border-amber-500/50 text-amber-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel text-xs text-amber-400">
                {stock.isGoldenStack ? 'GOLDEN STACK ACTIVE' : stock.isGoldenCross ? 'GOLDEN CROSS ACTIVE' : 'NO ACTIVE STACK'}
              </div>
              <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                {stock.isGoldenStack
                  ? 'Price > 9 > 20 > 50 > 100 > 200'
                  : stock.isGoldenCross
                  ? '50 EMA > 200 EMA Bullish Regime'
                  : 'Awaiting structural alignment'}
              </div>
            </div>
          </div>

          {/* RSI & MACD Combined Momentum */}
          <div className="p-3 border border-[#1c2436] rounded-xl bg-[#06080e] flex items-center gap-3">
            <div className="p-2 bg-pink-950 border border-pink-500/50 text-pink-400 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="font-pixel text-xs text-pink-300">
                RSI: {rsi.rsi14.toFixed(1)} &bull; MACD: {macd.isBullish ? 'BULL' : 'BEAR'}
              </div>
              <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                {rsi.isAbove50 ? 'Momentum Expanding (>50)' : 'Momentum Contracting (<50)'}
              </div>
            </div>
          </div>
        </div>

        {/* 5 EMAs Comparison Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 my-4">
          {emaRows.map((row) => (
            <div
              key={row.period}
              className={`p-3 rounded-xl border transition-all ${
                row.isAbove ? 'bg-[#06140d] border-emerald-500/40' : 'bg-[#17080a] border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-pixel text-[9px] text-slate-200">{row.period}</span>
                {row.isAbove ? (
                  <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-pixel font-bold rounded border border-emerald-500/40">
                    PASS
                  </span>
                ) : (
                  <span className="text-[8px] px-1.5 py-0.5 bg-rose-500/20 text-rose-400 font-pixel font-bold rounded border border-rose-500/40">
                    FAIL
                  </span>
                )}
              </div>
              <div className="text-sm font-bold font-mono text-white tabular-nums mt-1">
                ₹{row.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] font-mono tabular-nums pt-1.5 border-t border-[#1c2436]">
                <span className={row.isAbove ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {row.isAbove ? '▲ ABOVE' : '▼ BELOW'}
                </span>
                <span className={`font-bold ${row.diffPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {row.diffPercent >= 0 ? '+' : ''}
                  {row.diffPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 52-Week Range Bar */}
        <div className="my-4 p-3.5 border border-[#1c2436] rounded-xl bg-[#06080e]">
          <div className="flex items-center justify-between text-xs font-pixel text-slate-400 mb-2">
            <span>52-WEEK RANGE</span>
            <span className="text-[#ff3b00]">
              {stock.distFrom52WHighPercent.toFixed(1)}% FROM 52W HIGH
            </span>
          </div>
          <div className="relative w-full bg-[#141b2a] h-2.5 rounded-full overflow-hidden border border-[#1c2436]">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
              style={{ width: '100%' }}
            />
            <div
              className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-[0_0_8px_#ffffff] -translate-x-1/2 border border-black"
              style={{ left: `${week52PosPct}%` }}
              title={`CMP at ${week52PosPct.toFixed(0)}% of 52W Range`}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
            <span>52W Low: ₹{stock.week52Low.toFixed(2)}</span>
            <span className="text-white font-bold">CMP: ₹{stock.currentPrice.toFixed(2)}</span>
            <span>52W High: ₹{stock.week52High.toFixed(2)}</span>
          </div>
        </div>

        {/* Chart Viewport with Tabs (EMA Ribbon / RSI / MACD) */}
        {stock.history && stock.history.length > 0 && (
          <div className="my-4 p-4 border border-[#1c2436] rounded-xl bg-[#06080e]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-xs sm:text-sm font-pixel text-white flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#ff3b00]" />
                <span>TECHNICAL INDICATOR CHARTS (40 TRADING DAYS)</span>
              </h4>

              {/* Chart Mode Tabs */}
              <div className="flex items-center bg-[#0a0e17] p-1 border border-[#1c2436] rounded-lg font-pixel text-[9px]">
                <button
                  onClick={() => setActiveChartTab('ema')}
                  className={`px-2.5 py-1 rounded cursor-pointer ${
                    activeChartTab === 'ema' ? 'bg-[#ff3b00] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EMA RIBBON
                </button>
                <button
                  onClick={() => setActiveChartTab('rsi')}
                  className={`px-2.5 py-1 rounded cursor-pointer ${
                    activeChartTab === 'rsi' ? 'bg-[#ff3b00] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  RSI (14)
                </button>
                <button
                  onClick={() => setActiveChartTab('macd')}
                  className={`px-2.5 py-1 rounded cursor-pointer ${
                    activeChartTab === 'macd' ? 'bg-[#ff3b00] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  MACD (12,26,9)
                </button>
              </div>
            </div>

            {/* EMA Ribbon Chart */}
            {activeChartTab === 'ema' && (
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stock.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2436" opacity={0.8} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(str) => str.slice(5)}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(val) => `₹${Math.round(val)}`}
                      width={55}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-3 bg-[#0a0e17] text-white border border-[#1c2436] rounded-xl shadow-2xl text-xs space-y-1 font-mono">
                              <div className="font-pixel text-xs text-[#ff3b00]">{label}</div>
                              {payload.map((p) => (
                                <div key={p.name} className="flex justify-between gap-4 font-mono text-[11px]">
                                  <span style={{ color: p.color }}>{p.name}:</span>
                                  <span className="font-bold">₹{Number(p.value).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '8px', color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="close" name="CMP" stroke="#ffffff" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="ema9" name="EMA 9" stroke="#ff3b00" strokeWidth={1.5} strokeDasharray="2 2" dot={false} />
                    <Line type="monotone" dataKey="ema20" name="EMA 20" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="ema50" name="EMA 50" stroke="#10b981" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="ema100" name="EMA 100" stroke="#64748b" strokeWidth={1.2} dot={false} />
                    <Line type="monotone" dataKey="ema200" name="EMA 200" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* RSI (14) Chart */}
            {activeChartTab === 'rsi' && (
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stock.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2436" opacity={0.8} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(str) => str.slice(5)}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(val) => `${val}`}
                      width={40}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val = Number(payload[0].value);
                          return (
                            <div className="p-3 bg-[#0a0e17] text-white border border-[#1c2436] rounded-xl shadow-2xl text-xs space-y-1 font-mono">
                              <div className="font-pixel text-xs text-[#ff3b00]">{label}</div>
                              <div className="flex justify-between gap-4 font-mono text-[11px]">
                                <span className="text-pink-400">RSI(14):</span>
                                <span className="font-bold">{val.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Overbought (70)', fill: '#ef4444', fontSize: 9 }} />
                    <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Centerline (50)', fill: '#f59e0b', fontSize: 9 }} />
                    <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Oversold (30)', fill: '#10b981', fontSize: 9 }} />
                    <Line type="monotone" dataKey="rsi14" name="RSI (14)" stroke="#ec4899" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* MACD Chart */}
            {activeChartTab === 'macd' && (
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stock.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c2436" opacity={0.8} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(str) => str.slice(5)}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(val) => `${val.toFixed(1)}`}
                      width={45}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="p-3 bg-[#0a0e17] text-white border border-[#1c2436] rounded-xl shadow-2xl text-xs space-y-1 font-mono">
                              <div className="font-pixel text-xs text-[#ff3b00]">{label}</div>
                              <div className="flex justify-between gap-4 font-mono text-[11px]">
                                <span className="text-amber-400">MACD Line:</span>
                                <span className="font-bold">{(d.macd || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between gap-4 font-mono text-[11px]">
                                <span className="text-blue-400">Signal Line:</span>
                                <span className="font-bold">{(d.macdSignal || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between gap-4 font-mono text-[11px]">
                                <span className="text-emerald-400">Histogram:</span>
                                <span className="font-bold">{(d.macdHist || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <Bar dataKey="macdHist" name="MACD Histogram" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Intraday Stats & Yahoo Link */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1c2436] text-xs text-slate-400 font-mono">
          <div>
            <div className="text-[9px] uppercase font-pixel text-slate-500">Day High</div>
            <div className="font-bold text-white tabular-nums mt-0.5">₹{stock.dayHigh.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-pixel text-slate-500">Day Low</div>
            <div className="font-bold text-white tabular-nums mt-0.5">₹{stock.dayLow.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase font-pixel text-slate-500">Day Volume</div>
            <div className="font-bold text-white tabular-nums mt-0.5">{stock.volume.toLocaleString('en-IN')}</div>
          </div>
          <div className="flex items-center sm:justify-end">
            <a
              href={`https://finance.yahoo.com/quote/${stock.ticker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-pixel text-[#ff3b00] hover:underline"
            >
              <span>[YAHOO FINANCE]</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
