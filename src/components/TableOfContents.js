import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function TableOfContents() {
  const [headings, setHeadings] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Delay slightly to ensure page components are fully mounted
    const timeout = setTimeout(() => {
      const mainElement = document.querySelector('main');
      if (!mainElement) return;

      const elements = Array.from(
        mainElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
      );

      const parsedHeadings = elements.map((elem) => {
        // Only assign an ID if it doesn't have one
        if (!elem.id) {
          const text = elem.innerText || elem.textContent;
          if (text) {
            // Create a URL-safe id
            // e.g. "My Great Heading!" -> "my-great-heading"
            const generatedId = text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            // Only assign if valid generatedId and avoiding collisions ideally
            // Simple generation for now
            elem.id = generatedId || `heading-${Math.random().toString(36).substr(2, 9)}`;
          } else {
             elem.id = `heading-${Math.random().toString(36).substr(2, 9)}`;
          }
        }

        return {
          id: elem.id,
          text: elem.innerText || elem.textContent,
          level: parseInt(elem.tagName.substring(1), 10),
        };
      }).filter(h => h.text && h.text.trim() !== '');

      setHeadings(parsedHeadings);
    }, 500);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  if (headings.length === 0) {
    return null; // Don't render if no headings found
  }

  return (
    <div className="relative z-40 mb-8">
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg shadow-accent-violet-500/10">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-white/5 transition-colors duration-300"
        >
          <span className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-accent-violet-300 to-accent-pink-300">
            Table of Contents
          </span>
          <svg
            className={`w-6 h-6 text-white/60 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 px-6'
          }`}
        >
          <div className="px-6 pb-6 mt-2 space-y-2 overflow-y-auto max-h-[60vh] custom-scrollbar">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  let target = document.getElementById(heading.id);
                  
                  // Self-heal: If React re-rendered and stripped our dynamically added IDs,
                  // find the heading again by its text content and re-apply the ID.
                  if (!target) {
                    const elements = Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6, .wp-content h1, .wp-content h2, .wp-content h3, .wp-content h4, .wp-content h5, .wp-content h6'));
                    target = elements.find(el => (el.innerText || el.textContent || '').trim() === heading.text.trim());
                    if (target) {
                      target.id = heading.id;
                    }
                  }

                  console.log("TOC Click target:", target, "ID:", heading.id);
                  if (target) {
                    // Try to add scroll margin so it doesn't get hidden behind the header
                    target.style.scrollMarginTop = '100px';
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`block transition-all duration-300 text-gray-300 hover:text-white hover:translate-x-1 ${
                  heading.level === 1 ? 'font-bold text-lg mt-4' : ''
                } ${heading.level === 2 ? 'font-semibold text-base py-1 ml-2' : ''} ${
                  heading.level === 3 ? 'text-sm py-1 ml-6 text-white/80' : ''
                } ${heading.level > 3 ? 'text-xs py-0.5 ml-10 text-white/60' : ''}`}
              >
                {heading.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableOfContents;
