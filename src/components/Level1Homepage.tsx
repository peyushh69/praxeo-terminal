import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass, Layers, Quote, Sparkles, Sliders } from 'lucide-react';
import { LiveMarketNewsTerminal } from './LiveMarketNewsTerminal';
import { SECTORAL_INDICES } from '../data/sectoralIndices';

interface Level1HomepageProps {
  onEnterBreadth: () => void;
  onEnterRotation: () => void;
  onEnterScatter: () => void;
}

interface MarketQuote {
  quote: string;
  author: string;
}

const MARKET_QUOTES: MarketQuote[] = [
  {
    quote: "In God we trust. All others must bring data.",
    author: "W. Edwards Deming",
  },
  {
    quote: "Markets are never wrong; opinions often are.",
    author: "Jesse Livermore",
  },
  {
    quote: "Price is the final arbiter.",
    author: "Paul Tudor Jones",
  },
  {
    quote: "You can't predict. You can prepare.",
    author: "Howard Marks",
  },
  {
    quote: "Amateurs think about how much money they can make. Professionals think about how much money they could lose.",
    author: "Jack Schwager",
  },
  {
    quote: "The stock market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett",
  },
  {
    quote: "It is not what happens in the market that matters; it is how you react to it.",
    author: "Mark Douglas",
  },
  {
    quote: "If you personalize losses, you can't trade.",
    author: "Bruce Kovner",
  },
  {
    quote: "Don't anticipate and move without market confirmation.",
    author: "Jesse Livermore",
  },
  {
    quote: "Trend following is an exercise in observing and responding to the ever-present moment of now.",
    author: "Ed Seykota",
  },
  {
    quote: "It's not whether you're right or wrong, but how much you make when you're right and how much you lose when you're wrong.",
    author: "George Soros",
  },
  {
    quote: "There is nothing new in Wall Street. Whatever happens today has happened before and will happen again.",
    author: "Jesse Livermore",
  },
  {
    quote: "Risk comes from not knowing what you're doing.",
    author: "Warren Buffett",
  },
  {
    quote: "The trend is your friend until the end when it bends.",
    author: "Ed Seykota",
  },
  {
    quote: "Losers average losers.",
    author: "Paul Tudor Jones",
  },
  {
    quote: "I always define my risk, and I don't have to worry about it.",
    author: "Tony Saliba",
  },
  {
    quote: "The elements of good trading are: 1. Cutting losses, 2. Cutting losses, and 3. Cutting losses.",
    author: "Ed Seykota",
  },
  {
    quote: "Do more of what works and less of what doesn't.",
    author: "Steve Clark",
  },
  {
    quote: "The core of the problem is that people don't understand randomness.",
    author: "Nassim Nicholas Taleb",
  },
  {
    quote: "There are old traders and there are bold traders, but there are very few old, bold traders.",
    author: "Ed Seykota",
  },
];

export const Level1Homepage: React.FC<Level1HomepageProps> = ({
  onEnterBreadth,
  onEnterRotation,
  onEnterScatter,
}) => {
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Initialize and increment loop on every visit/reload (1 -> 2 -> ... -> 20 -> 1)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('praxeo_quote_index');
      let nextIndex = 0;
      if (saved !== null && !isNaN(parseInt(saved, 10))) {
        nextIndex = (parseInt(saved, 10) + 1) % MARKET_QUOTES.length;
      } else {
        nextIndex = 0;
      }
      localStorage.setItem('praxeo_quote_index', nextIndex.toString());
      setQuoteIndex(nextIndex);
    } catch {
      setQuoteIndex(0);
    }
  }, []);

  const currentQuote = MARKET_QUOTES[quoteIndex] || MARKET_QUOTES[0];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#000000] flex flex-col justify-start px-3 sm:px-6 lg:px-8 py-6 select-none relative font-mono">
      
      {/* 1. TOP CENTER QUOTE SECTION (Prominently centered at the top) */}
      <div className="w-full max-w-6xl mx-auto mb-6 text-center">
        <div className="inline-flex items-start sm:items-center gap-3 bg-[#07070e] border border-[#222238] hover:border-[#bef264]/60 rounded-xl px-5 py-3 shadow-lg max-w-3xl mx-auto text-left transition-all">
          <Quote className="w-5 h-5 text-[#bef264] shrink-0 mt-0.5 sm:mt-0 opacity-90" />
          <div className="space-y-1 flex-1">
            <p className="text-white text-xs sm:text-sm md:text-base font-mono font-medium tracking-normal leading-relaxed">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>
            <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs font-mono">
              <span className="text-[#bef264] font-medium">— {currentQuote.author}</span>
              <span className="text-[9px] text-slate-600 font-pixel">#DAILY INSIGHT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SPLIT DASHBOARD */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: 3 Primary Launch Cards (Market Breadth, Rotation Matrix & Return Scatter) */}
        <div className="lg:col-span-5 flex flex-col space-y-3.5">
          
          <div className="flex items-center justify-between px-1">
            <span className="font-pixel text-[10px] text-[#ff8800] tracking-wider">
              PRIMARY SUITE MODULES
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              3 ACTIVE ENGINES
            </span>
          </div>

          {/* OPTION 01: MARKET BREADTH */}
          <div className="w-full bg-[#050508] border-2 border-[#ff3b00]/50 hover:border-[#ff3b00] rounded-xl p-4 sm:p-4.5 text-left space-y-3 transition-all duration-150 shadow-lg group">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#ff3b00]/10 border border-[#ff3b00]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Layers className="w-4.5 h-4.5 text-[#ff3b00]" />
                </div>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wide">
                    MARKET BREADTH
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Advance/Decline & 52-Week Multi-Sector Health
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-pixel bg-[#160808] text-[#ff3b00] border border-[#ff3b00]/40">
                {SECTORAL_INDICES.length} INDICES
              </span>
            </div>

            <button
              id="btn-market-breadth-launch"
              onClick={onEnterBreadth}
              className="w-full py-2.5 sm:py-3 bg-[#ff3b00] hover:bg-[#ff4d14] text-black font-pixel text-[11px] tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shadow-md active:scale-[0.99]"
            >
              <span>LAUNCH MARKET BREADTH</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>

          {/* OPTION 02: SECTOR ROTATION MATRIX */}
          <div className="w-full bg-[#050508] border-2 border-[#bef264]/50 hover:border-[#bef264] rounded-xl p-4 sm:p-4.5 text-left space-y-3 transition-all duration-150 shadow-lg group">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#bef264]/10 border border-[#bef264]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Compass className="w-4.5 h-4.5 text-[#bef264]" />
                </div>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wide">
                    SECTOR ROTATION MATRIX
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Relative Strength vs Momentum (1W to 5Y RRG)
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-pixel bg-[#0b1408] text-[#bef264] border border-[#bef264]/40">
                MOMENTUM
              </span>
            </div>

            <button
              id="btn-rotation-matrix-launch"
              onClick={onEnterRotation}
              className="w-full py-2.5 sm:py-3 bg-[#bef264] hover:bg-[#cbf77f] text-black font-pixel text-[11px] tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shadow-md active:scale-[0.99]"
            >
              <span>LAUNCH ROTATION MATRIX</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>

          {/* OPTION 03: NIFTY 50 CROSS-SECTIONAL RETURN SCATTER (KOYFIN STYLE) */}
          <div className="w-full bg-[#050508] border-2 border-[#00e5ff]/50 hover:border-[#00e5ff] rounded-xl p-4 sm:p-4.5 text-left space-y-3 transition-all duration-150 shadow-lg group">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sliders className="w-4.5 h-4.5 text-[#00e5ff]" />
                </div>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm text-white tracking-wide flex items-center gap-2">
                    <span>RETURN SCATTER PLOT</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Koyfin-Style Cross-Sectional Alpha & Regression
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-pixel bg-[#03141a] text-[#00e5ff] border border-[#00e5ff]/40">
                5 BENCHMARKS
              </span>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Koyfin-Style Alpha Matrix for Nifty 50, 500, Next 50, Midcap & Smallcap
            </p>

            <button
              id="btn-scatter-plot-launch"
              onClick={onEnterScatter}
              className="w-full py-2.5 sm:py-3 bg-[#00e5ff] hover:bg-[#38bdf8] text-black font-pixel text-[11px] tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold shadow-md active:scale-[0.99]"
            >
              <span>LAUNCH SCATTER PLOT</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>

          {/* Small Feature Footnote */}
          <div className="text-[9px] text-slate-600 font-mono px-1 flex items-center justify-between pt-1">
            <span>REAL-TIME NSE / BSE REFRESH</span>
            <span>PROPRIETARY QUANT ALGO</span>
          </div>

        </div>

        {/* RIGHT COLUMN: Real-time India Financial News Terminal (Bloomberg / DJ Box) */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff3b00] animate-ping" />
              <span className="font-pixel text-[10px] text-white tracking-wider">
                LIVE FINANCIAL INTELLIGENCE WIRE
              </span>
            </div>
            <span className="text-[9px] font-pixel text-[#bef264]">
              ONE-LINE BULLETINS
            </span>
          </div>

          {/* Terminal Box */}
          <LiveMarketNewsTerminal />
        </div>

      </div>

    </div>
  );
};
