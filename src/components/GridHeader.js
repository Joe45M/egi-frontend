import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import wordpressApi from "../services/wordpressApi";
import { useInitialData } from "../initialDataContext";

function GridHeader() {
    const initialData = useInitialData();
    const hasInitialData = initialData && initialData.postType === 'home' && Array.isArray(initialData.sliderPosts);

    const [posts, setPosts] = useState(hasInitialData ? initialData.sliderPosts : []);
    const [loading, setLoading] = useState(!hasInitialData);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (hasInitialData) {
            return;
        }

        const fetchLatestPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch the 3 latest posts from the games post type
                const result = await wordpressApi.posts.getByPostType('games', {
                    perPage: 3,
                    includeImages: true,
                    orderBy: 'date',
                    order: 'desc'
                });

                // Handle both array and object formats
                if (Array.isArray(result)) {
                    setPosts(result);
                } else if (result.posts && Array.isArray(result.posts)) {
                    setPosts(result.posts);
                } else {
                    setPosts([]);
                }
            } catch (err) {
                console.error('Error fetching latest posts:', err);
                setError('Failed to load posts');
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestPosts();
    }, [hasInitialData]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            timeZone: 'UTC',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const postLink = (post) => {
        return post.slug ? `/games/${post.slug}` : `/games?id=${post.id}`;
    };

    const fallbackImg = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1470&h=600&fit=crop';

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 pt-[110px] pb-6 lg:pt-[120px]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                    {/* Large Skeleton */}
                    <div className="lg:col-span-2 h-[300px] sm:h-[400px] lg:h-full rounded-2xl bg-base-800/20 border border-base-800/40 animate-pulse flex flex-col justify-end p-6 md:p-8">
                        <div className="h-4 bg-base-700/60 rounded-full w-24 mb-4"></div>
                        <div className="h-8 bg-base-700/60 rounded-full w-3/4 mb-3"></div>
                        <div className="h-4 bg-base-700/60 rounded-full w-1/2"></div>
                    </div>
                    {/* Two Smaller Skeletons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-6 lg:h-full">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-[200px] lg:h-full rounded-2xl bg-base-800/20 border border-base-800/40 animate-pulse flex flex-col justify-end p-5">
                                <div className="h-3 bg-base-700/60 rounded-full w-16 mb-3"></div>
                                <div className="h-6 bg-base-700/60 rounded-full w-5/6 mb-2"></div>
                                <div className="h-3 bg-base-700/60 rounded-full w-1/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state - show empty or fallback
    if (error || posts.length === 0) {
        return (
            <div className="container mx-auto px-4 pt-[110px] pb-6 lg:pt-[120px]">
                <div className="h-[250px] lg:h-[500px] flex flex-col justify-end rounded-2xl overflow-hidden relative z-10 border border-base-800/50 shadow-2xl">
                    <img 
                        src={fallbackImg} 
                        alt="Latest News"
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="eager"
                        width="1470"
                        height="600"
                    />
                    <div className="absolute left-0 top-0 w-full h-full z-0 bg-gradient-to-t from-base-950/90 via-base-950/40 to-transparent"></div>
                    <div className="container mx-auto mb-10 px-6 relative z-10">
                        <span className="inline-block bg-accent-pink-500/20 text-accent-pink-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-accent-pink-500/30 mb-3 uppercase tracking-wider">
                            Latest News
                        </span>
                        <h3 className="text-2xl lg:text-4xl font-extrabold text-white">Stay updated with the latest gaming news</h3>
                    </div>
                </div>
            </div>
        );
    }

    const mainPost = posts[0];
    const sidePosts = posts.slice(1, 3);

    return (
        <div className="container mx-auto px-4 pt-[110px] pb-6 lg:pt-[120px]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                {/* Main Large Post */}
                {mainPost && (
                    <div className="lg:col-span-2 h-[300px] sm:h-[400px] lg:h-full relative overflow-hidden rounded-2xl group border border-base-800/50 hover:border-accent-pink-500/40 transition-all duration-500 shadow-2xl">
                        <Link to={postLink(mainPost)} className="block w-full h-full">
                            <img 
                                src={mainPost.image || fallbackImg} 
                                alt={mainPost.title || 'Featured post'}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                                width="800"
                                height="500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/40 to-transparent z-10"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                                {mainPost.date && (
                                    <span className="inline-block bg-accent-pink-500/20 text-accent-pink-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-accent-pink-500/30 mb-3 uppercase tracking-wider">
                                        Featured • {formatDate(mainPost.date)}
                                    </span>
                                )}
                                <h2 
                                    className="text-2xl md:text-4xl font-extrabold text-white mb-2 group-hover:text-accent-pink-300 transition-colors duration-300 line-clamp-3 leading-tight"
                                    dangerouslySetInnerHTML={{ __html: mainPost.title || '' }}
                                />
                                {mainPost.excerpt && (
                                    <p 
                                        className="text-base-300 text-sm md:text-base line-clamp-2 mb-1 opacity-80"
                                        dangerouslySetInnerHTML={{ __html: mainPost.excerpt }}
                                    />
                                )}
                            </div>
                        </Link>
                    </div>
                )}

                {/* Side Stacked Posts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-6 lg:h-full">
                    {sidePosts.map((post) => (
                        <div key={post.id} className="h-[200px] lg:h-full relative overflow-hidden rounded-2xl group border border-base-800/50 hover:border-accent-violet-500/40 transition-all duration-500 shadow-xl">
                            <Link to={postLink(post)} className="block w-full h-full">
                                <img 
                                    src={post.image || fallbackImg} 
                                    alt={post.title || 'Latest post'}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                                    loading="lazy"
                                    decoding="async"
                                    width="500"
                                    height="250"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/50 to-transparent z-10"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                                    {post.date && (
                                        <span className="inline-block bg-accent-violet-500/20 text-accent-violet-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-accent-violet-500/30 mb-2 uppercase tracking-wider">
                                            Latest • {formatDate(post.date)}
                                        </span>
                                    )}
                                    <h3 
                                        className="text-lg md:text-xl font-bold text-white group-hover:text-accent-violet-300 transition-colors duration-300 line-clamp-2 leading-snug"
                                        dangerouslySetInnerHTML={{ __html: post.title || '' }}
                                    />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GridHeader;
