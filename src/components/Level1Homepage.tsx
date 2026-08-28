import React from 'react';
import { ArrowRight, Compass, Layers } from 'lucide-react';

interface Level1HomepageProps {
  onEnterBreadth: () => void;
  onEnterRotation: () => void;
}

export const Level1Homepage: React.FC<Level1HomepageProps> = ({ onEnterBreadth, onEnterRotation }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#000000] flex flex-col items-center justify-center px-4 py-12 select-none relative font-mono">
      
      {/* Container */}
      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center space-y-8">
        
        {/* Terminal Header Eyebrow */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#08080d] border border-[#1a1a26]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
          <span className="font-pixel text-[9px] text-[#bef264] tracking-widest uppercase">
            PRAXEO TERMINAL
          </span>
        </div>

        {/* Hero Header */}
        <div className="space-y-1.5">
          <h1 className="font-pixel text-2xl sm:text-3xl text-white tracking-tight">
            QUANTITATIVE SUITE
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
            Institutional Market Telemetry &amp; Sector Trajectory Analytics
          </p>
        </div>

        {/* 2 Focused Indicator Launch Cards */}
        <div className="w-full space-y-4">
          
          {/* INDICATOR 01: MARKET BREADTH */}
          <div className="w-full bg-[#050508] border border-[#ff3b00]/40 hover:border-[#ff3b00] rounded-xl p-5 text-left space-y-4 transition-all duration-150">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#ff3b00]/10 border border-[#ff3b00]/30 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-[#ff3b00]" />
                </div>
                <div>
                  <span className="text-[8px] font-pixel text-[#ff3b00] uppercase tracking-wider block">
                    INDICATOR 01
                  </span>
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
                  <span className="text-[8px] font-pixel text-[#bef264] uppercase tracking-wider block">
                    INDICATOR 02
                  </span>
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
