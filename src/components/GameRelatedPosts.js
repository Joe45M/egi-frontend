import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wordpressApi from '../services/wordpressApi';

function GameRelatedPosts({ gameId, gameName, postType = 'games', limit = 20, currentPostId, initialPosts }) {
    const [posts, setPosts] = useState(initialPosts || []);
    const [loading, setLoading] = useState(!initialPosts);

    useEffect(() => {
        if (!gameId) return;

        // Skip fetch if initialPosts is provided
        if (initialPosts) {
            setLoading(false);
            return;
        }

        const fetchPosts = async () => {
            try {
                setLoading(true);
                // Fetch posts for this game
                // We try common taxonomy names for games
                const taxFilter = { game: gameId };

                const params = {
                    perPage: limit + 1, // Fetch extra to handle current post exclusion
                    taxonomyFilter: taxFilter
                };

                const result = await wordpressApi.posts.getByPostType(postType, params);

                // Handle API result format (array or object with posts)
                let fetchedPosts = [];
                if (Array.isArray(result)) {
                    fetchedPosts = result;
                } else if (result.posts) {
                    fetchedPosts = result.posts;
                }

                // Filter out current post
                const filtered = fetchedPosts.filter(p => String(p.id) !== String(currentPostId)).slice(0, limit);
                setPosts(filtered);
            } catch (err) {
                console.error('Error fetching game related posts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [gameId, postType, limit, currentPostId, initialPosts]);

    if (loading) {
        return (
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-white">More from {gameName}</h3>
                <div className="space-y-2 pr-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-accent-violet-950/10 animate-pulse rounded-lg h-11 border border-accent-violet-900/10"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-white">More from {gameName}</h3>
            <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        to={`/${postType}/${post.slug}`}
                        className="group block p-3 bg-accent-violet-950/10 hover:bg-accent-violet-950/20 rounded-lg transition-colors border border-accent-violet-900/10 hover:border-accent-violet-500/20"
                    >
                        <h4
                            className="text-sm font-semibold text-gray-200 group-hover:text-accent-pink-400 transition-colors duration-200 leading-snug line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: post.title }}
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default GameRelatedPosts;
