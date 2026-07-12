import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { palworldApi } from "../services/palworldApi";
import PageMetadata, { SITE_URL } from "../components/PageMetadata";
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from "../components/StructuredSchema";
import { useInitialData } from "../initialDataContext";

const ELEMENTS = ["Fire", "Water", "Grass", "Electric", "Ice", "Ground", "Dark", "Dragon", "Neutral", "Earth"];
const WORKS = ["Kindling", "Watering", "Planting", "Generating Electricity", "Handiwork", "Gathering", "Lumbering", "Mining", "Medicine Production", "Transporting", "Cooling", "Farming"];
const SIZES = ["XS", "S", "M", "L", "XL"];

function Pals() {
  const initialData = useInitialData();
  
  // Filters state
  const [search, setSearch] = useState("");
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  
  // Stat Ranges
  const [stats, setStats] = useState({
    hp_min: "", hp_max: "",
    attack_min: "", attack_max: "",
    defense_min: "", defense_max: "",
    rarity_min: "", rarity_max: "",
  });

  // Sorting
  const [orderBy, setOrderBy] = useState("id");
  const [order, setOrder] = useState("ASC");

  // Pagination
  const [page, setPage] = useState(1);

  const hasInitialData = initialData && 
    initialData.postType === 'palworld-list' && 
    initialData.pals && 
    (typeof window === 'undefined' || (page === 1 && !search && selectedElements.length === 0 && selectedWorks.length === 0 && selectedSizes.length === 0));

  const [pals, setPals] = useState(hasInitialData ? initialData.pals : []);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(hasInitialData ? initialData.totalPages : 1);
  const [totalItems, setTotalItems] = useState(hasInitialData ? initialData.totalItems : 0);

  // Show/hide filters on mobile
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchPals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 100,
        search,
        order_by: orderBy,
        order,
        element: selectedElements.join(","),
        work: selectedWorks.join(","),
        size: selectedSizes.join(","),
        ...stats
      };

      const response = await palworldApi.getPals(params);
      setPals(response.data || []);
      setTotalPages(response.headers?.totalPages || 1);
      setTotalItems(response.headers?.total || 0);
    } catch (err) {
      console.error("Error fetching pals:", err);
      setError("Failed to fetch Pals. Please make sure the WP REST API is available.");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedElements, selectedWorks, selectedSizes, stats, orderBy, order]);

  useEffect(() => {
    if (hasInitialData) {
      return;
    }
    fetchPals();
  }, [fetchPals, hasInitialData]);

  // Reset page when filters change
  const handleFilterChange = () => {
    setPage(1);
  };

  const handleElementToggle = (elem) => {
    setSelectedElements(prev =>
      prev.includes(elem) ? prev.filter(e => e !== elem) : [...prev, elem]
    );
    handleFilterChange();
  };

  const handleWorkToggle = (work) => {
    setSelectedWorks(prev =>
      prev.includes(work) ? prev.filter(w => w !== work) : [...prev, work]
    );
    handleFilterChange();
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    handleFilterChange();
  };

  const handleStatChange = (e) => {
    const { name, value } = e.target;
    setStats(prev => ({ ...prev, [name]: value }));
    handleFilterChange();
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedElements([]);
    setSelectedWorks([]);
    setSelectedSizes([]);
    setStats({
      hp_min: "", hp_max: "",
      attack_min: "", attack_max: "",
      defense_min: "", defense_max: "",
      rarity_min: "", rarity_max: "",
    });
    setOrderBy("id");
    setOrder("ASC");
    setPage(1);
  };

  const getPageTitle = () => "Palworld Pals Directory & Stats Database - EliteGamerInsights";
  const getPageDescription = () => "Explore the full Palworld directory. Filter and search all Pals by elements, work suitabilities, stats, and discover details, rarity, and fast navigation.";

  const schemas = [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/palworld/pals`
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL },
        { name: "Palworld Pals", url: `${SITE_URL}/palworld/pals` }
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        keywords="palworld, pals directory, pals statistics, palworld elemental, work suitability, palworld database"
        image={`${SITE_URL}/pal-directory-og.png`}
      />
      <StructuredSchema schemas={schemas} />

      <div className="pt-[140px] pb-16 px-4 container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            Palworld <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink-500 to-accent-violet-500">Pals Directory</span>
          </h1>
          <p className="text-base-300 max-w-2xl text-sm md:text-base">
            Complete database of all Pals in Palworld. Use the advanced filtering below to search by Element types, Work Suitabilities, Stats ranges, and more.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar (Desktop) / Dropdown (Mobile) */}
          <div className={`w-full lg:w-1/4 ${showMobileFilters ? "block mb-6" : "hidden lg:block"} shrink-0`}>
            <div className="bg-base-800/80 backdrop-blur-md rounded-2xl p-6 border border-base-700/50 sticky top-28 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-4 border-b border-base-700">
                <h2 className="text-lg font-bold text-white">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-accent-pink-400 hover:text-accent-pink-300 font-semibold"
                >
                  Clear All
                </button>
              </div>

              {/* Elements Filter */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Element Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {ELEMENTS.map(elem => {
                    const isSelected = selectedElements.includes(elem);
                    return (
                      <button
                        key={elem}
                        onClick={() => handleElementToggle(elem)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all duration-200 ${
                          isSelected
                            ? "bg-accent-violet-500/20 border-accent-violet-500 text-accent-violet-300"
                            : "bg-base-900/40 border-base-700/50 text-base-300 hover:border-base-600"
                        }`}
                      >
                        {elem}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Work Suitability */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Work Suitability</h3>
                <div className="flex flex-wrap gap-1.5">
                  {WORKS.map(work => {
                    const isSelected = selectedWorks.includes(work);
                    return (
                      <button
                        key={work}
                        onClick={() => handleWorkToggle(work)}
                        className={`text-[11px] px-2 py-1 rounded-md border transition-all duration-200 ${
                          isSelected
                            ? "bg-accent-pink-500/20 border-accent-pink-500 text-accent-pink-300"
                            : "bg-base-900/40 border-base-700/50 text-base-300 hover:border-base-600"
                        }`}
                      >
                        {work}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Size</h3>
                <div className="flex gap-2">
                  {SIZES.map(size => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`flex-1 text-xs py-1.5 rounded-lg border font-bold transition-all duration-200 ${
                          isSelected
                            ? "bg-white/10 border-white text-white"
                            : "bg-base-900/40 border-base-700/50 text-base-400 hover:border-base-600"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Range Filters */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Stats Ranges</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-base-400 block mb-1">HP Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        name="hp_min"
                        value={stats.hp_min}
                        onChange={handleStatChange}
                        className="w-full bg-base-900/60 border border-base-700/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent-violet-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        name="hp_max"
                        value={stats.hp_max}
                        onChange={handleStatChange}
                        className="w-full bg-base-900/60 border border-base-700/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent-violet-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-base-400 block mb-1">Attack Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        name="attack_min"
                        value={stats.attack_min}
                        onChange={handleStatChange}
                        className="w-full bg-base-900/60 border border-base-700/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent-violet-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        name="attack_max"
                        value={stats.attack_max}
                        onChange={handleStatChange}
                        className="w-full bg-base-900/60 border border-base-700/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent-violet-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-base-400 block mb-1">Defense Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        name="defense_min"
                        value={stats.defense_min}
                        onChange={handleStatChange}
                        className="w-full bg-base-900/60 border border-base-700/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent-violet-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        name="defense_max"
                        value={stats.defense_max}
                        onChange={handleStatChange}
                        className="w-full bg-base-900/60 border border-base-700/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent-violet-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pals Content */}
          <div className="flex-grow">
            {/* Top Toolbar */}
            <div className="bg-base-800/40 rounded-xl p-4 border border-base-800/80 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search Pals..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full bg-base-950/80 border border-base-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-accent-violet-500/50"
                />
                <svg
                  className="absolute left-3 top-3 w-4 h-4 text-base-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Sorting & Mobile Filter Toggle */}
              <div className="flex gap-3 w-full sm:w-auto justify-end items-center">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden bg-base-900/60 hover:bg-base-950 text-white border border-base-700 text-xs px-4 py-2 rounded-lg"
                >
                  {showMobileFilters ? "Hide Filters" : "Filters"}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-base-400">Sort:</span>
                  <select
                    value={orderBy}
                    onChange={(e) => {
                      setOrderBy(e.target.value);
                      handleFilterChange();
                    }}
                    className="bg-base-900 border border-base-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="id">Paldex ID</option>
                    <option value="name">Name</option>
                    <option value="hp">HP</option>
                    <option value="attack">Attack</option>
                    <option value="defense">Defense</option>
                    <option value="rarity">Rarity</option>
                    <option value="run_speed">Speed</option>
                  </select>

                  <button
                    onClick={() => {
                      setOrder(prev => prev === "ASC" ? "DESC" : "ASC");
                      handleFilterChange();
                    }}
                    className="bg-base-900 border border-base-700 text-white px-2 py-1.5 rounded-lg text-xs"
                  >
                    {order}
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-accent-violet-900 border-t-accent-pink-500 rounded-full animate-spin mb-4"></div>
                <p className="text-base-300 text-sm">Querying Paldex Database...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-base-800/20 border border-base-800 rounded-2xl">
                <p className="text-red-400 font-medium mb-3">{error}</p>
                <button
                  onClick={fetchPals}
                  className="bg-accent-violet-600 hover:bg-accent-violet-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Retry
                </button>
              </div>
            ) : pals.length === 0 ? (
              <div className="text-center py-24 bg-base-800/10 border border-base-800 rounded-2xl">
                <p className="text-base-400 mb-2">No Pals found matching your filter selection.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-accent-pink-400 text-xs font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <>
                {/* Pals Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {pals.map((pal) => (
                    <Link
                      key={pal.id}
                      to={`/palworld/pals/${encodeURIComponent(pal.name)}`}
                      className="group bg-base-800/40 hover:bg-base-800/80 border border-base-800 hover:border-accent-violet-500/40 rounded-2xl p-3.5 md:p-5 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-violet-500/5"
                    >
                      {/* Image Frame */}
                      <div className="bg-base-950/60 rounded-xl aspect-square flex items-center justify-center mb-4 relative overflow-hidden">
                        {pal.image_url ? (
                          <img
                            src={pal.image_url}
                            alt={pal.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-base-800 to-base-900 gap-1">
                            <span className="text-3xl">🎮</span>
                            <span className="text-[10px] text-base-500 font-medium text-center px-1 leading-tight line-clamp-2">{pal.name}</span>
                          </div>
                        )}
                        {/* Size tag */}
                        <div className="absolute top-2 right-2 bg-base-900 border border-base-700 text-[10px] font-bold text-white px-2 py-0.5 rounded-md">
                          {pal.size}
                        </div>
                      </div>

                      {/* Header */}
                      <div className="mb-3">
                        <span className="text-[10px] text-accent-pink-400 font-mono font-bold tracking-widest block mb-1">
                          No. {pal.id.toString().padStart(3, "0")}
                        </span>
                        <h3 className="text-lg font-bold text-white group-hover:text-accent-violet-300 transition-colors duration-200">
                          {pal.name}
                        </h3>
                      </div>

                      {/* Elements */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {pal.element_types?.map((elem) => (
                          <span
                            key={elem}
                            className="text-[10px] font-extrabold uppercase tracking-wide bg-base-900 text-base-300 px-2 py-1 rounded border border-base-700/60"
                          >
                            {elem}
                          </span>
                        ))}
                      </div>

                      {/* Base Stats Summary */}
                      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-base-800/80 pt-3">
                        <div className="text-center">
                          <span className="text-[9px] text-base-500 block">HP</span>
                          <span className="text-xs font-bold text-white">{pal.hp}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-base-500 block">ATK</span>
                          <span className="text-xs font-bold text-white">{pal.attack}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-base-500 block">DEF</span>
                          <span className="text-xs font-bold text-white">{pal.defense}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="bg-base-800/80 hover:bg-base-700 disabled:opacity-30 border border-base-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-base-400">
                      Page {page} of {totalPages} ({totalItems} Pals)
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="bg-base-800/80 hover:bg-base-700 disabled:opacity-30 border border-base-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SEO Information Content Section */}
        <div className="mt-16 pt-12 border-t border-base-800/80 max-w-4xl mx-auto space-y-8 wp-content text-left">
          <h2 className="text-2xl font-bold text-white mb-4">Ultimate Palworld Paldex Database Guide</h2>
          
          <p>
            Welcome to the definitive <strong>Palworld Pals Database</strong>. Understanding your Pals' stats, elemental strengths, and work capabilities is vital for optimizing both base management and survival combat. This directory indexes all discovered companions (Pals) in Palworld, along with their detailed numerical attributes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Elemental Type Matchups</h3>
              <p className="text-xs text-gray-400">
                Pals in Palworld are grouped into 9 primary elemental types: Fire, Water, Grass, Electric, Ice, Ground, Dark, Dragon, and Neutral. Using elements strategically is crucial. For instance, Fire Pals deal double damage to Grass and Ice types, while Water types counter Fire elements. Always form teams that cover diverse weaknesses to conquer difficult dungeon bosses.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Work Suitability & Base Productivity</h3>
              <p className="text-xs text-gray-400">
                Pals are not just for combat; they are the heart of your base operations. Each Pal features distinct levels of suitability for tasks like Mining, Kindling, Watering, and Planting. Mining Pals like Anubis or Digtoise speed up ore collection, while Kindling specialists like Jetragon or Blazamut keep smelters running continuously.
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-200 mb-2">Stat Min/Maxing for Combat</h3>
          <p>
            When filtering Pals in our directory, paying attention to stats like HP, Attack, and Defense can help you choose the best fighting party. High-tier Pals feature higher base stats, and these can be further boosted using the Statue of Power or by condensing duplicates. Use the filters on this page to search for top-performing Pals to target in your next capture runs.
          </p>
        </div>
      </div>
    </>
  );
}

export default Pals;
