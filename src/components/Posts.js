import { useState, useEffect, useMemo } from "react";
import PostCard, { PostCardSkeleton } from "./PostCard";
import wordpressApi from "../services/wordpressApi";
import { useInitialData } from "../initialDataContext";
import AdPlacement from "./AdPlacement";

const SKELETON_COUNT = 36;

function Posts({ posts: propPosts = null }) {
  const initialData = useInitialData();
  const hasInitialData = initialData && initialData.postType === 'home' && Array.isArray(initialData.allPosts) && initialData.allPosts.length > 0;

  const [posts, setPosts] = useState(propPosts !== null ? propPosts : (hasInitialData ? initialData.allPosts : []));
  const [loading, setLoading] = useState(propPosts === null && !hasInitialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If posts are provided as prop, use them directly (for flexibility)
    if (propPosts !== null) {
      setPosts(propPosts);
      setLoading(false);
      return;
    }

    if (hasInitialData) {
      setLoading(false);
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

  const renderedItems = useMemo(() => {
    if (loading && posts.length === 0) {
      const list = [];
      for (let idx = 0; idx < SKELETON_COUNT; idx++) {
        if (idx > 0 && idx % 12 === 0) {
          list.push({ isAd: true, id: `ad-skeleton-${idx}` });
        }
        list.push({ isSkeleton: true, id: `skeleton-${idx}` });
      }
      return list;
    }

    const list = [];
    posts.forEach((post, idx) => {
      if (idx > 0 && idx % 12 === 0) {
        list.push({ isAd: true, id: `ad-posts-grid-${idx}` });
      }
      list.push(post);
    });
    return list;
  }, [posts, loading]);

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="text-center py-8 min-h-[300px] flex flex-col items-center justify-center">
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
  if (!loading && posts.length === 0) {
    return (
      <div className="text-center py-8 min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400">No games found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[1200px] md:min-h-[2200px] lg:min-h-[3600px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderedItems.map((item) => {
          if (item.isAd) {
            return (
              <div key={item.id} className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center my-2">
                <AdPlacement placement="paldexGrid" className="!my-0" />
              </div>
            );
          }

          if (item.isSkeleton) {
            return (
              <PostCardSkeleton key={item.id} />
            );
          }

          const post = item;
          // Use post slug for link, or fallback to /games with id
          const postLink = post.slug ? `/games/${post.slug}` : `/games?id=${post.id}`;
          return (
            <PostCard key={post.id} post={post} link={postLink} />
          );
        })}
      </div>
    </div>
  );
}

export default Posts;

