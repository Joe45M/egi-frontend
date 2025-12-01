import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function RelatedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock API function - simulates an API call
    const fetchRelatedPosts = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock API response
        const mockPosts = [
          {
            id: 1,
            title: "Latest Gaming Trends 2024",
            image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop"
          },
          {
            id: 2,
            title: "Top 10 Games This Month",
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
          },
          {
            id: 3,
            title: "Gaming Hardware Reviews",
            image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop"
          },
          {
            id: 4,
            title: "Esports Championship Updates",
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop"
          }
        ];
        
        setPosts(mockPosts);
        setError(null);
      } catch (err) {
        setError('Failed to load related posts');
        console.error('Error fetching related posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, []);

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
        {posts.map((post) => (
          <Link
            to={post.slug ? `/games/${post.slug}` : "/games"}
            key={post.id}
            className="flex-shrink-0 bg-accent-violet-950/10 group overflow-hidden transition-shadow duration-300 rounded-lg"
          >
            <div className="relative flex bg-cover items-center bg-center">
              <img src={post.image} className="w-20 mr-5 object object-cover" alt=""/>
              <h3 className="text-lg font-bold group-hover:text-accent-violet-300 transition-colors duration-300">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedPosts;

