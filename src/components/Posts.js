import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";
import wordpressApi from "../services/wordpressApi";

function Posts({ posts: propPosts = null }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If posts are provided as prop, use them directly (for flexibility)
    if (propPosts !== null) {
      setPosts(propPosts);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from WordPress API
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await wordpressApi.posts.getByPostType('games', {
          perPage: 12,
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
  }, [propPosts]);

  const postsToDisplay = posts;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="relative h-64 bg-accent-violet-950/10 animate-pulse rounded-lg"
          ></div>
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

