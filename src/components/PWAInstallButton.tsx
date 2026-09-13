import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff8800] hover:bg-[#ff9d2e] text-black font-pixel text-[9px] font-bold rounded shadow-lg transition-all"
      >
        <Download className="w-3 h-3" />
        INSTALL TERMINAL
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a2e] border border-[#ff8800]/50 hover:bg-[#23233a] text-[#ff8800] font-pixel text-[9px] font-bold rounded shadow-lg transition-all"
        >
          <Download className="w-3 h-3" />
          INSTALL ON IOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#0a0a14] border-2 border-[#ff8800] p-6 shadow-[0_0_30px_rgba(255,136,0,0.2)]">
              <h3 className="text-sm font-pixel text-[#ff8800] mb-4 text-center">Install on iPhone / iPad</h3>
              <p className="mt-2 text-xs font-mono text-slate-300 leading-relaxed mb-6">
                1. Tap the <strong>Share</strong> button in the Safari toolbar.<br /><br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded bg-[#ff8800] py-2 text-[10px] font-pixel text-black font-bold hover:bg-[#ff9d2e] transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
