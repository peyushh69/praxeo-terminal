import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  Sparkles,
  Compass,
  Layers,
  BarChart2,
} from 'lucide-react';

export const BreadthExplainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="praxis-card shadow-2xl overflow-hidden">
      <div
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ff3b00]/10 border border-[#ff3b00]/40 text-[#ff3b00] rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[9px] tracking-widest uppercase font-pixel text-[#ff3b00]">
              PRAXIS PROTOCOL // QUANTITATIVE INDICATOR SUITE
            </div>
            <h3 className="font-pixel text-sm sm:text-base text-white mt-1">
              NIFTY 50 TECHNICAL SUITE &amp; MARKET BREADTH RULES
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              EMA 9/20/50/100/200, RSI(14) Momentum, MACD Crossovers, and Golden Stack strategy rules.
            </p>
          </div>
        </div>
        <button
          id="btn-toggle-explainer"
          className="p-2 border border-[#1c2436] rounded-xl text-slate-400 hover:text-white hover:border-[#ff3b00] bg-[#06080e] transition-colors cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#ff3b00]" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-[#1c2436] bg-[#06080e] space-y-5 text-xs text-slate-300 font-mono">
          {/* Indicator Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* EMA 9 */}
            <div className="p-3.5 border border-[#1c2436] rounded-xl bg-[#0a0e17]">
              <div className="text-[9px] uppercase font-pixel text-[#ff3b00] mb-1">
                [EMA 9] MOMENTUM
              </div>
              <div className="font-pixel text-xs text-white mb-2">
                1D EMA 9 (Fast Scalp &amp; Pullback Line)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ultra-fast momentum trigger. When &gt;35 Nifty constituents hold above their 9 EMA, buyers aggressively defend shallow dips.
              </p>
            </div>

            {/* EMA 20 */}
            <div className="p-3.5 border border-[#1c2436] rounded-xl bg-[#0a0e17]">
              <div className="text-[9px] uppercase font-pixel text-[#3b82f6] mb-1">
                [EMA 20] SWING CORE
              </div>
              <div className="font-pixel text-xs text-white mb-2">
                1D EMA 20 (Mean Reversion Benchmark)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard swing benchmark. When &gt;60% of stocks hold 20 EMA, positional swing long trades offer optimal risk-reward.
              </p>
            </div>

            {/* EMA 50 */}
            <div className="p-3.5 border border-[#1c2436] rounded-xl bg-[#0a0e17]">
              <div className="text-[9px] uppercase font-pixel text-[#10b981] mb-1">
                [EMA 50] INSTITUTIONAL
              </div>
              <div className="font-pixel text-xs text-white mb-2">
                1D EMA 50 (Quarterly Accumulation Base)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Key baseline watched by mutual funds and DIIs. Healthy quarterly trends require broad participation above 50 EMA.
              </p>
            </div>

            {/* EMA 200 */}
            <div className="p-3.5 border border-[#1c2436] rounded-xl bg-[#0a0e17]">
              <div className="text-[9px] uppercase font-pixel text-[#8b5cf6] mb-1">
                [EMA 200] MACRO REGIME
              </div>
              <div className="font-pixel text-xs text-white mb-2">
                1D EMA 200 (Bull / Bear Regime Floor)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Primary dividing line between secular bull markets and cyclical bear markets. When &gt;75% hold 200 EMA, macro trend is firmly bullish.
              </p>
            </div>

            {/* RSI 14 */}
            <div className="p-3.5 border border-[#1c2436] rounded-xl bg-[#0a0e17]">
              <div className="text-[9px] uppercase font-pixel text-[#ec4899] mb-1">
                [RSI 14] OSCILLATOR
              </div>
              <div className="font-pixel text-xs text-white mb-2">
                14-Day Relative Strength Index
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                RSI &gt; 50 indicates bull-regime expansion. RSI &gt; 70 signals short-term overbought exhaustion; RSI &lt; 30 indicates deep oversold extremes.
              </p>
            </div>

            {/* MACD */}
            <div className="p-3.5 border border-[#1c2436] rounded-xl bg-[#0a0e17]">
              <div className="text-[9px] uppercase font-pixel text-[#f59e0b] mb-1">
                [MACD 12,26,9] TREND
              </div>
              <div className="font-pixel text-xs text-white mb-2">
                MACD &gt; Signal Crossover Acceleration
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Measures rate of price change. When MACD line crosses above the 9-period Signal line with positive histogram bars, momentum is actively accelerating.
              </p>
            </div>
          </div>

          {/* Strategy Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 border border-amber-500/30 bg-amber-950/15 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 font-pixel text-xs mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>GOLDEN STACK ALIGNMENT</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Triggered when <strong className="text-amber-300">Price &gt; EMA 9 &gt; EMA 20 &gt; EMA 50 &gt; EMA 100 &gt; EMA 200</strong> in perfect sequential order. Represents pure mathematical trend strength with no overhead resistance.
              </p>
            </div>

            <div className="p-4 border border-purple-500/30 bg-purple-950/15 rounded-xl">
              <div className="flex items-center gap-2 text-purple-300 font-pixel text-xs mb-1.5">
                <Compass className="w-4 h-4" />
                <span>GOLDEN CROSS (50 &gt; 200 EMA)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Classical quantitative golden cross occurs when the <strong className="text-purple-300">50 EMA crosses above the 200 EMA</strong>, signaling long-term structural institutional accumulation.
              </p>
            </div>
          </div>

          {/* Breadth Rules Table */}
          <div className="p-4 border border-[#1c2436] rounded-xl bg-[#0a0e17]">
            <div className="font-pixel text-xs text-white mb-3 tracking-wide">
              MARKET BREADTH INTERPRETATION MATRIX
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 border border-emerald-500/40 rounded-xl bg-emerald-950/20">
                <span className="font-pixel text-emerald-400 block mb-1.5 text-xs">
                  HYPER-BULLISH (&gt;80%)
                </span>
                <span className="leading-relaxed text-slate-300">
                  &gt;40 stocks above key EMAs. Strong trend continuation, high breakout success rate across top sectors.
                </span>
              </div>
              <div className="p-3.5 border border-blue-500/40 rounded-xl bg-blue-950/20">
                <span className="font-pixel text-blue-400 block mb-1.5 text-xs">
                  ACCUMULATION (50%-80%)
                </span>
                <span className="leading-relaxed text-slate-300">
                  25 to 40 stocks holding EMAs. Healthy swing-trading environment with selective rotation into leaders.
                </span>
              </div>
              <div className="p-3.5 border border-rose-500/40 rounded-xl bg-rose-950/20">
                <span className="font-pixel text-rose-400 block mb-1.5 text-xs">
                  EXTREME PANIC (&lt;25%)
                </span>
                <span className="leading-relaxed text-slate-300">
                  &lt;12 stocks holding EMAs. Extreme pessimism zone — ideal for contrarian accumulation and mean-reversion short squeezes.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
