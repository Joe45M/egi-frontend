import React, { useEffect, useRef, useState, memo } from 'react';
import adsConfig from '../config/ads.json';

function AdPlacement({ placement, className = "", style = {} }) {
  const adRef = useRef(null);
  const config = adsConfig.placements[placement];
  const [isAdLoaded, setIsAdLoaded] = useState(false);

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
        return true;
      } else if (adStatus === 'unfilled') {
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

    // 2. Set up fallback timeout to check status
    const timeoutTimer = setTimeout(() => {
      const adStatus = adElement.getAttribute('data-ad-status');
      const hasIframe = adElement.querySelector('iframe') !== null;

      if (adStatus === 'filled' || hasIframe) {
        setIsAdLoaded(true);
      }
    }, 8000);

    // 3. AdSense Initialization Logic
    const initAd = () => {
      if (!window.adsbygoogle) return false;
      if (adElement.dataset.adsbygoogleStatus === 'done') return true;

      try {
        window.adsbygoogle.push({});
        adElement.dataset.adsbygoogleStatus = 'done';
        return true;
      } catch (e) {
        console.error(`AdSense error for placement "${placement}":`, e);
        return true; // Don't try again if it errored
      }
    };

    const tryInit = () => {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        initAd();
        return;
      }

      // If adsbygoogle is not loaded yet, observe visibility/resize without querying offsetWidth
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver((entries) => {
          const width = entries[0]?.contentRect?.width || 0;
          if (width > 0 && window.adsbygoogle) {
            if (initAd()) {
              if (observer) {
                observer.disconnect();
                observer = null;
              }
            }
          }
        });
        observer.observe(adElement);
      }

      // Check when adsbygoogle script becomes available
      let pollCount = 0;
      pollInterval = setInterval(() => {
        pollCount++;
        if (window.adsbygoogle) {
          if (initAd()) {
            clearInterval(pollInterval);
            pollInterval = null;
            if (observer) {
              observer.disconnect();
              observer = null;
            }
          }
        } else if (pollCount > 30) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }, 250);
    };

    // Delay initialization slightly to let the initial render frame settle
    timer = setTimeout(tryInit, 200);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(timeoutTimer);
      if (pollInterval) clearInterval(pollInterval);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [placement, config]);

  // If placement is disabled in config, don't render anything
  if (!config || !config.enabled) {
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
    <div className={`ad-placement-container my-8 flex flex-col items-center justify-center w-full ${minHeightClass} ${className}`}>
      {/* Subtle Ad Label - height reserved to prevent Cumulative Layout Shift */}
      <span className={`text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 select-none transition-opacity duration-300 ${isAdLoaded ? 'opacity-100' : 'opacity-0 invisible'}`}>
        Advertisement
      </span>
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

export default memo(AdPlacement);
