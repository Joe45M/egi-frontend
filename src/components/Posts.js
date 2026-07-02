import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import wordpressApi from "../services/wordpressApi";
import { useInitialData } from "../initialDataContext";

function Posts({ posts: propPosts = null }) {
  const initialData = useInitialData();
  const hasInitialData = initialData && initialData.postType === 'home' && Array.isArray(initialData.allPosts);

  const [posts, setPosts] = useState(propPosts !== null ? propPosts : (hasInitialData ? initialData.allPosts : []));
  const [loading, setLoading] = useState(propPosts !== null ? false : !hasInitialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If posts are provided as prop, use them directly (for flexibility)
    if (propPosts !== null) {
      setPosts(propPosts);
      setLoading(false);
      return;
    }

    if (hasInitialData) {
      return;
    }

    // Otherwise, fetch from WordPress API
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await wordpressApi.posts.getByPostType('games', {
          perPage: 36,
          includeImages: true,
          orderBy: 'date',
          order: 'desc'
        });

        // Handle both old format (array) and new format (object with posts and pagination)
        if (Array.isArray(result)) {
          setPosts(result);
        } else if (result.posts && Array.isArray(result.posts)) {
          setPosts(result.posts);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games. Please try again later.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [propPosts, hasInitialData]);

  const postsToDisplay = posts;

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-accent-violet-950/20 to-base-800/30 rounded-xl overflow-hidden border border-accent-violet-900/10 animate-pulse block h-full"
          >
            <div className="aspect-video bg-base-900/50"></div>
            <div className="p-5">
              <div className="h-6 bg-accent-violet-900/30 rounded mb-2 w-5/6"></div>
              <div className="h-4 bg-accent-violet-900/30 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-accent-pink-500 text-white px-4 py-2 rounded-md hover:bg-accent-pink-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (postsToDisplay.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No games found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsToDisplay.map((post) => {
          // Use post slug for link, or fallback to /games with id
          const postLink = post.slug ? `/games/${post.slug}` : `/games?id=${post.id}`;
          // Fallback image if no featured image
          return (
            <PostCard key={post.id} post={post} link={postLink} />
          );
        })}
      </div>
    </div>
  );
}

export default Posts;

