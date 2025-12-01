import { useState, useEffect } from "react";
import {Link} from "react-router-dom";
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
        
        const games = await wordpressApi.posts.getByPostType('games', {
          perPage: 12,
          includeImages: true,
          orderBy: 'date',
          order: 'desc'
        });

        setPosts(games);
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
          // Use post slug for link, or fallback to /post with id
          const postLink = post.slug ? `/post/${post.slug}` : `/post?id=${post.id}`;
          // Fallback image if no featured image
          const imageUrl = post.image || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop';

          return (
            <Link
              to={postLink}
              key={post.id}
              className="relative group overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Background Image */}
              <div
                className="relative h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  {post.date && (
                    <p className="text-sm text-gray-300 mb-1">
                      {formatDate(post.date)}
                    </p>
                  )}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent-violet-300 transition-colors duration-300">
                    {post.title}
                  </h3>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Posts;

