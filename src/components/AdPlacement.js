import { useEffect, useRef } from 'react';
import adsConfig from '../config/ads.json';

function AdPlacement({ placement, className = "", style = {} }) {
  const adRef = useRef(null);
  const config = adsConfig.placements[placement];

  useEffect(() => {
    // If the placement is disabled or not configured, do nothing
    if (!config || !config.enabled) return;

    const timer = setTimeout(() => {
      if (adRef.current && window.adsbygoogle) {
        try {
          const adElement = adRef.current;
          // Check if this ad hasn't been initialized yet
          if (!adElement.dataset.adsbygoogleStatus) {
            window.adsbygoogle.push({});
            adElement.dataset.adsbygoogleStatus = 'done';
          }
        } catch (e) {
          console.error(`AdSense error for placement "${placement}":`, e);
        }
      }
    }, 150); // slight delay to ensure DOM is ready and prevent layout shift during mount

    return () => clearTimeout(timer);
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
