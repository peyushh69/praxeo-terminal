import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Info,
  Sliders,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ChevronRight,
  CheckSquare,
  Square,
  HelpCircle,
  Eye,
  Crosshair,
  RefreshCw,
  Zap,
} from 'lucide-react';
import type { RRGResponse, RRGSectorItem, RRGQuadrant } from '../types';

interface RRGViewProps {
  onBackHome: () => void;
  onNavigateBreadth: () => void;
}

export const RRGView: React.FC<RRGViewProps> = ({ onBackHome, onNavigateBreadth }) => {
  // State
  const [data, setData] = useState<RRGResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Settings & Filters
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');
  const [trailLength, setTrailLength] = useState<number>(8);
  const [benchmark, setBenchmark] = useState<string>('^NSEI');
  const [selectedQuadrant, setSelectedQuadrant] = useState<'ALL' | RRGQuadrant>('ALL');
  const [highlightedSectorId, setHighlightedSectorId] = useState<string | null>(null);
  const [selectedSectorIds, setSelectedSectorIds] = useState<Set<string>>(new Set());
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Interactive Playback Animation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null); // Index in trail (0 to trailLength-1)

  // Chart Container Dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 700, height: 520 });

  // Tooltip State
  const [hoveredSector, setHoveredSector] = useState<RRGSectorItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fetch RRG data with retry
  const fetchRRGData = async (force = false, retryCount = 2) => {
    try {
      setLoading(true);
      setError(null);
      const cacheKey = `praxeo_rrg_${benchmark}_${timeframe}_${trailLength}`;

      if (!force) {
        try {
          const cachedStr = sessionStorage.getItem(cacheKey);
          if (cachedStr) {
            const cachedObj = JSON.parse(cachedStr);
            if (cachedObj && cachedObj.sectors?.length > 0) {
              setData(cachedObj);
              const allIds = new Set(cachedObj.sectors.map((s: RRGSectorItem) => s.id));
              setSelectedSectorIds(allIds);
            }
          }
        } catch {
          // ignore
        }
      }

      const url = `/api/rrg?benchmark=${encodeURIComponent(benchmark)}&timeframe=${timeframe}&trail=${trailLength}${force ? '&refresh=true' : ''}`;
      
      let lastErr: any = null;
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const res = await axios.get(url, { timeout: 20000 });
          if (res.data?.success && res.data?.data) {
            setData(res.data.data);
            setError(null);
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(res.data.data));
            } catch {
              // ignore
            }
            // Initialize all selected
            const allIds = new Set(res.data.data.sectors.map((s: RRGSectorItem) => s.id));
            setSelectedSectorIds(allIds);
            setPlaybackIndex(null);
            setIsPlaying(false);
            return;
          } else {
            throw new Error(res.data?.error || 'Failed to load RRG matrix');
          }
        } catch (err: any) {
          lastErr = err;
          if (attempt < retryCount) {
            await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
          }
        }
      }
      throw lastErr;
    } catch (err: any) {
      try {
        const cacheKey = `praxeo_rrg_${benchmark}_${timeframe}_${trailLength}`;
        const cachedStr = sessionStorage.getItem(cacheKey);
        if (cachedStr) {
          const cachedObj = JSON.parse(cachedStr);
          if (cachedObj && cachedObj.sectors?.length > 0) {
            setData(cachedObj);
            setError(null);
            return;
          }
        }
      } catch {
        // ignore
      }

      setData(prev => {
        if (!prev) {
          setError(err.message || 'Connecting to RRG engine...');
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRRGData();
    // Auto-update sector rotation matrix in background every 60 seconds
    const interval = setInterval(() => {
      fetchRRGData(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [benchmark, timeframe, trailLength]);

  // Handle ResizeObserver for responsive SVG
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const newWidth = Math.max(320, width);
        const newHeight = Math.min(600, Math.max(380, Math.round(newWidth * 0.72)));
        setDimensions({ width: newWidth, height: newHeight });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying || !data || data.sectors.length === 0) return;
    const maxIndex = (data.sectors[0].trail.length || trailLength) - 1;

    const interval = setInterval(() => {
      setPlaybackIndex((prev) => {
        const next = (prev === null ? 0 : prev + 1);
        if (next > maxIndex) {
          return 0; // loop back
        }
        return next;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isPlaying, data, trailLength]);

  // Filtered Sectors
  const visibleSectors = useMemo(() => {
    if (!data) return [];
    return data.sectors.filter((sec) => {
      const matchesQuadrant = selectedQuadrant === 'ALL' || sec.quadrant === selectedQuadrant;
      const isChecked = selectedSectorIds.has(sec.id);
      return matchesQuadrant && isChecked;
    });
  }, [data, selectedQuadrant, selectedSectorIds]);

  // Coordinate scales: dynamic or standard 92 to 108
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (!data || data.sectors.length === 0) {
      return { minX: 94, maxX: 106, minY: 94, maxY: 106 };
    }

    let minXVal = 95;
    let maxXVal = 105;
    let minYVal = 95;
    let maxYVal = 105;

    data.sectors.forEach((s) => {
      s.trail.forEach((pt) => {
        if (pt.rsRatio < minXVal) minXVal = pt.rsRatio;
        if (pt.rsRatio > maxXVal) maxXVal = pt.rsRatio;
        if (pt.rsMomentum < minYVal) minYVal = pt.rsMomentum;
        if (pt.rsMomentum > maxYVal) maxYVal = pt.rsMomentum;
      });
    });

    // Make bounds symmetric around 100 for equal visual weight
    const maxDeltaX = Math.max(Math.abs(100 - minXVal), Math.abs(maxXVal - 100), 4.5);
    const maxDeltaY = Math.max(Math.abs(100 - minYVal), Math.abs(maxYVal - 100), 4.5);
    const maxDelta = Math.max(maxDeltaX, maxDeltaY) + 0.8;

    return {
      minX: Number((100 - maxDelta).toFixed(1)),
      maxX: Number((100 + maxDelta).toFixed(1)),
      minY: Number((100 - maxDelta).toFixed(1)),
      maxY: Number((100 + maxDelta).toFixed(1)),
    };
  }, [data]);

  // Scale functions (Data coordinates to SVG pixels)
  const padding = { top: 35, right: 35, bottom: 45, left: 50 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height - padding.top - padding.bottom;

  const scaleX = (val: number) => padding.left + ((val - minX) / (maxX - minX)) * chartWidth;
  const scaleY = (val: number) => padding.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

  const centerX = scaleX(100);
  const centerY = scaleY(100);

  // Toggle Single Sector Checkbox
  const toggleSector = (id: string) => {
    setSelectedSectorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // Keep at least one
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllSectors = () => {
    if (!data) return;
    setSelectedSectorIds(new Set(data.sectors.map((s) => s.id)));
  };

  const deselectAllSectors = () => {
    if (!data || data.sectors.length === 0) return;
    // Keep top sector only
    setSelectedSectorIds(new Set([data.sectors[0].id]));
  };

  // Color mapping per quadrant
  const getQuadrantColor = (quad: RRGQuadrant) => {
    switch (quad) {
      case 'Leading':
        return '#bef264'; // Lime green
      case 'Weakening':
        return '#fbbf24'; // Amber yellow
      case 'Lagging':
        return '#f43f5e'; // Rose red
      case 'Improving':
        return '#38bdf8'; // Sky blue
    }
  };

  const getQuadrantBadge = (quad: RRGQuadrant) => {
    switch (quad) {
      case 'Leading':
        return 'bg-emerald-950/80 text-[#bef264] border-emerald-700/60';
      case 'Weakening':
        return 'bg-amber-950/80 text-[#fbbf24] border-amber-700/60';
      case 'Lagging':
        return 'bg-rose-950/80 text-rose-400 border-rose-700/60';
      case 'Improving':
        return 'bg-sky-950/80 text-sky-400 border-sky-700/60';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 space-y-5 font-mono select-none">
      
      {/* 1. TOP SUB-NAV BAR (Breadcrumbs & Direct Switch) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#06060a] border border-[#181824] rounded-xl p-3 sm:p-4">
        
        {/* Left: Indicator Title & Benchmark Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#ff3b00]/10 border border-[#ff3b00]/30 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-[#ff3b00]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-pixel text-sm sm:text-base text-white tracking-wide">
                SECTOR ROTATION MATRIX
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-pixel bg-[#161622] text-[#bef264] border border-[#262638]">
                OMNIS MOMENTUM MODEL
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">
              Sector momentum vs Benchmark ({data?.benchmark.name || 'NIFTY 50'} • RS-Ratio vs RS-Momentum)
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Switch to Breadth Engine */}
          <button
            onClick={onNavigateBreadth}
            id="btn-nav-to-breadth"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e0e16] border border-[#222232] hover:border-[#bef264] text-slate-300 hover:text-white font-pixel text-[8px] sm:text-[9px] transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#bef264]" />
            <span>MARKET BREADTH</span>
          </button>

          {/* Guide / Methodology Drawer Trigger */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0e0e16] border border-[#222232] hover:border-[#ff3b00] text-slate-300 hover:text-[#ff3b00] font-pixel text-[8px] sm:text-[9px] transition-all cursor-pointer"
            title="How to interpret Rotation Matrix"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HOW TO READ</span>
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchRRGData(true)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-[#0e0e16] border border-[#222232] hover:border-[#bef264] text-slate-300 hover:text-[#bef264] transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Rotation Matrix"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* 2. METHODOLOGY & TRADING STRATEGY ACCORDION / GUIDE */}
      {showGuide && (
        <div className="bg-[#08080e] border-2 border-[#ff3b00]/40 rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#1c1c28] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff3b00]" />
              <h3 className="font-pixel text-xs text-white">
                SECTOR ROTATION MATRIX — METHODOLOGY &amp; TRADING GUIDE
              </h3>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-white font-pixel text-[9px] px-2 py-0.5 rounded bg-[#12121c] border border-[#222230]"
            >
              CLOSE [X]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* 1. Leading */}
            <div className="p-3 rounded-lg bg-[#05150c] border border-emerald-800/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[9px] text-[#bef264]">1. LEADING (TOP-RIGHT)</span>
                <span className="text-[10px] text-emerald-400 font-bold">&gt;100 / &gt;100</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-[#bef264]">Strong Outperformance + Accelerating Momentum.</strong> Sectors in this quadrant have high relative strength and are leading the benchmark rally.
              </p>
              <div className="text-[10px] text-emerald-300/80 font-mono bg-emerald-950/40 p-1.5 rounded">
                ⚡ Action: Aggressive Long / Trend Following
              </div>
            </div>

            {/* 2. Weakening */}
            <div className="p-3 rounded-lg bg-[#181105] border border-amber-800/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[9px] text-[#fbbf24]">2. WEAKENING (BOTTOM-RIGHT)</span>
                <span className="text-[10px] text-amber-400 font-bold">&gt;100 / &lt;100</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-[#fbbf24]">Outperforming but Losing Momentum.</strong> Still above benchmark trend, but velocity is slowing down and rotating toward Lagging.
              </p>
              <div className="text-[10px] text-amber-300/80 font-mono bg-amber-950/40 p-1.5 rounded">
                ⚡ Action: Trail Tight Stop-Loss / Book Profits
              </div>
            </div>

            {/* 3. Lagging */}
            <div className="p-3 rounded-lg bg-[#1a0808] border border-rose-800/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[9px] text-rose-400">3. LAGGING (BOTTOM-LEFT)</span>
                <span className="text-[10px] text-rose-400 font-bold">&lt;100 / &lt;100</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-rose-400">Underperforming + Negative Momentum.</strong> Weakest sectors lagging behind the market with deteriorating relative strength.
              </p>
              <div className="text-[10px] text-rose-300/80 font-mono bg-rose-950/40 p-1.5 rounded">
                ⚡ Action: Avoid / Short Hedging / Underweight
              </div>
            </div>

            {/* 4. Improving */}
            <div className="p-3 rounded-lg bg-[#06121f] border border-sky-800/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[9px] text-sky-400">4. IMPROVING (TOP-LEFT)</span>
                <span className="text-[10px] text-sky-400 font-bold">&lt;100 / &gt;100</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-sky-400">Underperforming but Gaining Velocity.</strong> Bottoming out and rotating upward with rising momentum towards Leading.
              </p>
              <div className="text-[10px] text-sky-300/80 font-mono bg-sky-950/40 p-1.5 rounded">
                ⚡ Action: Early Breakout Watchlist / Accumulate
              </div>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] font-mono border-t border-[#181824] pt-2 flex items-center justify-between">
            <span>
              💡 <em>Rotational Principle:</em> Sectors naturally travel in a <strong>clockwise cycle</strong> across the four quadrants over time.
            </span>
          </div>
        </div>
      )}

      {/* 3. QUADRANT SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Leading Card */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'Leading' ? 'ALL' : 'Leading')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedQuadrant === 'Leading'
              ? 'bg-[#061a0e] border-[#bef264] shadow-[0_0_15px_rgba(190,242,100,0.2)]'
              : 'bg-[#050e09] border-emerald-900/40 hover:border-emerald-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-pixel text-[9px] text-[#bef264]">LEADING</span>
            <span className="font-pixel text-xs px-1.5 py-0.5 rounded bg-emerald-950 text-[#bef264] border border-emerald-800/60">
              {data?.quadrantCounts.leading || 0}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 truncate">
            {data?.sectors.filter((s) => s.quadrant === 'Leading').map((s) => s.shortName).join(', ') || 'None'}
          </div>
        </div>

        {/* Weakening Card */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'Weakening' ? 'ALL' : 'Weakening')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedQuadrant === 'Weakening'
              ? 'bg-[#1a1406] border-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.2)]'
              : 'bg-[#0e0c05] border-amber-900/40 hover:border-amber-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-pixel text-[9px] text-[#fbbf24]">WEAKENING</span>
            <span className="font-pixel text-xs px-1.5 py-0.5 rounded bg-amber-950 text-[#fbbf24] border border-amber-800/60">
              {data?.quadrantCounts.weakening || 0}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 truncate">
            {data?.sectors.filter((s) => s.quadrant === 'Weakening').map((s) => s.shortName).join(', ') || 'None'}
          </div>
        </div>

        {/* Lagging Card */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'Lagging' ? 'ALL' : 'Lagging')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedQuadrant === 'Lagging'
              ? 'bg-[#1c0808] border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
              : 'bg-[#0e0505] border-rose-900/40 hover:border-rose-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-pixel text-[9px] text-rose-400">LAGGING</span>
            <span className="font-pixel text-xs px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60">
              {data?.quadrantCounts.lagging || 0}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 truncate">
            {data?.sectors.filter((s) => s.quadrant === 'Lagging').map((s) => s.shortName).join(', ') || 'None'}
          </div>
        </div>

        {/* Improving Card */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === 'Improving' ? 'ALL' : 'Improving')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            selectedQuadrant === 'Improving'
              ? 'bg-[#061421] border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
              : 'bg-[#050a12] border-sky-900/40 hover:border-sky-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-pixel text-[9px] text-sky-400">IMPROVING</span>
            <span className="font-pixel text-xs px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
              {data?.quadrantCounts.improving || 0}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 truncate">
            {data?.sectors.filter((s) => s.quadrant === 'Improving').map((s) => s.shortName).join(', ') || 'None'}
          </div>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE RRG CANVAS CONTAINER */}
      <div className="bg-[#030306] border border-[#1a1a28] rounded-xl p-3 sm:p-5 space-y-4 shadow-2xl relative">
        
        {/* Controls Toolbar (Top of Chart) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141420] pb-3 text-xs">
          
          {/* Left: Timeframe & Trail Length */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Benchmark Selector */}
            <div className="flex items-center gap-1 bg-[#090910] border border-[#202030] rounded-lg px-2 py-1">
              <Crosshair className="w-3.5 h-3.5 text-[#ff3b00]" />
              <span className="text-slate-400 text-[10px] font-pixel">BENCHMARK:</span>
              <select
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
                className="bg-transparent text-white font-pixel text-[9px] focus:outline-none cursor-pointer"
              >
                <option value="^NSEI" className="bg-[#090910]">NIFTY 50</option>
                <option value="^NSEBANK" className="bg-[#090910]">NIFTY BANK</option>
                <option value="^BSESN" className="bg-[#090910]">BSE SENSEX</option>
              </select>
            </div>

            {/* Timeframe */}
            <div className="flex items-center rounded-lg bg-[#090910] border border-[#202030] p-0.5">
              <button
                onClick={() => setTimeframe('daily')}
                className={`px-2.5 py-1 rounded font-pixel text-[8px] sm:text-[9px] transition-all cursor-pointer ${
                  timeframe === 'daily' ? 'bg-[#ff3b00] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                DAILY (1D)
              </button>
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-2.5 py-1 rounded font-pixel text-[8px] sm:text-[9px] transition-all cursor-pointer ${
                  timeframe === 'weekly' ? 'bg-[#ff3b00] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                WEEKLY (1W)
              </button>
            </div>

            {/* Trail Length */}
            <div className="flex items-center gap-1 bg-[#090910] border border-[#202030] rounded-lg px-2 py-1">
              <span className="text-slate-400 text-[10px] font-pixel">TRAIL:</span>
              {[5, 8, 12, 16].map((len) => (
                <button
                  key={len}
                  onClick={() => setTrailLength(len)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-pixel cursor-pointer ${
                    trailLength === len ? 'bg-[#bef264] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {len}P
                </button>
              ))}
            </div>
          </div>

          {/* Right: Playback & Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Play/Pause Rotation Simulation */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-pixel text-[8px] sm:text-[9px] border transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-emerald-950 text-[#bef264] border-emerald-600 animate-pulse'
                  : 'bg-[#0a0a14] text-slate-300 border-[#222232] hover:border-[#bef264]'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3 text-[#bef264]" /> : <Play className="w-3 h-3 text-[#bef264]" />}
              <span>{isPlaying ? 'PAUSE ROTATION' : 'PLAY ROTATION'}</span>
            </button>

            {/* Labels toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-1 rounded-lg font-pixel text-[8px] border transition-all cursor-pointer ${
                showLabels ? 'bg-[#181824] text-slate-200 border-[#303046]' : 'bg-[#090910] text-slate-500 border-[#1a1a24]'
              }`}
              title="Toggle ticker labels on chart"
            >
              LABELS: {showLabels ? 'ON' : 'OFF'}
            </button>

            {/* Trails toggle */}
            <button
              onClick={() => setShowTrails(!showTrails)}
              className={`px-2 py-1 rounded-lg font-pixel text-[8px] border transition-all cursor-pointer ${
                showTrails ? 'bg-[#181824] text-slate-200 border-[#303046]' : 'bg-[#090910] text-slate-500 border-[#1a1a24]'
              }`}
              title="Toggle historical rotation trails"
            >
              TRAILS: {showTrails ? 'ON' : 'OFF'}
            </button>

            {/* Reset highlight */}
            {highlightedSectorId && (
              <button
                onClick={() => setHighlightedSectorId(null)}
                className="px-2 py-1 rounded-lg font-pixel text-[8px] bg-rose-950 text-rose-300 border border-rose-800/60 cursor-pointer"
              >
                CLEAR FOCUS
              </button>
            )}
          </div>

        </div>

        {/* SVG RRG Chart Area */}
        <div ref={containerRef} className="relative w-full overflow-hidden flex items-center justify-center">
          {loading && !data ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#ff3b00]" />
              <div className="font-pixel text-xs text-white">COMPUTING SECTOR ROTATION MATRIX...</div>
              <div className="text-slate-500 text-[11px] font-mono">
                Calculating Relative Strength &amp; Momentum Trajectory across 15 NSE Sectoral Indices
              </div>
            </div>
          ) : (
            <svg
              width={dimensions.width}
              height={dimensions.height}
              className="overflow-visible select-none"
              onMouseLeave={() => setHoveredSector(null)}
            >
              <defs>
                {/* Quadrant Background Gradients */}
                <radialGradient id="grad-leading" cx="100%" cy="0%" r="90%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                </radialGradient>
                <radialGradient id="grad-improving" cx="0%" cy="0%" r="90%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.01" />
                </radialGradient>
                <radialGradient id="grad-lagging" cx="0%" cy="100%" r="90%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.01" />
                </radialGradient>
                <radialGradient id="grad-weakening" cx="100%" cy="100%" r="90%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
                </radialGradient>

                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. QUADRANT RECTANGLES */}
              {/* Top-Right: LEADING */}
              <rect
                x={centerX}
                y={padding.top}
                width={chartWidth - (centerX - padding.left)}
                height={centerY - padding.top}
                fill="url(#grad-leading)"
                stroke="#10b981"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Top-Left: IMPROVING */}
              <rect
                x={padding.left}
                y={padding.top}
                width={centerX - padding.left}
                height={centerY - padding.top}
                fill="url(#grad-improving)"
                stroke="#0ea5e9"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Bottom-Left: LAGGING */}
              <rect
                x={padding.left}
                y={centerY}
                width={centerX - padding.left}
                height={chartHeight - (centerY - padding.top)}
                fill="url(#grad-lagging)"
                stroke="#f43f5e"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Bottom-Right: WEAKENING */}
              <rect
                x={centerX}
                y={centerY}
                width={chartWidth - (centerX - padding.left)}
                height={chartHeight - (centerY - padding.top)}
                fill="url(#grad-weakening)"
                stroke="#f59e0b"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* 2. QUADRANT LABELS (Watermarks) */}
              <text
                x={padding.left + 15}
                y={padding.top + 22}
                fill="#38bdf8"
                fontSize="11"
                fontWeight="bold"
                fontFamily="'Press Start 2P', monospace"
                opacity="0.85"
              >
                IMPROVING
              </text>
              <text
                x={dimensions.width - padding.right - 15}
                y={padding.top + 22}
                fill="#bef264"
                fontSize="11"
                fontWeight="bold"
                fontFamily="'Press Start 2P', monospace"
                textAnchor="end"
                opacity="0.85"
              >
                LEADING
              </text>
              <text
                x={padding.left + 15}
                y={dimensions.height - padding.bottom - 12}
                fill="#f43f5e"
                fontSize="11"
                fontWeight="bold"
                fontFamily="'Press Start 2P', monospace"
                opacity="0.85"
              >
                LAGGING
              </text>
              <text
                x={dimensions.width - padding.right - 15}
                y={dimensions.height - padding.bottom - 12}
                fill="#fbbf24"
                fontSize="11"
                fontWeight="bold"
                fontFamily="'Press Start 2P', monospace"
                textAnchor="end"
                opacity="0.85"
              >
                WEAKENING
              </text>

              {/* 3. GRID LINES & AXIS TICKS */}
              {/* Vertical Grid Lines */}
              {Array.from({ length: 9 }).map((_, i) => {
                const val = minX + (i / 8) * (maxX - minX);
                const x = scaleX(val);
                const isCenter = Math.abs(val - 100) < 0.2;
                return (
                  <g key={`x-grid-${i}`}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={dimensions.height - padding.bottom}
                      stroke={isCenter ? '#ffffff' : '#1c1c28'}
                      strokeWidth={isCenter ? 1.5 : 0.8}
                      strokeDasharray={isCenter ? 'none' : '2 2'}
                      opacity={isCenter ? 0.9 : 0.5}
                    />
                    <text
                      x={x}
                      y={dimensions.height - padding.bottom + 16}
                      fill={isCenter ? '#ffffff' : '#64748b'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Horizontal Grid Lines */}
              {Array.from({ length: 9 }).map((_, i) => {
                const val = minY + (i / 8) * (maxY - minY);
                const y = scaleY(val);
                const isCenter = Math.abs(val - 100) < 0.2;
                return (
                  <g key={`y-grid-${i}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={dimensions.width - padding.right}
                      y2={y}
                      stroke={isCenter ? '#ffffff' : '#1c1c28'}
                      strokeWidth={isCenter ? 1.5 : 0.8}
                      strokeDasharray={isCenter ? 'none' : '2 2'}
                      opacity={isCenter ? 0.9 : 0.5}
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      fill={isCenter ? '#ffffff' : '#64748b'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Center Benchmark Point (100, 100) */}
              <g className="cursor-pointer" title={`Benchmark Origin: ${data?.benchmark.name || 'NIFTY 50'}`}>
                <circle cx={centerX} cy={centerY} r="7" fill="#000000" stroke="#ff3b00" strokeWidth="2" />
                <circle cx={centerX} cy={centerY} r="3" fill="#ff3b00" />
                <text
                  x={centerX + 9}
                  y={centerY - 8}
                  fill="#ff3b00"
                  fontSize="8"
                  fontFamily="'Press Start 2P', monospace"
                  fontWeight="bold"
                >
                  {data?.benchmark.name || 'NIFTY 50'} (100,100)
                </text>
              </g>

              {/* 4. SECTOR TRAILS & HEADS */}
              {visibleSectors.map((sec) => {
                const isFocused = highlightedSectorId === sec.id;
                const isDimmed = highlightedSectorId !== null && !isFocused;
                const color = getQuadrantColor(sec.quadrant);

                // Effective trail based on animation playback
                const maxStep = sec.trail.length - 1;
                const currentStep = playbackIndex !== null ? Math.min(playbackIndex, maxStep) : maxStep;
                const activeTrail = sec.trail.slice(0, currentStep + 1);
                const currentPoint = activeTrail[activeTrail.length - 1] || sec.trail[sec.trail.length - 1];

                if (!currentPoint) return null;

                const headX = scaleX(currentPoint.rsRatio);
                const headY = scaleY(currentPoint.rsMomentum);

                // Build path string for trail
                const pathD = activeTrail
                  .map((pt, idx) => {
                    const px = scaleX(pt.rsRatio);
                    const py = scaleY(pt.rsMomentum);
                    return `${idx === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
                  })
                  .join(' ');

                return (
                  <g
                    key={sec.id}
                    className="transition-opacity duration-150"
                    opacity={isDimmed ? 0.2 : 1}
                    onMouseEnter={(e) => {
                      setHoveredSector(sec);
                      const rect = containerRef.current?.getBoundingClientRect();
                      if (rect) {
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }
                    }}
                    onClick={() => setHighlightedSectorId(isFocused ? null : sec.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Continuous Trail Line */}
                    {showTrails && activeTrail.length > 1 && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth={isFocused ? 2.5 : 1.4}
                        strokeOpacity={isFocused ? 0.9 : 0.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Historical Trail Dots */}
                    {showTrails &&
                      activeTrail.map((pt, ptIdx) => {
                        const isLast = ptIdx === activeTrail.length - 1;
                        if (isLast) return null; // Head drawn separately
                        const px = scaleX(pt.rsRatio);
                        const py = scaleY(pt.rsMomentum);
                        const progress = (ptIdx + 1) / activeTrail.length;
                        const radius = Math.max(1.8, 1.8 + progress * 2.2);

                        return (
                          <circle
                            key={`${sec.id}-pt-${ptIdx}`}
                            cx={px}
                            cy={py}
                            r={radius}
                            fill={color}
                            fillOpacity={0.25 + progress * 0.45}
                          />
                        );
                      })}

                    {/* Head Glowing Aura on Hover / Focus */}
                    {(isFocused || hoveredSector?.id === sec.id) && (
                      <circle
                        cx={headX}
                        cy={headY}
                        r="14"
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        className="animate-spin"
                        style={{ transformOrigin: `${headX}px ${headY}px` }}
                      />
                    )}

                    {/* Head Dot */}
                    <circle
                      cx={headX}
                      cy={headY}
                      r={isFocused ? 6.5 : 5}
                      fill={color}
                      stroke="#000000"
                      strokeWidth="1.5"
                      filter="url(#glow)"
                    />

                    {/* Ticker Label */}
                    {showLabels && (
                      <g>
                        <rect
                          x={headX + 7}
                          y={headY - 11}
                          width={sec.shortName.length * 6 + 10}
                          height="14"
                          rx="3"
                          fill="#06060c"
                          fillOpacity="0.85"
                          stroke={isFocused ? color : '#242436'}
                          strokeWidth="0.8"
                        />
                        <text
                          x={headX + 12}
                          y={headY - 1}
                          fill={isFocused ? '#ffffff' : color}
                          fontSize="8"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {sec.shortName.toUpperCase()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Axis Titles */}
              <text
                x={dimensions.width / 2}
                y={dimensions.height - 8}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="'Press Start 2P', monospace"
                textAnchor="middle"
              >
                RS-Ratio (Trend Strength vs Benchmark)
              </text>
              <text
                x={-dimensions.height / 2}
                y={15}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="'Press Start 2P', monospace"
                textAnchor="middle"
                transform="rotate(-90)"
              >
                RS-Momentum (Velocity)
              </text>
            </svg>
          )}

          {/* Floating Tooltip Box */}
          {hoveredSector && (
            <div
              className="absolute pointer-events-none z-30 bg-[#080812] border-2 border-[#ff3b00] rounded-xl p-3 shadow-2xl space-y-1.5 text-xs text-left max-w-xs"
              style={{
                left: Math.min(dimensions.width - 220, Math.max(10, tooltipPos.x + 15)),
                top: Math.min(dimensions.height - 180, Math.max(10, tooltipPos.y - 40)),
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#1c1c28] pb-1.5">
                <span className="font-pixel text-[10px] text-white">{hoveredSector.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[7px] font-pixel border ${getQuadrantBadge(hoveredSector.quadrant)}`}>
                  {hoveredSector.quadrant}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
                <div className="text-slate-400">RS-Ratio:</div>
                <div className="text-white font-bold tabular-nums">
                  {hoveredSector.currentRsRatio.toFixed(2)}
                  <span className={`text-[9px] ml-1 ${hoveredSector.ratioChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({hoveredSector.ratioChange >= 0 ? '+' : ''}{hoveredSector.ratioChange.toFixed(2)})
                  </span>
                </div>
                <div className="text-slate-400">RS-Momentum:</div>
                <div className="text-white font-bold tabular-nums">
                  {hoveredSector.currentRsMomentum.toFixed(2)}
                  <span className={`text-[9px] ml-1 ${hoveredSector.momentumChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({hoveredSector.momentumChange >= 0 ? '+' : ''}{hoveredSector.momentumChange.toFixed(2)})
                  </span>
                </div>
                <div className="text-slate-400">Center Dist:</div>
                <div className="text-slate-200 tabular-nums">{hoveredSector.distanceFromBenchmark.toFixed(2)} pts</div>
                <div className="text-slate-400">Heading:</div>
                <div className="text-[#bef264] tabular-nums">{hoveredSector.headingAngle}° (Clockwise)</div>
              </div>
            </div>
          )}
        </div>

        {/* Playback Progress Slider (When playing or scrubbing) */}
        {data && (
          <div className="flex items-center gap-3 bg-[#06060c] border border-[#161622] rounded-lg p-2 text-xs">
            <span className="text-slate-400 font-pixel text-[8px] whitespace-nowrap">TIMELINE SCRUB:</span>
            <input
              type="range"
              min="0"
              max={(data.sectors[0]?.trail.length || trailLength) - 1}
              value={playbackIndex !== null ? playbackIndex : (data.sectors[0]?.trail.length || trailLength) - 1}
              onChange={(e) => {
                setIsPlaying(false);
                setPlaybackIndex(parseInt(e.target.value, 10));
              }}
              className="flex-1 accent-[#ff3b00] cursor-pointer"
            />
            <span className="font-mono text-slate-300 text-[10px] tabular-nums whitespace-nowrap">
              {playbackIndex !== null
                ? `Period ${playbackIndex + 1}/${data.sectors[0]?.trail.length || trailLength}`
                : 'Current (Latest)'}
            </span>
          </div>
        )}

      </div>

      {/* 5. SECTOR SELECTION CHIPS & QUICK TOGGLE */}
      <div className="bg-[#050508] border border-[#181824] rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141420] pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#bef264]" />
            <span className="font-pixel text-[9px] text-slate-200">SECTOR CONSTITUENT SELECTOR:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllSectors}
              className="px-2 py-0.5 rounded bg-[#10101c] border border-[#242436] text-[8px] font-pixel text-slate-300 hover:text-white cursor-pointer"
            >
              SELECT ALL
            </button>
            <button
              onClick={deselectAllSectors}
              className="px-2 py-0.5 rounded bg-[#10101c] border border-[#242436] text-[8px] font-pixel text-slate-300 hover:text-white cursor-pointer"
            >
              DESELECT ALL
            </button>
          </div>
        </div>

        {/* Sector Chips */}
        <div className="flex flex-wrap gap-1.5">
          {data?.sectors.map((sec) => {
            const isChecked = selectedSectorIds.has(sec.id);
            const isFocused = highlightedSectorId === sec.id;
            const color = getQuadrantColor(sec.quadrant);

            return (
              <button
                key={sec.id}
                onClick={() => toggleSector(sec.id)}
                onMouseEnter={() => setHighlightedSectorId(sec.id)}
                onMouseLeave={() => setHighlightedSectorId(null)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-mono transition-all cursor-pointer ${
                  isChecked
                    ? isFocused
                      ? 'bg-[#181828] border-white text-white shadow-sm'
                      : 'bg-[#090912] border-[#222234] text-slate-200 hover:border-slate-500'
                    : 'bg-[#030306] border-[#12121c] text-slate-600'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-bold">{sec.shortName}</span>
                <span className="text-[8px] opacity-70">({sec.currentRsRatio.toFixed(1)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. COMPREHENSIVE DATA MATRIX TABLE */}
      <div className="bg-[#050508] border border-[#181824] rounded-xl p-3 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141420] pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ff3b00]" />
            <h3 className="font-pixel text-xs text-white">NSE SECTOR ROTATION MATRIX</h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Sorted by Outperformance (RS-Ratio descending)
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#181824] text-[9px] font-pixel text-slate-500 uppercase">
                <th className="py-2 px-2">SECTOR INDEX</th>
                <th className="py-2 px-2 text-center">QUADRANT</th>
                <th className="py-2 px-2 text-right">RS-RATIO (TREND)</th>
                <th className="py-2 px-2 text-right">RS-MOMENTUM</th>
                <th className="py-2 px-2 text-right">CENTER DIST</th>
                <th className="py-2 px-2 text-right">HEADING</th>
                <th className="py-2 px-2 text-center">ROTATION STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10101a]">
              {data?.sectors
                .slice()
                .sort((a, b) => b.currentRsRatio - a.currentRsRatio)
                .map((sec) => {
                  const isPosRatio = sec.ratioChange >= 0;
                  const isPosMom = sec.momentumChange >= 0;
                  const isFocused = highlightedSectorId === sec.id;

                  return (
                    <tr
                      key={sec.id}
                      onMouseEnter={() => setHighlightedSectorId(sec.id)}
                      onMouseLeave={() => setHighlightedSectorId(null)}
                      className={`hover:bg-[#0a0a14] transition-colors cursor-pointer ${
                        isFocused ? 'bg-[#121220]' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-2.5 px-2 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: getQuadrantColor(sec.quadrant) }}
                          />
                          <span>{sec.name}</span>
                          <span className="text-[9px] text-slate-500 font-normal">({sec.shortName})</span>
                        </div>
                      </td>

                      {/* Quadrant */}
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-pixel border ${getQuadrantBadge(sec.quadrant)}`}>
                          {sec.quadrant.toUpperCase()}
                        </span>
                      </td>

                      {/* RS-Ratio */}
                      <td className="py-2.5 px-2 text-right font-bold tabular-nums text-white">
                        {sec.currentRsRatio.toFixed(2)}
                        <span className={`text-[9px] ml-1 font-normal ${isPosRatio ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPosRatio ? '+' : ''}{sec.ratioChange.toFixed(2)}
                        </span>
                      </td>

                      {/* RS-Momentum */}
                      <td className="py-2.5 px-2 text-right font-bold tabular-nums text-white">
                        {sec.currentRsMomentum.toFixed(2)}
                        <span className={`text-[9px] ml-1 font-normal ${isPosMom ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPosMom ? '+' : ''}{sec.momentumChange.toFixed(2)}
                        </span>
                      </td>

                      {/* Distance */}
                      <td className="py-2.5 px-2 text-right tabular-nums text-slate-300">
                        {sec.distanceFromBenchmark.toFixed(2)} pts
                      </td>

                      {/* Heading Angle */}
                      <td className="py-2.5 px-2 text-right tabular-nums text-[#bef264]">
                        {sec.headingAngle}°
                      </td>

                      {/* Rotation Status */}
                      <td className="py-2.5 px-2 text-center">
                        {sec.previousQuadrant !== sec.quadrant ? (
                          <span className="text-[9px] font-pixel text-[#bef264]">
                            {sec.previousQuadrant} &rarr; {sec.quadrant}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 font-mono">
                            Steady in {sec.quadrant}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
