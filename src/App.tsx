import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MinimalHeader } from './components/MinimalHeader';
import { Level1Homepage } from './components/Level1Homepage';
import { Level3IndexDetail } from './components/Level3IndexDetail';
import { RRGView } from './components/RRGView';
import { NiftyReturnScatterView } from './components/NiftyReturnScatterView';
import { SECTORAL_INDICES } from './data/sectoralIndices';
import type { MarketBreadthResponse } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation view: 'home' | 'breadth' | 'rotation' | 'scatter'
  const [view, setView] = useState<'home' | 'breadth' | 'rotation' | 'scatter'>('home');
  const [currentIndexId, setCurrentIndexId] = useState<string>('NIFTY_50');

  // Breadth Data State
  const [data, setData] = useState<MarketBreadthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch breadth data from backend for given index with automatic retry & client cache
  const fetchData = useCallback(async (indexId: string, force = false, retryCount = 2) => {
    try {
      setLoading(true);
      setError(null);

      // Check client-side storage cache for instantaneous transition
      if (!force) {
        try {
          const cachedStr = sessionStorage.getItem(`praxeo_breadth_${indexId}`);
          if (cachedStr) {
            const cachedObj = JSON.parse(cachedStr);
            if (cachedObj && cachedObj.stocks?.length > 0) {
              setData(cachedObj);
            }
          }
        } catch {
          // ignore session storage error
        }
      }

      const url = force
        ? `/api/breadth?index=${encodeURIComponent(indexId)}&refresh=true`
        : `/api/breadth?index=${encodeURIComponent(indexId)}`;
      
      let lastErr: any = null;
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const response = await axios.get(url, { timeout: 20000 });
          if (response.data?.success && response.data?.data) {
            setData(response.data.data);
            setError(null);
            try {
              sessionStorage.setItem(`praxeo_breadth_${indexId}`, JSON.stringify(response.data.data));
            } catch {
              // ignore storage quota error
            }
            return;
          } else {
            throw new Error(response.data?.error || `Failed to fetch breadth data for ${indexId}`);
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
      // Check if we have cached data before showing any error
      try {
        const cachedStr = sessionStorage.getItem(`praxeo_breadth_${indexId}`);
        if (cachedStr) {
          const cachedObj = JSON.parse(cachedStr);
          if (cachedObj && cachedObj.stocks?.length > 0) {
            setData(cachedObj);
            setError(null);
            return;
          }
        }
      } catch {
        // ignore
      }

      setData(prevData => {
        if (!prevData) {
          setError(err.message || 'Connecting to market telemetry...');
        }
        return prevData;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state with URL hash on load or back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#scatter')) {
        setView('scatter');
      } else if (hash.startsWith('#rotation') || hash.startsWith('#rrg')) {
        setView('rotation');
      } else if (hash.startsWith('#breadth')) {
        setView('breadth');
        const params = new URLSearchParams(hash.replace('#breadth?', '').replace('#breadth', ''));
        const indexFromUrl = params.get('index');
        const targetId = indexFromUrl && SECTORAL_INDICES.some(s => s.id === indexFromUrl) ? indexFromUrl : 'NIFTY_50';
        setCurrentIndexId(targetId);
        fetchData(targetId, false);
      } else {
        setView('home');
      }
    };

    handleHashChange();
    window.addEventListener('popstate', handleHashChange);
    return () => window.removeEventListener('popstate', handleHashChange);
  }, [fetchData]);

  // Automated background polling: keep breadth data continuously fresh without manual intervention
  useEffect(() => {
    if (view !== 'breadth') return;
    const interval = setInterval(() => {
      fetchData(currentIndexId, false);
    }, 45000); // 45 seconds seamless auto-update
    return () => clearInterval(interval);
  }, [view, currentIndexId, fetchData]);

  // Direct Transition to NIFTY 50 on Enter Market Breadth
  const handleEnterBreadth = () => {
    const targetId = 'NIFTY_50';
    setCurrentIndexId(targetId);
    setView('breadth');
    window.location.hash = `#breadth?index=${targetId}`;
    fetchData(targetId, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Transition to Sector Rotation Matrix Engine
  const handleEnterRotation = () => {
    setView('rotation');
    window.location.hash = '#rotation';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Transition to Nifty 50 Cross-Sectional Return Scatter Plot
  const handleEnterScatter = () => {
    setView('scatter');
    window.location.hash = '#scatter';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch Sector Index directly in Breadth
  const handleSelectIndex = (indexId: string) => {
    setCurrentIndexId(indexId);
    setView('breadth');
    window.location.hash = `#breadth?index=${indexId}`;
    fetchData(indexId, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Level 1 (Homepage)
  const handleNavigateHome = () => {
    setView('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeIndexDef = SECTORAL_INDICES.find(s => s.id === currentIndexId) || SECTORAL_INDICES[0];

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-mono selection:bg-neutral-800 selection:text-white">
      
      {/* Retro Minimal Header */}
      <MinimalHeader
        level={view === 'home' ? 1 : 3}
        onNavigateHome={handleNavigateHome}
        onRefresh={() => fetchData(currentIndexId, true)}
        loading={loading}
        currentIndexName={view === 'rotation' ? 'SECTOR ROTATION MATRIX' : (data?.indexName || activeIndexDef.name)}
      />

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col">
        {/* HOMEPAGE: 3 Quantitative Indicators (Market Breadth + Sector Rotation Matrix + Return Scatter) */}
        {view === 'home' && (
          <Level1Homepage
            onEnterBreadth={handleEnterBreadth}
            onEnterRotation={handleEnterRotation}
            onEnterScatter={handleEnterScatter}
          />
        )}

        {/* INDICATOR 3: NIFTY 50 CROSS-SECTIONAL RETURN SCATTER PLOT */}
        {view === 'scatter' && (
          <NiftyReturnScatterView
            onBackToHome={handleNavigateHome}
          />
        )}

        {/* INDICATOR 2: SECTOR ROTATION MATRIX FULL PAGE */}
        {view === 'rotation' && (
          <RRGView
            onBackHome={handleNavigateHome}
            onNavigateBreadth={handleEnterBreadth}
          />
        )}

        {/* INDICATOR 1: MARKET BREADTH DETAIL PAGE */}
        {view === 'breadth' && (
          <>
            {/* Error Message */}
            {error && (
              <div className="max-w-6xl mx-auto w-full px-4 pt-6">
                <div className="p-4 border border-white/20 bg-[#0a0a0a] text-white flex items-center justify-between gap-3 text-xs rounded-xl shadow-none">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-white" />
                    <span className="font-pixel text-[10px] text-white">{error}</span>
                  </div>
                  <button
                    onClick={() => fetchData(currentIndexId, true)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-pixel text-[9px] rounded transition-colors shrink-0 cursor-pointer uppercase"
                  >
                    RETRY
                  </button>
                </div>
              </div>
            )}

            {/* Loading state if data is fetching for first time */}
            {loading && !data ? (
              <div className="py-24 flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="p-6 bg-[#0a0a0a] border border-[#262626] rounded-xl flex items-center gap-4 max-w-md shadow-lg">
                  <RefreshCw className="w-6 h-6 animate-spin text-white" />
                  <div>
                    <div className="font-pixel text-xs text-white">
                      INITIALIZING {activeIndexDef.name}...
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                      Computing 1D candle closes, EMAs 9/20/50/100/200, A/D &amp; RS metrics
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              data && (
                <Level3IndexDetail
                  data={data}
                  loading={loading}
                  onRefresh={() => fetchData(currentIndexId, true)}
                  onBackHome={handleNavigateHome}
                  onSelectIndex={handleSelectIndex}
                />
              )
            )}
          </>
        )}
      </main>

      {/* Minimal Hacker Footer */}
      <footer className="border-t border-[#1a1a1a] py-4 bg-[#000000] text-[11px] text-neutral-500 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-white text-[10px]">Prexios</span>
            <span className="text-neutral-700">•</span>
            <span className="font-mono text-neutral-400 text-[11px]">By zero-sum Commune</span>
          </div>
          <div className="text-neutral-500 font-mono text-[11px]">
            Created by peyush!
          </div>
        </div>
      </footer>

    </div>
  );
}
