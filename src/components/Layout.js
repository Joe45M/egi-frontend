import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import LatestArticleRibbon from './LatestArticleRibbon';
import ScrollToTop from './ScrollToTop';
import StructuredSchema, { generateOrganizationSchema, generateWebSiteSchema } from './StructuredSchema';

function Layout() {
  const location = useLocation();
  
  useEffect(() => {
    // Clear chunk-load-reload flag since the app loaded/mounted successfully
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chunk-load-reload');
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
      <main className="flex-grow">
        <Outlet />
      </main>
      <LatestArticleRibbon />
      <Footer />
    </div>
  );
}

export default Layout;
