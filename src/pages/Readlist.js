import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wordpressApi from '../services/wordpressApi';
import { getReadlist } from '../utils/readlist';
import PageMetadata, { SITE_URL } from '../components/PageMetadata';
import SavePost from '../components/SavePost';
import StructuredSchema, { generateWebPageSchema, generateBreadcrumbSchema, generateCollectionPageSchema } from '../components/StructuredSchema';

function Readlist() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readlistSlugs, setReadlistSlugs] = useState([]);

  useEffect(() => {
    const loadReadlist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get readlist items from localStorage (each item has slug and postType)
        const readlistItems = getReadlist();
        setReadlistSlugs(readlistItems.map(item => item.slug));
        
        if (readlistItems.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // Group items by post type for efficient fetching
        const itemsByPostType = {};
        readlistItems.forEach(item => {
          const postType = item.postType || 'games'; // Default to 'games' for backward compatibility
          if (!itemsByPostType[postType]) {
            itemsByPostType[postType] = [];
          }
          itemsByPostType[postType].push(item.slug);
        });

        // Fetch posts by post type
        const allPosts = [];
        for (const [postType, slugs] of Object.entries(itemsByPostType)) {
          try {
            const fetchedPosts = await wordpressApi.posts.getByPostTypeAndSlugs(
              postType,
              slugs,
              true
            );
            // Add postType to each post for routing
            fetchedPosts.forEach(post => {
              post.postType = postType;
            });
            allPosts.push(...fetchedPosts);
          } catch (err) {
            console.warn(`Error fetching posts from ${postType}:`, err);
          }
        }

        // Remove duplicates (in case a slug exists in multiple post types)
        const uniquePosts = allPosts.filter((post, index, self) =>
          index === self.findIndex(p => p.slug === post.slug)
        );

        // Sort by date (newest first)
        uniquePosts.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB - dateA;
        });

        setPosts(uniquePosts);
      } catch (err) {
        console.error('Error loading readlist:', err);
        setError('Failed to load your readlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadReadlist();

    // Listen for storage changes (when items are added/removed from other tabs or components)
    const handleStorageChange = (e) => {
      if (e.key === 'readlist' || e.key === null) {
        loadReadlist();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event for same-tab updates
    const handleReadlistUpdate = () => {
      loadReadlist();
    };

    window.addEventListener('readlistUpdated', handleReadlistUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('readlistUpdated', handleReadlistUpdate);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPostPath = (post) => {
    // Use the postType stored with the post, or default to /games
    const postType = post.postType || 'games';
    return `/${postType}/${post.slug}`;
  };

  const schemas = [
    generateWebPageSchema({
      name: "My Readlist - Saved Articles",
      description: "View all your saved articles and posts in one place.",
      url: `${SITE_URL}/readlist`
    }),
    generateCollectionPageSchema({
      name: "My Readlist",
      description: "View all your saved articles and posts in one place.",
      url: `${SITE_URL}/readlist`,
      numberOfItems: posts.length,
      itemListElement: posts.map(post => ({
        name: post.title,
        url: `${SITE_URL}${getPostPath(post)}`,
        image: post.image,
        description: post.excerpt
      }))
    }),
    generateBreadcrumbSchema({
      items: [
        { name: 'Home', url: SITE_URL },
        { name: 'My Readlist', url: `${SITE_URL}/readlist` }
      ]
    })
  ];

  return (
    <>
      <PageMetadata
        title="My Readlist - Saved Articles"
        description="View all your saved articles and posts in one place."
        keywords="readlist, saved articles, bookmarks"
      />
      <StructuredSchema schemas={schemas} />
      <div className="pt-[200px] p-4 container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">My Readlist</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="relative h-64 bg-accent-violet-950/10 animate-pulse rounded-lg"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-accent-pink-500 text-white px-4 py-2 rounded-md hover:bg-accent-pink-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 mx-auto mb-4 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M192,24H96A16,16,0,0,0,80,40V56H64A16,16,0,0,0,48,72V224a8,8,0,0,0,12.65,6.51L128,193.83l51.36,36.68A8,8,0,0,0,192,224V40A16,16,0,0,0,192,24ZM160,208.46l-43.36-31a8,8,0,0,0-9.3,0L64,208.45V72h96Zm32-32L176,165V72a16,16,0,0,0-16-16H96V40h96Z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Your readlist is empty</h2>
            <p className="text-gray-400 mb-6">
              Start saving articles you want to read later by clicking the save button on any post.
            </p>
            <Link
              to="/"
              className="inline-flex gap-2 font-[600] items-center px-4 py-2 text-white bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-violet-500/50"
            >
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-accent-violet-950/10 rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-accent-violet-500/20 group"
              >
                {post.image && (
                  <Link to={getPostPath(post)}>
                    <img
                      src={post.image}
                      alt={post.title || ''}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      to={getPostPath(post)}
                      className="flex-1"
                    >
                      <h3
                        className="text-lg font-bold text-white group-hover:text-accent-violet-300 transition-colors duration-300 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.title || '' }}
                      />
                    </Link>
                    <div className="flex-shrink-0">
                      <SavePost slug={post.slug} postType={post.postType || 'games'} />
                    </div>
                  </div>
                  {post.excerpt && (
                    <p
                      className="text-gray-400 text-sm mb-3 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(post.date)}</span>
                    {post.authorName && (
                      <span>By {post.authorName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Readlist;

