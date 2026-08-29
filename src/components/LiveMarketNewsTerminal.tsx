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
    const filtered = news.filter((item) => {
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
    <div className="w-full bg-[#05050a] border-2 border-[#ff3b00]/70 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-left select-none">
      
      {/* 1. Terminal Top Ribbon (Bloomberg / DJ Style) */}
      <div className="bg-[#120707] border-b border-[#301212] px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap text-[10px]">
        {/* Left Function Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#ff3b00] text-black px-1.5 py-0.5 rounded font-pixel text-[8px] font-black tracking-wider">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>LIVE NEWS</span>
          </div>
          <span className="text-[#ff3b00] font-pixel text-[9px] tracking-wide">
            INDIA MARKET WIRE
          </span>
          <span className="hidden sm:inline-block text-slate-500 text-[9px]">
            [NSE / BSE / MACRO]
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {lastFetchedTime && (
            <span className="text-slate-400 text-[9px] hidden md:inline font-mono">
              UPDATED: <span className="text-[#bef264] font-bold">{lastFetchedTime}</span>
            </span>
          )}
          <button
            onClick={() => fetchNews(true)}
            disabled={refreshing || loading}
            title="Refresh Live Feeds"
            className="flex items-center gap-1 bg-[#1c0d0d] hover:bg-[#2e1313] border border-[#ff3b00]/40 text-[#ff3b00] hover:text-white px-2 py-0.5 rounded text-[8px] font-pixel transition-all cursor-pointer"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* 2. DJ Action Toolbar (Deep Red/Burgundy bar as seen in Bloomberg/DJ) */}
      <div className="bg-[#240808] border-b border-[#401212] px-3 py-1.5 flex items-center justify-between gap-2 flex-wrap">
        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[8px] font-pixel">
          {(['ALL', 'CORPORATE', 'MARKET', 'ECONOMY'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                selectedFilter === cat
                  ? 'bg-[#ff3b00] text-black font-bold shadow-sm'
                  : 'bg-[#150505] text-slate-300 hover:text-white hover:bg-[#300c0c]'
              }`}
            >
              {cat === 'ALL' ? 'ALL WIRE' : cat}
            </button>
          ))}
        </div>

        {/* Live Headline Count */}
        <div className="text-[9px] text-slate-400 font-pixel flex items-center gap-1">
          <span className="text-[#bef264] font-bold">{filteredNews.length}</span>
          <span>STORIES</span>
        </div>
      </div>

      {/* 3. Search Bar (Bloomberg Amber '<What do you want news on?>' style) */}
      <div className="bg-[#0c0c16] border-b border-[#1c1c2e] px-3 py-1.5 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-[#ff8800] shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search news, stock name (e.g. Tata Motors, Reliance), or source..."
          className="w-full bg-transparent border-none outline-none text-white text-xs font-mono placeholder:text-slate-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[9px] font-pixel text-slate-400 hover:text-white px-1"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* 4. Real-time News Items Feed Container */}
      <div className="max-h-[340px] sm:max-h-[380px] overflow-y-auto divide-y divide-[#141422] p-0 custom-scrollbar">
        {loading && news.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 text-[#ff3b00] animate-spin" />
            <span className="font-pixel text-[9px] text-slate-400">POLLING LIVE GOOGLE & FINANCIAL RSS WIRES...</span>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-10 text-center text-slate-400 space-y-1">
            <p className="font-pixel text-[10px] text-slate-300">NO MATCHING HEADLINES FOUND</p>
            <p className="text-xs text-slate-500 font-mono">Try searching with a different stock name or category.</p>
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
                    ? 'bg-[#2e1505] ring-1 ring-[#ff8800] shadow-[0_0_15px_rgba(255,136,0,0.3)] animate-pulse'
                    : isTopStory
                    ? 'bg-[#090914] hover:bg-[#0f0f20]'
                    : 'hover:bg-[#0c0c18]'
                }`}
              >
                {/* Index Number (Terminal sequence 1), 2), 3)...) */}
                <div className="flex flex-col items-end shrink-0 pt-0.5 w-6">
                  <span className={`text-[10px] font-pixel tabular-nums ${isTopStory ? 'text-[#bef264] font-bold' : 'text-[#ff8800] opacity-80'}`}>
                    {index + 1})
                  </span>
                  {isTopStory && (
                    <span className="text-[7px] font-pixel text-[#bef264] leading-tight">TOP</span>
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Single Line Headline + Breaking indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 flex-1">
                      {isBreaking && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] font-pixel font-bold bg-[#ff3b00] text-black rounded shrink-0 mt-0.5 animate-pulse">
                          <Zap className="w-2 h-2 fill-current" />
                          <span>NEW</span>
                        </span>
                      )}
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-100 group-hover:text-white font-mono text-[11px] sm:text-xs leading-snug font-medium line-clamp-2 hover:underline flex-1"
                      >
                        {item.title}
                      </a>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 group-hover:text-[#ff3b00] shrink-0 p-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Bottom Metadata Ribbon (Stock Name, Good/Bad News Tag, Source, Time) */}
                  <div className="flex items-center gap-2 flex-wrap text-[9px] font-mono pt-0.5">
                    
                    {/* Related Stock Pill if detected */}
                    {item.relatedStock && (
                      <div className="flex items-center gap-1 bg-[#0d121f] border border-[#2b3b60] text-[#7dd3fc] px-1.5 py-0.5 rounded font-mono font-bold">
                        <Building2 className="w-2.5 h-2.5 text-[#38bdf8]" />
                        <span>{item.relatedStock.name}</span>
                        <span className="text-[8px] text-slate-400">({item.relatedStock.ticker})</span>
                      </div>
                    )}

                    {/* Sentiment / Good News vs Bad News Badge */}
                    {isBullish && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0b1f0e] border border-[#166534] text-[#4ade80] font-pixel text-[8px] font-bold">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>POSITIVE / GOOD</span>
                      </span>
                    )}

                    {isBearish && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#240c0c] border border-[#991b1b] text-[#f87171] font-pixel text-[8px] font-bold">
                        <TrendingDown className="w-2.5 h-2.5" />
                        <span>NEGATIVE / CAUTION</span>
                      </span>
                    )}

                    {!isBullish && !isBearish && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#101018] border border-[#222234] text-slate-400 font-pixel text-[8px]">
                        <Minus className="w-2 h-2 text-slate-500" />
                        <span>NEUTRAL / UPDATE</span>
                      </span>
                    )}

                    {/* Source Name & Code */}
                    <div className="flex items-center gap-1 text-slate-400 bg-[#090912] border border-[#181828] px-1.5 py-0.5 rounded">
                      <Globe className="w-2.5 h-2.5 text-[#bef264]" />
                      <span className="text-slate-300 font-medium">{item.source}</span>
                      <span className="text-[8px] font-pixel text-slate-500">[{item.sourceCode}]</span>
                    </div>

                    {/* Time Ago */}
                    <div className="flex items-center gap-1 text-slate-500 ml-auto">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      <span className="text-slate-300 font-bold tabular-nums">{liveTime}</span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Terminal Bottom Status Bar */}
      <div className="bg-[#080810] border-t border-[#1a1a28] px-3 py-1.5 flex items-center justify-between text-[9px] font-mono text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#bef264] font-pixel text-[8px]">SOURCE WIRES:</span>
          <span className="text-slate-400">MC • ET • Livemint • Business Standard • Hindu BusinessLine • Financial Express • Google Wire</span>
        </div>
        <div className="text-[8px] font-pixel text-slate-500">
          POWERED BY REAL-TIME RSS ENGINE
        </div>
      </div>

    </div>
  );
};
