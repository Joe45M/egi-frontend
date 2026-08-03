import { useState, useEffect } from 'react';
import { ShieldWarning, ArrowClockwise, CheckCircle, Info, Sparkle, LockLaminated } from 'phosphor-react';
import { useAdBlockDetector } from '../utils/adBlockDetector';
import { splitArticleContent } from '../utils/contentSplitter';

function AntiAdBlocker({ content, paragraphCut = 1 }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAdBlockerActive, recheckAdBlock, dismissGracePeriod } = useAdBlockDetector();
  const [rechecking, setRechecking] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [recheckMessage, setRecheckMessage] = useState('');

  // Hydration safety: ensure client initial render matches server rendered HTML
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { introHtml, restrictedHtml } = splitArticleContent(content, paragraphCut);

  const handleRecheck = async () => {
    setRechecking(true);
    setRecheckMessage('');
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    const stillActive = await recheckAdBlock();
    setRechecking(false);

    if (!stillActive) {
      setJustUnlocked(true);
      setTimeout(() => setJustUnlocked(false), 3000);
    } else {
      setRecheckMessage('Ad blocker still detected. Please ensure it is disabled for this domain and try again.');
    }
  };

  const handleSnooze = () => {
    dismissGracePeriod(120); // 2-hour grace pass
  };

  // During SSR or before client hydration completes, render full content to avoid Hydration Error #418
  if (!isHydrated || !restrictedHtml) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // If adblocker is not active or user just unlocked
  if (!isAdBlockerActive && !justUnlocked) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <div className="anti-adblock-wrapper relative">
      {/* First Paragraph (Always Visible) */}
      <div
        className="wp-content-intro mb-6"
        dangerouslySetInnerHTML={{ __html: introHtml }}
      />

      {/* Unlocked Toast Banner if just unblocked */}
      {justUnlocked && (
        <div className="my-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center gap-3 backdrop-blur-md animate-fade-in shadow-lg shadow-emerald-950/40">
          <CheckCircle size={28} className="text-emerald-400 shrink-0" weight="fill" />
          <div>
            <h4 className="font-bold text-sm text-emerald-300">Ad Blocker Disabled — Thank You!</h4>
            <p className="text-xs text-emerald-400/90">Your support allows us to continue producing free guides and content.</p>
          </div>
        </div>
      )}

      {/* Blurred & Gated Content Area */}
      {isAdBlockerActive && (
        <div className="relative mt-4">
          {/* Blurred preview of remaining article content */}
          <div
            className="wp-content-restricted select-none pointer-events-none filter blur-[8px] opacity-25 max-h-[500px] overflow-hidden transition-all duration-700"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: restrictedHtml }}
          />

          {/* Gradient overlay masking the bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0f1a]/80 to-[#0d0f1a] pointer-events-none" />

          {/* Stylish Anti-Adblock Paywall Card */}
          <div className="absolute inset-x-0 top-6 z-30 flex justify-center px-2 md:px-4">
            <div className="w-full max-w-xl bg-base-900/90 backdrop-blur-xl border border-accent-violet-500/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-accent-violet-950/60 relative overflow-hidden transition-all duration-300">
              
              {/* Top ambient glow background elements */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-violet-600/20 rounded-full filter blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-pink-600/20 rounded-full filter blur-3xl pointer-events-none" />

              <div className="relative z-10 text-center">
                {/* Shield Icon Badge */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet-900/60 to-accent-pink-900/40 border border-accent-violet-500/40 mb-4 shadow-lg shadow-accent-violet-950/50">
                  <ShieldWarning size={36} className="text-accent-pink-400 animate-pulse" weight="duotone" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-violet-950/70 border border-accent-violet-500/30 text-[11px] font-mono font-bold tracking-wider text-accent-violet-300 uppercase mb-3">
                  <Sparkle size={12} className="text-accent-pink-400" />
                  Support Free Gaming Content
                </div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
                  Please Disable Your Ad Blocker
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  We rely on non-intrusive advertisements to keep our gaming guides, tools, and servers <span className="text-white font-semibold">100% free for everyone</span> without paywalls.
                </p>

                {/* Quick Steps Guide */}
                <div className="bg-base-950/60 border border-base-800 rounded-2xl p-4 mb-6 text-left space-y-2.5">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Info size={14} className="text-accent-violet-400" />
                    How to whitelist us in 3 seconds:
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-violet-950 text-accent-violet-300 font-bold text-[10px] shrink-0 border border-accent-violet-500/30">1</span>
                    <span>Click your ad blocker icon in your browser extension toolbar.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-violet-950 text-accent-violet-300 font-bold text-[10px] shrink-0 border border-accent-violet-500/30">2</span>
                    <span>Select <strong className="text-white">"Don't run on pages on this site"</strong> or toggle to pause.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-violet-950 text-accent-violet-300 font-bold text-[10px] shrink-0 border border-accent-violet-500/30">3</span>
                    <span>Click the button below to instantly unlock the full article.</span>
                  </div>
                </div>

                {recheckMessage && (
                  <p className="text-xs text-rose-400 font-semibold mb-4 bg-rose-950/40 border border-rose-800/40 p-2.5 rounded-xl">
                    {recheckMessage}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleRecheck}
                    disabled={rechecking}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-accent-violet-600 via-accent-violet-500 to-accent-pink-600 hover:from-accent-violet-500 hover:to-accent-pink-500 text-white font-bold text-sm shadow-lg shadow-accent-violet-950/60 hover:shadow-accent-violet-600/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <ArrowClockwise size={18} className={rechecking ? 'animate-spin' : ''} />
                    {rechecking ? 'Re-checking Ad Blocker...' : "I've Disabled AdBlock"}
                  </button>

                  <button
                    onClick={handleSnooze}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-base-800/80 hover:bg-base-800 text-gray-300 hover:text-white font-semibold text-xs border border-base-700 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Continue reading for this session"
                  >
                    <LockLaminated size={14} className="text-gray-400" />
                    Temporary Reader Pass
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AntiAdBlocker;
