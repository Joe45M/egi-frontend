import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wordpressApi from '../services/wordpressApi';

function RelatedPosts({ postId, postType = 'games', basePath = '/games' }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if postId is provided
    if (!postId) {
      setLoading(false);
      return;
    }

    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch related posts of the same post type
        const relatedPosts = await wordpressApi.posts.getRelatedByPostType(postType, postId, 4);
        
        // Exclude the current post from the results (compare as strings to be safe)
        const filtered = (relatedPosts || []).filter((p) => String(p.id) !== String(postId));
        // Keep the same max count (4)
        setPosts(filtered.slice(0, 4));
      } catch (err) {
        setError('Failed to load related posts');
        console.error('Error fetching related posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [postId, postType]);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 bg-accent-violet-950/10 animate-pulse rounded-lg h-16 mb-5"></div>
        ))}
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
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
      <div className="gap-5 flex-col flex">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              to={post.slug ? `${basePath}/${post.slug}` : basePath}
              key={post.id}
              className="flex-shrink-0 bg-accent-violet-950/10 group overflow-hidden transition-shadow duration-300 rounded-lg"
            >
              <div className="relative flex bg-cover items-center bg-center">
                {post.image && (
                  <img src={post.image} className="w-20 mr-5 object object-cover" alt={post.title || ''}/>
                )}
                <h3 
                  className="text-lg font-bold group-hover:text-accent-violet-300 transition-colors duration-300"
                  dangerouslySetInnerHTML={{ __html: post.title || '' }}
                />
              </div>
            </Link>
          ))
        ) : (
          !loading && (
            <p className="text-gray-400">No related posts found.</p>
          )
        )}
      </div>
    </div>
  );
}

export default RelatedPosts;
