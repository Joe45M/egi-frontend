import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import wordpressApi from "../services/wordpressApi";
import PageMetadata, { SITE_URL } from "../components/PageMetadata";
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema } from "../components/StructuredSchema";

function Tags() {
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchTags = async () => {
      try {
        setLoading(true);
        // Fetch every single active tag (hide empty by default)
        const data = await wordpressApi.tags.getAll({
          fetchAll: true,
          orderby: "name",
          order: "asc",
          hideEmpty: true,
        });

        if (active) {
          setTags(data || []);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
        if (active) {
          setError("Failed to load tags. Please try again later.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTags();

    return () => {
      active = false;
    };
  }, []);

  // Filter tags based on search input
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group tags by starting letter
  const groupedTags = filteredTags.reduce((acc, tag) => {
    const firstLetter = tag.name.charAt(0).toUpperCase();
    const key = /^[A-Z]/.test(firstLetter) ? firstLetter : "#";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tag);
    return acc;
  }, {});

  // Get sorted keys (letters)
  const sortedLetters = Object.keys(groupedTags).sort();

  const getPageTitle = () => "All Tags - EliteGamerInsights";
  const getPageDescription = () => "Browse and filter all gaming articles, tutorials, and culture news by tags on EliteGamerInsights.";

  const schemas = [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/tags`
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL },
        { name: "Tags", url: `${SITE_URL}/tags` }
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        keywords="gaming tags, game topics, gaming articles index, tags list"
      />
      <StructuredSchema schemas={schemas} />
      
      <div className="pt-[200px] pb-16 p-4 container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-accent-pink-400 to-accent-violet-400 bg-clip-text text-transparent inline-block">
            Browse by Tag
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Explore our deep repository of gaming news, guides, and tutorials. Search or select a tag below to filter articles.
          </p>
        </div>

        {/* Search input with glowing styling */}
        <div className="max-w-md mx-auto mb-12 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 rounded-lg blur opacity-30 group-focus-within:opacity-60 transition duration-300"></div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-base-950/80 border border-base-800 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:border-accent-violet-500/50 transition-colors"
            />
            <svg
              className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500"
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-accent-violet-900 border-t-accent-pink-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading topics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-accent-pink-500 hover:bg-accent-pink-600 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTags.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No tags found matching "{searchTerm}"
          </div>
        )}

        {/* Tag Cloud / Alphabetical Directory */}
        {!loading && !error && filteredTags.length > 0 && (
          <div className="space-y-12">
            {sortedLetters.map((letter) => (
              <div key={letter} className="border-b border-base-800/40 pb-8">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-3xl font-extrabold text-accent-violet-400 font-mono">
                    {letter}
                  </h2>
                  <div className="h-px bg-base-800/60 flex-grow"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupedTags[letter].map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/tags/${tag.slug}`}
                      className="group bg-base-900/40 hover:bg-accent-violet-950/20 border border-base-800/60 hover:border-accent-violet-500/30 px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent-violet-500/5"
                    >
                      <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors duration-300 truncate mr-2">
                        #{tag.name}
                      </span>
                      <span className="text-[10px] font-bold text-accent-pink-400 bg-accent-pink-950/20 px-2 py-1 rounded-md border border-accent-pink-900/10 group-hover:bg-accent-violet-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shrink-0">
                        {tag.count} {tag.count === 1 ? "post" : "posts"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Tags;
