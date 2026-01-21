import { createRoutesFromElements, createBrowserRouter, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';

// Lazy load all route components for code splitting
const Home = lazy(() => import('./pages/Home'));
const Games = lazy(() => import('./pages/Games'));
const GameReviews = lazy(() => import('./pages/GameReviews'));
const OldGame = lazy(() => import('./pages/OldGame'));
const OldGameRedirect = lazy(() => import('./pages/OldGameRedirect'));
const Culture = lazy(() => import('./pages/Culture'));
const Archive = lazy(() => import('./pages/Archive'));
const Readlist = lazy(() => import('./pages/Readlist'));
const DownloadSpeedCalculator = lazy(() => import('./pages/DownloadSpeedCalculator'));
const KDCalculator = lazy(() => import('./pages/KDCalculator'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Accessibility = lazy(() => import('./pages/Accessibility'));
const Contact = lazy(() => import('./pages/Contact'));
const Author = lazy(() => import('./pages/Author'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const RouteLoadingFallback = () => (
    <div className="pt-[200px] p-4 container mx-auto">
        <div className="animate-pulse">
            <div className="h-12 bg-accent-violet-950/10 rounded-lg mb-4 w-3/4"></div>
            <div className="h-px bg-gray-600 mb-4"></div>
            <div className="h-6 bg-accent-violet-950/10 rounded mb-5 w-1/2"></div>
        </div>
    </div>
);

export function getRouteElements() {
    return (
        <>
            <Route path="/" element={<Layout />}>
                <Route index element={<Suspense fallback={<RouteLoadingFallback />}><Home /></Suspense>} />
                <Route path="games/:slug" element={<Suspense fallback={<RouteLoadingFallback />}><Games /></Suspense>} />
                <Route path="game-reviews/:slug" element={<Suspense fallback={<RouteLoadingFallback />}><GameReviews /></Suspense>} />
                <Route path="game/:slug/" element={<Suspense fallback={<RouteLoadingFallback />}><OldGameRedirect /></Suspense>} />
                <Route path="game/:slug" element={<Suspense fallback={<RouteLoadingFallback />}><OldGame /></Suspense>} />
                <Route path="culture/:slug" element={<Suspense fallback={<RouteLoadingFallback />}><Culture /></Suspense>} />
                <Route path="author/:slug" element={<Suspense fallback={<RouteLoadingFallback />}><Author /></Suspense>} />
                <Route path="readlist" element={<Suspense fallback={<RouteLoadingFallback />}><Readlist /></Suspense>} />
                <Route path="game-download-speed-calculator" element={<Suspense fallback={<RouteLoadingFallback />}><DownloadSpeedCalculator /></Suspense>} />
                <Route path="k-d-calculator-calculate-your-kill-death-ratio" element={<Suspense fallback={<RouteLoadingFallback />}><KDCalculator /></Suspense>} />
                <Route path="privacy" element={<Suspense fallback={<RouteLoadingFallback />}><Privacy /></Suspense>} />
                <Route path="terms" element={<Suspense fallback={<RouteLoadingFallback />}><Terms /></Suspense>} />
                <Route path="cookies" element={<Suspense fallback={<RouteLoadingFallback />}><Cookies /></Suspense>} />
                <Route path="accessibility" element={<Suspense fallback={<RouteLoadingFallback />}><Accessibility /></Suspense>} />
                <Route path="contact" element={<Suspense fallback={<RouteLoadingFallback />}><Contact /></Suspense>} />
                <Route path=":type" element={<Suspense fallback={<RouteLoadingFallback />}><Archive /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<RouteLoadingFallback />}><NotFound /></Suspense>} />
            </Route>
        </>
    );
}

export const routes = createRoutesFromElements(getRouteElements());

export function createAppRouter() {
    return createBrowserRouter(routes);
}
