import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wordpressApi from '../services/wordpressApi';

function GameRelatedPosts({ gameId, gameName, postType = 'games', limit = 4, currentPostId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!gameId) return;

        const fetchPosts = async () => {
            try {
                setLoading(true);
                // Fetch posts for this game
                // We try common taxonomy names for games
                const taxFilter = { games: gameId };

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
    }, [gameId, postType, limit, currentPostId]);

    if (loading) {
        return (
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-white">More from {gameName}</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-accent-violet-950/10 animate-pulse rounded-lg flex gap-4">
                            <div className="w-24 h-full bg-accent-violet-900/20"></div>
                            <div className="flex-1 py-2">
                                <div className="h-4 bg-accent-violet-900/20 w-3/4 mb-2"></div>
                                <div className="h-3 bg-accent-violet-900/20 w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-white">More from {gameName}</h3>
            <div className="flex flex-col gap-4">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        to={`/${postType}/${post.slug}`}
                        className="group flex gap-3 h-20 overflow-hidden bg-accent-violet-950/10 hover:bg-accent-violet-950/20 rounded-lg transition-colors border border-transparent hover:border-accent-violet-500/20"
                    >
                        {/* Image */}
                        <div className="w-24 flex-shrink-0 h-full relative">
                            {post.image ? (
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-accent-violet-900/30 flex items-center justify-center">
                                    <span className="text-2xl">🎮</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 py-1 pr-2 flex flex-col justify-center">
                            <h4
                                className="text-sm font-semibold text-gray-200 group-hover:text-accent-pink-400 transition-colors line-clamp-2 leading-tight"
                                dangerouslySetInnerHTML={{ __html: post.title }}
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default GameRelatedPosts;
