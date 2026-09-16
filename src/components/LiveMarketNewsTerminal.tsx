import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Globe, 
  Sparkles, 
  Clock, 
  Search, 
  Tag, 
  Radio,
  Building2,
  AlertCircle,
  Zap
} from 'lucide-react';
import type { MarketNewsItem } from '../types';
import { INITIAL_FALLBACK_NEWS } from '../data/fallbackNews';

interface LiveMarketNewsTerminalProps {
  onSelectStock?: (ticker: string) => void;
}

function getLiveTimeAgo(pubDateStr: string, fallback = 'Recently'): string {
  try {
    const d = new Date(pubDateStr);
    if (isNaN(d.getTime())) return fallback;
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return fallback;
  }
}

function isRecentBreaking(pubDateStr: string): boolean {
  try {
    const d = new Date(pubDateStr);
    if (isNaN(d.getTime())) return false;
    const diffMs = Date.now() - d.getTime();
    return diffMs >= 0 && diffMs <= 45 * 60 * 1000; // Under 45 mins
  } catch {
    return false;
  }
}

export const LiveMarketNewsTerminal: React.FC<LiveMarketNewsTerminalProps> = ({ onSelectStock }) => {
  const [news, setNews] = useState<MarketNewsItem[]>(INITIAL_FALLBACK_NEWS);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CORPORATE' | 'MARKET' | 'ECONOMY'>('ALL');
  const [lastFetchedTime, setLastFetchedTime] = useState<string>('');
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [flashNewTop, setFlashNewTop] = useState<boolean>(false);
  const [, setTick] = useState<number>(0);

  const prevTopIdRef = useRef<string | null>(null);

  const fetchNews = async (force = false) => {
    if (force) setRefreshing(true);
    setFetchError(false);

    try {
      const res = await fetch(`/api/news${force ? '?refresh=true' : ''}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const sorted = [...json.data].sort((a, b) => {
          const timeA = new Date(a.pubDate).getTime() || 0;
          const timeB = new Date(b.pubDate).getTime() || 0;
          return timeB - timeA;
        });

        // Detect if a new #1 latest story arrived
        if (prevTopIdRef.current && sorted.length > 0 && sorted[0].id !== prevTopIdRef.current) {
          setFlashNewTop(true);
          setTimeout(() => setFlashNewTop(false), 4000);
        }
        if (sorted.length > 0) {
          prevTopIdRef.current = sorted[0].id;
        }

        setNews(sorted);
        const now = new Date();
        setLastFetchedTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else if (news.length === 0) {
        setNews(INITIAL_FALLBACK_NEWS);
      }
    } catch (e) {
      console.warn('Backend news wire sync notice (using cached/fallback feeds):', e);
      setFetchError(true);
      setNews((prev) => (prev.length > 0 ? prev : INITIAL_FALLBACK_NEWS));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const now = new Date();
    setLastFetchedTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    
    // Auto-refresh news every 30 seconds for real-time live feed
    const refreshInterval = setInterval(() => {
      fetchNews(true);
    }, 30000);

    // Live clock ticker to update relative 'Xm ago' tags every 15 seconds
    const tickInterval = setInterval(() => {
      setTick(t => t + 1);
    }, 15000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(tickInterval);
    };
  }, []);

  const filteredNews = useMemo(() => {
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;

    const filtered = news.filter((item) => {
      // 48 hours filter
      let isWithin48Hours = true;
      try {
        const itemTime = new Date(item.pubDate).getTime();
        if (!isNaN(itemTime)) {
          isWithin48Hours = itemTime >= fortyEightHoursAgo;
        }
      } catch {
        isWithin48Hours = true; // Fallback if invalid date
      }

      if (!isWithin48Hours) return false;

      const matchesFilter = selectedFilter === 'ALL' || item.category === selectedFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.relatedStock?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.relatedStock?.ticker.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // Guarantee latest timestamp is ALWAYS at index 0 (#1 rank)
    return filtered.sort((a, b) => {
      const timeA = new Date(a.pubDate).getTime() || 0;
      const timeB = new Date(b.pubDate).getTime() || 0;
      return timeB - timeA;
    });
  }, [news, selectedFilter, searchQuery]);

  return (
    <div className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-left select-none">
      
      {/* 1. Terminal Top Ribbon (Bloomberg / DJ Style) */}
      <div className="bg-[#111111] border-b border-[#262626] px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap text-[10px]">
        {/* Left Function Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-neutral-800 text-white px-1.5 py-0.5 rounded font-pixel text-[8px] font-black tracking-wider">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>LIVE NEWS</span>
          </div>
          <span className="text-white font-pixel text-[9px] tracking-wide">
            INDIA MARKET WIRE
          </span>
          <span className="hidden sm:inline-block text-neutral-500 text-[9px]">
            [NSE / BSE / MACRO]
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {lastFetchedTime && (
            <span className="text-neutral-400 text-[9px] hidden md:inline font-mono">
              UPDATED: <span className="text-white font-bold">{lastFetchedTime}</span>
            </span>
          )}
          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing || loading}
            title="Refresh Live Feeds"
            className="flex items-center gap-1 bg-[#141414] hover:bg-[#262626] border border-white/20 text-white hover:text-white px-2 py-0.5 rounded text-[8px] font-pixel transition-all cursor-pointer"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* 2. DJ Action Toolbar */}
      <div className="bg-[#111111] border-b border-[#262626] px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap">
        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[8px] font-pixel">
          {(['ALL', 'CORPORATE', 'MARKET', 'ECONOMY'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                selectedFilter === cat
                  ? 'bg-neutral-800 text-white font-bold shadow-sm'
                  : 'bg-[#141414] text-neutral-300 hover:text-white hover:bg-[#262626]'
              }`}
            >
              {cat === 'ALL' ? 'ALL WIRE' : cat}
            </button>
          ))}
        </div>

        {/* Live Headline Count */}
        <div className="text-[9px] text-neutral-400 font-pixel flex items-center gap-1">
          <span className="text-white font-bold">{filteredNews.length}</span>
          <span>STORIES</span>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-[#0a0a0a] border-b border-[#262626] px-3 py-1.5 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-white shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search news, stock name (e.g. Tata Motors, Reliance), or source..."
          className="w-full bg-transparent border-none outline-none text-white text-xs font-mono placeholder:text-neutral-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[9px] font-pixel text-neutral-400 hover:text-white px-1"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* 4. Real-time News Items Feed Container */}
      <div className="max-h-[340px] sm:max-h-[380px] overflow-y-auto divide-y divide-[#1a1a1a] p-0 custom-scrollbar">
        {loading && news.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center text-neutral-400">
            <RefreshCw className="w-5 h-5 text-white animate-spin" />
            <span className="font-pixel text-[9px] text-neutral-400">POLLING LIVE GOOGLE & FINANCIAL RSS WIRES...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-10 text-center text-neutral-400 space-y-1">
            <p className="font-pixel text-[10px] text-neutral-300">NO MATCHING HEADLINES FOUND</p>
            <p className="text-xs text-neutral-500 font-mono">Try searching with a different stock name or category.</p>
          </div>
        ) : (
          filteredNews.map((item, index) => {
            const isBullish = item.sentiment === 'BULLISH';
            const isBearish = item.sentiment === 'BEARISH';
            const liveTime = getLiveTimeAgo(item.pubDate, item.timeAgo);
            const isBreaking = isRecentBreaking(item.pubDate);
            const isTopStory = index === 0;

            return (
              <div
                key={item.id || index}
                className={`p-2.5 sm:p-3 transition-all duration-300 group flex items-start gap-2.5 ${
                  isTopStory && flashNewTop
                    ? 'bg-[#1a1a1a] ring-1 ring-white/50 shadow-none animate-pulse'
                    : isTopStory
                    ? 'bg-[#111111] hover:bg-[#1a1a1a]'
                    : 'hover:bg-[#141414]'
                }`}
              >
                {/* Index Number (Terminal sequence 1), 2), 3)...) */}
                <div className="flex flex-col items-end shrink-0 pt-0.5 w-6">
                  <span className={`text-[10px] font-pixel tabular-nums ${isTopStory ? 'text-white font-bold' : 'text-white opacity-80'}`}>
                    {index + 1})
                  </span>
                  {isTopStory && (
                    <span className="text-[7px] font-pixel text-white leading-tight">TOP</span>
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Single Line Headline + Breaking indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 flex-1">
                      {isBreaking && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] font-pixel font-bold bg-neutral-800 text-white rounded shrink-0 mt-0.5 animate-pulse">
                          <Zap className="w-2 h-2 fill-current" />
                          <span>NEW</span>
                        </span>
                      )}
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white group-hover:text-neutral-300 font-mono text-[11px] sm:text-xs leading-snug font-medium line-clamp-2 hover:underline flex-1"
                      >
                        {item.title}
                      </a>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-500 group-hover:text-white shrink-0 p-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Bottom Metadata Ribbon (Stock Name, Good/Bad News Tag, Source, Time) */}
                  <div className="flex items-center gap-2 flex-wrap text-[9px] font-mono pt-0.5">
                    
                    {/* Related Stock Pill if detected */}
                    {item.relatedStock && (
                      <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333333] text-white px-1.5 py-0.5 rounded font-mono font-bold">
                        <Building2 className="w-2.5 h-2.5 text-white" />
                        <span>{item.relatedStock.name}</span>
                        <span className="text-[8px] text-neutral-400">({item.relatedStock.ticker})</span>
                      </div>
                    )}

                    {/* Sentiment / Good News vs Bad News Badge */}
                    {isBullish && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-pixel text-[8px] font-bold">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>POSITIVE / GOOD</span>
                      </span>
                    )}

                    {isBearish && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-400 font-pixel text-[8px] font-bold">
                        <TrendingDown className="w-2.5 h-2.5" />
                        <span>NEGATIVE / CAUTION</span>
                      </span>
                    )}

                    {!isBullish && !isBearish && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#111111] border border-[#262626] text-neutral-400 font-pixel text-[8px]">
                        <Minus className="w-2 h-2 text-neutral-500" />
                        <span>NEUTRAL / UPDATE</span>
                      </span>
                    )}

                    {/* Source Name & Code */}
                    <div className="flex items-center gap-1 text-neutral-400 bg-[#0a0a0a] border border-[#262626] px-1.5 py-0.5 rounded">
                      <Globe className="w-2.5 h-2.5 text-white" />
                      <span className="text-neutral-300 font-medium">{item.source}</span>
                      <span className="text-[8px] font-pixel text-neutral-500">[{item.sourceCode}]</span>
                    </div>

                    {/* Time Ago */}
                    <div className="flex items-center gap-1 text-neutral-500 ml-auto">
                      <Clock className="w-2.5 h-2.5 text-neutral-500" />
                      <span className="text-neutral-300 font-bold tabular-nums">{liveTime}</span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Terminal Bottom Status Bar */}
      <div className="bg-[#050505] border-t border-[#1a1a1a] px-3 py-1.5 flex items-center justify-between text-[9px] font-mono text-neutral-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-pixel text-[8px]">SOURCE WIRES:</span>
          <span className="text-neutral-400">MC • ET • Livemint • Business Standard • Hindu BusinessLine • Financial Express • Google Wire</span>
        </div>
        <div className="text-[8px] font-pixel text-white">
          POWERED BY REAL-TIME RSS ENGINE
        </div>
      </div>

    </div>
  );
};
