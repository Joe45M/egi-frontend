import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import wordpressApi from "../services/wordpressApi";

function Slider() {
    const [emblaRef] = useEmblaCarousel();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                    <div className="embla__slide">
                        <div className="h-[500px] flex flex-col justify-end bg-cover bg-center relative z-10 bg-accent-violet-950/10 animate-pulse">
                            <div className="absolute left-0 top-0 w-full h-full z-0 bg-gradient-to-t from-black/80 to-black/10"></div>
                            <div className="container mx-auto mb-10">
                                <span className="text-white mb-2 relative text-sm">Loading...</span>
                                <h3 className="text-4xl font-bold text-white relative">Loading...</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state - show empty or fallback
    if (error || posts.length === 0) {
        return (
            <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                    <div className="embla__slide">
                        <div className="h-[500px] flex flex-col justify-end bg-cover bg-center relative z-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1470&h=600&fit=crop')"}}>
                            <div className="absolute left-0 top-0 w-full h-full z-0 bg-gradient-to-t from-black/80 to-black/10"></div>
                            <div className="container mx-auto mb-10">
                                <span className="text-white mb-2 relative text-sm">Latest News</span>
                                <h3 className="text-4xl font-bold text-white relative">Stay updated with the latest gaming news</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="embla" ref={emblaRef}>
            <div className="embla__container">
                {posts.map((post) => {
                    const imageUrl = post.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1470&h=600&fit=crop';
                    // Link to games post detail page
                    const postLink = post.slug ? `/games/${post.slug}` : `/games?id=${post.id}`;
                    
                    return (
                        <div key={post.id} className="embla__slide">
                            <Link to={postLink}>
                                <div className="h-[500px] flex flex-col justify-end bg-cover bg-center relative z-10 cursor-pointer hover:opacity-95 transition-opacity duration-300" style={{backgroundImage: `url('${imageUrl}')`}}>
                                    <div className="absolute left-0 top-0 w-full h-full z-0 bg-gradient-to-t from-black/80 to-black/10"></div>
                                    <div className="container mx-auto mb-10 px-5 lg:px-0">
                                        {post.date && (
                                            <span className="text-white mb-2 relative text-sm block">{formatDate(post.date)}</span>
                                        )}
                                        <h3 
                                            className="text-2xl lg:text-4xl font-bold text-white relative"
                                            dangerouslySetInnerHTML={{ __html: post.title || '' }}
                                        />
                                    </div>
                                </div>    
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Slider;

