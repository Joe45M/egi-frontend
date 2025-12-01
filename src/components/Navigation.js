import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../assets/images/image.png';

function Navigation() {
  const [open, setOpen] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Only hide if scrolled down more than 50px
          if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 5) {
              // Scrolling down (with threshold to prevent flickering)
              setIsScrolledDown(true);
            } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 5) {
              // Scrolling up (with threshold to prevent flickering)
              setIsScrolledDown(false);
            }
          } else {
            // At the top, always show
            setIsScrolledDown(false);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
    <nav className="bg-base-900/50 backdrop-blur-2xl shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className={`border-b border-gray-500/10 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isScrolledDown 
          ? 'transform -translate-y-full opacity-0 scale-95 max-h-0 overflow-hidden pointer-events-none' 
          : 'transform translate-y-0 opacity-100 scale-100 max-h-32'
      }`}>
        <div className="container py-5 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center">

              <Link to="/" className="text-xl font-bold text-gray-800">
                <img src={logo} alt="EGI Logo" className="w-[100px] h-[40px] object-contain"/>
              </Link>
            </div>

          <div>
            <Link to="/readlist" className="inline-flex gap-2 font-[600] items-center px-4 py-2 text-white bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-violet-500/50 hover:from-accent-pink-600 hover:to-accent-violet-600">
              <svg className="w-5" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,16V161.57l-51.77-32.35a8,8,0,0,0-8.48,0L72,161.56V48ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V180.43l56-35,56,35v29.14Z"></path></svg>
              Read list
            </Link>
          </div>

          </div>
        </div>
      </div>

      <div className="flex justify-center py-5 bg-accent-violet-950/10">
        <div className="flex justify-center">
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center justify-center">
            <Link
                to="/"
                className="text-white tracking-wider"
            >
              Home
            </Link>
            <Link
                to="/games"
                className="text-white tracking-wider"
            >
              Gaming news
            </Link>
            <Link
                to="/culture"
                className="text-white tracking-wider"
            >
              Culture
            </Link>
          </div>
        </div>

        <div className="flex items-center sm:hidden">
          <button
              type="button"
              onClick={() => setOpen(!open)}
              className={`relative z-[60] inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none transition-all duration-300 ${
                open ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
              }`}
              aria-expanded={open}
          >
            <span className="sr-only">Open main menu</span>
            <div className="relative w-6 h-6">
              <span className="absolute top-0 left-0 w-6 h-0.5 bg-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"></span>
              <span className="absolute top-2.5 left-0 w-6 h-0.5 bg-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"></span>
              <span className="absolute top-5 left-0 w-6 h-0.5 bg-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"></span>
            </div>
          </button>
        </div>
      </div>

    </nav>

    {/* Mobile Menu Overlay - Outside nav for proper z-index */}
    <div 
      className={`fixed inset-0 z-[100] sm:hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        open 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setOpen(false)}
    >
      {/* Backdrop with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-base-900 via-accent-violet-950/95 to-base-900 backdrop-blur-xl"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(196, 181, 253, 0.4) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.4) 0%, transparent 50%),
                            radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`,
          backgroundSize: '100% 100%',
          animation: open ? 'pulse 4s ease-in-out infinite' : 'none'
        }}></div>
      </div>
    </div>

    {/* Mobile Menu Content - Outside nav for proper z-index */}
    <div 
      className={`fixed inset-0 z-[101] sm:hidden flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        open 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      onClick={(e) => {
        // Don't close when clicking on menu items
        if (e.target.closest('a')) {
          setOpen(false);
        }
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setOpen(false)}
        className={`absolute top-6 right-6 z-[102] p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-110 hover:rotate-90 ${
          open 
            ? 'opacity-100 scale-100 rotate-0' 
            : 'opacity-0 scale-75 rotate-90 pointer-events-none'
        }`}
        aria-label="Close menu"
        style={{
          animation: open 
            ? 'slideInUp 0.6s ease-out 300ms both' 
            : 'none'
        }}
      >
        <svg 
          className="w-6 h-6 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <nav className="w-full px-8 py-16 max-w-md mx-auto">
        <div className="space-y-4">
          {[
            { to: '/', label: 'Home', delay: 0 },
            { to: '/games', label: 'Gaming news', delay: 100 },
            { to: '/culture', label: 'Culture', delay: 200 }
          ].map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`block group relative overflow-hidden ${open ? '' : 'pointer-events-none'}`}
              style={{
                animation: open 
                  ? `slideInUp 0.6s ease-out ${item.delay}ms both` 
                  : 'none'
              }}
            >
              <div className="relative z-10 px-6 py-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-500 hover:bg-white/10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent-violet-500/20">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent-violet-500/20 to-accent-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                {/* Text content */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-2xl font-bold text-white tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-violet-300 group-hover:to-accent-pink-300 transition-all duration-500">
                    {item.label}
                  </span>
                  
                  {/* Arrow icon */}
                  <svg 
                    className="w-6 h-6 text-white/40 group-hover:text-accent-violet-300 group-hover:translate-x-2 transition-all duration-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl"></div>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
    </>
  );
}

export default Navigation;
