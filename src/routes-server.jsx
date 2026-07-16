import { createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Direct imports for server-side rendering (no lazy loading)
import Home from './pages/Home';
import Games from './pages/Games';
import GameReviews from './pages/GameReviews';
import OldGame from './pages/OldGame';
import OldGameRedirect from './pages/OldGameRedirect';
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
import Tags from './pages/Tags';
import TagArchive from './pages/TagArchive';
import Pals from './pages/Pals';
import PalDetails from './pages/PalDetails';
import Technologies from './pages/Technologies';
import PalworldBingo from './pages/PalworldBingo';
import PalworldHub from './pages/PalworldHub';

export function getRouteElements() {
    return (
        <>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="games/:slug" element={<Games />} />
                <Route path="game-reviews/:slug" element={<GameReviews />} />
                <Route path="game/:slug/" element={<OldGameRedirect />} />
                <Route path="game/:slug" element={<OldGame />} />
                <Route path="culture/:slug" element={<Culture />} />
                <Route path="readlist" element={<Readlist />} />
                <Route path="game-download-speed-calculator" element={<DownloadSpeedCalculator />} />
                <Route path="k-d-calculator-calculate-your-kill-death-ratio" element={<KDCalculator />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="cookies" element={<Cookies />} />
                <Route path="accessibility" element={<Accessibility />} />
                <Route path="contact" element={<Contact />} />
                <Route path="games" element={<Archive type="games" />} />
                <Route path="culture" element={<Archive type="culture" />} />
                <Route path="game-reviews" element={<Archive type="game-reviews" />} />
                <Route path="tags" element={<Tags />} />
                <Route path="tags/:slug" element={<TagArchive />} />
                
                {/* Palworld Routes */}
                <Route path="palworld" element={<PalworldHub />} />
                <Route path="palworld/pals" element={<Pals />} />
                <Route path="palworld/pals/:id" element={<PalDetails />} />
                <Route path="palworld/tech" element={<Technologies />} />
                <Route path="palworld/bingo" element={<PalworldBingo />} />

                <Route path="404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </>
    );
}

export const routes = createRoutesFromElements(getRouteElements());
