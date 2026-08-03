import { useState, useEffect, useCallback } from 'react';

/**
 * Robust multi-vector AdBlock detection function.
 * Uses 3 independent probes:
 * 1. DOM Bait Element Probe (AdBlock CSS rule filters)
 * 2. Network Fetch Probe (Ad network URL / script filters)
 * 3. AdSense Script / Global Object Probe
 *
 * @returns {Promise<boolean>} True if an adblocker is detected, false otherwise.
 */
export async function detectAdBlock() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body) {
    return false; // Server-side rendering safety
  }

  try {
    // Vector 1: DOM Bait Element Probe
    // Create elements with classes & IDs commonly blocked by uBlock, AdBlock Plus, AdGuard, Brave
    const baitClasses = [
      'adsbygoogle',
      'ad-placement',
      'ad-banner',
      'adsbox',
      'banner_ad',
      'ad-slot',
      'sponsor-banner'
    ];

    const bait = document.createElement('div');
    bait.className = baitClasses.join(' ');
    bait.setAttribute('aria-hidden', 'true');
    bait.style.cssText = 'position: absolute !important; top: -9999px !important; left: -9999px !important; width: 100px !important; height: 100px !important; pointer-events: none !important;';

    // Add a fake inner element mimicking AdSense structure
    const baitInner = document.createElement('ins');
    baitInner.className = 'adsbygoogle';
    baitInner.style.cssText = 'display: block !important; width: 100px !important; height: 100px !important;';
    bait.appendChild(baitInner);

    document.body.appendChild(bait);

    // Give browser paint cycle a moment to apply adblocker CSS rules
    await new Promise((resolve) => setTimeout(resolve, 80));

    const computedStyle = window.getComputedStyle(bait);
    const innerComputedStyle = window.getComputedStyle(baitInner);

    const isDomBlocked =
      bait.offsetHeight === 0 ||
      bait.offsetWidth === 0 ||
      bait.clientHeight === 0 ||
      computedStyle.display === 'none' ||
      computedStyle.visibility === 'hidden' ||
      innerComputedStyle.display === 'none' ||
      innerComputedStyle.visibility === 'hidden';

    // Cleanup bait element
    if (bait.parentNode) {
      bait.parentNode.removeChild(bait);
    }

    if (isDomBlocked) {
      return true;
    }

    // Vector 2: Network Probe (Fetch probe targeting ad script URL)
    try {
      const adUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      await fetch(adUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      });
      // In no-cors mode, fetch succeeding means request wasn't blocked.
    } catch (networkError) {
      // Network fetch error (TypeError: Failed to fetch) indicates adblocker blocked network request
      return true;
    }

    // Vector 3: Global AdSense Object Probe
    if (window.adsbygoogle && window.adsbygoogle.loaded === false && window.adsbygoogle.length === 0) {
      const isStubbed = typeof window.adsbygoogle.push !== 'function';
      if (isStubbed) return true;
    }

    return false;
  } catch (e) {
    console.warn('AdBlock detection probe error:', e);
    return false;
  }
}

/**
 * Custom React Hook for AdBlock detection and state management.
 */
export function useAdBlockDetector() {
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasSnoozed, setHasSnoozed] = useState(false);

  const runCheck = useCallback(async () => {
    setIsChecking(true);
    const detected = await detectAdBlock();
    setIsAdBlockerActive(detected);
    setIsChecking(false);
    return detected;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check local storage for temporary snooze pass
    const snoozeExpiry = localStorage.getItem('egi_adblock_snooze_until');
    if (snoozeExpiry && Date.now() < parseInt(snoozeExpiry, 10)) {
      setHasSnoozed(true);
      setIsChecking(false);
      return;
    }

    runCheck();
  }, [runCheck]);

  const recheckAdBlock = async () => {
    return await runCheck();
  };

  const dismissGracePeriod = (minutes = 60) => {
    if (typeof window !== 'undefined') {
      const expiry = Date.now() + minutes * 60 * 1000;
      localStorage.setItem('egi_adblock_snooze_until', expiry.toString());
      setHasSnoozed(true);
      setIsAdBlockerActive(false);
    }
  };

  return {
    isAdBlockerActive: hasSnoozed ? false : isAdBlockerActive,
    isChecking,
    recheckAdBlock,
    dismissGracePeriod
  };
}
