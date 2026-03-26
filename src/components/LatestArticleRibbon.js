import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CaretRight } from 'phosphor-react';
import { postsApi } from '../services/wordpressApi';

function LatestArticleRibbon() {
  const [latestPost, setLatestPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        setLoading(true);
        // Fetch the single latest post from the 'games' post type
        const response = await postsApi.getByPostType('games', { perPage: 1, includeImages: true });
        
        // getByPostType returns either an array or an object with { posts, pagination }
        const posts = Array.isArray(response) ? response : response.posts;
        
        if (posts && posts.length > 0) {
          setLatestPost(posts[0]);
        }
      } catch (err) {
        console.error('Error fetching latest post for ribbon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPost();
  }, []);

  if (loading || !latestPost) {
    return null;
  }

  // Fallback to a default color if there's no image
  const bgStyle = latestPost.image
    ? { backgroundImage: `url(${latestPost.image})` }
    : { backgroundColor: '#1e1e2f' };

  return (
    <div className="w-full bg-base-900 border-t border-gray-500/10">
      <Link 
        to={`/games/${latestPost.slug}`} 
        className="block relative overflow-hidden group w-full"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 blur-[2px]"
          style={bgStyle}
        />
        {/* Modern gradient overlay for better image visibility and text readability */}
        <div className="relative z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/30 backdrop-blur-[2px] py-12 px-4 sm:px-6 lg:px-8 w-full flex justify-center items-center">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <span className="bg-accent-violet-500/20 text-accent-violet-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md border border-accent-violet-500/30 shrink-0">
                Latest Article
              </span>
              <h3 
                className="text-white font-bold text-xl sm:text-2xl lg:text-3xl group-hover:text-accent-violet-300 transition-colors duration-300 line-clamp-2 md:line-clamp-1"
                dangerouslySetInnerHTML={{ __html: latestPost.title }}
              />
            </div>
            <div className="flex items-center gap-3 text-accent-violet-400 font-bold text-lg group-hover:text-accent-pink-400 transition-all duration-300 shrink-0 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md shadow-xl group-hover:bg-white/10">
              Read Now <CaretRight size={24} weight="bold" className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default LatestArticleRibbon;
