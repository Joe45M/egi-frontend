import { Link } from 'react-router-dom';
import { useState } from 'react';

function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-base-900/50 backdrop-blur-2xl shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="border-b border-gray-500/10">
        <div className="container py-5 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center">

              <Link to="/" className="text-xl font-bold text-gray-800">
                <img src="" alt="" className="w-[100px] h-[40px] bg-gray-300"/>
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
                to="/"
                className="text-white tracking-wider"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="flex items-center sm:hidden">
          <button
              type="button"
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded={open}
          >
            <span className="sr-only">Open main menu</span>
            <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
              {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>


      {open && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-gray-700 bg-indigo-50 border-indigo-500"
            >
              Home
            </Link>
            <Link
              to="/post"
              onClick={() => setOpen(false)}
              className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300"
            >
              Post
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
