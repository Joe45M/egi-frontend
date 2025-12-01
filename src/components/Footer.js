import { Link } from 'react-router-dom';
import { TwitterLogo, TiktokLogo, YoutubeLogo, RedditLogo } from 'phosphor-react';
import logo from '../assets/images/image.png';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-900 border-t border-gray-500/10 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">About Us</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/game-download-speed-calculator" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Game Download Speed Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/game-download-speed-calculator" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Game Download Speed Calculator
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Socials</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://twitter.com/elitegamerinsights" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-400 transition-all duration-300">
                  <TwitterLogo size={20} weight="regular" className="group-hover:text-accent-violet-400 transition-colors duration-300" />
                  <span className="group-hover:bg-gradient-to-r group-hover:from-accent-pink-400 group-hover:to-accent-violet-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Twitter</span>
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@elitegamerinsights" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-400 transition-all duration-300">
                  <TiktokLogo size={20} weight="regular" className="group-hover:text-accent-violet-400 transition-colors duration-300" />
                  <span className="group-hover:bg-gradient-to-r group-hover:from-accent-pink-400 group-hover:to-accent-violet-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Tiktok</span>
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@elitegamerinsights" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-400 transition-all duration-300">
                  <YoutubeLogo size={20} weight="regular" className="group-hover:text-accent-violet-400 transition-colors duration-300" />
                  <span className="group-hover:bg-gradient-to-r group-hover:from-accent-pink-400 group-hover:to-accent-violet-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Youtube</span>
                </a>
              </li>
              <li>
                <a href="https://www.reddit.com/r/elitegamerinsights" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-400 transition-all duration-300">
                  <RedditLogo size={20} weight="regular" className="group-hover:text-accent-violet-400 transition-colors duration-300" />
                  <span className="group-hover:bg-gradient-to-r group-hover:from-accent-pink-400 group-hover:to-accent-violet-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Reddit</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-500/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center gap-4">
              <Link to="/">
                <img src={logo} alt="EGI Logo" className="h-8 w-auto object-contain"/>
              </Link>
              <p className="text-gray-400 text-sm">
                © {currentYear} EGI. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/game-download-speed-calculator" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                Game Download Speed Calculator
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                Sitemap
              </Link>
              <Link to="/rss" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                RSS
              </Link>
              <Link to="/newsletter" className="text-gray-400 hover:bg-gradient-to-r hover:from-accent-pink-400 hover:to-accent-violet-400 hover:bg-clip-text hover:text-transparent transition-all duration-300">
                Newsletter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

