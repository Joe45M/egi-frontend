import { Link, useLocation } from 'react-router-dom';
import PageMetadata, { SITE_URL } from '../components/PageMetadata';
import StructuredSchema, { generateWebPageSchema } from '../components/StructuredSchema';

function NotFound() {
  const location = useLocation();

  // Build URL safely for SSR (window.location doesn't exist on server)
  const currentUrl = `${SITE_URL}${location.pathname}${location.search}`;

  const schemas = [
    generateWebPageSchema({
      name: "404 - Page Not Found",
      description: "The page you're looking for doesn't exist. Return to EliteGamerInsights homepage to continue browsing gaming news, tutorials, and culture coverage.",
      url: currentUrl
    })
  ];

  return (
    <>
      <PageMetadata
        title="404 - Page Not Found"
        description="The page you're looking for doesn't exist. Return to EliteGamerInsights homepage to continue browsing gaming news, tutorials, and culture coverage."
        noindex={true}
      />
      <StructuredSchema schemas={schemas} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-[175px] py-16 min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-2xl">
          {/* 404 Number with gradient */}
          <h1 className="text-9xl font-bold mb-4 bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 bg-clip-text text-transparent">
            404
          </h1>

          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Er, this is awkward...
          </h2>

          <p className="text-gray-400 text-lg mb-8">
            We can't find that... we'll validate game files and fix it as soon as possible.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="inline-flex gap-2 font-[600] items-center px-6 py-3 text-white bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-violet-500/50 hover:from-accent-pink-600 hover:to-accent-violet-600"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex gap-2 font-[600] items-center px-6 py-3 text-white border-2 border-gray-500/30 rounded-full transition-all duration-300 hover:border-accent-violet-500/50 hover:bg-accent-violet-950/10"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;

