import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageMetadata, { SITE_URL } from '../components/PageMetadata';
import StructuredSchema, { 
  generateWebPageSchema, 
  generateBreadcrumbSchema,
  generateFAQPageSchema,
  generateCollectionPageSchema
} from '../components/StructuredSchema';
import { palworldApi } from '../services/palworldApi';
import wordpressApi from '../services/wordpressApi';
import { useInitialData } from '../initialDataContext';
import FAQ from '../components/FAQ';

// 10 Detailed FAQs for Palworld 1.0
const FAQS = [
  {
    q: "When did Palworld 1.0 release?",
    a: "Palworld officially exited Early Access and launched its highly anticipated 1.0 version on July 10, 2026. This milestone update is free for anyone who already bought the game, and developer Pocketpair did not raise the price for the full release. You can read the official announcement on the Pocketpair Developer Portal."
  },
  {
    q: "What platforms is Palworld 1.0 available on?",
    a: "You can play Palworld 1.0 on a wide range of platforms: PC (via Steam, Microsoft Store, and Mac), PlayStation 5, Xbox Series X/S and Xbox One, and Xbox Game Pass (available day one)."
  },
  {
    q: "How many Pals are in the Palworld 1.0 Paldex?",
    a: "The 1.0 update added 72 new Pals (47 entirely new species and 25 element variants), bringing the official Paldex total to 287 Pals. These new additions feature exciting designs like the cat-jester Dupin, the Grass-type Clovee, and endgame legendary bosses. You can track your completion status on community tools like Game Checklists."
  },
  {
    q: "What are the new regions added in Palworld 1.0?",
    a: "The map size has nearly doubled with the addition of two major end-game zones:\n\n• Sunreach: An archipelago of floating sky islands kept aloft by Paldium. It features exclusive high-tier Pals, new tower bosses, and Soralite ore.\n\n• The World Tree: The giant tree behind the red barrier is finally explorable. This serves as the conclusion to the game’s main storyline and is home to level 80+ endgame challenges."
  },
  {
    q: "What are the new Pal Awakening and Mutation systems?",
    a: "Breeding and power progression have been completely overhauled with two new mechanics:\n\n• Mutation: There is now a random chance for eggs to mutate. Mutated Pals hatch with boosted stats and entirely unique passives. You can manipulate these chances using new specialty cakes.\n\n• Awakening: You can boost a Pal’s stats past their normal limits using Radiant Gems, an endgame resource found only within the treacherous World Tree zone."
  },
  {
    q: "What is the new level cap in Palworld 1.0?",
    a: "The maximum player and Pal level cap has been raised from 65 to 80. The Technology Tree has been extended to match this level cap, introducing advanced late-game blueprints like the Laser Sword, Beam Launcher, Plasma Rifle, and the Wing Pack (a glider that allows free flight without using a Pal mount slot)."
  },
  {
    q: "How does the updated Pal Condensation work?",
    a: "Condensing Pals to increase their star rank is now much less tedious. Pocketpair dramatically reduced the number of duplicate Pals required to max out a Pal's rank—dropping the requirement from 116 Pals down to just 48. Additionally, the max level for Pal Work Suitabilities has been raised to level 10."
  },
  {
    q: "How do the new wave-based Base Raids work?",
    a: "Base raids have been completely redesigned. Instead of a single incoming crowd, raids now attack in progressive, wave-based survival formats. Furthermore: Defensive structures no longer consume ammunition; enemy levels now dynamically scale based on the level of the Pals currently assigned to your base; and you can hire a Negotiator NPC to bribe raiders with Gold Coins to make them leave peacefully."
  },
  {
    q: "Can you capture Tower Bosses in Palworld 1.0?",
    a: "Yes! Tower Boss encounters have been completely reworked. They now feature unique arenas, smarter AI patterns, and a shortened 5-minute time limit. Best of all, defeating these bosses now allows you to officially recruit and capture them for your own party."
  },
  {
    q: "Does Palworld 1.0 support crossplay?",
    a: "Crossplay is fully supported between Xbox consoles and PC players using the Microsoft Store/Xbox App version. While Steam and PlayStation 5 players cannot cross-play on official console servers yet, Pocketpair is actively working on unifying servers across all platforms. You can check the latest progress and patch notes on the Official Palworld Steam News Hub."
  }
];

const ELEMENT_TYPES = [
  "all", "neutral", "fire", "water", "grass", "electric", "earth", "ice", "dragon", "dark"
];

function PalworldHub() {
  const initialData = useInitialData();
  const hasInitialData = initialData && initialData.postType === 'palworld-hub';

  // State caches
  const [pals, setPals] = useState(hasInitialData ? (initialData.pals || []) : []);
  const [articles, setArticles] = useState(hasInitialData ? (initialData.articles || []) : []);
  const [loadingPals, setLoadingPals] = useState(!hasInitialData);
  const [loadingArticles, setLoadingArticles] = useState(!hasInitialData);

  // Search input & filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedElement, setSelectedElement] = useState("all");

  // Dynamic filtered list query state
  const [filteredPals, setFilteredPals] = useState([]);
  const [loadingPalsFilter, setLoadingPalsFilter] = useState(false);

  // Pagination for guides: start by displaying 4 guides
  const [visibleGuidesCount, setVisibleGuidesCount] = useState(4);

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

  // Central search filtering: returns pals matching search input query
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return pals.filter(pal => pal.name.toLowerCase().includes(query)).slice(0, 5);
  }, [pals, searchQuery]);

  // Trigger element filtering query to WordPress API on selectedElement changes
  useEffect(() => {
    if (selectedElement === "all") {
      if (pals && pals.length > 0) {
        setFilteredPals(pals.slice(0, 8));
      }
      return;
    }

    let active = true;
    async function fetchFilteredPals() {
      try {
        setLoadingPalsFilter(true);
        // Map lowercase element back to proper case expected by WordPress API
        const elementMap = {
          neutral: "Neutral",
          fire: "Fire",
          water: "Water",
          grass: "Grass",
          electric: "Electric",
          earth: "Earth",
          ice: "Ice",
          dragon: "Dragon",
          dark: "Dark"
        };
        const queryElement = elementMap[selectedElement] || selectedElement;
        
        const response = await palworldApi.getPals({ 
          limit: 8, 
          element: queryElement 
        });
        
        if (response && response.data && active) {
          setFilteredPals(response.data);
        }
      } catch (err) {
        console.error("Failed to query filtered pals:", err);
      } finally {
        if (active) setLoadingPalsFilter(false);
      }
    }

    fetchFilteredPals();

    return () => {
      active = false;
    };
  }, [selectedElement, pals]);

  // Paginated Articles list slice
  const paginatedArticles = useMemo(() => {
    return articles.slice(0, visibleGuidesCount);
  }, [articles, visibleGuidesCount]);

  const getPageTitle = () => "Palworld Guides, Paldex & Tech Tree | Elite Gamer Insights";
  const getPageDescription = () => "The ultimate Palworld companion hub. Access complete Paldex stats, technology trees, seeded bingo cards, and 1.0 guides. Learn base building & breeding combos.";

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
    }),
    generateFAQPageSchema({
      questions: FAQS.map(faq => ({
        question: faq.q,
        answer: faq.a
      }))
    }),
    generateCollectionPageSchema({
      name: "Latest Palworld Guides and Strategy News",
      description: "Read expert gameplay guides, boss speedrun tips, and survival updates.",
      url: `${SITE_URL}/palworld`,
      itemListElement: articles.map(article => ({
        name: article.title,
        url: `${SITE_URL}/games/${article.slug}/`,
        image: article.image,
        description: article.excerpt || article.title
      }))
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

          {/* Breadcrumb Trail Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-base-400 mb-6 bg-base-950/20 px-4 py-2.5 rounded-xl border border-base-800/40 w-fit">
            <Link to="/" className="hover:text-accent-violet-300 transition-colors">Home</Link>
            <span className="opacity-40">/</span>
            <span className="text-gray-200">Palworld Hub</span>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[110px] bg-accent-violet-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <span className="px-3.5 py-1 bg-accent-violet-500/10 border border-accent-violet-500/25 text-accent-violet-300 font-extrabold text-[10px] sm:text-xs rounded-full uppercase tracking-wider mb-4 inline-block">
              Central Guide Directory
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 pb-2 bg-gradient-to-r from-accent-violet-400 via-accent-pink-400 to-amber-300 bg-clip-text text-transparent tracking-tight leading-tight">
              Palworld Guides, Paldex, and Tools Hub
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed mb-4">
              Welcome to the ultimate directory and tools suite for Palworld. Read our curated expert guides, 
              find Pal element suitabilities, trace technology requirements, or challenge your friends with Seeded Bingo races. 
              Master your base building layouts, calculate the best breeding combinations, map out high-tier boss locations, 
              and prepare your character for end-game challenges with our comprehensive resources.
            </p>
          </div>

          {/* Quick Search Input Bar */}
          <div className="max-w-xl mx-auto mb-12 relative z-35">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-400 text-lg">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Pals by name (e.g. Lamball, Anubis)..."
                className="w-full bg-base-950/80 backdrop-blur-xl border border-base-800 hover:border-base-750 focus:border-accent-violet-500/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500/10 transition-all shadow-xl"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute inset-x-0 mt-2 bg-base-950/95 backdrop-blur-xl border border-base-800 rounded-2xl shadow-2xl overflow-hidden z-40">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-base-900">
                    {searchResults.map(pal => (
                      <Link
                        key={`search_${pal.id}`}
                        to={`/palworld/pals/${encodeURIComponent(pal.name)}`}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-base-900/50 p-1 flex items-center justify-center">
                          {pal.image_url ? (
                            <img src={pal.image_url} alt={pal.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-lg">🐾</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-accent-violet-300 transition-colors">
                            {pal.name}
                          </p>
                          {pal.elements && (
                            <p className="text-[10px] font-semibold uppercase text-base-400 tracking-wider">
                              {pal.elements.join(' / ')}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-base-400 italic">
                    No matching Pals found. Trying looking for items on the <Link to="/palworld/tech" className="text-accent-violet-400 hover:underline">Technology Tree</Link>.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Core Utilities Grid (4 CTA Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            
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

            {/* CTA 2: Breeding Calculator */}
            <Link
              to="/palworld/palworld-breeding"
              className="group bg-base-950/50 hover:bg-base-900/60 border border-base-800 hover:border-accent-pink-500/40 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-pink-500/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.15),transparent_70%)] pointer-events-none"></div>
              <div>
                <span className="text-4xl mb-4 block filter drop-shadow">🧬</span>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-pink-300 transition-colors">
                  Breeding Calculator
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Select parents to find offspring, check combos for a target Pal, and learn the 1.0 mutation mechanics & passive inheritance rules.
                </p>
              </div>
              <span className="text-xs font-bold text-accent-pink-400 group-hover:text-accent-pink-300 uppercase tracking-widest flex items-center gap-1">
                Calculate Combos <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </span>
            </Link>

            {/* CTA 3: Technology Tree */}
            <Link
              to="/palworld/tech"
              className="group bg-base-950/50 hover:bg-base-900/60 border border-base-800 hover:border-accent-violet-500/40 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-violet-500/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none"></div>
              <div>
                <span className="text-4xl mb-4 block filter drop-shadow">⚡</span>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-violet-300 transition-colors">
                  Technology Tree
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Trace level requirements and technology point costs for items, weapons, structures, and Pal saddles. Plan your build progression.
                </p>
              </div>
              <span className="text-xs font-bold text-accent-violet-400 group-hover:text-accent-violet-300 uppercase tracking-widest flex items-center gap-1">
                View Tech Tree <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </span>
            </Link>

            {/* CTA 4: Seeded Bingo */}
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

          {/* Featured Pals Section: Complete Palworld Paldex Database */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Complete Palworld Paldex Database
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Look up element types, suitability, and stats of wild Pals.</p>
              </div>
              <Link
                to="/palworld/pals"
                className="mt-4 sm:mt-0 text-xs font-bold text-base-300 hover:text-white bg-base-900 border border-base-800 hover:border-base-750 px-4 py-2.5 rounded-xl transition-all"
              >
                View Full Paldex Database →
              </Link>
            </div>

            {/* Dynamic Element Filtering Row */}
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              {ELEMENT_TYPES.map(elem => (
                <button
                  key={elem}
                  onClick={() => setSelectedElement(elem)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide border transition-all active:scale-95 ${
                    selectedElement === elem
                      ? 'bg-accent-violet-600 border-accent-violet-500 text-white shadow-lg shadow-accent-violet-500/20'
                      : 'bg-base-950/40 border-base-850 text-gray-400 hover:text-white hover:border-base-700'
                  }`}
                >
                  {elem === "all" ? "All Elements" : elem}
                </button>
              ))}
            </div>

            {loadingPals || loadingPalsFilter ? (
              /* Skeleton Grid for zero layout shift */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, idx) => (
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
            ) : filteredPals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filteredPals.map(pal => (
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

                    {/* Quick Stats link */}
                    <span className="mt-4 text-[10px] font-semibold text-accent-pink-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 lowercase">
                      details <span>→</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-base-950/20 rounded-2xl border border-base-800/60">
                <p className="text-sm text-base-400 italic">No Pals matching the "{selectedElement}" element filter.</p>
              </div>
            )}
          </div>

          {/* Latest News & Guides Section */}
          <div className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Latest <span className="text-accent-pink-400">Palworld</span> Guides & Strategy News
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Read expert gameplay guides, boss speedrun tips, and survival updates.</p>
            </div>

            {loadingArticles ? (
              /* Skeleton Loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(visibleGuidesCount).fill(0).map((_, idx) => (
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
            ) : paginatedArticles.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {paginatedArticles.map(article => (
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

                {/* Load More Guides Button */}
                {visibleGuidesCount < articles.length && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setVisibleGuidesCount(prev => Math.min(prev + 4, articles.length))}
                      className="bg-base-900 hover:bg-base-800 border border-base-850 hover:border-accent-violet-500/35 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all active:scale-95"
                    >
                      🔄 Load More Guides
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center bg-base-950/20 rounded-2xl border border-base-800/60">
                <p className="text-sm text-base-400 italic">No Palworld guides or articles found.</p>
              </div>
            )}
          </div>

          {/* Interactive FAQs Accordion Section */}
          <FAQ 
            faqs={FAQS} 
            title="Palworld 1.0 Frequently Asked Questions" 
            subtitle="Everything you need to know about the official Palworld 1.0 release, map expansions, and breeding progression."
            accentColorClass="text-accent-violet-400"
          />

        </div>
      </div>
    </>
  );
}

export default PalworldHub;
