import { createRoutesFromElements, createBrowserRouter, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Games from './pages/Games';
import Culture from './pages/Culture';
import Archive from './pages/Archive';
import Readlist from './pages/Readlist';
import DownloadSpeedCalculator from './pages/DownloadSpeedCalculator';
import KDCalculator from './pages/KDCalculator';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Accessibility from './pages/Accessibility';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export function getRouteElements() {
  return (
    <>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="games/:slug" element={<Games />} />
        <Route path="culture/:slug" element={<Culture />} />
        <Route path="readlist" element={<Readlist />} />
        <Route path="game-download-speed-calculator" element={<DownloadSpeedCalculator />} />
        <Route path="k-d-calculator-calculate-your-kill-death-ratio" element={<KDCalculator />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="accessibility" element={<Accessibility />} />
        <Route path="contact" element={<Contact />} />
        <Route path=":type" element={<Archive />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  );
}

export const routes = createRoutesFromElements(getRouteElements());

export function createAppRouter() {
  return createBrowserRouter(routes);
}

