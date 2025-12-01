import { Link, useLocation } from 'react-router-dom';

function Pagination({ currentPage, totalPages, basePath }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  if (!totalPages || totalPages <= 1) {
    return null;
  }
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis before middle pages if needed
      if (start > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after middle pages if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  
  const getPageUrl = (page) => {
    // Parse basePath to separate path and existing query params
    const [basePathOnly, existingQuery] = basePath.split('?');
    
    // Start with current location search params (most up-to-date)
    const params = new URLSearchParams(searchParams);
    
    // If basePath had query params, merge them in (but current location takes precedence)
    if (existingQuery) {
      const baseParams = new URLSearchParams(existingQuery);
      baseParams.forEach((value, key) => {
        // Only add if not already in current params (current location is authoritative)
        if (!params.has(key)) {
          params.set(key, value);
        }
      });
    }
    
    // Set or remove page parameter
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    
    const queryString = params.toString();
    return `${basePathOnly}${queryString ? `?${queryString}` : ''}`;
  };

  const handlePageClick = () => {
    // Scroll to top smoothly when pagination link is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-8">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          to={getPageUrl(currentPage - 1)}
          onClick={handlePageClick}
          className="px-4 py-2 bg-accent-violet-950/20 hover:bg-accent-violet-950/40 text-white rounded-md transition-colors duration-300"
        >
          Previous
        </Link>
      )}

      {/* Page Numbers */}
      <div className="flex gap-2">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          
          return (
            <Link
              key={page}
              to={getPageUrl(page)}
              onClick={handlePageClick}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 text-white font-bold'
                  : 'bg-accent-violet-950/20 hover:bg-accent-violet-950/40 text-white'
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          to={getPageUrl(currentPage + 1)}
          onClick={handlePageClick}
          className="px-4 py-2 bg-accent-violet-950/20 hover:bg-accent-violet-950/40 text-white rounded-md transition-colors duration-300"
        >
          Next
        </Link>
      )}
    </div>
  );
}

export default Pagination;

