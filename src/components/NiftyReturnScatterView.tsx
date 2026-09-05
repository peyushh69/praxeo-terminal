import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Info,
  Sliders,
  Maximize2,
  Minimize2,
  Code,
  Download,
  Check,
  ChevronDown,
  Activity,
  Zap,
  ShieldAlert,
  HelpCircle,
  X,
} from 'lucide-react';
import type {
  ScatterMatrixResponse,
  ScatterTimeframe,
  ScatterQuadrant,
  ScatterDataPoint,
  ScatterRegressionMetrics,
  NiftyScatterConstituentItem,
} from '../types';
import { SECTORAL_INDICES } from '../data/sectoralIndices';

export interface BenchmarkChoice {
  id: string;
  name: string;
  shortName: string;
  ticker: string;
  count: number;
  badge: string;
  description: string;
}

export const SCATTER_BENCHMARKS: BenchmarkChoice[] = [
  { id: 'NIFTY_50', name: 'NIFTY 50', shortName: 'NIFTY 50', ticker: '^NSEI', count: 50, badge: 'Large Cap', description: '50 Bluechip Leaders' },
  { id: 'NIFTY_500', name: 'NIFTY 500', shortName: 'NIFTY 500', ticker: '^CRSLDX', count: 50, badge: 'Broad 500', description: 'Broad Market Heavyweights' },
  { id: 'NIFTY_NEXT_50', name: 'NIFTY NEXT 50', shortName: 'NEXT 50', ticker: '^NSMIDCP', count: 50, badge: 'Large Cap', description: '50 Next Large-Cap Bluechips' },
  { id: 'NIFTY_MIDCAP', name: 'NIFTY MIDCAP 100', shortName: 'MIDCAP 100', ticker: '^CRSMID', count: 50, badge: 'Mid Cap', description: '100 Mid-Cap Growth Leaders' },
  { id: 'NIFTY_SMALLCAP', name: 'NIFTY SMALLCAP 100', shortName: 'SMALLCAP 100', ticker: '^CNXSC', count: 50, badge: 'Small Cap', description: '100 High-Beta Small-Cap Momentum' },
];

interface NiftyReturnScatterViewProps {
  onBackToHome: () => void;
}

const TIMEFRAME_OPTIONS: { id: ScatterTimeframe; label: string; shortLabel: string; days: number }[] = [
  { id: '1D', label: '1 Day (1D)', shortLabel: '1D', days: 1 },
  { id: '1W', label: '1 Week (5D)', shortLabel: '5D', days: 5 },
  { id: '1M', label: '1 Month (21D)', shortLabel: '1M', days: 21 },
  { id: '3M', label: '3 Months (63D)', shortLabel: '3M', days: 63 },
  { id: '6M', label: '6 Months (126D)', shortLabel: '6M', days: 126 },
  { id: '1Y', label: '1 Year (252D)', shortLabel: '1Y', days: 252 },
];

const QUADRANT_CONFIG: Record<
  ScatterQuadrant,
  { name: string; subtitle: string; color: string; bgBadge: string; textBadge: string; border: string }
> = {
  leaders: {
    name: 'LEADERS',
    subtitle: 'Dual Outperformers',
    color: '#bef264',
    bgBadge: 'bg-emerald-950/60',
    textBadge: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  reversals: {
    name: 'REVERSALS / BREAKOUTS',
    subtitle: 'Short-Term Strong, Long-Term Lag',
    color: '#38bdf8',
    bgBadge: 'bg-sky-950/60',
    textBadge: 'text-sky-400',
    border: 'border-sky-500/40',
  },
  pullbacks: {
    name: 'PULLBACKS / DIPS',
    subtitle: 'Long-Term Leader, Short-Term Dip',
    color: '#fbbf24',
    bgBadge: 'bg-amber-950/60',
    textBadge: 'text-amber-400',
    border: 'border-amber-500/40',
  },
  laggards: {
    name: 'LAGGARDS',
    subtitle: 'Dual Underperformers',
    color: '#f87171',
    bgBadge: 'bg-rose-950/60',
    textBadge: 'text-rose-400',
    border: 'border-rose-500/40',
  },
};

export const NiftyReturnScatterView: React.FC<NiftyReturnScatterViewProps> = ({ onBackToHome }) => {
  // Timeframe selection (Defaults: Y = 1W / 5D, X = 1M / 21D)
  const [xTimeframe, setXTimeframe] = useState<ScatterTimeframe>('1M');
  const [yTimeframe, setYTimeframe] = useState<ScatterTimeframe>('1W');

  // Raw data from server
  const [data, setData] = useState<ScatterMatrixResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI Interactive States
  const [hoveredPoint, setHoveredPoint] = useState<ScatterDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [colorMode, setColorMode] = useState<'cyan' | 'quadrant'>('cyan');
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  // Dropdown menus
  const [showXDropdown, setShowXDropdown] = useState<boolean>(false);
  const [showYDropdown, setShowYDropdown] = useState<boolean>(false);

  // Responsive mobile mode: 'fit' fits within mobile screen without any horizontal scroll; 'pan' allows wide desktop-grade canvas with smooth swipe
  const [mobileMode, setMobileMode] = useState<'fit' | 'pan'>('fit');
  const [selectedPoint, setSelectedPoint] = useState<ScatterDataPoint | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(1200, Math.max(300, window.innerWidth - 32));
    }
    return 360;
  });

  // ResizeObserver for responsive SVG dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Selected Index Benchmark (Defaults to NIFTY_50 or reads from URL hash)
  const [selectedIndexId, setSelectedIndexId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/index=([A-Za-z0-9_]+)/);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }
    return 'NIFTY_50';
  });

  const activeBenchmarkDef = useMemo(() => {
    const foundBroad = SCATTER_BENCHMARKS.find((b) => b.id === selectedIndexId);
    if (foundBroad) return foundBroad;
    const foundSector = SECTORAL_INDICES.find((s) => s.id === selectedIndexId);
    if (foundSector) {
      return {
        id: foundSector.id,
        name: foundSector.name,
        shortName: foundSector.name.replace('NIFTY ', ''),
        ticker: foundSector.ticker,
        count: foundSector.stocks.length,
        badge: foundSector.category,
        description: `${foundSector.name} Sectoral Matrix`,
      };
    }
    return SCATTER_BENCHMARKS[0];
  }, [selectedIndexId]);

  // Fetch scatter data
  const fetchData = async (targetIndex = selectedIndexId, force = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/scatter?index=${encodeURIComponent(targetIndex)}${force ? '&refresh=true' : ''}`;
      const res = await axios.get(url, { timeout: 25000 });
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        throw new Error(res.data?.error || 'Failed to fetch scatter data');
      }
    } catch (err: any) {
      console.error('Error fetching scatter data:', err);
      setError(err.message || 'Unable to connect to market scatter engine');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchIndex = (newIndexId: string) => {
    if (newIndexId === selectedIndexId && data) return;
    setSelectedIndexId(newIndexId);
    setSelectedSector('ALL');
    setSearchQuery('');
    setSelectedPoint(null);
    window.location.hash = `#scatter?index=${newIndexId}`;
    fetchData(newIndexId, false);
  };

  useEffect(() => {
    fetchData(selectedIndexId, false);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleDocClick = () => {
      setShowXDropdown(false);
      setShowYDropdown(false);
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  // Extract all distinct sectors for filtering
  const sectorsList = useMemo(() => {
    if (!data?.constituents) return [];
    const set = new Set(data.constituents.map((c) => c.sector));
    return ['ALL', ...Array.from(set).sort()];
  }, [data]);

  // Compute processed scatter points based on current X & Y timeframes
  const { points, benchmarkX, benchmarkY, regression, stats, drivers, drags } = useMemo(() => {
    if (!data?.constituents || data.constituents.length === 0) {
      return {
        points: [] as ScatterDataPoint[],
        benchmarkX: 0,
        benchmarkY: 0,
        regression: { slope: 0, intercept: 0, rSquared: 0, correlation: 0, equation: 'y = 0.0000x + 0.0000' },
        stats: { beatingXCount: 0, beatingYCount: 0, total: 0, leadersCount: 0, reversalsCount: 0, pullbacksCount: 0, laggardsCount: 0 },
        drivers: [] as ScatterDataPoint[],
        drags: [] as ScatterDataPoint[],
      };
    }

    const bmX = data.benchmark.returns[xTimeframe] ?? 0;
    const bmY = data.benchmark.returns[yTimeframe] ?? 0;

    // Actual Nifty index start prices for point contribution:
    // Point_Contribution = (Weight / 100) * (Return / 100) * Nifty_Start_Price
    const niftyCurrentPrice = data.benchmark.currentPrice || 24175.65;
    const niftyStartX = (1 + bmX / 100) !== 0 ? niftyCurrentPrice / (1 + bmX / 100) : niftyCurrentPrice;
    const niftyStartY = (1 + bmY / 100) !== 0 ? niftyCurrentPrice / (1 + bmY / 100) : niftyCurrentPrice;

    const computedPoints: ScatterDataPoint[] = data.constituents.map((c: NiftyScatterConstituentItem) => {
      const xRet = c.returns[xTimeframe] ?? 0;
      const yRet = c.returns[yTimeframe] ?? 0;
      const xAlpha = xRet - bmX;
      const yAlpha = yRet - bmY;

      let quadrant: ScatterQuadrant = 'laggards';
      if (xRet >= bmX && yRet >= bmY) quadrant = 'leaders';
      else if (xRet < bmX && yRet >= bmY) quadrant = 'reversals';
      else if (xRet >= bmX && yRet < bmY) quadrant = 'pullbacks';
      else quadrant = 'laggards';

      const pointContribY = (c.weight / 100) * (yRet / 100) * niftyStartY;
      const pointContribX = (c.weight / 100) * (xRet / 100) * niftyStartX;

      return {
        symbol: c.symbol,
        name: c.name,
        sector: c.sector,
        weight: c.weight,
        currentPrice: c.currentPrice,
        xReturn: xRet,
        yReturn: yRet,
        xAlpha,
        yAlpha,
        weightedContribY: pointContribY,
        weightedContribX: pointContribX,
        quadrant,
      };
    });

    // Linear regression (Y on X)
    const n = computedPoints.length;
    const meanX = computedPoints.reduce((acc, p) => acc + p.xReturn, 0) / n;
    const meanY = computedPoints.reduce((acc, p) => acc + p.yReturn, 0) / n;

    let ssXX = 0;
    let ssYY = 0;
    let ssXY = 0;
    for (const p of computedPoints) {
      const dx = p.xReturn - meanX;
      const dy = p.yReturn - meanY;
      ssXX += dx * dx;
      ssYY += dy * dy;
      ssXY += dx * dy;
    }

    let slope = 0;
    let intercept = meanY;
    let rSquared = 0;
    let correlation = 0;

    if (ssXX !== 0) {
      slope = ssXY / ssXX;
      intercept = meanY - slope * meanX;
      let ssRes = 0;
      for (const p of computedPoints) {
        const yPred = slope * p.xReturn + intercept;
        ssRes += (p.yReturn - yPred) ** 2;
      }
      rSquared = ssYY > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssYY)) : 0;
      correlation = Math.sqrt(ssXX * ssYY) > 0 ? ssXY / Math.sqrt(ssXX * ssYY) : 0;
    }

    const regMetrics: ScatterRegressionMetrics = {
      slope,
      intercept,
      rSquared,
      correlation,
      equation: `y = ${slope.toFixed(4)}x + ${intercept >= 0 ? '+' : ''}${intercept.toFixed(4)}`,
    };

    // Breadth & Contributors
    const beatingXCount = computedPoints.filter((p) => p.xReturn > bmX).length;
    const beatingYCount = computedPoints.filter((p) => p.yReturn > bmY).length;

    // Top 3 Drivers & Drags based on weighted contribution on Y-Axis
    const sortedByContrib = [...computedPoints].sort((a, b) => b.weightedContribY - a.weightedContribY);
    const topDrivers = sortedByContrib.slice(0, 3);
    const topDrags = [...sortedByContrib].reverse().slice(0, 3);

    const leadersCount = computedPoints.filter((p) => p.quadrant === 'leaders').length;
    const reversalsCount = computedPoints.filter((p) => p.quadrant === 'reversals').length;
    const pullbacksCount = computedPoints.filter((p) => p.quadrant === 'pullbacks').length;
    const laggardsCount = computedPoints.filter((p) => p.quadrant === 'laggards').length;

    return {
      points: computedPoints,
      benchmarkX: bmX,
      benchmarkY: bmY,
      regression: regMetrics,
      stats: {
        beatingXCount,
        beatingYCount,
        total: n,
        leadersCount,
        reversalsCount,
        pullbacksCount,
        laggardsCount,
      },
      drivers: topDrivers,
      drags: topDrags,
    };
  }, [data, xTimeframe, yTimeframe]);

  // Filtered points by sector & search query
  const displayedPoints = useMemo(() => {
    return points.filter((p) => {
      const matchSector = selectedSector === 'ALL' || p.sector === selectedSector;
      const matchQuery =
        !searchQuery ||
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchQuery;
    });
  }, [points, selectedSector, searchQuery]);

  // Responsive layout measurements
  const isMobile = containerWidth < 640;
  const activeCanvasWidth = isMobile && mobileMode === 'pan' ? Math.max(680, containerWidth) : containerWidth;

  // Responsive padding & height to prevent any clipping on phone screens
  const padding = isMobile
    ? { top: 26, right: 16, bottom: 42, left: 44 }
    : { top: 40, right: 35, bottom: 52, left: 62 };

  const chartHeight = isMobile
    ? (mobileMode === 'pan' ? 440 : Math.min(460, Math.max(330, Math.round(activeCanvasWidth * 0.95))))
    : 540;

  const plotWidth = Math.max(140, activeCanvasWidth - padding.left - padding.right);
  const plotHeight = Math.max(160, chartHeight - padding.top - padding.bottom);

  const { xMin, xMax, yMin, yMax, xTicks, yTicks } = useMemo(() => {
    if (points.length === 0) {
      return { xMin: -10, xMax: 10, yMin: -10, yMax: 10, xTicks: [-10, -5, 0, 5, 10], yTicks: [-10, -5, 0, 5, 10] };
    }

    const allX = points.map((p) => p.xReturn).concat([benchmarkX]);
    const allY = points.map((p) => p.yReturn).concat([benchmarkY]);

    let minX = Math.min(...allX);
    let maxX = Math.max(...allX);
    let minY = Math.min(...allY);
    let maxY = Math.max(...allY);

    // Add 15% margin
    const xSpan = Math.max(2, maxX - minX);
    const ySpan = Math.max(2, maxY - minY);
    minX -= xSpan * 0.12;
    maxX += xSpan * 0.12;
    minY -= ySpan * 0.12;
    maxY += ySpan * 0.12;

    // Generate neat ticks
    const makeTicks = (minVal: number, maxVal: number, count = 7) => {
      const step = (maxVal - minVal) / (count - 1);
      const ticks: number[] = [];
      for (let i = 0; i < count; i++) {
        ticks.push(minVal + step * i);
      }
      return ticks;
    };

    const tickCount = isMobile && mobileMode === 'fit' ? 5 : 7;

    return {
      xMin: minX,
      xMax: maxX,
      yMin: minY,
      yMax: maxY,
      xTicks: makeTicks(minX, maxX, tickCount),
      yTicks: makeTicks(minY, maxY, tickCount),
    };
  }, [points, benchmarkX, benchmarkY, isMobile, mobileMode]);

  // Coordinate conversion functions
  const scaleX = (val: number) => {
    const ratio = (val - xMin) / (xMax - xMin);
    return padding.left + ratio * plotWidth;
  };

  const scaleY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  // Regression line coordinates across X domain
  const regressionStart = {
    x: scaleX(xMin),
    y: scaleY(regression.slope * xMin + regression.intercept),
  };
  const regressionEnd = {
    x: scaleX(xMax),
    y: scaleY(regression.slope * xMax + regression.intercept),
  };

  // Handle dot hover & tap/touch
  const handleDotMouseEnter = (p: ScatterDataPoint, e: React.MouseEvent) => {
    setHoveredPoint(p);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleDotClick = (p: ScatterDataPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPoint((prev) => (prev?.symbol === p.symbol ? null : p));
    setHoveredPoint(p);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleDotMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleDotMouseLeave = () => {
    setHoveredPoint(null);
  };

  const currentXOption = TIMEFRAME_OPTIONS.find((t) => t.id === xTimeframe) || TIMEFRAME_OPTIONS[2];
  const currentYOption = TIMEFRAME_OPTIONS.find((t) => t.id === yTimeframe) || TIMEFRAME_OPTIONS[1];

  const sampleTickers = useMemo(() => {
    if (!data?.constituents || data.constituents.length === 0) {
      return ['"RELIANCE.NS"', '"TCS.NS"', '"HDFCBANK.NS"', '"INFY.NS"'];
    }
    return data.constituents.slice(0, 8).map((c) => `"${c.ticker}"`);
  }, [data]);

  const pythonScriptContent = `#!/usr/bin/env python3
"""
${data?.benchmark.symbol || activeBenchmarkDef.name} CROSS-SECTIONAL RETURN SCATTER & ALPHA ANALYSIS
================================================================================
Koyfin-Style Quantitative Script for ${data?.benchmark.symbol || activeBenchmarkDef.name} constituents.
"""
import numpy as np
import pandas as pd
import yfinance as yf

# 1. Tickers (${data?.benchmark.symbol || activeBenchmarkDef.name})
TICKERS = ["${data?.benchmark.ticker || activeBenchmarkDef.ticker}", ${sampleTickers.join(', ')}]

# 2. Download Data
data = yf.download(TICKERS, period="1y", interval="1d")['Adj Close'].dropna()

# 3. Compute Returns
x_days, y_days = ${currentXOption.days}, ${currentYOption.days}  # ${currentXOption.label} vs ${currentYOption.label}
benchmark_ticker = "${data?.benchmark.ticker || activeBenchmarkDef.ticker}"
returns_x = (data.iloc[-1] - data.iloc[-x_days-1]) / data.iloc[-x_days-1] * 100
returns_y = (data.iloc[-1] - data.iloc[-y_days-1]) / data.iloc[-y_days-1] * 100

# 4. Linear Regression
x_vals = returns_x.drop(benchmark_ticker).values
y_vals = returns_y.drop(benchmark_ticker).values
slope, intercept = np.polyfit(x_vals, y_vals, 1)
r_sq = np.corrcoef(x_vals, y_vals)[0, 1] ** 2

print(f"Regression: y = {slope:.4f}x + {intercept:.4f} | R² = {r_sq:.4f}")
`;

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-mono select-none flex flex-col">
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <div className="border-b border-[#181a24] bg-[#07070c] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              id="btn-scatter-back-home"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1018] border border-[#222536] hover:border-[#00e5ff] text-slate-300 hover:text-white text-xs tracking-wider transition-all cursor-pointer group shadow-sm"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00e5ff] group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-pixel text-[10px]">HOME</span>
            </button>

            <div className="h-5 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse" />
              <div>
                <h1 className="font-pixel text-xs sm:text-sm text-white tracking-wider flex items-center gap-2">
                  <span>{data?.benchmark.symbol || activeBenchmarkDef.name} RETURN SCATTER</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/30 font-pixel">
                    KOYFIN-STYLE
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                  End-of-Day Relative Outperformance Matrix &amp; Linear Regression
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions / Script & Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScriptModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0e1018] border border-[#222536] hover:border-[#00e5ff] text-slate-300 hover:text-[#00e5ff] text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              title="View Python Quant Script"
            >
              <Code className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span className="hidden sm:inline font-pixel text-[9px]">PYTHON SCRIPT</span>
            </button>

            <button
              onClick={() => fetchData(selectedIndexId, true)}
              disabled={loading}
              className="p-1.5 rounded-lg bg-[#0e1018] border border-[#222536] hover:border-[#00e5ff] text-slate-300 hover:text-[#00e5ff] transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh EOD Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00e5ff]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. INDEX BENCHMARK SWITCHER (Nifty 50, Nifty 500, Next 50, Midcap 100, Smallcap 100 + Sectors) */}
      <div className="border-b border-[#141824] bg-[#070912] px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Index Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <span className="text-[10px] font-pixel text-[#00e5ff] mr-1 hidden sm:inline flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#00e5ff]" />
              <span>INDEX:</span>
            </span>
            {SCATTER_BENCHMARKS.map((bm) => {
              const isActive = selectedIndexId === bm.id;
              return (
                <button
                  key={bm.id}
                  id={`btn-scatter-index-${bm.id.toLowerCase()}`}
                  onClick={() => handleSwitchIndex(bm.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-pixel tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#00e5ff] text-black font-bold shadow-md shadow-[#00e5ff]/20'
                      : 'bg-[#0e121d] text-slate-300 hover:text-white hover:bg-[#151b2a] border border-[#1e2538]'
                  }`}
                  title={bm.description}
                >
                  <span>{bm.shortName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[8px] font-mono ${
                      isActive ? 'bg-black/25 text-black font-bold' : 'bg-[#080b12] text-slate-400'
                    }`}
                  >
                    {bm.count}
                  </span>
                </button>
              );
            })}

            {/* Other Sectoral Indices Dropdown */}
            <div className="relative">
              <select
                value={SCATTER_BENCHMARKS.some((b) => b.id === selectedIndexId) ? '' : selectedIndexId}
                onChange={(e) => {
                  if (e.target.value) handleSwitchIndex(e.target.value);
                }}
                className="bg-[#0e121d] text-slate-300 hover:text-white border border-[#1e2538] rounded-lg px-2.5 py-1.5 text-xs font-pixel tracking-wider cursor-pointer focus:outline-none focus:border-[#00e5ff]"
              >
                <option value="" disabled>
                  MORE SECTORS...
                </option>
                {SECTORAL_INDICES.filter(
                  (s) => !SCATTER_BENCHMARKS.some((b) => b.id === s.id)
                ).map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0d111c] text-white">
                    {s.name} ({s.stocks.length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Index Info Pill */}
          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-[#0b0e17] px-2.5 py-1 rounded border border-[#181f30]">
            <span className="text-[#00e5ff] font-pixel">BENCHMARK:</span>
            <span className="text-white font-bold">{data?.benchmark.symbol || activeBenchmarkDef.name}</span>
            <span className="text-slate-600 font-mono">({data?.benchmark.ticker || activeBenchmarkDef.ticker})</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{data?.constituents.length || activeBenchmarkDef.count} stocks</span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC CONTROLS & TIMEFRAME TOOLBAR */}
      <div className="border-b border-[#141620] bg-[#05060a] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Axis Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Y-Axis Selector */}
            <div className="flex items-center gap-1.5 bg-[#0a0d16] border border-[#1e2333] rounded-lg px-2.5 py-1 text-xs relative">
              <span className="text-[10px] font-pixel text-[#00e5ff]">Y-AXIS (SHORT):</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowYDropdown(!showYDropdown);
                  setShowXDropdown(false);
                }}
                className="font-bold text-white flex items-center gap-1 hover:text-[#00e5ff] cursor-pointer"
              >
                <span>{currentYOption.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showYDropdown && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-1 w-44 bg-[#0d111c] border border-[#272e42] rounded-lg shadow-xl z-50 py-1"
                >
                  {TIMEFRAME_OPTIONS.map((opt) => (
                    <button
                      key={`y-${opt.id}`}
                      onClick={() => {
                        setYTimeframe(opt.id);
                        setShowYDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs font-mono flex items-center justify-between hover:bg-[#182033] ${
                        yTimeframe === opt.id ? 'text-[#00e5ff] font-bold bg-[#141a29]' : 'text-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {yTimeframe === opt.id && <Check className="w-3.5 h-3.5 text-[#00e5ff]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* X-Axis Selector */}
            <div className="flex items-center gap-1.5 bg-[#0a0d16] border border-[#1e2333] rounded-lg px-2.5 py-1 text-xs relative">
              <span className="text-[10px] font-pixel text-[#bef264]">X-AXIS (LONG):</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowXDropdown(!showXDropdown);
                  setShowYDropdown(false);
                }}
                className="font-bold text-white flex items-center gap-1 hover:text-[#bef264] cursor-pointer"
              >
                <span>{currentXOption.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showXDropdown && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-1 w-44 bg-[#0d111c] border border-[#272e42] rounded-lg shadow-xl z-50 py-1"
                >
                  {TIMEFRAME_OPTIONS.map((opt) => (
                    <button
                      key={`x-${opt.id}`}
                      onClick={() => {
                        setXTimeframe(opt.id);
                        setShowXDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs font-mono flex items-center justify-between hover:bg-[#182033] ${
                        xTimeframe === opt.id ? 'text-[#bef264] font-bold bg-[#141a29]' : 'text-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {xTimeframe === opt.id && <Check className="w-3.5 h-3.5 text-[#bef264]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Benchmark Values pill */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] bg-[#0c0f18] px-3 py-1 rounded-lg border border-[#1b2030] text-slate-400">
              <span className="font-pixel text-[9px] text-white">{data?.benchmark.symbol || activeBenchmarkDef.name}:</span>
              <span className="text-slate-300">
                X ({currentXOption.shortLabel}):{' '}
                <strong className={benchmarkX >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {benchmarkX >= 0 ? '+' : ''}
                  {benchmarkX.toFixed(2)}%
                </strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">
                Y ({currentYOption.shortLabel}):{' '}
                <strong className={benchmarkY >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {benchmarkY >= 0 ? '+' : ''}
                  {benchmarkY.toFixed(2)}%
                </strong>
              </span>
            </div>
          </div>

          {/* Sector Filter & Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sector Dropdown */}
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-[#0c0f18] border border-[#1b2030] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#00e5ff] cursor-pointer"
              >
                {sectorsList.map((sec) => (
                  <option key={sec} value={sec} className="bg-[#0d111c] text-slate-200">
                    {sec === 'ALL' ? 'ALL SECTORS' : sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-36">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2.5" />
              <input
                type="text"
                placeholder="Search stock..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c0f18] border border-[#1b2030] rounded-lg pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
              />
            </div>

            {/* Labels toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-1 rounded text-[10px] font-pixel border transition-all cursor-pointer ${
                showLabels
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/50'
                  : 'bg-[#0a0d16] text-slate-500 border-[#1c2233]'
              }`}
              title="Toggle stock ticker labels"
            >
              LABELS
            </button>

            {/* Color mode toggle */}
            <button
              onClick={() => setColorMode(colorMode === 'cyan' ? 'quadrant' : 'cyan')}
              className={`px-2 py-1 rounded text-[10px] font-pixel border transition-all cursor-pointer ${
                colorMode === 'quadrant'
                  ? 'bg-[#bef264]/20 text-[#bef264] border-[#bef264]/50'
                  : 'bg-[#0a0d16] text-[#00e5ff] border-[#00e5ff]/40'
              }`}
              title="Switch between Classic Cyan or Quadrant Colors"
            >
              {colorMode === 'cyan' ? 'KOYFIN CYAN' : 'QUADRANT'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex-1 flex flex-col space-y-4">
        {/* Loading / Error States */}
        {loading && !data && (
          <div className="flex-1 min-h-[450px] flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#00e5ff] animate-spin" />
            <p className="font-pixel text-xs text-slate-300 tracking-wider">
              CALCULATING {activeBenchmarkDef.name} CROSS-SECTIONAL MATRIX...
            </p>
            <p className="text-[11px] text-slate-500 font-mono">Fetching {activeBenchmarkDef.count} constituents EOD closes & regression</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-[#1c0808] border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchData(selectedIndexId, true)}
              className="px-3 py-1 rounded bg-rose-900 text-white font-pixel text-[10px]"
            >
              RETRY
            </button>
          </div>
        )}

        {/* 4. THE KOYFIN-STYLE SCATTER PLOT DISPLAY */}
        {data && (
          <div className="bg-[#05060b] border border-[#161a27] rounded-xl p-3 sm:p-4 shadow-2xl relative flex flex-col">
            {/* Chart Top Header (Title + Linear Regression Formula in top right corner) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#141824] mb-2 px-1">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Sliders className="w-4 h-4 text-[#00e5ff] flex-shrink-0" />
                  <h2 className="font-pixel text-[11px] sm:text-xs text-white tracking-wide truncate">
                    {data?.benchmark.symbol || activeBenchmarkDef.name} {currentXOption.shortLabel} VS {currentYOption.shortLabel} RETURNS
                  </h2>
                </div>
              </div>

              {/* Exact Linear Regression Equation displayed like uploaded image */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#0a0d17] px-2.5 py-1 rounded border border-[#1c2234] text-[10px] sm:text-[11px]">
                <span className="text-slate-300 font-mono font-bold tracking-wider">
                  {regression.equation}
                </span>
                <span className="text-slate-600 hidden xs:inline">|</span>
                <span className="font-mono text-slate-300">
                  R² = <strong className="text-[#00e5ff]">{regression.rSquared.toFixed(4)}</strong>
                </span>
                <span className="text-slate-600 hidden xs:inline">|</span>
                <span className="font-mono text-slate-300">
                  r = <strong className="text-[#bef264]">{regression.correlation.toFixed(3)}</strong>
                </span>
              </div>
            </div>

            {/* Mobile Viewport Mode Switcher & Pan Guide (Only shown on mobile devices) */}
            {isMobile && (
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#131724] text-[9px] font-pixel">
                <span className="text-slate-400">PHONE DISPLAY:</span>
                <div className="flex items-center gap-1 bg-[#0a0d17] p-0.5 rounded border border-[#1d2438]">
                  <button
                    onClick={() => setMobileMode('fit')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      mobileMode === 'fit'
                        ? 'bg-[#00e5ff] text-black font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    FIT SCREEN
                  </button>
                  <button
                    onClick={() => setMobileMode('pan')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      mobileMode === 'pan'
                        ? 'bg-[#bef264] text-black font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    PAN ↔ (WIDE)
                  </button>
                </div>
              </div>
            )}
            {isMobile && mobileMode === 'pan' && (
              <div className="text-[9px] font-mono text-[#bef264] pb-1 text-center animate-pulse">
                ↔ Swipe horizontally left/right to pan wide chart
              </div>
            )}

            {/* Interactive SVG Chart Container with smooth horizontal scroll when in PAN mode */}
            <div
              ref={containerRef}
              className={`w-full relative select-none bg-[#030408] rounded-lg border border-[#0f131d] ${
                isMobile && mobileMode === 'pan' ? 'overflow-x-auto scrollbar-thin' : 'overflow-hidden'
              }`}
              style={{ minHeight: `${chartHeight}px` }}
              onMouseMove={handleDotMouseMove}
              onClick={() => {
                setSelectedPoint(null);
              }}
            >
              <svg
                width={activeCanvasWidth}
                height={chartHeight}
                viewBox={`0 0 ${activeCanvasWidth} ${chartHeight}`}
                className="block cursor-crosshair"
                style={{ minWidth: isMobile && mobileMode === 'pan' ? '680px' : '100%' }}
              >
                <defs>
                  {/* Subtle Grid Pattern */}
                  <linearGradient id="cyanDotGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#0088ff" stopOpacity="0.8" />
                  </linearGradient>

                  <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Plot Background Area */}
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={plotWidth}
                  height={plotHeight}
                  fill="#030407"
                />

                {/* 4 Quadrant Background Tints */}
                {/* Top-Right: Leaders */}
                <rect
                  x={scaleX(benchmarkX)}
                  y={padding.top}
                  width={Math.max(0, padding.left + plotWidth - scaleX(benchmarkX))}
                  height={Math.max(0, scaleY(benchmarkY) - padding.top)}
                  fill="rgba(190, 242, 100, 0.025)"
                />
                {/* Top-Left: Reversals */}
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={Math.max(0, scaleX(benchmarkX) - padding.left)}
                  height={Math.max(0, scaleY(benchmarkY) - padding.top)}
                  fill="rgba(56, 189, 248, 0.025)"
                />
                {/* Bottom-Right: Pullbacks */}
                <rect
                  x={scaleX(benchmarkX)}
                  y={scaleY(benchmarkY)}
                  width={Math.max(0, padding.left + plotWidth - scaleX(benchmarkX))}
                  height={Math.max(0, padding.top + plotHeight - scaleY(benchmarkY))}
                  fill="rgba(251, 191, 36, 0.025)"
                />
                {/* Bottom-Left: Laggards */}
                <rect
                  x={padding.left}
                  y={scaleY(benchmarkY)}
                  width={Math.max(0, scaleX(benchmarkX) - padding.left)}
                  height={Math.max(0, padding.top + plotHeight - scaleY(benchmarkY))}
                  fill="rgba(248, 113, 113, 0.025)"
                />

                {/* Quadrant Watermark Badges in 4 corners */}
                {/* Top-Right: Leaders */}
                <text
                  x={padding.left + plotWidth - (isMobile ? 6 : 12)}
                  y={padding.top + (isMobile ? 16 : 22)}
                  textAnchor="end"
                  className={`font-pixel ${isMobile ? 'text-[7.5px]' : 'text-[9px]'} fill-emerald-400/60 select-none pointer-events-none tracking-wider font-bold`}
                >
                  {isMobile ? 'LEADERS' : 'LEADERS (DUAL OUTPERFORMERS)'}
                </text>
                {/* Top-Left: Reversals */}
                <text
                  x={padding.left + (isMobile ? 6 : 12)}
                  y={padding.top + (isMobile ? 16 : 22)}
                  textAnchor="start"
                  className={`font-pixel ${isMobile ? 'text-[7.5px]' : 'text-[9px]'} fill-sky-400/60 select-none pointer-events-none tracking-wider font-bold`}
                >
                  {isMobile ? 'REVERSALS' : 'REVERSALS / BREAKOUTS (SHORT-TERM STRONG)'}
                </text>
                {/* Bottom-Right: Pullbacks */}
                <text
                  x={padding.left + plotWidth - (isMobile ? 6 : 12)}
                  y={padding.top + plotHeight - (isMobile ? 8 : 12)}
                  textAnchor="end"
                  className={`font-pixel ${isMobile ? 'text-[7.5px]' : 'text-[9px]'} fill-amber-400/60 select-none pointer-events-none tracking-wider font-bold`}
                >
                  {isMobile ? 'PULLBACKS' : 'PULLBACKS / DIPS (LONG-TERM LEADERS)'}
                </text>
                {/* Bottom-Left: Laggards */}
                <text
                  x={padding.left + (isMobile ? 6 : 12)}
                  y={padding.top + plotHeight - (isMobile ? 8 : 12)}
                  textAnchor="start"
                  className={`font-pixel ${isMobile ? 'text-[7.5px]' : 'text-[9px]'} fill-rose-400/60 select-none pointer-events-none tracking-wider font-bold`}
                >
                  {isMobile ? 'LAGGARDS' : 'LAGGARDS (DUAL UNDERPERFORMERS)'}
                </text>

                {/* Vertical Grid Lines & X-Axis Ticks */}
                {xTicks.map((val, idx) => {
                  const x = scaleX(val);
                  return (
                    <g key={`xtick-${idx}`}>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={padding.top + plotHeight}
                        stroke="#131722"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={padding.top + plotHeight + (isMobile ? 14 : 20)}
                        textAnchor="middle"
                        className={`font-mono ${isMobile ? 'text-[8.5px]' : 'text-[10px]'} fill-slate-500 select-none`}
                      >
                        {val.toFixed(1)}%
                      </text>
                    </g>
                  );
                })}

                {/* Horizontal Grid Lines & Y-Axis Ticks */}
                {yTicks.map((val, idx) => {
                  const y = scaleY(val);
                  return (
                    <g key={`ytick-${idx}`}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + plotWidth}
                        y2={y}
                        stroke="#131722"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - (isMobile ? 5 : 10)}
                        y={y + (isMobile ? 2.5 : 3.5)}
                        textAnchor="end"
                        className={`font-mono ${isMobile ? 'text-[8.5px]' : 'text-[10px]'} fill-slate-500 select-none`}
                      >
                        {val.toFixed(1)}%
                      </text>
                    </g>
                  );
                })}

                {/* 0.00% Zero Reference Lines if within domain */}
                {xMin <= 0 && xMax >= 0 && (
                  <line
                    x1={scaleX(0)}
                    y1={padding.top}
                    x2={scaleX(0)}
                    y2={padding.top + plotHeight}
                    stroke="#222838"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
                {yMin <= 0 && yMax >= 0 && (
                  <line
                    x1={padding.left}
                    y1={scaleY(0)}
                    x2={padding.left + plotWidth}
                    y2={scaleY(0)}
                    stroke="#222838"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Vertical Benchmark Line (X-Axis: Long-Term Nifty Return) */}
                <g>
                  <line
                    x1={scaleX(benchmarkX)}
                    y1={padding.top}
                    x2={scaleX(benchmarkX)}
                    y2={padding.top + plotHeight}
                    stroke="#bef264"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    opacity="0.85"
                  />
                  {/* Benchmark X Tag at bottom (safely clamped within SVG canvas) */}
                  {(() => {
                    const rawBx = scaleX(benchmarkX);
                    const tagW = isMobile ? 66 : 90;
                    const tagH = isMobile ? 16 : 18;
                    const tagX = Math.max(padding.left, Math.min(padding.left + plotWidth - tagW, rawBx - tagW / 2));
                    const tagY = padding.top + plotHeight + (isMobile ? 20 : 28);
                    return (
                      <g>
                        <rect
                          x={tagX}
                          y={tagY}
                          width={tagW}
                          height={tagH}
                          rx="3"
                          fill="#0a1205"
                          stroke="#bef264"
                          strokeWidth="1"
                        />
                        <text
                          x={tagX + tagW / 2}
                          y={tagY + (isMobile ? 11 : 13)}
                          textAnchor="middle"
                          className={`font-pixel ${isMobile ? 'text-[7px]' : 'text-[8px]'} fill-[#bef264] font-bold`}
                        >
                          NIFTY: {benchmarkX >= 0 ? '+' : ''}{benchmarkX.toFixed(isMobile ? 1 : 2)}%
                        </text>
                      </g>
                    );
                  })()}
                </g>

                {/* Horizontal Benchmark Line (Y-Axis: Short-Term Nifty Return) */}
                <g>
                  <line
                    x1={padding.left}
                    y1={scaleY(benchmarkY)}
                    x2={padding.left + plotWidth}
                    y2={scaleY(benchmarkY)}
                    stroke="#00e5ff"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    opacity="0.85"
                  />
                  {/* Benchmark Y Tag on Left Edge (safely clamped inside boundary) */}
                  {(() => {
                    const rawBy = scaleY(benchmarkY);
                    const yTagW = isMobile ? 38 : 58;
                    const yTagH = isMobile ? 15 : 18;
                    const yTagX = Math.max(2, padding.left - yTagW - 3);
                    return (
                      <g>
                        <rect
                          x={yTagX}
                          y={rawBy - yTagH / 2}
                          width={yTagW}
                          height={yTagH}
                          rx="3"
                          fill="#03141a"
                          stroke="#00e5ff"
                          strokeWidth="1"
                        />
                        <text
                          x={yTagX + yTagW / 2}
                          y={rawBy + (isMobile ? 3 : 3.5)}
                          textAnchor="middle"
                          className={`font-pixel ${isMobile ? 'text-[6.5px]' : 'text-[8px]'} fill-[#00e5ff] font-bold`}
                        >
                          {benchmarkY >= 0 ? '+' : ''}{benchmarkY.toFixed(1)}%
                        </text>
                      </g>
                    );
                  })()}
                </g>

                {/* Best-Fit Linear Regression Line */}
                <line
                  x1={regressionStart.x}
                  y1={regressionStart.y}
                  x2={regressionEnd.x}
                  y2={regressionEnd.y}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeOpacity="0.75"
                />

                {/* Scatter Bubbles (Nifty 50 Constituents) */}
                {displayedPoints.map((p) => {
                  const cx = scaleX(p.xReturn);
                  const cy = scaleY(p.yReturn);

                  // Bubble radius proportional to Nifty 50 free-float weight (0.5% ~ 4px, 12% ~ 14px)
                  const radius = isMobile
                    ? Math.max(3.5, Math.min(11, 2.5 + Math.sqrt(p.weight) * 2.2))
                    : Math.max(4, Math.min(15, 3.5 + Math.sqrt(p.weight) * 3.1));

                  // Color selection
                  let fillColor = '#00e5ff';
                  let strokeColor = '#38bdf8';
                  if (colorMode === 'quadrant') {
                    fillColor = QUADRANT_CONFIG[p.quadrant].color;
                    strokeColor = QUADRANT_CONFIG[p.quadrant].color;
                  }

                  const isHovered = hoveredPoint?.symbol === p.symbol;
                  const isSelected = selectedPoint?.symbol === p.symbol;
                  const isActive = isHovered || isSelected;

                  return (
                    <g
                      key={p.symbol}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={(e) => handleDotMouseEnter(p, e)}
                      onMouseLeave={handleDotMouseLeave}
                      onClick={(e) => handleDotClick(p, e)}
                    >
                      {/* Outer Glow Halo on Hover or Select */}
                      {isActive && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius + (isMobile ? 4 : 6)}
                          fill={fillColor}
                          opacity="0.35"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Scatter Bubble */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? radius + 2 : radius}
                        fill={fillColor}
                        stroke="#030408"
                        strokeWidth={isActive ? 2 : 1.5}
                        opacity={isActive ? 1 : 0.85}
                        className="transition-all duration-150"
                      />

                      {/* Stock Ticker Label next to dot (Koyfin style) */}
                      {showLabels && (
                        <text
                          x={cx + radius + (isMobile ? 2 : 3)}
                          y={cy + 3}
                          className={`font-mono ${isMobile ? 'text-[8px]' : 'text-[9px]'} select-none pointer-events-none font-bold tracking-tight ${
                            isActive
                              ? 'fill-white font-extrabold text-[10px]'
                              : 'fill-slate-400 opacity-80'
                          }`}
                        >
                          {p.symbol}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Axis Labels */}
                {/* X-Axis Title */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={chartHeight - (isMobile ? 4 : 8)}
                  textAnchor="middle"
                  className={`font-pixel ${isMobile ? 'text-[8px]' : 'text-[10px]'} fill-slate-300 tracking-wider`}
                >
                  {isMobile ? `TOTAL RETURN % (${currentXOption.shortLabel})` : `TOTAL RETURN % (${currentXOption.label.toUpperCase()})`}
                </text>

                {/* Y-Axis Title */}
                <text
                  transform={`rotate(-90)`}
                  x={-(padding.top + plotHeight / 2)}
                  y={isMobile ? 12 : 18}
                  textAnchor="middle"
                  className={`font-pixel ${isMobile ? 'text-[8px]' : 'text-[10px]'} fill-slate-300 tracking-wider`}
                >
                  {isMobile ? `TOTAL RETURN % (${currentYOption.shortLabel})` : `TOTAL RETURN % (${currentYOption.label.toUpperCase()})`}
                </text>

                {/* Subtle Prexios Brand Watermark in bottom right corner */}
                <text
                  x={padding.left + plotWidth - 10}
                  y={padding.top + plotHeight - (isMobile ? 20 : 32)}
                  textAnchor="end"
                  className="font-pixel text-[10px] fill-slate-700/60 select-none pointer-events-none"
                >
                  Prexios Terminal
                </text>
              </svg>

              {/* Hover Tooltip (High-Precision HUD Card) */}
              {hoveredPoint && !selectedPoint && (
                <div
                  className="absolute z-50 pointer-events-none bg-[#0a0d18]/95 border border-[#27324d] rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[240px] text-left transform -translate-x-1/2 -translate-y-full mb-3"
                  style={{
                    left: `${Math.max(125, Math.min(activeCanvasWidth - 125, tooltipPos.x))}px`,
                    top: `${Math.max(160, tooltipPos.y - 14)}px`,
                  }}
                >
                  {/* Tooltip Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#1b2234] mb-2">
                    <div>
                      <div className="font-pixel text-xs text-white font-bold tracking-wider">
                        {hoveredPoint.symbol}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                        {hoveredPoint.name}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-pixel border ${
                        QUADRANT_CONFIG[hoveredPoint.quadrant].bgBadge
                      } ${QUADRANT_CONFIG[hoveredPoint.quadrant].textBadge} ${
                        QUADRANT_CONFIG[hoveredPoint.quadrant].border
                      }`}
                    >
                      {QUADRANT_CONFIG[hoveredPoint.quadrant].name.split(' ')[0]}
                    </span>
                  </div>

                  {/* Return Metrics */}
                  <div className="space-y-1.5 text-[11px] font-mono">
                    {/* Short-Term Y Return vs Nifty */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{currentYOption.shortLabel} Return (Y):</span>
                      <span
                        className={`font-bold ${
                          hoveredPoint.yReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {hoveredPoint.yReturn >= 0 ? '+' : ''}
                        {hoveredPoint.yReturn.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>vs {data?.benchmark.symbol || 'Index'} {currentYOption.shortLabel}:</span>
                      <span
                        className={hoveredPoint.yAlpha >= 0 ? 'text-[#bef264]' : 'text-rose-400'}
                      >
                        {hoveredPoint.yAlpha >= 0 ? 'Outperforming +' : 'Lagging '}
                        {hoveredPoint.yAlpha.toFixed(2)}%
                      </span>
                    </div>

                    <div className="h-px bg-[#192133] my-1" />

                    {/* Long-Term X Return vs Index */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{currentXOption.shortLabel} Return (X):</span>
                      <span
                        className={`font-bold ${
                          hoveredPoint.xReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {hoveredPoint.xReturn >= 0 ? '+' : ''}
                        {hoveredPoint.xReturn.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>vs {data?.benchmark.symbol || 'Index'} {currentXOption.shortLabel}:</span>
                      <span
                        className={hoveredPoint.xAlpha >= 0 ? 'text-[#bef264]' : 'text-rose-400'}
                      >
                        {hoveredPoint.xAlpha >= 0 ? 'Outperforming +' : 'Lagging '}
                        {hoveredPoint.xAlpha.toFixed(2)}%
                      </span>
                    </div>

                    <div className="h-px bg-[#192133] my-1" />

                    {/* Weight & Sector */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Index Weight:</span>
                      <span className="text-[#00e5ff] font-bold">
                        {hoveredPoint.weight.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Point Contrib ({currentYOption.shortLabel}):</span>
                      <span
                        className={`font-bold ${
                          hoveredPoint.weightedContribY >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {hoveredPoint.weightedContribY >= 0 ? '+' : ''}
                        {hoveredPoint.weightedContribY.toFixed(1)} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Sector:</span>
                      <span className="text-slate-300 font-mono text-[9px]">
                        {hoveredPoint.sector}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Price:</span>
                      <span className="text-white font-bold">
                        ₹{hoveredPoint.currentPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile / Tap Selected Stock Inspection HUD Card */}
            {selectedPoint && (
              <div className="mt-3 bg-[#080b15] border border-[#232e48] rounded-xl p-3 shadow-2xl relative">
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="absolute top-2.5 right-2.5 p-1 rounded bg-[#101626] text-slate-400 hover:text-white border border-[#232e48] cursor-pointer"
                  title="Close inspector"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 pb-2 border-b border-[#182033] mb-2 pr-7">
                  <div>
                    <div className="font-pixel text-xs text-white font-bold flex items-center gap-1.5">
                      <span>{selectedPoint.symbol}</span>
                      <span className="text-[10px] font-mono text-slate-400">({selectedPoint.sector})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{selectedPoint.name}</div>
                  </div>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded text-[8px] font-pixel border ${
                      QUADRANT_CONFIG[selectedPoint.quadrant].bgBadge
                    } ${QUADRANT_CONFIG[selectedPoint.quadrant].textBadge} ${
                      QUADRANT_CONFIG[selectedPoint.quadrant].border
                    }`}
                  >
                    {QUADRANT_CONFIG[selectedPoint.quadrant].name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className="bg-[#0c101c] p-2 rounded border border-[#1a2338]">
                    <div className="text-slate-400 text-[9px]">{currentYOption.shortLabel} Return (Y)</div>
                    <div className={`font-bold text-sm ${selectedPoint.yReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedPoint.yReturn >= 0 ? '+' : ''}{selectedPoint.yReturn.toFixed(2)}%
                    </div>
                    <div className={`text-[8.5px] ${selectedPoint.yAlpha >= 0 ? 'text-[#bef264]' : 'text-rose-400'}`}>
                      {selectedPoint.yAlpha >= 0 ? 'Alpha +' : 'Alpha '}{selectedPoint.yAlpha.toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-[#0c101c] p-2 rounded border border-[#1a2338]">
                    <div className="text-slate-400 text-[9px]">{currentXOption.shortLabel} Return (X)</div>
                    <div className={`font-bold text-sm ${selectedPoint.xReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedPoint.xReturn >= 0 ? '+' : ''}{selectedPoint.xReturn.toFixed(2)}%
                    </div>
                    <div className={`text-[8.5px] ${selectedPoint.xAlpha >= 0 ? 'text-[#bef264]' : 'text-rose-400'}`}>
                      {selectedPoint.xAlpha >= 0 ? 'Alpha +' : 'Alpha '}{selectedPoint.xAlpha.toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-[#0c101c] p-2 rounded border border-[#1a2338]">
                    <div className="text-slate-400 text-[9px]">Last Price</div>
                    <div className="font-bold text-sm text-white">
                      ₹{selectedPoint.currentPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[8.5px] text-slate-500">EOD Market Data</div>
                  </div>

                  <div className="bg-[#0c101c] p-2 rounded border border-[#1a2338]">
                    <div className="text-slate-400 text-[9px]">Point Contrib ({currentYOption.shortLabel})</div>
                    <div
                      className={`font-bold text-sm ${
                        selectedPoint.weightedContribY >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {selectedPoint.weightedContribY >= 0 ? '+' : ''}
                      {selectedPoint.weightedContribY.toFixed(1)} pts
                    </div>
                    <div className="text-[8.5px] text-[#00e5ff]">{selectedPoint.weight.toFixed(2)}% wt</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. ACTIONABLE SUMMARY WIDGET (Below Chart) */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Market Breadth Status */}
            <div className="bg-[#05060b] border border-[#161a27] rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-[#00e5ff] tracking-wider">
                  MARKET BREADTH STATUS
                </span>
                <Activity className="w-4 h-4 text-[#00e5ff]" />
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-extrabold text-white">
                    {stats.beatingXCount}
                    <span className="text-sm text-slate-500 font-normal"> / {stats.total}</span>
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                      stats.beatingXCount >= 25
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {((stats.beatingXCount / stats.total) * 100).toFixed(1)}% BEATING
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-1.5 leading-relaxed">
                  {stats.beatingXCount} of {stats.total} stocks are outperforming {data?.benchmark.symbol || activeBenchmarkDef.name} on the{' '}
                  <strong className="text-[#bef264]">{currentXOption.label}</strong> horizon (
                  {stats.beatingXCount >= Math.floor(stats.total * 0.6)
                    ? 'Strong Internal Breadth'
                    : stats.beatingXCount >= Math.floor(stats.total * 0.4)
                    ? 'Selective / Stock-Picker Market'
                    : 'Narrow Heavyweight Breadth'}
                  ).
                </p>
              </div>

              {/* 4 Quadrants Quick Tally */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-[#141824] text-center text-[10px]">
                <div className="bg-[#0a1205] border border-emerald-900/40 rounded p-1">
                  <div className="text-emerald-400 font-bold">{stats.leadersCount}</div>
                  <div className="text-[8px] text-slate-500 font-pixel">LEADERS</div>
                </div>
                <div className="bg-[#03111a] border border-sky-900/40 rounded p-1">
                  <div className="text-sky-400 font-bold">{stats.reversalsCount}</div>
                  <div className="text-[8px] text-slate-500 font-pixel">REVERSAL</div>
                </div>
                <div className="bg-[#171103] border border-amber-900/40 rounded p-1">
                  <div className="text-amber-400 font-bold">{stats.pullbacksCount}</div>
                  <div className="text-[8px] text-slate-500 font-pixel">PULLBACK</div>
                </div>
                <div className="bg-[#170505] border border-rose-900/40 rounded p-1">
                  <div className="text-rose-400 font-bold">{stats.laggardsCount}</div>
                  <div className="text-[8px] text-slate-500 font-pixel">LAGGARDS</div>
                </div>
              </div>
            </div>

            {/* Card 2: Top 3 Alpha Drivers */}
            <div className="bg-[#05060b] border border-[#161a27] rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-emerald-400 tracking-wider">
                  TOP 3 ALPHA DRIVERS ({currentYOption.shortLabel})
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="space-y-2">
                {drivers.map((d, i) => (
                  <div
                    key={d.symbol}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#0a1205] border border-emerald-950 hover:border-emerald-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[9px] text-emerald-500">#{i + 1}</span>
                      <div>
                        <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{d.symbol}</span>
                          <span className="text-[9px] text-slate-500 font-normal">{d.weight}% wt</span>
                        </div>
                        <div className="text-[9px] text-slate-400">{d.sector}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-emerald-400">
                        {d.yReturn >= 0 ? '+' : ''}
                        {d.yReturn.toFixed(2)}%
                      </div>
                      <div className="text-[9px] text-slate-500">
                        +{d.weightedContribY.toFixed(1)} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Top 3 Drags */}
            <div className="bg-[#05060b] border border-[#161a27] rounded-xl p-4 shadow-lg flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-rose-400 tracking-wider">
                  TOP 3 INDEX DRAGS ({currentYOption.shortLabel})
                </span>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>

              <div className="space-y-2">
                {drags.map((d, i) => (
                  <div
                    key={d.symbol}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#140606] border border-rose-950 hover:border-rose-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[9px] text-rose-500">#{i + 1}</span>
                      <div>
                        <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{d.symbol}</span>
                          <span className="text-[9px] text-slate-500 font-normal">{d.weight}% wt</span>
                        </div>
                        <div className="text-[9px] text-slate-400">{d.sector}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-rose-400">
                        {d.yReturn >= 0 ? '+' : ''}
                        {d.yReturn.toFixed(2)}%
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {d.weightedContribY >= 0 ? '+' : ''}{d.weightedContribY.toFixed(1)} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. CONSTITUENTS BREAKDOWN DATA TABLE */}
        {data && (
          <div className="bg-[#05060b] border border-[#161a27] rounded-xl p-4 shadow-lg mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#141824] mb-3">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-white tracking-wider">
                  {data?.benchmark.symbol || activeBenchmarkDef.name} CONSTITUENTS PERFORMANCE TABLE
                </span>
                <span className="text-[10px] text-slate-400">
                  ({displayedPoints.length} of {points.length} stocks shown)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Sorted by Index Weightage
              </div>
            </div>

            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-[#070912] text-slate-400 border-b border-[#181d2c] text-[10px] font-pixel">
                  <tr>
                    <th className="py-2 px-3">TICKER</th>
                    <th className="py-2 px-3">NAME</th>
                    <th className="py-2 px-3">SECTOR</th>
                    <th className="py-2 px-3 text-right">WEIGHT %</th>
                    <th className="py-2 px-3 text-right">PRICE (₹)</th>
                    <th className="py-2 px-3 text-right">{currentXOption.shortLabel} RETURN</th>
                    <th className="py-2 px-3 text-right">{currentYOption.shortLabel} RETURN</th>
                    <th className="py-2 px-3 text-right">ALPHA ({currentYOption.shortLabel})</th>
                    <th className="py-2 px-3 text-center">QUADRANT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#101420]">
                  {displayedPoints.map((p) => {
                    const qConfig = QUADRANT_CONFIG[p.quadrant];
                    return (
                      <tr
                        key={p.symbol}
                        className="hover:bg-[#0c101c] transition-colors group cursor-pointer"
                        onClick={() => setHoveredPoint(p)}
                      >
                        <td className="py-2 px-3 font-bold text-white group-hover:text-[#00e5ff]">
                          {p.symbol}
                        </td>
                        <td className="py-2 px-3 text-slate-400 line-clamp-1 max-w-[180px]">
                          {p.name}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{p.sector}</td>
                        <td className="py-2 px-3 text-right text-[#00e5ff] font-bold">
                          {p.weight.toFixed(2)}%
                        </td>
                        <td className="py-2 px-3 text-right text-slate-200">
                          ₹{p.currentPrice.toLocaleString('en-IN')}
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-bold ${
                            p.xReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {p.xReturn >= 0 ? '+' : ''}
                          {p.xReturn.toFixed(2)}%
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-bold ${
                            p.yReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {p.yReturn >= 0 ? '+' : ''}
                          {p.yReturn.toFixed(2)}%
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-bold ${
                            p.yAlpha >= 0 ? 'text-[#bef264]' : 'text-rose-400'
                          }`}
                        >
                          {p.yAlpha >= 0 ? '+' : ''}
                          {p.yAlpha.toFixed(2)}%
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[8px] font-pixel border ${qConfig.bgBadge} ${qConfig.textBadge} ${qConfig.border}`}
                          >
                            {qConfig.name.split(' ')[0]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 7. PYTHON QUANT SCRIPT MODAL */}
      {showScriptModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowScriptModal(false)}
        >
          <div
            className="bg-[#090d16] border border-[#232b3f] rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 text-left font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2234]">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#00e5ff]" />
                <span className="font-pixel text-xs text-white tracking-wider">
                  PYTHON / PANDAS QUANT SCRIPT DELIVERABLE
                </span>
              </div>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-slate-400 hover:text-white text-xs font-pixel"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Calculates percentage returns using daily close prices of Nifty 50 and constituents,
              computes OLS linear regression metrics (Slope, Intercept, R²), and categorizes stocks
              into the 4 performance quadrants.
            </p>

            <div className="relative">
              <pre className="bg-[#04060a] border border-[#181f2f] rounded-lg p-3 text-[11px] text-emerald-400 overflow-x-auto max-h-72 font-mono">
                {pythonScriptContent}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1b2234]">
              <span className="text-[10px] text-slate-500">
                Location: scripts/nifty_scatter_analysis.py
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pythonScriptContent);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#00e5ff] text-black font-pixel text-[9px] font-bold hover:bg-[#38bdf8] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {copiedScript ? <Check className="w-3 h-3 text-black" /> : null}
                <span>{copiedScript ? 'COPIED TO CLIPBOARD' : 'COPY SCRIPT'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
