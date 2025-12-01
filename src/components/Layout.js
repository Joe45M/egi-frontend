import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-900 to-base-950 text-gray-200 flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
