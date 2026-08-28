import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MinimalHeader } from './components/MinimalHeader';
import { Level1Homepage } from './components/Level1Homepage';
import { Level3IndexDetail } from './components/Level3IndexDetail';
import { RRGView } from './components/RRGView';
import { SECTORAL_INDICES } from './data/sectoralIndices';
import type { MarketBreadthResponse } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation view: 'home' | 'breadth' | 'rotation'
  const [view, setView] = useState<'home' | 'breadth' | 'rotation'>('home');
  const [currentIndexId, setCurrentIndexId] = useState<string>('NIFTY_50');

  // Breadth Data State
  const [data, setData] = useState<MarketBreadthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch breadth data from backend for given index
  const fetchData = useCallback(async (indexId: string, force = false) => {
    try {
      setLoading(true);
      setError(null);
      const url = force
        ? `/api/breadth?index=${encodeURIComponent(indexId)}&refresh=true`
        : `/api/breadth?index=${encodeURIComponent(indexId)}`;
      const response = await axios.get(url);
      if (response.data?.success && response.data?.data) {
        setData(response.data.data);
      } else {
        throw new Error(response.data?.error || `Failed to fetch breadth data for ${indexId}`);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error communicating with market breadth engine.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state with URL hash on load or back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#rotation') || hash.startsWith('#rrg')) {
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
    <div className="min-h-screen bg-[#000000] text-slate-100 flex flex-col font-mono selection:bg-[#ff3b00] selection:text-black">
      
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
        {/* HOMEPAGE: 2 Quantitative Indicators (Market Breadth + Sector Rotation Matrix) */}
        {view === 'home' && (
          <Level1Homepage
            onEnterBreadth={handleEnterBreadth}
            onEnterRotation={handleEnterRotation}
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
                <div className="p-4 border border-[#ff3b00] bg-[#120505] text-rose-300 flex items-center justify-between gap-3 text-xs rounded-xl shadow-pixel-orange">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-[#ff3b00]" />
                    <span className="font-pixel text-[10px]">{error}</span>
                  </div>
                  <button
                    onClick={() => fetchData(currentIndexId, true)}
                    className="px-3 py-1.5 bg-[#ff3b00] text-black font-pixel text-[9px] rounded transition-colors shrink-0 cursor-pointer uppercase"
                  >
                    RETRY
                  </button>
                </div>
              </div>
            )}

            {/* Loading state if data is fetching for first time */}
            {loading && !data ? (
              <div className="py-24 flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="p-6 bg-[#060609] border border-[#1a1a28] rounded-xl flex items-center gap-4 max-w-md shadow-pixel-orange">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#ff3b00]" />
                  <div>
                    <div className="font-pixel text-xs text-white">
                      INITIALIZING {activeIndexDef.name}...
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
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
      <footer className="border-t border-[#12121c] py-4 bg-[#000000] text-[11px] text-slate-500 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[#bef264] text-[10px]">praxeo</span>
            <span className="text-slate-700">•</span>
            <span className="font-mono text-slate-400 text-xs">QUANTITATIVE SUITE</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            MARKET BREADTH MATRIX • SECTOR ROTATION MATRIX • RELATIVE STRENGTH &amp; MOMENTUM
          </div>
        </div>
      </footer>

    </div>
  );
}
