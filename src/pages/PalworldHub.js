import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageMetadata, { SITE_URL } from '../components/PageMetadata';
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from '../components/StructuredSchema';
import { palworldApi } from '../services/palworldApi';
import wordpressApi from '../services/wordpressApi';
import { useInitialData } from '../initialDataContext';

function PalworldHub() {
  const initialData = useInitialData();
  const hasInitialData = initialData && initialData.postType === 'palworld-hub';

  // State caches
  const [pals, setPals] = useState(hasInitialData ? (initialData.pals || []) : []);
  const [articles, setArticles] = useState(hasInitialData ? (initialData.articles || []) : []);
  const [loadingPals, setLoadingPals] = useState(!hasInitialData);
  const [loadingArticles, setLoadingArticles] = useState(!hasInitialData);

  // Client hydration if not loaded via SSR
  useEffect(() => {
    if (hasInitialData) return;

    let active = true;

    // Safety timeouts to prevent skeleton hanging
    const palsTimeout = setTimeout(() => {
      if (active) setLoadingPals(false);
    }, 3000);

    const articlesTimeout = setTimeout(() => {
      if (active) setLoadingArticles(false);
    }, 3000);

    async function loadPals() {
      try {
        const response = await palworldApi.getPals({ limit: 150 });
        if (response && response.data && active) {
          setPals(response.data);
        }
      } catch (err) {
        console.error("Hub client load pals failed:", err);
      } finally {
        if (active) {
          setLoadingPals(false);
          clearTimeout(palsTimeout);
        }
      }
    }

    async function loadArticles() {
      try {
        const gameTerm = await wordpressApi.taxonomies.getBySlug('game', 'palworld');
        let posts = [];
        if (gameTerm && gameTerm.id) {
          const response = await wordpressApi.posts.getByPostType('games', {
            taxonomyFilter: { game: gameTerm.id },
            perPage: 12,
            includeImages: true
          });
          posts = Array.isArray(response) ? response : (response?.posts || []);
        } else {
          // Fallback
          const response = await wordpressApi.posts.getByPostType('games', {
            perPage: 12,
            includeImages: true
          });
          posts = Array.isArray(response) ? response : (response?.posts || []);
        }
        if (active) setArticles(posts);
      } catch (err) {
        console.error("Hub client load articles failed:", err);
      } finally {
        if (active) {
          setLoadingArticles(false);
          clearTimeout(articlesTimeout);
        }
      }
    }

    loadPals();
    loadArticles();

    return () => {
      active = false;
      clearTimeout(palsTimeout);
      clearTimeout(articlesTimeout);
    };
  }, [hasInitialData]);

  // Pick 4 Random Pals from list (re-evaluates only if pals length changes)
  const featuredPals = useMemo(() => {
    if (!pals || pals.length === 0) return [];
    // Deterministic shuffle helper using a quick hash of names so it doesn't spin on every client render tick
    const sorted = [...pals].sort((a, b) => {
      const hashA = a.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = b.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // Mix with a simple prime multiplication to distribute
      return (hashA * 17) % 100 - (hashB * 17) % 100;
    });
    return sorted.slice(0, 4);
  }, [pals]);

  const getPageTitle = () => "Palworld Hub: Guides, Seeded Bingo, Paldex Directory - EliteGamerInsights";
  const getPageDescription = () => "Your ultimate centralized companion hub for Palworld. Read 12 latest guides and news, lookup pals in our directory, map technologies, or generate custom Seeded Bingo boards.";

  const schemas = [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/palworld`
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL },
        { name: "Palworld Hub", url: `${SITE_URL}/palworld` }
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        image="/palworld-hub-og.png?v=1"
        imageAlt="Palworld Hub Directory"
        imageWidth={1200}
        imageHeight={630}
        keywords="palworld, palworld hub, palworld database, palworld guide, palworld bingo, palworld tech tree, palworld tools, palworld wiki"
      />
      <StructuredSchema schemas={schemas} />

      {/* Subtle World Map Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/assets/pals/T_WorldMap.png" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.06] filter blur-[1px]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-base-900/10 via-base-950/80 to-base-950"></div>
      </div>

      <div className="min-h-screen pt-[120px] pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl relative z-10">

          {/* Hero Section */}
          <div className="text-center mb-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[110px] bg-accent-violet-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <span className="px-3.5 py-1 bg-accent-violet-500/10 border border-accent-violet-500/25 text-accent-violet-300 font-extrabold text-[10px] sm:text-xs rounded-full uppercase tracking-wider mb-4 inline-block">
              Central Guide Directory
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 pb-2 bg-gradient-to-r from-accent-violet-400 via-accent-pink-400 to-amber-300 bg-clip-text text-transparent tracking-tight leading-tight">
              The Palworld Central Hub
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
              Welcome to the ultimate directory and tools suite for Palworld. Read our curated expert guides, 
              find Pal element suitabilities, trace technology requirements, or challenge your friends with Seeded Bingo races.
            </p>
          </div>

          {/* Core Utilities Grid (3 CTA Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            
            {/* CTA 1: Paldex Directory */}
            <Link
              to="/palworld/pals"
              className="group bg-base-950/50 hover:bg-base-900/60 border border-base-800 hover:border-accent-violet-500/40 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-violet-500/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none"></div>
              <div>
                <span className="text-4xl mb-4 block filter drop-shadow">📖</span>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-violet-300 transition-colors">
                  Paldex Directory
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Browse our complete database of tamables. Filter by Element Type, work suitabilities (kindling, mining), capture locations, and stats.
                </p>
              </div>
              <span className="text-xs font-bold text-accent-violet-400 group-hover:text-accent-violet-300 uppercase tracking-widest flex items-center gap-1">
                Explore Database <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </span>
            </Link>

            {/* CTA 2: Technology Tree */}
            <Link
              to="/palworld/tech"
              className="group bg-base-950/50 hover:bg-base-900/60 border border-base-800 hover:border-accent-pink-500/40 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-pink-500/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_70%)] pointer-events-none"></div>
              <div>
                <span className="text-4xl mb-4 block filter drop-shadow">⚡</span>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-pink-300 transition-colors">
                  Technology Tree
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Trace level requirements and technology point costs for items, weapons, structures, and Pal saddles. Plan your build progression.
                </p>
              </div>
              <span className="text-xs font-bold text-accent-pink-400 group-hover:text-accent-pink-300 uppercase tracking-widest flex items-center gap-1">
                View Tech Tree <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </span>
            </Link>

            {/* CTA 3: Seeded Bingo */}
            <Link
              to="/palworld/bingo"
              className="group bg-base-950/50 hover:bg-base-900/60 border border-base-800 hover:border-amber-500/40 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.1),transparent_70%)] pointer-events-none"></div>
              <div>
                <span className="text-4xl mb-4 block filter drop-shadow">🎲</span>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  Bingo Card Generator
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Play co-op speedrun challenges. Instantly generate matching 5x5 boards from shared seeds with Easy, Medium, and Hard task settings.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 uppercase tracking-widest flex items-center gap-1">
                Generate Card <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </span>
            </Link>

          </div>

          {/* Featured Pals Section (4 Random Pals) */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Featured <span className="text-accent-violet-400">Pals</span> Database
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Look up element types, suitability, and stats of wild Pals.</p>
              </div>
              <Link
                to="/palworld/pals"
                className="mt-4 sm:mt-0 text-xs font-bold text-base-300 hover:text-white bg-base-900 border border-base-800 hover:border-base-700 px-4 py-2.5 rounded-xl transition-all"
              >
                View Full Paldex Database →
              </Link>
            </div>

            {loadingPals ? (
              /* Skeleton Grid for zero layout shift */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, idx) => (
                  <div
                    key={`pal_skeleton_${idx}`}
                    className="bg-base-950/40 border border-base-800/80 rounded-2xl p-6 h-[220px] flex flex-col justify-between items-center animate-pulse"
                  >
                    <div className="w-16 h-16 rounded-full bg-base-900/50"></div>
                    <div className="w-3/4 h-4 bg-base-900/50 rounded mt-4"></div>
                    <div className="w-1/2 h-3 bg-base-900/50 rounded mt-2"></div>
                  </div>
                ))}
              </div>
            ) : featuredPals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredPals.map(pal => (
                  <Link
                    key={pal.id}
                    to={`/palworld/pals/${encodeURIComponent(pal.name)}`}
                    className="group bg-base-950/45 hover:bg-base-900/60 border border-base-800/85 hover:border-accent-violet-500/40 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg shadow-base-950/40"
                  >
                    {/* Image / Thumbnail */}
                    <div className="w-20 h-20 bg-base-900/30 rounded-full flex items-center justify-center p-2 mb-3 relative overflow-hidden group-hover:scale-105 transition-all">
                      {pal.image_url ? (
                        <img 
                          src={pal.image_url} 
                          alt={pal.name} 
                          className="w-full h-full object-contain pointer-events-none"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-3xl">🐾</span>
                      )}
                    </div>
                    {/* Metadata */}
                    <h4 className="text-sm font-bold text-white group-hover:text-accent-violet-300 transition-colors">
                      {pal.name}
                    </h4>
                    
                    {/* Element badge */}
                    {pal.elements && pal.elements.length > 0 && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 mt-2 rounded bg-base-800 border border-base-750 text-gray-300">
                        {pal.elements.join(' / ')}
                      </span>
                    )}

                    {/* Quick Stats overview */}
                    <span className="mt-4 text-[10px] font-semibold text-accent-pink-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 lowercase">
                      details <span>→</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-base-950/20 rounded-2xl border border-base-800/60">
                <p className="text-sm text-base-400 italic">No Pals loaded in current view.</p>
              </div>
            )}
          </div>

          {/* Latest News & Guides Section (12 Articles) */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Latest <span className="text-accent-pink-400">Palworld</span> Guides & Strategy News
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Read expert gameplay guides, boss speedrun tips, and survival updates.</p>
            </div>

            {loadingArticles ? (
              /* Skeleton Loader */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {Array(12).fill(0).map((_, idx) => (
                  <div
                    key={`article_skele_${idx}`}
                    className="bg-base-950/40 border border-base-800/80 rounded-2xl overflow-hidden flex flex-col h-[270px] animate-pulse"
                  >
                    <div className="aspect-video bg-base-900/40"></div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-base-900/50 rounded w-full"></div>
                        <div className="h-4 bg-base-900/50 rounded w-5/6"></div>
                      </div>
                      <div className="h-3 bg-base-900/50 rounded w-1/3 mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {articles.map(article => (
                  <Link
                    key={article.id}
                    to={`/games/${article.slug}/`}
                    className="group bg-base-950/40 hover:bg-base-900/60 border border-base-800/80 hover:border-accent-violet-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-accent-violet-500/5 flex flex-col"
                  >
                    {/* Cover Thumbnail */}
                    {article.image ? (
                      <div className="aspect-video overflow-hidden bg-base-900">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-base-800 to-base-900 flex items-center justify-center">
                        <span className="text-3xl">🎮</span>
                      </div>
                    )}
                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3
                        className="text-sm font-bold text-white group-hover:text-accent-violet-300 transition-colors line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: article.title }}
                      />
                      <span className="mt-3 text-[11px] font-semibold text-accent-pink-400 uppercase tracking-wider flex items-center gap-1">
                        Read Article <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-base-950/20 rounded-2xl border border-base-800/60">
                <p className="text-sm text-base-400 italic">No Palworld guides or articles found.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default PalworldHub;
