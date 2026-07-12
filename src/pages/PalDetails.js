import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { palworldApi } from "../services/palworldApi";
import PageMetadata, { SITE_URL } from "../components/PageMetadata";
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from "../components/StructuredSchema";

import { useInitialData } from "../initialDataContext";

function PalDetails() {
  const { id } = useParams();
  const initialData = useInitialData();
  const hasInitialData = initialData &&
    initialData.postType === 'palworld-detail' &&
    initialData.pal &&
    (typeof window === 'undefined' || String(initialData.pal.id) === String(id) || initialData.pal.name.toLowerCase() === id.toLowerCase());

  const [pal, setPal] = useState(hasInitialData ? initialData.pal : null);
  const [loading, setLoading] = useState(!hasInitialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (hasInitialData) {
      return;
    }

    const fetchPal = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await palworldApi.getPalById(id);
        setPal(data);
      } catch (err) {
        console.error("Error fetching pal details:", err);
        setError("Failed to retrieve Pal details. Make sure the database has this Pal.");
      } finally {
        setLoading(false);
      }
    };
    fetchPal();
  }, [id, hasInitialData]);

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
            { name: "Palworld Pals", url: `${SITE_URL}/palworld/pals` },
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
        keywords={pal ? `palworld, ${pal.name}, ${pal.name} stats, ${pal.name} element, palworld database` : "palworld database"}
      />
      {pal && <StructuredSchema schemas={schemas} />}

      <div className="pt-[140px] pb-16 px-4 container mx-auto max-w-4xl">
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PalDetails;
