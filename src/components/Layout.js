import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import LatestArticleRibbon from './LatestArticleRibbon';
import ScrollToTop from './ScrollToTop';
import StructuredSchema, { generateOrganizationSchema, generateWebSiteSchema } from './StructuredSchema';
import AdPlacement from './AdPlacement';

import adsConfig from '../config/ads.json';

function Layout() {
  const location = useLocation();
  
  useEffect(() => {
    // Clear chunk-load-reload flag since the app loaded/mounted successfully
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chunk-load-reload');
    }

    // Dynamic loading of Google AdSense after hydration
    const loadAdSense = () => {
      if (typeof window !== 'undefined' && !window.adsenseScriptLoaded) {
        window.adsenseScriptLoaded = true;
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.clientId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
      }
    };
    
    // We defer loading slightly to prioritize main thread for layout/hydration
    if (typeof window !== 'undefined') {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => loadAdSense());
      } else {
        setTimeout(loadAdSense, 1000);
      }
    }
  }, []);
  
  // Detect popout mode from query parameters to bypass header/footer layout elements
  const isPopout = new URLSearchParams(location.search).get('popout') === 'true';

  // Site-wide schemas (Organization and WebSite)
  const siteSchemas = [
    generateOrganizationSchema(),
    generateWebSiteSchema()
  ];

  if (isPopout) {
    return (
      <div className="min-h-screen text-gray-200">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-900 to-base-950 text-gray-200 flex flex-col">
      <StructuredSchema schemas={siteSchemas} />
      <ScrollToTop />
      <Navigation />
      
      {/* globalHeader placement is disabled by default to avoid fixed-nav overlap, but fully supported */}
      <AdPlacement placement="globalHeader" className="container mx-auto px-4 mt-20 -mb-10" />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      <LatestArticleRibbon />
      
      <AdPlacement placement="globalFooter" className="container mx-auto px-4" />
      
      <Footer />
    </div>
  );
}

export default Layout;
