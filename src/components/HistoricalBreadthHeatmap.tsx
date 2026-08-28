import React, { useState, useMemo, useRef } from 'react';
import type { TimeSeriesBreadthPoint } from '../types';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface HistoricalBreadthHeatmapProps {
  timeSeries: TimeSeriesBreadthPoint[];
  timeframe: '3M' | '6M';
  onTimeframeChange: (tf: '3M' | '6M') => void;
  indexName?: string;
}

/**
 * Returns background color & text color matching the institutional breadth heatmap in image-2.png
 */
export function getBreadthHeatmapStyle(percent: number): { bg: string; text: string; label: string } {
  if (percent >= 80) {
    return {
      bg: 'bg-[#22c55e]', // Vibrant Emerald Green
      text: 'text-black font-bold',
      label: '≥80% Super Bullish',
    };
  }
  if (percent >= 70) {
    return {
      bg: 'bg-[#84cc16]', // Lime Green
      text: 'text-black font-bold',
      label: '70-79% Strong',
    };
  }
  if (percent >= 50) {
    return {
      bg: 'bg-[#facc15]', // Golden Yellow
      text: 'text-black font-bold',
      label: '50-69% Moderate',
    };
  }
  if (percent >= 35) {
    return {
      bg: 'bg-[#fb923c]', // Light Orange / Amber
      text: 'text-black font-bold',
      label: '35-49% Weak',
    };
  }
  if (percent >= 20) {
    return {
      bg: 'bg-[#ea580c]', // Deep Orange
      text: 'text-white font-bold',
      label: '20-34% Poor',
    };
  }
  return {
    bg: 'bg-[#dc2626]', // Crimson Red
    text: 'text-white font-bold',
    label: '<20% Oversold',
  };
}

/**
 * Format date display: e.g. "Apr 10", "Mar 31", "Aug 28"
 */
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${monthNames[monthIdx] || parts[1]} ${parts[2]}`;
    }
    return dateStr;
  }
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export const HistoricalBreadthHeatmap: React.FC<HistoricalBreadthHeatmapProps> = ({
  timeSeries,
  timeframe,
  onTimeframeChange,
  indexName = 'Index',
}) => {
  // Column mode: 'STANDARD' (SMA/EMA 20, 50, 100, 200) or 'WITH_9' (includes EMA 9)
  const [columnMode, setColumnMode] = useState<'STANDARD' | 'WITH_9'>('STANDARD');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter timeframe (3M = ~65 sessions, 6M = ~130 sessions)
  const filteredSeries = useMemo(() => {
    const totalPoints = timeframe === '3M' ? 65 : 130;
    const sliced = timeSeries.slice(-totalPoints);
    // Reverse so newest date is on top (exact match with image-2.png)
    return [...sliced].reverse();
  }, [timeSeries, timeframe]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-3 select-none">
      
      {/* Top Header & Controls */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pb-2 border-b border-[#161624]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-[8px] sm:text-[9px] text-[#bef264] uppercase tracking-wider">
              DAILY MATRIX
            </span>
            <span className="text-slate-600 font-mono text-[10px]">•</span>
            <span className="font-mono text-[10px] sm:text-xs text-slate-400">
              {filteredSeries.length} SESSIONS SCROLLABLE
            </span>
          </div>
          <h3 className="font-pixel text-[11px] sm:text-xs text-white mt-0.5">
            STOCKS ABOVE MOVING AVERAGES
          </h3>
        </div>

        {/* Controls: Timeframe & Column Switch */}
        <div className="flex items-center gap-1.5 self-start xs:self-auto">
          {/* Timeframe Toggle */}
          <div className="flex items-center rounded-lg bg-[#000000] border border-[#202030] p-0.5 text-[9px] font-pixel">
            <button
              onClick={() => onTimeframeChange('3M')}
              className={`px-2 sm:px-2.5 py-1 rounded transition-all cursor-pointer ${
                timeframe === '3M'
                  ? 'bg-[#ff3b00] text-black font-bold shadow-pixel-orange'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3M
            </button>
            <button
              onClick={() => onTimeframeChange('6M')}
              className={`px-2 sm:px-2.5 py-1 rounded transition-all cursor-pointer ${
                timeframe === '6M'
                  ? 'bg-[#ff3b00] text-black font-bold shadow-pixel-orange'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              6M
            </button>
          </div>

          {/* Column Toggle (+ 9 EMA) */}
          <div className="flex items-center rounded-lg bg-[#000000] border border-[#202030] p-0.5 text-[9px] font-pixel">
            <button
              onClick={() => setColumnMode(columnMode === 'STANDARD' ? 'WITH_9' : 'STANDARD')}
              className={`px-2 py-1 rounded transition-all cursor-pointer ${
                columnMode === 'WITH_9'
                  ? 'bg-[#bef264] text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle EMA 9 column"
            >
              {columnMode === 'WITH_9' ? '+EMA 9 (ON)' : '+EMA 9'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Heatmap Container - Fixed Height Scrollable Window (Sliding Viewport) */}
      <div className="w-full bg-[#050508] border border-[#202032] rounded-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Table Title Banner: "Stocks Above" + Quick Scroll Jump Actions */}
        <div className="bg-[#0a0a14] py-1.5 px-3 border-b border-[#1e1e30] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] sm:text-xs text-slate-200 tracking-wider">
              Stocks Above
            </span>
            <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">
              (Scroll inside to navigate {filteredSeries.length} sessions)
            </span>
          </div>

          {/* Jump to top/bottom quick buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={scrollToTop}
              className="p-1 rounded bg-[#0e0e1a] border border-[#222234] hover:border-[#bef264] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Scroll to Latest (Top)"
            >
              <ArrowUp className="w-3 h-3 text-[#bef264]" />
            </button>
            <button
              onClick={scrollToBottom}
              className="p-1 rounded bg-[#0e0e1a] border border-[#222234] hover:border-[#ff3b00] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Scroll to Oldest (Bottom)"
            >
              <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
            </button>
          </div>
        </div>

        {/* Scrollable Table Viewport with Sticky Header (Height locked at ~340px-400px so page never stretches) */}
        <div
          ref={scrollContainerRef}
          className="w-full max-h-[340px] sm:max-h-[400px] overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <table className="w-full table-fixed border-collapse font-mono text-center select-none min-w-[320px]">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 z-10 shadow-md">
              <tr className="border-b border-[#1e1e30] bg-[#090912] text-slate-300 font-pixel text-[9px] sm:text-[10px]">
                {/* Date & Close Column */}
                <th className={`py-2 px-1 sm:px-2 text-left border-r border-[#1a1a2c] bg-[#090912] ${columnMode === 'WITH_9' ? 'w-[22%] sm:w-[20%]' : 'w-[24%] sm:w-[20%]'}`}>
                  <div className="text-sky-400 font-bold">Date</div>
                  <div className="text-[8px] sm:text-[9px] text-slate-400 font-mono font-normal">Close</div>
                </th>

                {/* Optional EMA 9 */}
                {columnMode === 'WITH_9' && (
                  <th className="py-2 px-1 sm:px-1.5 border-r border-[#1a1a2c] text-[#ff3b00] bg-[#090912] w-[15.6%] sm:w-[16%]">
                    <div>EMA 9</div>
                  </th>
                )}

                {/* SMA / EMA 20 */}
                <th className="py-2 px-1 sm:px-1.5 border-r border-[#1a1a2c] text-[#38bdf8] bg-[#090912] w-[19%] sm:w-[20%]">
                  <div>SMA 20</div>
                </th>

                {/* SMA / EMA 50 */}
                <th className="py-2 px-1 sm:px-1.5 border-r border-[#1a1a2c] text-[#bef264] bg-[#090912] w-[19%] sm:w-[20%]">
                  <div>SMA 50</div>
                </th>

                {/* SMA / EMA 100 */}
                <th className="py-2 px-1 sm:px-1.5 border-r border-[#1a1a2c] text-[#c084fc] bg-[#090912] w-[19%] sm:w-[20%]">
                  <div>SMA 100</div>
                </th>

                {/* SMA / EMA 200 */}
                <th className="py-2 px-1 sm:px-1.5 text-[#f59e0b] bg-[#090912] w-[19%] sm:w-[20%]">
                  <div>SMA 200</div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#141424]">
              {filteredSeries.length > 0 ? (
                filteredSeries.map((row, idx) => {
                  const style9 = getBreadthHeatmapStyle(row.aboveEma9Percent);
                  const style20 = getBreadthHeatmapStyle(row.aboveEma20Percent);
                  const style50 = getBreadthHeatmapStyle(row.aboveEma50Percent);
                  const style100 = getBreadthHeatmapStyle(row.aboveEma100Percent);
                  const style200 = getBreadthHeatmapStyle(row.aboveEma200Percent);

                  const displayDate = formatDateDisplay(row.date);
                  const closePrice = row.indexPrice || row.niftyPrice;
                  const formattedClose = closePrice ? Math.round(closePrice).toLocaleString('en-IN') : '--';

                  return (
                    <tr
                      key={row.date || idx}
                      className="hover:brightness-110 transition-all"
                    >
                      {/* Date & Close Price Column */}
                      <td className="py-1.5 sm:py-2 px-1.5 sm:px-2.5 text-left border-r border-[#1a1a2c] bg-[#07070d]">
                        <div className="font-bold text-slate-100 text-[10px] sm:text-xs leading-tight">
                          {displayDate}
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono leading-tight">
                          {formattedClose}
                        </div>
                      </td>

                      {/* EMA 9 Cell */}
                      {columnMode === 'WITH_9' && (
                        <td className={`py-1.5 sm:py-2 px-1 border-r border-black/30 text-center ${style9.bg} ${style9.text}`}>
                          <span className="text-[11px] sm:text-xs font-bold tracking-tight">
                            {Math.round(row.aboveEma9Percent)}%
                          </span>
                        </td>
                      )}

                      {/* SMA 20 Cell */}
                      <td className={`py-1.5 sm:py-2 px-1 border-r border-black/30 text-center ${style20.bg} ${style20.text}`}>
                        <span className="text-[11px] sm:text-xs font-bold tracking-tight">
                          {Math.round(row.aboveEma20Percent)}%
                        </span>
                      </td>

                      {/* SMA 50 Cell */}
                      <td className={`py-1.5 sm:py-2 px-1 border-r border-black/30 text-center ${style50.bg} ${style50.text}`}>
                        <span className="text-[11px] sm:text-xs font-bold tracking-tight">
                          {Math.round(row.aboveEma50Percent)}%
                        </span>
                      </td>

                      {/* SMA 100 Cell */}
                      <td className={`py-1.5 sm:py-2 px-1 border-r border-black/30 text-center ${style100.bg} ${style100.text}`}>
                        <span className="text-[11px] sm:text-xs font-bold tracking-tight">
                          {Math.round(row.aboveEma100Percent)}%
                        </span>
                      </td>

                      {/* SMA 200 Cell */}
                      <td className={`py-1.5 sm:py-2 px-1 text-center ${style200.bg} ${style200.text}`}>
                        <span className="text-[11px] sm:text-xs font-bold tracking-tight">
                          {Math.round(row.aboveEma200Percent)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columnMode === 'WITH_9' ? 6 : 5} className="py-6 text-center text-slate-500 text-xs">
                    Loading historical breadth heatmap matrix...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Heatmap Footer: Scroll Indicator Status */}
        <div className="p-2 sm:p-2.5 bg-[#06060a] border-t border-[#1a1a2c] flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
            <span>Showing <span className="text-white font-bold">{filteredSeries.length}</span> daily sessions</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[8px] sm:text-[9px]">↕ Swipe / Scroll vertically</span>
          </div>
        </div>

      </div>

      {/* Compact Participation Color Legend */}
      <div className="bg-[#050508] border border-[#181826] p-2 sm:p-2.5 rounded-lg">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[9px] sm:text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#22c55e] flex-shrink-0" />
            <span className="text-slate-300">≥80% Bull</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#84cc16] flex-shrink-0" />
            <span className="text-slate-300">70-79%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#facc15] flex-shrink-0" />
            <span className="text-slate-300">50-69%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#fb923c] flex-shrink-0" />
            <span className="text-slate-300">35-49%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ea580c] flex-shrink-0" />
            <span className="text-slate-300">20-34%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#dc2626] flex-shrink-0" />
            <span className="text-slate-300">&lt;20% Bear</span>
          </div>
        </div>
      </div>

    </div>
  );
};
