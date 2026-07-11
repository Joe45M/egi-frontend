import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wordpressApi from '../services/wordpressApi';

function RelatedPosts({ postId, postType = 'games', basePath = '/games', limit = 20, initialPosts }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if postId is provided
    if (!postId) {
      setLoading(false);
      return;
    }

    // Skip fetch if initialPosts is provided
    if (initialPosts) {
      setLoading(false);
      return;
    }

    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch related posts of the same post type
        const relatedPosts = await wordpressApi.posts.getRelatedByPostType(postType, postId, limit);

        // Exclude the current post from the results (compare as strings to be safe)
        const filtered = (relatedPosts || []).filter((p) => String(p.id) !== String(postId));
        setPosts(filtered.slice(0, limit));
      } catch (err) {
        setError('Failed to load related posts');
        console.error('Error fetching related posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [postId, postType, limit, initialPosts]);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-white">Related Posts</h2>
        <div className="space-y-2 pr-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-accent-violet-950/10 animate-pulse rounded-lg h-11 border border-accent-violet-900/10"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-xl font-bold mb-4 text-white">Related Posts</h2>
      <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              to={post.slug ? `${basePath}/${post.slug}` : basePath}
              key={post.id}
              className="group block p-3 bg-accent-violet-950/10 hover:bg-accent-violet-950/20 rounded-lg transition-colors border border-accent-violet-900/10 hover:border-accent-violet-500/20"
            >
              <h3
                className="text-sm font-semibold text-gray-200 group-hover:text-accent-pink-400 transition-colors duration-200 leading-snug line-clamp-2"
                dangerouslySetInnerHTML={{ __html: post.title || '' }}
              />
            </Link>
          ))
        ) : (
          !loading && (
            <p className="text-gray-400 text-sm">No related posts found.</p>
          )
        )}
      </div>
    </div>
  );
}

export default RelatedPosts;
