import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import wordpressApi from "../services/wordpressApi";
import Pagination from "../components/Pagination";
import NotFound from "./NotFound";
import PageMetadata, { SITE_URL } from "../components/PageMetadata";
import StructuredSchema, { generateCollectionPageSchema, generateBreadcrumbSchema, generateWebPageSchema } from "../components/StructuredSchema";
import PostCard from "../components/PostCard";
function Archive() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const gameParam = searchParams.get('game'); // Can be slug or ID
  const postsPerPage = 24;
  const [gameTermId, setGameTermId] = useState(null);

  useEffect(() => {
    const fetchGameInfo = async () => {
      if (gameParam) {
        try {
          // Try different possible taxonomy names
          const possibleTaxonomies = ['games', 'game', 'game_taxonomy'];
          const isNumeric = /^\d+$/.test(gameParam);
          let game = null;
          let taxonomyName = null;

          for (const taxonomy of possibleTaxonomies) {
            try {
              if (isNumeric) {
                // It's an ID
                game = await wordpressApi.taxonomies.getById(taxonomy, parseInt(gameParam, 10));
                taxonomyName = taxonomy;
                break;
              } else {
                // It's a slug
                game = await wordpressApi.taxonomies.getBySlug(taxonomy, gameParam);
                taxonomyName = taxonomy;
                break;
              }
            } catch (err) {
              // Try next taxonomy
              continue;
            }
          }

          if (game) {
            setGameTermId(game.id);
            // Store taxonomy name in game object for filtering
            game.taxonomy = taxonomyName || 'games';
            setSelectedGame(game);
          } else {
            throw new Error('Game not found in any taxonomy');
          }
        } catch (err) {
          console.error('Error fetching game info:', err);
          setSelectedGame(null);
          setGameTermId(null);
        }
      } else {
        setSelectedGame(null);
        setGameTermId(null);
      }
    };

    fetchGameInfo();
  }, [gameParam]);

  useEffect(() => {
    let active = true;

    const fetchPosts = async () => {
      // console.log('fetchPosts running for type:', type, 'gameTermId:', gameTermId);
      if (!type) {
        if (active) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }

      try {
        if (active) {
          setLoading(true);
          setError(null);
          setNotFound(false);
        }

        // Build params with optional game filter
        const params = {
          page: currentPage,
          perPage: postsPerPage,
          includeImages: true,
          orderBy: 'date',
          order: 'desc'
        };

        // Add game filter if gameTermId is available
        // Try different taxonomy names - WordPress might use different REST base
        if (gameTermId) {
          // Use the first one that matches the selected game's taxonomy, or default to 'games'
          const taxonomyName = selectedGame?.taxonomy || 'games';
          params.taxonomyFilter = {
            [taxonomyName]: gameTermId
          };
          // console.log('Filtering posts by game:', { taxonomyName, gameTermId, selectedGame });
        }

        const result = await wordpressApi.posts.getByPostType(type, params);

        if (!active) return;

        // Handle both old format (array) and new format (object with posts and pagination)
        if (Array.isArray(result)) {
          setPosts(result);
          setPagination(null);
        } else if (result.posts && result.pagination) {
          setPosts(result.posts);
          setPagination(result.pagination);
        } else {
          setPosts([]);
          setPagination(null);
        }
      } catch (err) {
        if (!active) return;

        console.error(`Error fetching ${type} posts:`, err);
        // Check if it's a 404 or invalid post type
        if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
          setNotFound(true);
        } else {
          setError(`Failed to load ${type} posts. Please try again later.`);
        }
        setPosts([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      active = false;
    };
  }, [type, currentPage, gameTermId, selectedGame]);



  // Capitalize first letter of post type for display
  const getPostTypeLabel = () => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get page title for metadata
  const getPageTitle = () => {
    if (selectedGame) {
      return `${selectedGame.name} - ${getPostTypeLabel()}`;
    }
    return getPostTypeLabel();
  };

  // Get page description for metadata
  const getPageDescription = () => {
    if (selectedGame) {
      return `Browse all ${type} articles about ${selectedGame.name} on EliteGamerInsights. Latest news, tutorials, and guides.`;
    }
    return `Browse all ${type} articles on EliteGamerInsights. Latest gaming news, tutorials, and culture coverage.`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="pt-[200px] p-4 container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">{getPostTypeLabel()}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="relative h-64 bg-accent-violet-950/10 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // 404 handling
  if (notFound) {
    return <NotFound />;
  }

  // Error state
  if (error) {
    return (
      <div className="pt-[200px] p-4 container mx-auto">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-pink-500 text-white px-4 py-2 rounded-md hover:bg-accent-pink-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="pt-[200px] p-4 container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">{getPostTypeLabel()}</h1>
        <div className="text-center py-8">
          <p className="text-gray-400">No {type} posts found.</p>
        </div>
      </div>
    );
  }

  const schemas = [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/${type}${selectedGame ? `?game=${selectedGame.slug || selectedGame.id}` : ''}`
    }),
    generateCollectionPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/${type}${selectedGame ? `?game=${selectedGame.slug || selectedGame.id}` : ''}`,
      numberOfItems: posts.length,
      itemListElement: posts.map(post => ({
        name: post.title,
        url: `${SITE_URL}/${type}/${post.slug}`,
        image: post.image,
        description: post.excerpt
      }))
    }),
    generateBreadcrumbSchema({
      items: [
        { name: 'Home', url: SITE_URL },
        ...(selectedGame ? [
          { name: getPostTypeLabel(), url: `${SITE_URL}/${type}` },
          { name: selectedGame.name, url: `${SITE_URL}/${type}?game=${selectedGame.slug || selectedGame.id}` }
        ] : [
          { name: getPostTypeLabel(), url: `${SITE_URL}/${type}` }
        ])
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        keywords={`${type}, gaming articles, game news, ${selectedGame ? selectedGame.name + ', ' : ''}gaming content`}
      />
      <StructuredSchema schemas={schemas} />
      <div className="pt-[200px] p-4 container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">
            {selectedGame ? `${selectedGame.name} - ${getPostTypeLabel()}` : getPostTypeLabel()}
          </h1>
          {selectedGame && (
            <Link
              to={`/${type}`}
              className="text-accent-violet-300 hover:text-accent-violet-400 transition-colors duration-300 text-sm"
            >
              Clear filter
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            // Use post slug for link
            const postLink = post.slug ? `/${type}/${post.slug}` : `/${type}?id=${post.id}`;

            return (
              <PostCard key={post.id} post={post} link={postLink} />
            );
          })}
        </div>

        {/* Pagination */}
        {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            basePath={`/${type}`}
          />
        )}
      </div>
    </>
  );
}

export default Archive;

