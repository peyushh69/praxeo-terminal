import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  TrendingUp,
  Sliders,
  Layers,
  Zap,
  BarChart3,
  Shield,
  Clock,
  Car,
  Landmark,
  Cpu,
  ShoppingBag,
  CreditCard,
  HeartPulse,
  Building2,
  Building,
  Briefcase,
  Tv,
  Stethoscope,
  Tv2,
  ChevronRight,
  Terminal,
  Radio,
  ExternalLink,
  Sparkles,
  Search,
} from 'lucide-react';
import { SECTORAL_INDICES, type SectoralIndexDef } from '../data/sectoralIndices';

interface HomepageProps {
  onSelectModule: (moduleName: string, indexId?: string) => void;
}

// Icon mapper helper
const getSectorIcon = (iconName: string, className = 'w-4 h-4') => {
  switch (iconName) {
    case 'Activity': return <Activity className={className} />;
    case 'Landmark': return <Landmark className={className} />;
    case 'Car': return <Car className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Building2': return <Building2 className={className} />;
    case 'Building': return <Building className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Stethoscope': return <Stethoscope className={className} />;
    case 'Tv2': return <Tv2 className={className} />;
    default: return <BarChart3 className={className} />;
  }
};

export const Homepage: React.FC<HomepageProps> = ({ onSelectModule }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
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

  const filteredIndices = SECTORAL_INDICES.filter(idx =>
    idx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idx.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-mono selection:bg-[#ff3b00] selection:text-black bg-grid-praxis">
      
      {/* Top Terminal Status Strip */}
      <div className="border-b border-[#18181f] bg-[#000000] px-4 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            SYS_STATUS: ONLINE
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">FEED: NSE_REALTIME_DAILY</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-[#ff3b00]">ENGINE: PRAXIS QUANT v3.4</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            IST {currentTime || '--:--:--'}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold text-[10px]">
            MARKET OPEN
          </span>
        </div>
      </div>

      {/* Main Terminal Header */}
      <header className="border-b border-[#18181f] bg-[#050507] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff3b00] text-black font-black text-xl flex items-center justify-center shadow-pixel-orange">
              PX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  PRAXIS QUANT SUITE
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#ff3b00]/20 text-[#ff3b00] border border-[#ff3b00]/40">
                    TERMINAL HUB
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Institutional-Grade Quantitative Trading & Multi-Indicator Analytics Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              id="btn-nav-market-breadth-top"
              onClick={() => onSelectModule('market-breadth', 'NIFTY_50')}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff3b00] hover:bg-[#ff5500] text-black font-bold text-xs rounded-lg transition-all shadow-pixel-orange cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>LAUNCH MARKET BREADTH</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 flex flex-col gap-10">
        
        {/* HERO SECTION: HIGHLIGHTED / CHHATAK MARKET BREADTH INDICATOR BOX */}
        <section id="section-featured-breadth">
          <div className="relative group">
            {/* Animated Glow Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff3b00] via-amber-500 to-[#ff3b00] rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-500"></div>

            <div className="relative bg-[#050507] border-2 border-[#ff3b00] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
              
              {/* Card Top Pill & Tagline */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#251515] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-[#ff3b00] text-black text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    PRIMARY INDICATOR #01
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 text-xs font-bold">
                    LIVE & FULLY OPERATIONAL
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#ff3b00]" />
                  <span>15 SECTORAL INDICES • 180+ CONSTITUENTS</span>
                </div>
              </div>

              {/* Title & Core Description */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-[#ff3b00]/10 border border-[#ff3b00]/30 rounded-xl text-[#ff3b00]">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        MARKET BREADTH MATRIX
                      </h2>
                      <p className="text-sm font-semibold text-[#ff3b00]">
                        Multi-Index Moving Average, RSI & MACD Quantitative Participation Engine
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3 max-w-3xl">
                    Live quantitative tracking of stocks trading above <span className="text-amber-300 font-bold">EMA 9, 20, 50, 100 & 200</span>, <span className="text-emerald-400 font-bold">RSI(14)</span> momentum strength, <span className="text-cyan-400 font-bold">MACD Crossovers</span>, and <span className="text-[#ff3b00] font-bold">Golden Stack (9&gt;20&gt;50&gt;100&gt;200)</span> setups across Nifty 50 and all 14 NSE Sectoral Indices.
                  </p>
                </div>

                {/* Primary CTA Button */}
                <div className="flex flex-col gap-2 min-w-[240px]">
                  <button
                    id="btn-enter-market-breadth"
                    onClick={() => onSelectModule('market-breadth', 'NIFTY_50')}
                    className="w-full py-4 px-6 bg-[#ff3b00] hover:bg-[#ff5500] active:scale-[0.98] text-black font-black text-sm rounded-xl transition-all shadow-pixel-orange flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>ENTER MARKET BREADTH</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <span className="text-[11px] text-center text-slate-400">
                    Direct access to Nifty 50 & 14 Sectoral Indices
                  </span>
                </div>
              </div>

              {/* Quick Jump Sector Grid inside the Featured Box */}
              <div className="pt-4 border-t border-[#1c1d24]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Quick Sector Launcher:</span>
                  <span className="text-[11px] text-slate-500">Click any sector to open its breadth tracker</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
                  {SECTORAL_INDICES.map(idx => (
                    <button
                      key={idx.id}
                      id={`btn-quick-sector-${idx.id}`}
                      onClick={() => onSelectModule('market-breadth', idx.id)}
                      className="flex items-center gap-2 p-2 bg-[#09090e] hover:bg-[#151520] border border-[#20202a] hover:border-[#ff3b00] rounded-lg text-left transition-all group/btn cursor-pointer"
                    >
                      <div className="p-1 rounded bg-[#000000] border border-[#252535] text-slate-300 group-hover/btn:text-[#ff3b00] group-hover/btn:border-[#ff3b00]/40">
                        {getSectorIcon(idx.iconName, 'w-3 h-3')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-slate-200 group-hover/btn:text-white truncate">
                          {idx.shortName}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate">
                          {idx.stocks.length} Stocks
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ALL SECTORAL INDICES FULL DIRECTORY & SCREENER */}
        <section id="section-sector-directory" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#ff3b00]" />
                NSE SECTORAL INDICES SUITE ({SECTORAL_INDICES.length})
              </h2>
              <p className="text-xs text-slate-400">
                Detailed quantitative participation metrics available for every Indian market sector
              </p>
            </div>

            {/* Live Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="input-search-sectors"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sector (e.g. Auto, Bank, FMCG)..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#09090e] border border-[#20202a] text-slate-200 rounded-lg text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#ff3b00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredIndices.map(idx => (
              <div
                key={idx.id}
                id={`card-sector-full-${idx.id}`}
                onClick={() => onSelectModule('market-breadth', idx.id)}
                className="praxis-card p-4 hover:border-[#ff3b00]/80 transition-all cursor-pointer group flex flex-col justify-between gap-3 bg-[#07070a]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#000000] border border-[#20202c] text-[#ff3b00] group-hover:border-[#ff3b00] group-hover:bg-[#ff3b00]/10 transition-colors">
                        {getSectorIcon(idx.iconName, 'w-4 h-4')}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-[#ff3b00] transition-colors">
                          {idx.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {idx.category} • {idx.ticker}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#101018] border border-[#252535] text-slate-300">
                      {idx.stocks.length} Constituents
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {idx.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#181822] flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-[#ff3b00]">
                    <span>EMA 9/20/50/100/200 • RSI • MACD</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#ff3b00]">
                    <span>Launch</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OTHER QUANTITATIVE INDICATOR MODULES IN THE SUITE */}
        <section id="section-other-indicators" className="flex flex-col gap-4">
          <div className="border-t border-[#18181f] pt-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                EXTENDED QUANTITATIVE INDICATOR SUITE
              </h2>
              <span className="text-xs text-slate-500">MULTI-FACTOR ECOSYSTEM</span>
            </div>
            <p className="text-xs text-slate-400">
              Other specialized quantitative modules being engineered for this terminal suite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Module 2: Momentum & Trend */}
            <div className="praxis-card p-5 opacity-90 border-[#1f202b] flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-400">
                    INDICATOR #02
                  </span>
                  <span className="text-[10px] text-slate-500">TREND SUITE</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Momentum & Trend Following Vector
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  SuperTrend (10,3) multi-timeframe directional bias, ADX (14) trend acceleration index, and Donchian 20-day breakout tracking.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-[#151520] pt-3">
                <span className="text-[11px] text-emerald-400 font-semibold">Integrates with Breadth</span>
                <button
                  onClick={() => onSelectModule('market-breadth', 'NIFTY_50')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>View RSI/MACD</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Module 3: Relative Strength */}
            <div className="praxis-card p-5 opacity-90 border-[#1f202b] flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
                    INDICATOR #03
                  </span>
                  <span className="text-[10px] text-slate-500">ROTATION</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Relative Strength & Sector Rotation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mansfield Relative Strength vs Nifty 50 benchmark. Identifies leading, improving, lagging, and weakening market sectors.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-[#151520] pt-3">
                <span className="text-[11px] text-cyan-400 font-semibold">Sector Heatmap Active</span>
                <button
                  onClick={() => onSelectModule('market-breadth', 'NIFTY_50')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Sector Breadth</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Module 4: Volatility Profile */}
            <div className="praxis-card p-5 opacity-90 border-[#1f202b] flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-400">
                    INDICATOR #04
                  </span>
                  <span className="text-[10px] text-slate-500">VOLATILITY</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-400" />
                  Regime & Volatility Squeeze Radar
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  India VIX correlation matrix, Bollinger Bands %B compression scanner, and ATR (14) volatility expansion alerts.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-[#151520] pt-3">
                <span className="text-[11px] text-rose-400 font-semibold">Regime Stance Synced</span>
                <button
                  onClick={() => onSelectModule('market-breadth', 'NIFTY_50')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Breadth</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Terminal Footer */}
      <footer className="border-t border-[#18181f] bg-[#000000] py-6 px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff3b00]"></span>
          <span className="font-bold text-slate-400">PRAXIS QUANT TERMINAL</span>
          <span>• Multi-Indicator Breadth & Technical Analysis Engine</span>
        </div>
        <div>
          Data synchronized via Yahoo Finance API (Daily 1D Timeframe)
        </div>
      </footer>

    </div>
  );
};
