import { useEffect, useRef } from 'react';
import adsConfig from '../config/ads.json';

function AdPlacement({ placement, className = "", style = {} }) {
  const adRef = useRef(null);
  const config = adsConfig.placements[placement];

  useEffect(() => {
    // If the placement is disabled or not configured, do nothing
    if (!config || !config.enabled) return;

    let observer = null;
    let timer = null;

    const initAd = () => {
      const adElement = adRef.current;
      if (!adElement || !window.adsbygoogle) return false;

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
        // If not initialized (due to offsetWidth = 0), monitor for size changes
        const adElement = adRef.current;
        if (adElement && typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(() => {
            if (adElement.offsetWidth > 0) {
              if (initAd()) {
                observer.disconnect();
                observer = null;
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
      if (observer) {
        observer.disconnect();
      }
    };
  }, [placement, config]);

  // If placement is not found or disabled, don't render anything
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
    textAlign: "center",
    ...configStyle,
    ...style
  };

  return (
    <div className={`ad-placement-container my-8 flex flex-col items-center justify-center w-full transition-all duration-300 ${minHeightClass} ${className}`}>
      {/* Subtle Ad Label */}
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 select-none">
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

export default AdPlacement;
