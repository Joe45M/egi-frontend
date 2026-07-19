import { createRoutesFromElements, createBrowserRouter, Route, Navigate, useRouteError } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';

// Helper to retry dynamic imports when ChunkLoadError occurs
const lazyWithRetry = (componentImport) => {
    return lazy(async () => {
        try {
            return await componentImport();
        } catch (error) {
            // Check if it's a chunk loading error
            const isChunkLoadError = error && (
                error.name === 'ChunkLoadError' ||
                /loading\s+chunk\s+/i.test(error.message) ||
                /failed\s+to\s+fetch/i.test(error.message)
            );
            
            if (isChunkLoadError) {
                const hasReloaded = sessionStorage.getItem('chunk-load-reload');
                if (!hasReloaded) {
                    sessionStorage.setItem('chunk-load-reload', 'true');
                    window.location.reload();
                    // Return a pending promise so React doesn't try to render an error state
                    return new Promise(() => {});
                }
            }
            throw error;
        }
    });
};

// Root Error Boundary to handle router/rendering errors gracefully
function RouteErrorBoundary() {
    const error = useRouteError();
    console.error('RouteErrorBoundary caught an error:', error);

    const isChunkLoadError = error && (
        error.name === 'ChunkLoadError' ||
        /loading\s+chunk\s+/i.test(error.message) ||
        /failed\s+to\s+fetch/i.test(error.message)
    );

    if (isChunkLoadError) {
        const hasReloaded = sessionStorage.getItem('chunk-load-reload');
        if (!hasReloaded) {
            sessionStorage.setItem('chunk-load-reload', 'true');
            window.location.reload();
            return (
                <div className="pt-[200px] p-4 container mx-auto text-center text-gray-200">
                    <div className="max-w-md mx-auto bg-base-900 border border-violet-500/20 p-8 rounded-2xl shadow-xl backdrop-blur-md">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold mb-3 text-white">Updating Application</h2>
                        <p className="text-gray-400 text-sm">We are loading the latest version of Elite Gamer Insights. Please wait a moment...</p>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="pt-[200px] p-4 container mx-auto text-center text-gray-200">
            <div className="max-w-lg mx-auto bg-base-900 border border-red-500/20 p-8 rounded-2xl shadow-xl backdrop-blur-md">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold mb-3 text-white">Unexpected Application Error</h1>
                <p className="text-gray-400 text-sm mb-6">
                    {error?.message || error?.statusText || 'An unexpected error occurred while loading this page.'}
                </p>
                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => {
                            sessionStorage.removeItem('chunk-load-reload');
                            window.location.reload();
                        }}
                        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl shadow-lg shadow-violet-600/20 transition-all duration-200"
                    >
                        Refresh Page
                    </button>
                    <a 
                        href="/"
                        className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-all duration-200"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}

// Lazy load all route components for code splitting using lazyWithRetry
const Home = lazyWithRetry(() => import('./pages/Home'));
const Games = lazyWithRetry(() => import('./pages/Games'));
const GameReviews = lazyWithRetry(() => import('./pages/GameReviews'));
const OldGame = lazyWithRetry(() => import('./pages/OldGame'));
const OldGameRedirect = lazyWithRetry(() => import('./pages/OldGameRedirect'));
const Culture = lazyWithRetry(() => import('./pages/Culture'));
const Archive = lazyWithRetry(() => import('./pages/Archive'));
const Readlist = lazyWithRetry(() => import('./pages/Readlist'));
const DownloadSpeedCalculator = lazyWithRetry(() => import('./pages/DownloadSpeedCalculator'));
const KDCalculator = lazyWithRetry(() => import('./pages/KDCalculator'));
const Privacy = lazyWithRetry(() => import('./pages/Privacy'));
const Terms = lazyWithRetry(() => import('./pages/Terms'));
const Cookies = lazyWithRetry(() => import('./pages/Cookies'));
const Accessibility = lazyWithRetry(() => import('./pages/Accessibility'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const Author = lazyWithRetry(() => import('./pages/Author'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));
const Tags = lazyWithRetry(() => import('./pages/Tags'));
const TagArchive = lazyWithRetry(() => import('./pages/TagArchive'));
const Pals = lazyWithRetry(() => import('./pages/Pals'));
const PalDetails = lazyWithRetry(() => import('./pages/PalDetails'));
const Technologies = lazyWithRetry(() => import('./pages/Technologies'));
const PalworldBingo = lazyWithRetry(() => import('./pages/PalworldBingo'));
const PalworldHub = lazyWithRetry(() => import('./pages/PalworldHub'));
const PalworldBreeding = lazyWithRetry(() => import('./pages/PalworldBreeding'));
const PalworldMap = lazyWithRetry(() => import('./pages/PalworldMap'));

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
            <Route path="/" element={<Layout />} errorElement={<RouteErrorBoundary />}>
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
                <Route path="games" element={<Suspense fallback={<RouteLoadingFallback />}><Archive type="games" /></Suspense>} />
                <Route path="culture" element={<Suspense fallback={<RouteLoadingFallback />}><Archive type="culture" /></Suspense>} />
                <Route path="game-reviews" element={<Suspense fallback={<RouteLoadingFallback />}><Archive type="game-reviews" /></Suspense>} />
                <Route path="tags" element={<Suspense fallback={<RouteLoadingFallback />}><Tags /></Suspense>} />
                <Route path="tags/:slug" element={<Suspense fallback={<RouteLoadingFallback />}><TagArchive /></Suspense>} />
                
                {/* Palworld Routes */}
                <Route path="palworld" element={<Suspense fallback={<RouteLoadingFallback />}><PalworldHub /></Suspense>} />
                <Route path="palworld/pals" element={<Suspense fallback={<RouteLoadingFallback />}><Pals /></Suspense>} />
                <Route path="palworld/pals/:id" element={<Suspense fallback={<RouteLoadingFallback />}><PalDetails /></Suspense>} />
                <Route path="palworld/tech" element={<Suspense fallback={<RouteLoadingFallback />}><Technologies /></Suspense>} />
                <Route path="palworld/bingo" element={<Suspense fallback={<RouteLoadingFallback />}><PalworldBingo /></Suspense>} />
                <Route path="palworld/palworld-breeding" element={<Suspense fallback={<RouteLoadingFallback />}><PalworldBreeding /></Suspense>} />
                <Route path="palworld/map" element={<Suspense fallback={<RouteLoadingFallback />}><PalworldMap /></Suspense>} />

                <Route path="404" element={<Suspense fallback={<RouteLoadingFallback />}><NotFound /></Suspense>} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </>
    );
}

export const routes = createRoutesFromElements(getRouteElements());

export function createAppRouter() {
    return createBrowserRouter(routes);
}
