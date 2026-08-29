import React, { useState, useEffect } from 'react';
import { ArrowRight, Compass, Layers, Quote } from 'lucide-react';

interface Level1HomepageProps {
  onEnterBreadth: () => void;
  onEnterRotation: () => void;
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

export const Level1Homepage: React.FC<Level1HomepageProps> = ({ onEnterBreadth, onEnterRotation }) => {
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

  const handleNextQuote = () => {
    const next = (quoteIndex + 1) % MARKET_QUOTES.length;
    setQuoteIndex(next);
    try {
      localStorage.setItem('praxeo_quote_index', next.toString());
    } catch {
      // ignore
    }
  };

  const currentQuote = MARKET_QUOTES[quoteIndex] || MARKET_QUOTES[0];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#000000] flex flex-col items-center justify-center px-4 py-10 select-none relative font-mono">
      
      {/* Container */}
      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center space-y-6">
        
        {/* Dynamic Market Quote (Open layout, matching website typography with side neon green quote sign) */}
        <div className="max-w-xl mx-auto py-1 flex items-start gap-3 text-left">
          <Quote className="w-4 h-4 text-[#bef264] shrink-0 mt-1 opacity-90" />
          <div className="space-y-1.5 flex-1">
            <p className="text-white text-sm sm:text-base font-mono font-medium tracking-normal leading-relaxed">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>
            <p className="text-slate-400 text-xs font-mono tracking-wide">
              — {currentQuote.author}
            </p>
          </div>
        </div>

        {/* 2 Focused Indicator Launch Cards */}
        <div className="w-full space-y-4 pt-1">
          
          {/* INDICATOR 01: MARKET BREADTH */}
          <div className="w-full bg-[#050508] border border-[#ff3b00]/40 hover:border-[#ff3b00] rounded-xl p-5 text-left space-y-4 transition-all duration-150">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#ff3b00]/10 border border-[#ff3b00]/30 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-[#ff3b00]" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm sm:text-base text-white">
                    MARKET BREADTH
                  </h2>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-pixel bg-[#160808] text-[#ff3b00] border border-[#ff3b00]/30">
                15 SECTORS
              </span>
            </div>

            <button
              id="btn-market-breadth-launch"
              onClick={onEnterBreadth}
              className="w-full py-3 bg-[#ff3b00] hover:bg-[#ff4d14] text-black font-pixel text-xs tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <span>MARKET BREADTH</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* INDICATOR 02: SECTOR ROTATION MATRIX */}
          <div className="w-full bg-[#050508] border border-[#bef264]/40 hover:border-[#bef264] rounded-xl p-5 text-left space-y-4 transition-all duration-150">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#bef264]/10 border border-[#bef264]/30 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-[#bef264]" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm sm:text-base text-white">
                    SECTOR ROTATION MATRIX
                  </h2>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-pixel bg-[#0b1408] text-[#bef264] border border-[#bef264]/30">
                MOMENTUM
              </span>
            </div>

            <button
              id="btn-rotation-matrix-launch"
              onClick={onEnterRotation}
              className="w-full py-3 bg-[#bef264] hover:bg-[#cbf77f] text-black font-pixel text-xs tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <span>ROTATION MATRIX</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
