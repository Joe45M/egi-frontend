import { useState, useEffect, useMemo } from "react";
import PostCard from "./PostCard";
import wordpressApi from "../services/wordpressApi";
import { useInitialData } from "../initialDataContext";
import AdPlacement from "./AdPlacement";

const FALLBACK_POSTS = [
  { id: 'fb-1', title: 'Call of Duty Black Ops 6 Complete Guide', date: '2026-08-01T00:00:00Z', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop', slug: '' },
  { id: 'fb-2', title: 'Minecraft 1.21 Update Patch Notes & Breakdown', date: '2026-07-30T00:00:00Z', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop', slug: '' },
  { id: 'fb-3', title: 'GTA VI Release Date, Leaks, and Everything We Know', date: '2026-07-28T00:00:00Z', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop', slug: '' },
  { id: 'fb-4', title: 'Fortnite Chapter 6 Season 1 Map Changes', date: '2026-07-26T00:00:00Z', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop', slug: '' },
  { id: 'fb-5', title: 'Rust Base Building Tips & Defense Strategies', date: '2026-07-24T00:00:00Z', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop', slug: '' },
  { id: 'fb-6', title: 'Arc Raiders Closed Beta Impressions & Gameplay', date: '2026-07-22T00:00:00Z', image: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=800&h=600&fit=crop', slug: '' }
];

function Posts({ posts: propPosts = null }) {
  const initialData = useInitialData();
  const hasInitialData = initialData && initialData.postType === 'home' && Array.isArray(initialData.allPosts);

  const [posts, setPosts] = useState(propPosts !== null ? propPosts : (hasInitialData ? initialData.allPosts : []));
  const [error, setError] = useState(null);

  useEffect(() => {
    // If posts are provided as prop, use them directly (for flexibility)
    if (propPosts !== null) {
      setPosts(propPosts);
      return;
    }

    if (hasInitialData) {
      return;
    }

    // Otherwise, fetch from WordPress API
    const fetchGames = async () => {
      try {
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
      }
    };

    fetchGames();
  }, [propPosts, hasInitialData]);

  const postsToDisplay = posts.length > 0 ? posts : FALLBACK_POSTS;

  const renderedItems = useMemo(() => {
    const list = [];
    postsToDisplay.forEach((post, idx) => {
      if (idx > 0 && idx % 12 === 0) {
        list.push({ isAd: true, id: `ad-posts-grid-${idx}` });
      }
      list.push(post);
    });
    return list;
  }, [postsToDisplay]);

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
        {renderedItems.map((item) => {
          if (item.isAd) {
            return (
              <div key={item.id} className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center my-2">
                <AdPlacement placement="paldexGrid" className="!my-0" />
              </div>
            );
          }

          const post = item;
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

