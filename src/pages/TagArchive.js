import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, Navigate } from "react-router-dom";
import wordpressApi from "../services/wordpressApi";
import Pagination from "../components/Pagination";
import PageMetadata, { SITE_URL } from "../components/PageMetadata";
import StructuredSchema, { generateCollectionPageSchema, generateBreadcrumbSchema, generateWebPageSchema } from "../components/StructuredSchema";
import PostCard from "../components/PostCard";

function TagArchive() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [tag, setTag] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const postsPerPage = 24;

  // Step 1: Fetch tag details by slug
  useEffect(() => {
    let active = true;

    const fetchTagDetails = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const decodedSlug = decodeURIComponent(slug);
        const tagData = await wordpressApi.tags.getBySlug(decodedSlug);
        
        if (active) {
          setTag(tagData);
        }
      } catch (err) {
        console.error("Error fetching tag details:", err);
        if (active) {
          if (err.message && err.message.includes("not found")) {
            setNotFound(true);
          } else {
            setError("Failed to load tag details. Please try again later.");
          }
          setLoading(false);
        }
      }
    };

    fetchTagDetails();

    return () => {
      active = false;
    };
  }, [slug]);

  // Step 2: Fetch posts once tag ID is resolved
  useEffect(() => {
    if (!tag?.id) return;
    let active = true;

    const fetchPosts = async () => {
      try {
        const params = {
          page: currentPage,
          perPage: postsPerPage,
          tag: tag.id,
          includeImages: true,
          orderBy: "date",
          order: "desc",
        };

        // We use getByPostType to query games type posts
        const result = await wordpressApi.posts.getByPostType("games", params);

        if (!active) return;

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
        console.error("Error fetching posts for tag:", err);
        if (active) {
          setError("Failed to load articles. Please try again later.");
          setPosts([]);
        }
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
  }, [tag, currentPage]);

  const getPageTitle = () => {
    if (tag) {
      return `${tag.name} Articles - EliteGamerInsights`;
    }
    return "Tag Archive";
  };

  const getPageDescription = () => {
    if (tag) {
      return `Browse all gaming articles, tutorials, and guides tagged with ${tag.name} on EliteGamerInsights.`;
    }
    return "Browse articles filtered by tag.";
  };

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  // Loading state (preloader)
  if (loading && !tag) {
    return (
      <div className="pt-[200px] p-4 container mx-auto">
        <div className="h-10 bg-accent-violet-950/10 animate-pulse rounded-lg w-1/4 mb-8"></div>
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

  const schemas = tag ? [
    generateWebPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/tags/${tag.slug}`
    }),
    generateCollectionPageSchema({
      name: getPageTitle(),
      description: getPageDescription(),
      url: `${SITE_URL}/tags/${tag.slug}`,
      numberOfItems: posts.length,
      itemListElement: posts.map((post) => ({
        name: post.title,
        url: `${SITE_URL}/games/${post.slug}`,
        image: post.image,
        description: post.excerpt,
      })),
    }),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: SITE_URL },
        { name: "Tags", url: `${SITE_URL}/tags` },
        { name: tag.name, url: `${SITE_URL}/tags/${tag.slug}` }
      ]
    })
  ] : [];

  return (
    <>
      <PageMetadata
        title={getPageTitle()}
        description={getPageDescription()}
        keywords={tag ? `${tag.name}, gaming, guides, tutorials` : "gaming, tags"}
      />
      {tag && <StructuredSchema schemas={schemas} />}

      <div className="pt-[200px] pb-16 p-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-base-800/40 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Link to="/tags" className="hover:text-accent-violet-400 transition-colors">Tags</Link>
              <span>/</span>
              <span className="text-gray-400 font-medium">{tag?.name || slug}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-2">
              <span>Articles tagged:</span>
              <span className="bg-gradient-to-r from-accent-pink-400 to-accent-violet-400 bg-clip-text text-transparent">
                #{tag?.name || slug}
              </span>
            </h1>
          </div>
          <Link
            to="/tags"
            className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm font-semibold transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Tags
          </Link>
        </div>

        {/* Loading overlay for inner states */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative h-64 bg-accent-violet-950/10 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
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

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16 bg-base-900/20 border border-base-800/40 rounded-2xl">
            <p className="text-gray-400 mb-2">No articles found with this tag.</p>
            <Link to="/tags" className="text-accent-violet-400 hover:text-accent-pink-400 font-semibold text-sm transition-colors">
              Explore other tags
            </Link>
          </div>
        )}

        {/* Post Grid */}
        {!error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const postLink = post.slug ? `/games/${post.slug}` : `/games?id=${post.id}`;
                return <PostCard key={post.id} post={post} link={postLink} />;
              })}
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                basePath={`/tags/${slug}`}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default TagArchive;
