import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { palworldApi } from "../services/palworldApi";
import PageMetadata, { SITE_URL } from "../components/PageMetadata";
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from "../components/StructuredSchema";

function Technologies() {
  const [techList, setTechList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters State
  const [search, setSearch] = useState("");
  const [type, setType] = useState(""); // "" (All), "Regular", "Ancient"
  
  // Level & Cost filters
  const [levels, setLevels] = useState({ level_min: "", level_max: "" });
  const [costs, setCosts] = useState({ cost_min: "", cost_max: "" });

  // Sorting
  const [orderBy, setOrderBy] = useState("level");
  const [order, setOrder] = useState("ASC");

  const fetchTech = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 15,
        search,
        type,
        level_min: levels.level_min,
        level_max: levels.level_max,
        cost_min: costs.cost_min,
        cost_max: costs.cost_max,
        order_by: orderBy,
        order
      };

      const response = await palworldApi.getTech(params);
      setTechList(response.data || []);
      setTotalPages(response.headers?.totalPages || 1);
      setTotalItems(response.headers?.total || 0);
    } catch (err) {
      console.error("Error fetching technology list:", err);
      setError("Failed to fetch Technologies. Please make sure the WP REST API is active.");
    } finally {
      setLoading(false);
    }
  }, [page, search, type, levels, costs, orderBy, order]);

  useEffect(() => {
    fetchTech();
  }, [fetchTech]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const handleLevelChange = (e) => {
    const { name, value } = e.target;
    setLevels(prev => ({ ...prev, [name]: value }));
    handleFilterChange();
  };

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({ ...prev, [name]: value }));
    handleFilterChange();
  };

  const clearAllFilters = () => {
    setSearch("");
    setType("");
    setLevels({ level_min: "", level_max: "" });
    setCosts({ cost_min: "", cost_max: "" });
    setOrderBy("level");
    setOrder("ASC");
    setPage(1);
  };

  const getPageTitle = () => "Palworld Technology tree Calculator & Database - EliteGamerInsights";
  const getPageDescription = () => "Complete listing of Palworld technologies, costs, unlock levels, unlocks structures, items, and ancient vs regular categories.";

  const schemas = [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/palworld/tech`
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL },
        { name: "Palworld Hub", url: `${SITE_URL}/palworld` },
        { name: "Technologies Tree", url: `${SITE_URL}/palworld/tech` }
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        keywords="palworld, technologies tree, ancient technology points, tech cost, unlock items, unlock structures"
      />
      <StructuredSchema schemas={schemas} />

      <div className="pt-[140px] pb-16 px-4 container mx-auto max-w-7xl">
        {/* Breadcrumb Trail Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-base-400 mb-6 bg-base-950/20 px-4 py-2.5 rounded-xl border border-base-800/40 w-fit">
          <Link to="/" className="hover:text-accent-violet-300 transition-colors">Home</Link>
          <span className="opacity-40">/</span>
          <Link to="/palworld" className="hover:text-accent-violet-300 transition-colors">Palworld Hub</Link>
          <span className="opacity-40">/</span>
          <span className="text-gray-200">Technologies Tree</span>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            Palworld <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink-500 to-accent-violet-500">Technology Tree</span>
          </h1>
          <p className="text-base-300 max-w-2xl text-sm md:text-base">
            Discover and calculate costs for all Palworld technologies. Filter by technology level, cost points, and classification, or check out how to breed your mount Pals with our <Link to="/palworld/palworld-breeding" className="text-accent-pink-450 font-bold hover:underline">Breeding Calculator</Link>.
          </p>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-base-800/40 rounded-2xl p-6 border border-base-800/80 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="text-[11px] font-bold text-base-400 uppercase tracking-wider block mb-1.5">
                Search
              </label>
              <input
                type="text"
                placeholder="Search Technology..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleFilterChange();
                }}
                className="w-full bg-base-950/80 border border-base-700 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-accent-violet-500/50"
              />
            </div>

            {/* Type Selection */}
            <div>
              <label className="text-[11px] font-bold text-base-400 uppercase tracking-wider block mb-1.5">
                Tech Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  handleFilterChange();
                }}
                className="w-full bg-base-950/80 border border-base-700 text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-accent-violet-500/50"
              >
                <option value="">All Types</option>
                <option value="Regular">Regular (Blue)</option>
                <option value="Ancient">Ancient (Purple)</option>
              </select>
            </div>

            {/* Level range */}
            <div>
              <label className="text-[11px] font-bold text-base-400 uppercase tracking-wider block mb-1.5">
                Unlock Levels
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  name="level_min"
                  value={levels.level_min}
                  onChange={handleLevelChange}
                  className="w-full bg-base-950/80 border border-base-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent-violet-500/50"
                />
                <input
                  type="number"
                  placeholder="Max"
                  name="level_max"
                  value={levels.level_max}
                  onChange={handleLevelChange}
                  className="w-full bg-base-950/80 border border-base-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent-violet-500/50"
                />
              </div>
            </div>

            {/* Cost Range */}
            <div>
              <label className="text-[11px] font-bold text-base-400 uppercase tracking-wider block mb-1.5">
                Tech Points Cost
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  name="cost_min"
                  value={costs.cost_min}
                  onChange={handleCostChange}
                  className="w-full bg-base-950/80 border border-base-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent-violet-500/50"
                />
                <input
                  type="number"
                  placeholder="Max"
                  name="cost_max"
                  value={costs.cost_max}
                  onChange={handleCostChange}
                  className="w-full bg-base-950/80 border border-base-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent-violet-500/50"
                />
              </div>
            </div>
          </div>

          {/* Secondary bar: Sorting, count, reset */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-base-700/50 gap-4">
            <span className="text-xs text-base-400">
              Found <strong className="text-white">{totalItems}</strong> technologies
            </span>

            <div className="flex items-center gap-3">
              <span className="text-xs text-base-400">Sort:</span>
              <select
                value={orderBy}
                onChange={(e) => {
                  setOrderBy(e.target.value);
                  handleFilterChange();
                }}
                className="bg-base-900 border border-base-750 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="level">Level</option>
                <option value="cost">Points Cost</option>
                <option value="name">Name</option>
              </select>

              <button
                onClick={() => {
                  setOrder(prev => prev === "ASC" ? "DESC" : "ASC");
                  handleFilterChange();
                }}
                className="bg-base-900 border border-base-750 text-white text-xs px-2.5 py-1.5 rounded-lg"
              >
                {order}
              </button>

              <button
                onClick={clearAllFilters}
                className="text-xs text-accent-pink-400 hover:underline font-semibold ml-2"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-accent-pink-900 border-t-accent-violet-500 rounded-full animate-spin mb-4"></div>
            <p className="text-base-300 text-sm">Translating ancient tech trees...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-base-800/20 border border-base-800 rounded-2xl">
            <p className="text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={fetchTech}
              className="bg-accent-pink-600 hover:bg-accent-pink-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              Retry
            </button>
          </div>
        ) : techList.length === 0 ? (
          <div className="text-center py-24 bg-base-800/10 border border-base-800 rounded-2xl">
            <p className="text-base-400 mb-2">No technologies match your current filter settings.</p>
            <button
              onClick={clearAllFilters}
              className="text-accent-violet-400 text-xs font-semibold hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            {/* Tech Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techList.map((tech) => (
                <div
                  key={tech.id}
                  className="bg-base-800/40 border border-base-800 hover:border-base-700/60 rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Card Header Info */}
                  <div className="flex gap-4 mb-4 items-start">
                    <div className="w-16 h-16 bg-base-950/60 rounded-xl p-2.5 flex items-center justify-center border border-base-800 shrink-0 relative overflow-hidden">
                      {tech.image_url ? (
                        <img
                          src={tech.image_url}
                          alt={tech.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-2xl">⚙️</span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-md font-bold text-white leading-tight mb-1.5">
                        {tech.name}
                      </h3>
                      <div className="flex gap-1.5 flex-wrap">
                        {/* Type badge */}
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            tech.type === "Ancient"
                              ? "bg-accent-violet-950/60 border border-accent-violet-800/40 text-accent-violet-300"
                              : "bg-base-900 border border-base-750 text-base-300"
                          }`}
                        >
                          {tech.type}
                        </span>

                        <span className="text-[9px] font-bold bg-base-950 text-accent-pink-400 px-2 py-0.5 rounded border border-base-750">
                          Lvl {tech.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-base-300 leading-relaxed mb-4 flex-grow">
                    {tech.description}
                  </p>

                  {/* Tech unlocks & cost footer */}
                  <div className="border-t border-base-800/80 pt-3 mt-auto space-y-2">
                    {tech.unlocks_items?.length > 0 && (
                      <div className="flex gap-1 items-center">
                        <span className="text-[10px] text-base-500 font-bold block shrink-0">Unlocks:</span>
                        <div className="flex flex-wrap gap-1">
                          {tech.unlocks_items.map((item, idx) => (
                            <span key={idx} className="text-[10px] bg-base-900 px-1.5 py-0.5 rounded text-white border border-base-800">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-base-400">Point Cost:</span>
                      <span className="font-extrabold text-white bg-base-950 px-2.5 py-1 rounded border border-base-800">
                        {tech.cost} Point{tech.cost !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
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
                  Page {page} of {totalPages} ({totalItems} Techs)
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
    </>
  );
}

export default Technologies;
