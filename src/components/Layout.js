import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-900 to-base-950 text-gray-600">
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
