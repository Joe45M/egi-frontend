import { useEffect, useRef, useState } from 'react';
import adsConfig from '../config/ads.json';

function AdPlacement({ placement, className = "", style = {} }) {
  const adRef = useRef(null);
  const config = adsConfig.placements[placement];
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdFailed, setIsAdFailed] = useState(false);

  useEffect(() => {
    // If the placement is disabled or not configured, do nothing
    if (!config || !config.enabled) return;

    const adElement = adRef.current;
    if (!adElement) return;

    let observer = null;
    let timer = null;
    let pollInterval = null;
    let mutationObserver = null;

    // Check status helper
    const checkStatus = () => {
      const adStatus = adElement.getAttribute('data-ad-status');
      const hasIframe = adElement.querySelector('iframe') !== null;

      if (adStatus === 'filled' || hasIframe) {
        setIsAdLoaded(true);
        setIsAdFailed(false);
        return true;
      } else if (adStatus === 'unfilled') {
        setIsAdFailed(true);
        setIsAdLoaded(false);
        return true;
      }
      return false;
    };

    // 1. Set up MutationObserver to detect attributes and child changes added by AdSense
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        checkStatus();
      });
      mutationObserver.observe(adElement, { attributes: true, childList: true, subtree: true });
    }

    // 2. Set up fallback timeout to check if loading failed (due to AdBlocker or explicit unfilled status)
    const timeoutTimer = setTimeout(() => {
      const adStatus = adElement.getAttribute('data-ad-status');
      const hasIframe = adElement.querySelector('iframe') !== null;

      if (adStatus === 'unfilled') {
        setIsAdFailed(true);
      } else if (!window.adsbygoogle || (!hasIframe && !adStatus)) {
        // Only collapse if the script is blocked (no adsbygoogle) or it has zero activity
        setIsAdFailed(true);
      } else if (adStatus === 'filled' || hasIframe) {
        setIsAdLoaded(true);
        setIsAdFailed(false);
      }
    }, 8000); // 8 seconds timeout (allows slow network loads without premature collapse)

    // 3. AdSense Initialization Logic
    const initAd = () => {
      if (!window.adsbygoogle) return false;

      // Check if the element is visible (has width > 0)
      if (adElement.offsetWidth > 0) {
        try {
          if (!adElement.dataset.adsbygoogleStatus) {
            window.adsbygoogle.push({});
            adElement.dataset.adsbygoogleStatus = 'done';
          }
          return true; // Successfully initialized
        } catch (e) {
          console.error(`AdSense error for placement "${placement}":`, e);
          return true; // Don't try again if it errored
        }
      }
      return false; // Not initialized yet because width is 0
    };

    const tryInit = () => {
      const success = initAd();
      if (!success) {
        // If adsbygoogle is not loaded yet, or element width is 0, poll for script availability
        let pollCount = 0;
        pollInterval = setInterval(() => {
          pollCount++;
          if (window.adsbygoogle && adElement.offsetWidth > 0) {
            if (initAd()) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          } else if (pollCount > 30) { // Stop polling after 6 seconds (30 * 200ms)
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }, 200);

        // Also monitor for size changes if width was 0 initially
        if (adElement.offsetWidth === 0 && typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(() => {
            if (adElement.offsetWidth > 0 && window.adsbygoogle) {
              if (initAd()) {
                observer.disconnect();
                observer = null;
                if (pollInterval) {
                  clearInterval(pollInterval);
                  pollInterval = null;
                }
              }
            }
          });
          observer.observe(adElement);
        }
      }
    };

    // Delay slightly to ensure layout has computed sizes
    timer = setTimeout(tryInit, 150);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(timeoutTimer);
      if (pollInterval) clearInterval(pollInterval);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [placement, config]);

  // If placement is disabled or ad failed to load (no fill / blocked), don't render anything
  if (!config || !config.enabled || isAdFailed) {
    return null;
  }

  const clientId = adsConfig.clientId;
  const { slot, format = "auto", responsive = true, style: configStyle = {} } = config;

  if (!clientId || !slot) {
    console.warn(`AdSense: clientId and slot are required for placement: ${placement}`);
    return null;
  }

  // Determine standard classes and min-heights based on the placement type to prevent CLS
  let minHeightClass = "min-h-[90px]";
  if (placement === "articleSidebar" || placement === "paldexSidebar") {
    minHeightClass = "min-h-[250px] md:min-h-[300px]";
  } else if (placement === "globalHeader" || placement === "paldexGrid") {
    minHeightClass = "min-h-[60px] md:min-h-[90px]";
  } else if (placement === "globalFooter") {
    minHeightClass = "min-h-[90px]";
  } else if (placement === "calculatorContent") {
    minHeightClass = "min-h-[100px] md:min-h-[120px]";
  }

  // Combine inline styles
  const combinedStyle = {
    display: "block",
    width: "100%",
    textAlign: "center",
    ...configStyle,
    ...style
  };

  return (
    <div className={`ad-placement-container my-8 flex flex-col items-center justify-center w-full transition-all duration-300 ${isAdLoaded ? '' : minHeightClass} ${className}`}>
      {/* Subtle Ad Label - only visible once the ad has successfully loaded */}
      {isAdLoaded && (
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 select-none">
          Advertisement
        </span>
      )}
      <div className="w-full flex justify-center overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={combinedStyle}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}

export default AdPlacement;
