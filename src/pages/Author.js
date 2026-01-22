import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import wordpressApi from '../services/wordpressApi';
import NotFound from './NotFound';
import PostCard from '../components/PostCard';
import PageMetadata from '../components/PageMetadata';

/**
 * Author Page Component
 * Displays author profile and their published posts
 */
function Author() {
    const { slug } = useParams();
    const [author, setAuthor] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchAuthorData = async () => {
            if (!slug) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setNotFound(false);

                // Fetch author by slug
                const authorData = await wordpressApi.authors.getBySlug(slug);
                setAuthor(authorData);

                // Fetch posts by this author
                const authorPosts = await wordpressApi.authors.getPosts(authorData.id);
                setPosts(authorPosts);
            } catch (error) {
                console.error('Error fetching author:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorData();
    }, [slug]);



    // Loading state
    if (loading) {
        return (
            <div className="pt-[200px] p-4 container mx-auto">
                <div className="animate-pulse">
                    {/* Author header skeleton */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 bg-accent-violet-950/20 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-8 bg-accent-violet-950/20 rounded w-48 mb-3"></div>
                            <div className="h-4 bg-accent-violet-950/20 rounded w-96"></div>
                        </div>
                    </div>
                    {/* Posts grid skeleton */}
                    <div className="h-8 bg-accent-violet-950/20 rounded w-48 mb-6"></div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-accent-violet-950/10 rounded-lg h-64"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 404 handling
    if (notFound || !author) {
        return <NotFound />;
    }

    return (
        <>
            <PageMetadata
                title={`${author.name} - Author at EliteGamerInsights`}
                description={author.description || `Articles and posts written by ${author.name} on EliteGamerInsights.`}
                type="profile"
            />

            <div className="pt-[200px] p-4 container mx-auto">
                {/* Author Header */}
                <div className="bg-gradient-to-br from-accent-violet-950/30 to-base-800/50 rounded-2xl p-8 mb-10 border border-accent-violet-900/20 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative group flex-shrink-0">
                            <div className="absolute -inset-2 bg-gradient-to-r from-accent-violet-500 to-accent-pink-500 rounded-full opacity-50 blur-md"></div>
                        </div>

                        {/* Author Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold text-white mb-3">{author.name}</h1>
                            {author.description && (
                                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                                    {author.description}
                                </p>
                            )}
                            {author.url && (
                                <a
                                    href={author.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-4 text-accent-violet-400 hover:text-accent-violet-300 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <span>Website</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Articles by {author.name}
                        <span className="text-gray-500 font-normal ml-2">({posts.length})</span>
                    </h2>

                    {posts.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    link={`${post.basePath || '/games'}/${post.slug}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <p>No posts found from this author.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Author;
