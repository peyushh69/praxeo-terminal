import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
} from 'lucide-react';
import type { StockBreadthItem } from '../types';

interface StockTableProps {
  stocks: StockBreadthItem[];
  indexName?: string;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  selectedSector: string;
  onSelectSector: (sector: string) => void;
  onSelectStock: (stock: StockBreadthItem) => void;
}

type SortField =
  | 'symbol'
  | 'currentPrice'
  | 'changePercent'
  | 'bullishScore'
  | 'diffEma9'
  | 'diffEma20'
  | 'diffEma50'
  | 'diffEma100'
  | 'diffEma200'
  | 'rsi14'
  | 'dist52w';

type SortDirection = 'asc' | 'desc';

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  indexName = 'NIFTY 50',
  activeFilter,
  onSelectFilter,
  selectedSector,
  onSelectSector,
  onSelectStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Extract unique sectors
  const sectors = useMemo(() => {
    const s = new Set(stocks.map((item) => item.sector));
    return ['All Sectors', ...Array.from(s).sort()];
  }, [stocks]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and Sort stocks
  const filteredAndSortedStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSymbol = s.symbol.toLowerCase().includes(q);
          const matchName = s.name.toLowerCase().includes(q);
          if (!matchSymbol && !matchName) return false;
        }

        // Sector Filter
        if (selectedSector && selectedSector !== 'All Sectors') {
          if (s.sector !== selectedSector) return false;
        }

        // Condition Filter
        if (activeFilter === 'above-ema9') return s.emas.isAboveEma9;
        if (activeFilter === 'above-ema20') return s.emas.isAboveEma20;
        if (activeFilter === 'above-ema50') return s.emas.isAboveEma50;
        if (activeFilter === 'above-ema100') return s.emas.isAboveEma100;
        if (activeFilter === 'above-ema200') return s.emas.isAboveEma200;
        if (activeFilter === 'rsi-above50') return s.rsi.isAbove50;
        if (activeFilter === 'macd-bullish') return s.macd.isBullish;
        if (activeFilter === 'above-all') return s.bullishScore === 5;
        if (activeFilter === 'below-all') return s.bullishScore === 0;
        if (activeFilter === 'golden-stack') return s.isGoldenStack;
        if (activeFilter === 'golden-cross') return s.isGoldenCross;

        return true;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        switch (sortField) {
          case 'symbol':
            valA = a.symbol;
            valB = b.symbol;
            break;
          case 'currentPrice':
            valA = a.currentPrice;
            valB = b.currentPrice;
            break;
          case 'changePercent':
            valA = a.changePercent;
            valB = b.changePercent;
            break;
          case 'bullishScore':
            valA = a.bullishScore;
            valB = b.bullishScore;
            break;
          case 'diffEma9':
            valA = a.emas.diffEma9Percent;
            valB = b.emas.diffEma9Percent;
            break;
          case 'diffEma20':
            valA = a.emas.diffEma20Percent;
            valB = b.emas.diffEma20Percent;
            break;
          case 'diffEma50':
            valA = a.emas.diffEma50Percent;
            valB = b.emas.diffEma50Percent;
            break;
          case 'diffEma100':
            valA = a.emas.diffEma100Percent;
            valB = b.emas.diffEma100Percent;
            break;
          case 'diffEma200':
            valA = a.emas.diffEma200Percent;
            valB = b.emas.diffEma200Percent;
            break;
          case 'rsi14':
            valA = a.rsi.rsi14;
            valB = b.rsi.rsi14;
            break;
          case 'dist52w':
            valA = a.distFrom52WHighPercent;
            valB = b.distFrom52WHighPercent;
            break;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [stocks, searchQuery, selectedSector, activeFilter, sortField, sortDirection]);

  // Export CSV with complete quantitative indicator columns
  const handleExportCSV = () => {
    const headers = [
      'Symbol',
      'Company Name',
      'Sector',
      'Price (INR)',
      'Change %',
      'EMA 9',
      'Above EMA 9',
      'EMA 20',
      'Above EMA 20',
      'EMA 50',
      'Above EMA 50',
      'EMA 100',
      'Above EMA 100',
      'EMA 200',
      'Above EMA 200',
      'RSI (14)',
      'RSI > 50',
      'MACD Bullish',
      'Bullish Score (/5)',
      'Golden Stack',
      'Golden Cross (50>200)',
      '52W High (INR)',
      'Dist 52W High %',
    ];

    const rows = filteredAndSortedStocks.map((s) => [
      s.symbol,
      `"${s.name}"`,
      s.sector,
      s.currentPrice,
      s.changePercent,
      s.emas.ema9,
      s.emas.isAboveEma9 ? 'YES' : 'NO',
      s.emas.ema20,
      s.emas.isAboveEma20 ? 'YES' : 'NO',
      s.emas.ema50,
      s.emas.isAboveEma50 ? 'YES' : 'NO',
      s.emas.ema100,
      s.emas.isAboveEma100 ? 'YES' : 'NO',
      s.emas.ema200,
      s.emas.isAboveEma200 ? 'YES' : 'NO',
      s.rsi.rsi14,
      s.rsi.isAbove50 ? 'YES' : 'NO',
      s.macd.isBullish ? 'YES' : 'NO',
      s.bullishScore,
      s.isGoldenStack ? 'YES' : 'NO',
      s.isGoldenCross ? 'YES' : 'NO',
      s.week52High,
      s.distFrom52WHighPercent,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${indexName.replace(/\s+/g, '_').toLowerCase()}_breadth_stocks_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterTabs = [
    { id: 'all', label: `ALL (${stocks.length})` },
    { id: 'above-ema9', label: `> 9 EMA (${stocks.filter((s) => s.emas.isAboveEma9).length})` },
    { id: 'above-ema20', label: `> 20 EMA (${stocks.filter((s) => s.emas.isAboveEma20).length})` },
    { id: 'above-ema50', label: `> 50 EMA (${stocks.filter((s) => s.emas.isAboveEma50).length})` },
    { id: 'above-ema100', label: `> 100 EMA (${stocks.filter((s) => s.emas.isAboveEma100).length})` },
    { id: 'above-ema200', label: `> 200 EMA (${stocks.filter((s) => s.emas.isAboveEma200).length})` },
    { id: 'rsi-above50', label: `RSI>50 (${stocks.filter((s) => s.rsi.isAbove50).length})` },
    { id: 'macd-bullish', label: `MACD+ (${stocks.filter((s) => s.macd.isBullish).length})` },
    { id: 'golden-stack', label: `GOLDEN (${stocks.filter((s) => s.isGoldenStack).length})` },
    { id: 'above-all', label: `5/5 BULL (${stocks.filter((s) => s.bullishScore === 5).length})` },
    { id: 'below-all', label: `0/5 BEAR (${stocks.filter((s) => s.bullishScore === 0).length})` },
  ];

  return (
    <div className="bg-[#050508] border border-[#181826] rounded-xl shadow-2xl overflow-hidden font-mono select-none">
      {/* Header Controls */}
      <div className="p-3 sm:p-4 border-b border-[#181826] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-pixel text-xs sm:text-sm text-white flex items-center gap-2">
              <span>{indexName.toUpperCase()} CONSTITUENTS</span>
              <span className="text-[9px] px-1.5 py-0.5 border border-[#bef264]/40 bg-[#bef264]/10 text-[#bef264] font-pixel rounded">
                {filteredAndSortedStocks.length} OF {stocks.length}
              </span>
            </h3>
          </div>

          {/* Search, Sector, and CSV export */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input Box */}
            <div className="relative min-w-[140px] sm:min-w-[180px] flex-1 sm:flex-initial">
              <input
                id="input-search-stocks"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH TICKER..."
                className="w-full pl-2.5 pr-7 py-1.5 text-[10px] sm:text-xs border border-[#202030] bg-[#000000] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#ff3b00] font-mono"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Search className="w-3 h-3" />
              </span>
            </div>

            {/* Sector Dropdown */}
            {sectors.length > 2 && (
              <select
                id="select-sector-filter"
                value={selectedSector}
                onChange={(e) => onSelectSector(e.target.value)}
                className="py-1.5 px-2 text-[10px] sm:text-xs border border-[#202030] bg-[#000000] rounded-lg text-white focus:outline-none focus:border-[#ff3b00] cursor-pointer font-mono"
              >
                {sectors.map((sec) => (
                  <option key={sec} value={sec} className="bg-[#0a0a12] text-white">
                    {sec}
                  </option>
                ))}
              </select>
            )}

            {/* Export CSV Button */}
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-pixel border border-[#202030] bg-[#000000] text-slate-300 hover:text-white hover:border-[#ff3b00] rounded-lg transition-colors cursor-pointer"
              title="Download quantitative indicator data as CSV"
            >
              <Download className="w-3 h-3 text-[#ff3b00]" />
              <span className="hidden xs:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Scrollable Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-[#141420] pt-2.5 font-pixel scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-filter-${tab.id}`}
              onClick={() => onSelectFilter(tab.id)}
              className={`px-2.5 py-1 whitespace-nowrap text-[8px] sm:text-[9px] rounded-md transition-all cursor-pointer border ${
                activeFilter === tab.id
                  ? 'bg-[#ff3b00] text-black font-bold border-[#ff3b00] shadow-pixel-orange'
                  : 'bg-[#000000] text-slate-400 border-[#1c1c28] hover:border-slate-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Table List with Horizontal Overflow Handling */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#08080e] border-b border-[#181826] text-slate-400 font-pixel select-none text-[8px] sm:text-[9px] tracking-wider shadow-sm">
            <tr>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-white border-r border-[#141420]"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-1">
                  <span>STOCK</span>
                  {sortField === 'symbol' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-[#ff3b00]" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </div>
              </th>

              <th
                className="py-2.5 px-2.5 cursor-pointer hover:text-white text-right border-r border-[#141420]"
                onClick={() => handleSort('currentPrice')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>LTP (₹)</span>
                  {sortField === 'currentPrice' && (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-[#ff3b00]" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                    )
                  )}
                </div>
              </th>

              <th
                className="py-2.5 px-2.5 cursor-pointer hover:text-white text-right border-r border-[#141420]"
                onClick={() => handleSort('changePercent')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CHG %</span>
                  {sortField === 'changePercent' && (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-[#ff3b00]" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                    )
                  )}
                </div>
              </th>

              <th
                className="py-2.5 px-2 cursor-pointer hover:text-white text-center border-r border-[#141420]"
                onClick={() => handleSort('diffEma9')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>9 EMA</span>
                  {sortField === 'diffEma9' && (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#ff3b00]" /> : <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                  )}
                </div>
              </th>

              <th
                className="py-2.5 px-2 cursor-pointer hover:text-white text-center border-r border-[#141420]"
                onClick={() => handleSort('diffEma20')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>20 EMA</span>
                  {sortField === 'diffEma20' && (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#ff3b00]" /> : <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                  )}
                </div>
              </th>

              <th
                className="py-2.5 px-2 cursor-pointer hover:text-white text-center border-r border-[#141420]"
                onClick={() => handleSort('diffEma50')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>50 EMA</span>
                  {sortField === 'diffEma50' && (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#ff3b00]" /> : <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                  )}
                </div>
              </th>

              <th
                className="py-2.5 px-2 cursor-pointer hover:text-white text-center border-r border-[#141420]"
                onClick={() => handleSort('diffEma200')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>200 EMA</span>
                  {sortField === 'diffEma200' && (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#ff3b00]" /> : <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                  )}
                </div>
              </th>

              <th
                className="py-2.5 px-2 cursor-pointer hover:text-white text-center border-r border-[#141420]"
                onClick={() => handleSort('rsi14')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>RSI (14)</span>
                  {sortField === 'rsi14' && (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#ff3b00]" /> : <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                  )}
                </div>
              </th>

              <th
                className="py-2.5 px-2 cursor-pointer hover:text-white text-center border-r border-[#141420]"
                onClick={() => handleSort('bullishScore')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>SCORE</span>
                  {sortField === 'bullishScore' && (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#ff3b00]" /> : <ArrowDown className="w-3 h-3 text-[#ff3b00]" />
                  )}
                </div>
              </th>

              <th className="py-2.5 px-2.5 text-center">CHART</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#12121e] bg-[#000000]">
            {filteredAndSortedStocks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-500 font-pixel text-xs">
                  NO STOCKS MATCH CRITERIA.
                </td>
              </tr>
            ) : (
              filteredAndSortedStocks.map((stock) => {
                const isPos = stock.change >= 0;
                const { emas, rsi } = stock;

                return (
                  <tr
                    key={stock.symbol}
                    id={`stock-row-${stock.symbol}`}
                    onClick={() => onSelectStock(stock)}
                    className="hover:bg-[#090912] cursor-pointer transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-2 sm:py-2.5 px-3 border-r border-[#12121e]">
                      <div className="flex items-start gap-1.5">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-pixel text-[11px] sm:text-xs text-white group-hover:text-[#bef264] transition-all">
                              {stock.symbol}
                            </span>
                            {stock.isGoldenStack && (
                              <span
                                title="Golden Stack (Price > 9 > 20 > 50 > 100 > 200)"
                                className="px-1 py-0.5 bg-[#ff3b00] text-black text-[7px] font-bold font-pixel rounded"
                              >
                                GOLDEN
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono truncate max-w-[130px] sm:max-w-[170px]">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-2 sm:py-2.5 px-2.5 text-right font-bold text-white font-mono tabular-nums border-r border-[#12121e] text-[11px] sm:text-xs">
                      ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Day Change */}
                    <td className="py-2 sm:py-2.5 px-2.5 text-right border-r border-[#12121e]">
                      <span
                        className={`font-pixel text-[9px] sm:text-[10px] tabular-nums ${
                          isPos ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* EMA 9 */}
                    <td className="py-2 sm:py-2.5 px-2 text-center border-r border-[#12121e] font-mono text-[10px]">
                      <span className={`font-bold ${emas.isAboveEma9 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {emas.isAboveEma9 ? '+' : ''}
                        {emas.diffEma9Percent.toFixed(1)}%
                      </span>
                    </td>

                    {/* EMA 20 */}
                    <td className="py-2 sm:py-2.5 px-2 text-center border-r border-[#12121e] font-mono text-[10px]">
                      <span className={`font-bold ${emas.isAboveEma20 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {emas.isAboveEma20 ? '+' : ''}
                        {emas.diffEma20Percent.toFixed(1)}%
                      </span>
                    </td>

                    {/* EMA 50 */}
                    <td className="py-2 sm:py-2.5 px-2 text-center border-r border-[#12121e] font-mono text-[10px]">
                      <span className={`font-bold ${emas.isAboveEma50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {emas.isAboveEma50 ? '+' : ''}
                        {emas.diffEma50Percent.toFixed(1)}%
                      </span>
                    </td>

                    {/* EMA 200 */}
                    <td className="py-2 sm:py-2.5 px-2 text-center border-r border-[#12121e] font-mono text-[10px]">
                      <span className={`font-bold ${emas.isAboveEma200 ? 'text-purple-400' : 'text-rose-400'}`}>
                        {emas.isAboveEma200 ? '+' : ''}
                        {emas.diffEma200Percent.toFixed(1)}%
                      </span>
                    </td>

                    {/* RSI (14) */}
                    <td className="py-2 sm:py-2.5 px-2 text-center border-r border-[#12121e] font-mono text-[10px]">
                      <span
                        className={
                          rsi.isOverbought
                            ? 'text-amber-400 font-bold'
                            : rsi.isOversold
                            ? 'text-cyan-400 font-bold'
                            : rsi.isAbove50
                            ? 'text-emerald-400 font-bold'
                            : 'text-slate-400'
                        }
                      >
                        {rsi.rsi14.toFixed(1)}
                      </span>
                    </td>

                    {/* Bullish Score (0-5) */}
                    <td className="py-2 sm:py-2.5 px-2 text-center border-r border-[#12121e]">
                      <span
                        className={`inline-block px-1.5 py-0.5 text-[8px] font-pixel rounded ${
                          stock.bullishScore === 5
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : stock.bullishScore >= 3
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                            : stock.bullishScore === 0
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                            : 'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {stock.bullishScore}/5
                      </span>
                    </td>

                    {/* Action View */}
                    <td className="py-2 sm:py-2.5 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(stock);
                        }}
                        className="p-1 text-slate-400 hover:text-white hover:bg-[#ff3b00]/20 rounded border border-transparent hover:border-[#ff3b00]/40 transition-colors cursor-pointer"
                        title="Open Technical Chart & Multi-Indicator Analysis"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#ff3b00]" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-[#08080e] border-t border-[#181826] flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <div>Click any stock row to view candle chart &amp; EMA comparison</div>
        <div className="text-slate-400">Total: {filteredAndSortedStocks.length} stocks</div>
      </div>
    </div>
  );
};
