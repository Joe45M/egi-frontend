import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import StructuredSchema, { generateOrganizationSchema, generateWebSiteSchema } from './StructuredSchema';

function Layout() {
  // Site-wide schemas (Organization and WebSite)
  const siteSchemas = [
    generateOrganizationSchema(),
    generateWebSiteSchema()
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-900 to-base-950 text-gray-200 flex flex-col">
      <StructuredSchema schemas={siteSchemas} />
      <ScrollToTop />
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
