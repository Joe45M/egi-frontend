import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { palworldApi } from "../services/palworldApi";
import wordpressApi from "../services/wordpressApi";
import PageMetadata, { SITE_URL } from "../components/PageMetadata";
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from "../components/StructuredSchema";

import { useInitialData } from "../initialDataContext";
import { useFlags, useBoolVariation } from "@launchdarkly/react-sdk";

function HabitatMap({ spawns }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const drawMap = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const rect = img.getBoundingClientRect();
    
    // Set internal resolution to match rendered size
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!spawns || spawns.length === 0) return;

    const minCoord = -1024000;
    const maxCoord = 1024000;
    const range = maxCoord - minCoord;

    spawns.forEach(pt => {
      const relX = (pt.y - minCoord) / range;
      const relY = 1.0 - (pt.x - minCoord) / range;

      const px = relX * canvas.width;
      const py = relY * canvas.height;

      // Draw radius
      const radiusPx = Math.max(4, (pt.radius / range) * canvas.width);

      ctx.beginPath();
      ctx.arc(px, py, radiusPx, 0, 2 * Math.PI);
      if (pt.isBoss) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
      } else {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
      }
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });
  };

  useEffect(() => {
    window.addEventListener('resize', drawMap);
    // Draw initial if image is already loaded
    if (imageRef.current && imageRef.current.complete) {
      drawMap();
    }
    return () => window.removeEventListener('resize', drawMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spawns]);

  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-base-800 bg-base-950/40">
      <img
        ref={imageRef}
        src="/assets/pals/T_WorldMap.png"
        alt="World Map"
        className="w-full h-full object-cover select-none"
        onLoad={drawMap}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}

function PalDetails() {
  const { id } = useParams();
  const initialData = useInitialData();
  const hasInitialData = initialData &&
    initialData.postType === 'palworld-detail' &&
    initialData.pal &&
    (typeof window === 'undefined' || String(initialData.pal.id) === String(id) || initialData.pal.name.toLowerCase() === id.toLowerCase());

  const [pal, setPal] = useState(hasInitialData ? initialData.pal : null);
  const [breeding, setBreeding] = useState(hasInitialData ? initialData.breeding : null);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState(null);
  const [palGuides, setPalGuides] = useState([]);
  const [breedingSearch, setBreedingSearch] = useState("");
  const [spawnsData, setSpawnsData] = useState(null);

  const { showPalBreedingDetails } = useFlags();
  const showBreedingVariation = useBoolVariation('show-pal-breeding-details', false);
  const showBreeding = showPalBreedingDetails || showBreedingVariation;

  useEffect(() => {
    const fetchSpawns = async () => {
      try {
        const response = await fetch('/assets/pals/spawns.json');
        const data = await response.json();
        setSpawnsData(data);
      } catch (err) {
        console.error("Error loading spawn data:", err);
      }
    };
    fetchSpawns();
  }, []);

  useEffect(() => {
    if (hasInitialData) {
      return;
    }

    const fetchPalAndBreeding = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await palworldApi.getPalById(id);
        setPal(data);
        
        try {
          const breedingData = await palworldApi.getBreedingRecipe(data.id, data.name);
          setBreeding(breedingData);
        } catch (bErr) {
          console.error("Error fetching breeding recipe:", bErr);
        }
      } catch (err) {
        console.error("Error fetching pal details:", err);
        setError("Failed to retrieve Pal details. Make sure the database has this Pal.");
      } finally {
        setLoading(false);
      }
    };
    fetchPalAndBreeding();
  }, [id, hasInitialData]);

  // Fetch guides (posts) tagged with this pal's name
  useEffect(() => {
    if (!pal?.name) return;
    const fetchGuides = async () => {
      try {
        // Slug-ify the pal name to match WP tag slugs (e.g. "Boltmane" -> "boltmane")
        const palSlug = pal.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const tag = await wordpressApi.tags.getBySlug(palSlug);
        if (!tag?.id) return;
        const result = await wordpressApi.posts.getByPostType('games', {
          tag: tag.id,
          perPage: 6,
          includeImages: true,
        });
        const posts = Array.isArray(result) ? result : (result?.posts || []);
        setPalGuides(posts);
      } catch {
        // Silently ignore — no tag or no posts is fine
      }
    };
    fetchGuides();
  }, [pal?.name]);

  const getPageTitle = () => (pal ? `${pal.name} Stats & Details - Palworld Database` : "Pal Details - Palworld Database");
  const getPageDescription = () =>
    pal
      ? `Full Palworld database entry for ${pal.name}. Discover elements: ${pal.element_types?.join(
          ", "
        )}, stats: HP ${pal.hp}, ATK ${pal.attack}, DEF ${pal.defense}, sizes: ${pal.size}, work capabilities, and speeds.`
      : "Detailed stats for Palworld Pals.";

  const schemas = pal
    ? [
        generateWebPageSchema({
          name: getPageTitle(),
          description: getPageDescription(),
          url: `${SITE_URL}/palworld/pals/${id}`
        }),
        generateBreadcrumbSchema({
          items: [
            { name: "Home", url: SITE_URL },
            { name: "Palworld Hub", url: `${SITE_URL}/palworld` },
            { name: "Pals Directory", url: `${SITE_URL}/palworld/pals` },
            { name: pal.name, url: `${SITE_URL}/palworld/pals/${id}` }
          ]
        })
      ]
    : [];

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        image={pal?.image_url}
        keywords={pal ? `palworld, ${pal.name}, ${pal.name} stats, ${pal.name} element, palworld database` : "palworld database"}
      />
      {pal && <StructuredSchema schemas={schemas} />}

      <div className="pt-[140px] pb-16 px-4 container mx-auto max-w-4xl">
        {/* Breadcrumb Trail Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-base-400 mb-6 bg-base-950/20 px-4 py-2.5 rounded-xl border border-base-800/40 w-fit">
          <Link to="/" className="hover:text-accent-violet-300 transition-colors">Home</Link>
          <span className="opacity-40">/</span>
          <Link to="/palworld" className="hover:text-accent-violet-300 transition-colors">Palworld Hub</Link>
          <span className="opacity-40">/</span>
          <Link to="/palworld/pals" className="hover:text-accent-violet-300 transition-colors">Pals</Link>
          <span className="opacity-40">/</span>
          <span className="text-gray-200">{pal ? pal.name : 'Details'}</span>
        </nav>

        <div className="mb-6">
          <Link
            to="/palworld/pals"
            className="inline-flex items-center gap-2 text-sm text-base-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Pals Directory
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-base-800/10 border border-base-800/40 rounded-3xl">
            <div className="w-12 h-12 border-4 border-accent-pink-900 border-t-accent-violet-500 rounded-full animate-spin mb-4"></div>
            <p className="text-base-300 text-sm">Accessing Paldex Archives...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-base-800/20 border border-base-800 rounded-3xl">
            <p className="text-red-400 font-medium mb-3">{error}</p>
            <Link
              to="/palworld/pals"
              className="bg-accent-violet-600 hover:bg-accent-violet-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition inline-block"
            >
              Back to Directory
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left side: Pal Image Box */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="bg-gradient-to-b from-base-800/60 to-base-950/80 border border-base-700/50 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center aspect-square">
                {/* Background glow based on elements */}
                <div className="absolute inset-0 bg-gradient-radial from-accent-violet-500/10 to-transparent blur-xl pointer-events-none"></div>

                {pal.image_url ? (
                  <img
                    src={pal.image_url}
                    alt={pal.name}
                    className="w-full h-full object-contain max-h-64 relative z-10 filter drop-shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <span className="text-6xl">🎮</span>
                    <span className="text-base-400 text-sm font-medium tracking-wide">{pal.name}</span>
                  </div>
                )}

                {/* Internal ID badge */}
                <span className="absolute bottom-4 text-xs font-mono text-base-500 tracking-wider">
                  Code: {pal.internal_id}
                </span>
              </div>

              {/* Elements & Size Info Box */}
              <div className="bg-base-800/30 border border-base-800/80 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-base-500 uppercase tracking-widest block mb-1">
                    Elements
                  </span>
                  <div className="flex gap-1.5">
                    {pal.element_types?.map((elem) => (
                      <span
                        key={elem}
                        className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded bg-base-950 border border-base-700/60 text-white"
                      >
                        {elem}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-base-500 uppercase tracking-widest block mb-1">
                    Size Category
                  </span>
                  <span className="text-base font-black text-accent-pink-400 bg-accent-pink-950/20 px-3 py-1 border border-accent-pink-900/20 rounded-md">
                    {pal.size}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Detailed Stats and suitabilities */}
            <div className="md:col-span-7 space-y-6">
              {/* Header Details */}
              <div>
                <span className="text-sm font-mono font-bold text-accent-pink-400 bg-accent-pink-950/20 border border-accent-pink-900/30 px-3 py-1 rounded-full inline-block mb-3">
                  Paldex Entry No. {pal.id.toString().padStart(3, "0")}
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-white">{pal.name}</h1>
              </div>

              {/* Basic Stats Grid */}
              <div className="bg-base-800/40 border border-base-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-md font-bold text-white uppercase tracking-wider pb-2 border-b border-base-700/50">
                  Base Statistics
                </h2>

                <div className="space-y-3">
                  {/* Stats Bars */}
                  {[
                    { label: "HP", value: pal.hp, max: 150, color: "from-green-500 to-emerald-500" },
                    { label: "Attack", value: pal.attack, max: 150, color: "from-red-500 to-rose-500" },
                    { label: "Defense", value: pal.defense, max: 150, color: "from-blue-500 to-indigo-500" },
                    {
                      label: "Rarity",
                      value: pal.rarity,
                      max: 10,
                      color: "from-yellow-500 to-amber-500"
                    },
                    {
                      label: "Food Amount",
                      value: pal.food_amount,
                      max: 10,
                      color: "from-orange-500 to-amber-600"
                    }
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-base-300">{stat.label}</span>
                        <span className="text-white">{stat.value}</span>
                      </div>
                      <div className="w-full bg-base-950 h-2 rounded-full overflow-hidden border border-base-800">
                        <div
                          className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                          style={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speeds & Stamina */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-base-800/30 border border-base-800/80 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-base-500 block uppercase mb-1">Run Speed</span>
                  <span className="text-lg font-black text-white">{pal.run_speed}</span>
                </div>
                <div className="bg-base-800/30 border border-base-800/80 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-base-500 block uppercase mb-1">Ride Sprint</span>
                  <span className="text-lg font-black text-white">{pal.ride_sprint_speed || "N/A"}</span>
                </div>
                <div className="bg-base-800/30 border border-base-800/80 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-base-500 block uppercase mb-1">Stamina</span>
                  <span className="text-lg font-black text-white">{pal.stamina}</span>
                </div>
              </div>

              {/* Work Suitabilities List */}
              <div className="bg-base-800/40 border border-base-800 rounded-2xl p-6">
                <h2 className="text-md font-bold text-white uppercase tracking-wider pb-2 border-b border-base-700/50 mb-4">
                  Work Suitabilities
                </h2>
                
                {pal.work_suitability && Object.keys(pal.work_suitability).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(pal.work_suitability).map(([work, level]) => (
                      <div
                        key={work}
                        className="bg-base-900/60 border border-base-800 rounded-xl px-4 py-2.5 flex justify-between items-center"
                      >
                        <span className="text-xs text-base-300 font-semibold">{work}</span>
                        <span className="text-xs font-bold text-accent-pink-400 bg-accent-pink-950/30 border border-accent-pink-900/20 px-2.5 py-0.5 rounded-full">
                          Lvl {level}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-base-400 italic">This Pal has no specific work suitabilities.</p>
                )}
              </div>

              {/* Habitat & Spawns Map Section */}
              <div className="bg-base-800/40 border border-base-800 rounded-2xl p-6">
                <h2 className="text-md font-bold text-white uppercase tracking-wider pb-2 border-b border-base-700/50 mb-4 flex justify-between items-center">
                  <span>Habitat Spawns Map</span>
                  <span className="text-[10px] text-base-400 font-mono lowercase">Coordinates scale: ~1:1000</span>
                </h2>
                
                {(() => {
                  if (!pal) return null;
                  const palSpawns = spawnsData ? spawnsData[pal.internal_id] : null;
                  if (!palSpawns || palSpawns.length === 0) {
                    return (
                      <div className="py-8 text-center bg-base-950/20 rounded-2xl border border-base-800/60">
                        <p className="text-sm text-base-400 italic">No wild habitat spawn locations found for this Pal.</p>
                        <p className="text-xs text-base-500 mt-1">This Pal may be breed-only, dungeon-only, or obtained through specific boss raids.</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-4">
                      <HabitatMap spawns={palSpawns} />
                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-base-300 bg-base-950/30 p-3 rounded-xl border border-base-800/50">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/70 inline-block"></span>
                          <span>Wild Spawns</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500 inline-block"></span>
                          <span>Alpha Boss Spawn</span>
                        </div>
                        <div className="ml-auto text-[11px] text-base-500">
                          Total Spawn Points: {palSpawns.length}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Breeding Combinations Section */}
        {showBreeding && breeding && breeding.breeding_parents && breeding.breeding_parents.length > 0 && (
          <div className="mt-12 bg-base-800/20 border border-base-800 rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-black text-white mb-2">
              Breeding Combinations for <span className="text-accent-pink-400">{pal?.name}</span>
            </h2>
            <p className="text-sm text-base-300 mb-6">
              Breed these Pal combinations together to obtain {pal?.name}.
            </p>

            {/* Search Bar */}
            <div className="mb-6 relative">
              <input
                type="text"
                value={breedingSearch}
                onChange={(e) => setBreedingSearch(e.target.value)}
                placeholder="Search parent Pals..."
                className="w-full bg-base-900/60 border border-base-800 text-white placeholder-base-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent-pink-500/50 transition-colors"
              />
              {breedingSearch && (
                <button
                  onClick={() => setBreedingSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-500 hover:text-white transition-colors"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filtered grid */}
            {(() => {
              const filteredParents = breeding.breeding_parents.filter((pair) => {
                if (pair.length < 2) return false;
                const [p1, p2] = pair;
                const query = breedingSearch.toLowerCase();
                return p1.name.toLowerCase().includes(query) || p2.name.toLowerCase().includes(query);
              });

              if (filteredParents.length === 0) {
                return (
                  <p className="text-sm text-base-500 italic py-4">No combinations found matching "{breedingSearch}".</p>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-2">
                  {filteredParents.map((pair, idx) => {
                    const [p1, p2] = pair;
                    return (
                      <div key={idx} className="flex items-center justify-between bg-base-900/40 border border-base-800/80 p-3 rounded-2xl gap-3">
                        {/* Parent 1 */}
                        <Link
                          to={`/palworld/pals/${encodeURIComponent(p1.name)}`}
                          className="text-sm font-bold text-white hover:text-accent-pink-450 transition-colors flex-1 min-w-0 truncate text-right"
                        >
                          {p1.name}
                        </Link>

                        {/* Plus sign */}
                        <span className="text-base-500 font-bold px-2 flex-shrink-0">+</span>

                        {/* Parent 2 */}
                        <Link
                          to={`/palworld/pals/${encodeURIComponent(p2.name)}`}
                          className="text-sm font-bold text-white hover:text-accent-pink-450 transition-colors flex-1 min-w-0 truncate text-left"
                        >
                          {p2.name}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </>
    )}

        {/* Guides section */}
        {palGuides.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black text-white mb-6">
              Guides about <span className="text-accent-pink-400">{pal?.name}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {palGuides.map(guide => (
                <Link
                  key={guide.id}
                  to={`/games/${guide.slug}/`}
                  className="group bg-base-800/40 border border-base-700/50 hover:border-accent-violet-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent-violet-500/10 flex flex-col"
                >
                  {guide.image ? (
                    <div className="aspect-video overflow-hidden bg-base-900">
                      <img
                        src={guide.image}
                        alt={guide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-base-800 to-base-900 flex items-center justify-center">
                      <span className="text-3xl">🎮</span>
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3
                      className="text-sm font-bold text-white group-hover:text-accent-violet-300 transition-colors line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: guide.title }}
                    />
                    <span className="mt-3 text-[11px] font-semibold text-accent-pink-400 uppercase tracking-wider">
                      Read Guide →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PalDetails;
