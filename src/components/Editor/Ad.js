import { useEffect, useRef } from 'react';

function Ad({ 
  clientId, 
  slot, 
  format = "auto", 
  responsive = true,
  className = "" 
}) {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  if (!clientId || !slot) {
    console.warn("AdSense: clientId and slot are required");
    return null;
  }

  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

export default Ad;

