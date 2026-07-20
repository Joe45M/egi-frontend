import { useState, useEffect, useRef } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { TwitterLogo, FacebookLogo, RedditLogo, LinkSimple, ShareNetwork } from 'phosphor-react';
import SavePost from "./SavePost";
import GooglePreferredSourceButton from "./GooglePreferredSourceButton";
import wordpressApi from "../services/wordpressApi";
import { palworldApi } from "../services/palworldApi";
import PageMetadata, { stripHtml, createExcerpt, SITE_URL } from "./PageMetadata";
import { useInitialData } from "../initialDataContext";
import StructuredSchema, { generateArticleSchema, generateBreadcrumbSchema } from "./StructuredSchema";
import AuthorBox from "./AuthorBox";
import { replaceAdShortcodes } from "../utils/ads";
import TableOfContents from "./TableOfContents";
import AdPlacement from "./AdPlacement";

import RelatedPosts from "./RelatedPosts";
import GameRelatedPosts from "./GameRelatedPosts";

function PostDetail({ postType = 'games', basePath = '/games' }) {
    const { slug } = useParams();
    const initialData = useInitialData();

    // Check if we have initial data from SSR that matches this route
    // Compare slugs case-insensitively after decoding to handle URL encoding
    const normalizedSlug = slug ? decodeURIComponent(slug).toLowerCase() : '';
    const hasInitialData = initialData &&
        initialData.postType === postType &&
        initialData.post &&
        (typeof window === 'undefined' || initialData.post.slug.toLowerCase() === normalizedSlug);

    // Debug logging for SSR
    if (typeof window === 'undefined') {
        console.log('PostDetail SSR Debug:', {
            postType,
            slug,
            normalizedSlug,
            hasInitialData,
            initialDataPostType: initialData?.postType,
            initialDataSlug: initialData?.post?.slug,
        });
    }

    const [post, setPost] = useState(hasInitialData ? initialData.post : null);
    const [wpSchema, setWpSchema] = useState(null);
    const [loading, setLoading] = useState(!hasInitialData);
    const [notFound, setNotFound] = useState(false);
    const [associatedGame, setAssociatedGame] = useState(hasInitialData ? (initialData.post.associatedGame || null) : null);
    const [tagsList, setTagsList] = useState(hasInitialData ? (initialData.post.tagsDetails || []) : []);
    const [copied, setCopied] = useState(false);
    const [matchedPal, setMatchedPal] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!post) return;
        if (hasInitialData && post.associatedGame) {
            return;
        }

        // Try to find associated game
        const fetchGameDetails = async () => {
            // Check common taxonomy fields
            const gameIds = [post.games, post.game, post.game_taxonomy].find(arr => arr && arr.length > 0) || [];
            if (gameIds && gameIds.length > 0) {
                const gameId = gameIds[0];
                try {
                    // Start with 'game' taxonomy
                    const term = await wordpressApi.taxonomies.getById('game', gameId);
                    setAssociatedGame(term);
                } catch (e) {
                    console.log('Failed to fetch game details', e);
                }
            }
        };

        fetchGameDetails();
    }, [post, hasInitialData]);

    useEffect(() => {
        if (!post) {
            setTagsList([]);
            return;
        }

        if (hasInitialData && post.tagsDetails) {
            return;
        }

        if (post.tagsDetails && post.tagsDetails.length > 0) {
            setTagsList(post.tagsDetails);
            return;
        }

        if (post.tags && post.tags.length > 0) {
            const fetchTags = async () => {
                try {
                    const data = await wordpressApi.tags.getAll({
                        include: post.tags,
                        hideEmpty: false
                    });
                    setTagsList(data.map(t => ({
                        id: t.id,
                        name: t.name,
                        slug: t.slug
                    })));
                } catch (e) {
                    console.error("Failed to fetch tags by IDs:", e);
                }
            };
            fetchTags();
        } else {
            setTagsList([]);
        }
    }, [post, hasInitialData]);

    // Check if any tag on this post matches a Palworld Pal name
    useEffect(() => {
        if (!tagsList || tagsList.length === 0) return;
        let cancelled = false;
        const findMatchingPal = async () => {
            for (const tag of tagsList) {
                // Skip generic tags that are definitely not pal names
                if (['palworld', 'gaming', 'guide', 'tips', 'news'].includes(tag.slug)) continue;
                try {
                    const pal = await palworldApi.getPalById(tag.slug);
                    if (!cancelled && pal) {
                        setMatchedPal(pal);
                        return;
                    }
                } catch {
                    // Tag doesn't match a pal — try next
                }
            }
        };
        findMatchingPal();
        return () => { cancelled = true; };
    }, [tagsList]);

    useEffect(() => {
        if (!post?.id) return;

        const fetchSchema = async () => {
            try {
                const schema = await wordpressApi.posts.getPostSchema(post.id);
                if (schema && Array.isArray(schema)) {
                    setWpSchema(schema);
                }
            } catch (e) {
                console.error('Error fetching WP schema', e);
            }
        };

        fetchSchema();
    }, [post?.id]);

    useEffect(() => {
        // If we already have initial data from SSR, skip fetching
        if (hasInitialData) {
            return;
        }

        const fetchPost = async () => {
            if (!slug) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setNotFound(false);
                // Decode the slug in case it's URL encoded
                const decodedSlug = decodeURIComponent(slug);
                const postData = await wordpressApi.posts.getByPostTypeAndSlug(postType, decodedSlug, true);
                setPost(postData);
            } catch (error) {
                console.error(`Error fetching ${postType}:`, error);
                // Check if it's a 404 error (post not found)
                if (error.message && error.message.includes('not found')) {
                    console.warn(`${postType} with slug "${slug}" not found in WordPress`);
                }
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug, postType, hasInitialData]);

    // Initialize AdSense ads from WordPress content
    useEffect(() => {
        if (!post || !contentRef.current) return;

        // Wait for content to be rendered
        const timer = setTimeout(() => {
            const contentElement = contentRef.current;
            if (!contentElement) return;

            // Find all ad elements in the content
            const adElements = contentElement.querySelectorAll('ins.adsbygoogle');

            // Remove any script tags (they won't execute anyway)
            const scripts = contentElement.querySelectorAll('script');
            scripts.forEach(script => {
                // Only remove AdSense initialization scripts
                if (script.textContent && script.textContent.includes('adsbygoogle')) {
                    script.remove();
                }
            });

            // Initialize each ad
            if (window.adsbygoogle && adElements.length > 0) {
                adElements.forEach((adElement) => {
                    try {
                        // Check if this ad hasn't been initialized yet
                        if (!adElement.dataset.adsbygoogleStatus) {
                            // Push an empty object to initialize this specific ad
                            window.adsbygoogle.push({});
                            adElement.dataset.adsbygoogleStatus = 'done';
                        }
                    } catch (e) {
                        console.error('AdSense initialization error:', e);
                    }
                });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [post]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            timeZone: 'UTC',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Loading state (preloader)
    if (loading) {
        return (
            <div className="pt-[200px] p-4 container mx-auto">
                <div className="animate-pulse">
                    <div className="h-12 bg-accent-violet-950/10 rounded-lg mb-4 w-3/4"></div>
                    <div className="h-px bg-gray-600 mb-4"></div>
                    <div className="h-6 bg-accent-violet-950/10 rounded mb-5 w-1/2"></div>
                    <div className="grid gap-5 lg:grid-cols-5">
                        <div className="lg:col-span-3">
                            <div className="space-y-4">
                                <div className="h-8 bg-accent-violet-950/10 rounded"></div>
                                <div className="h-4 bg-accent-violet-950/10 rounded w-full"></div>
                                <div className="h-4 bg-accent-violet-950/10 rounded w-5/6"></div>
                                <div className="h-64 bg-accent-violet-950/10 rounded"></div>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="h-8 bg-accent-violet-950/10 rounded mb-4"></div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-16 bg-accent-violet-950/10 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 404 handling
    if (notFound || !post) {
        return <Navigate to="/404" replace />;
    }

    // Prepare metadata for article
    const articleTitle = stripHtml(post.title);
    const articleExcerpt = post.excerpt ? stripHtml(post.excerpt) : createExcerpt(post.content);
    const articleImage = post.image || null;
    const articleUrl = `${SITE_URL}${basePath}/${slug}`;
    const publishedDate = post.date ? new Date(post.date).toISOString() : null;
    const modifiedDate = post.modified ? new Date(post.modified).toISOString() : publishedDate;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(articleUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Prepare section (capitalize first letter of post type)
    const articleSection = postType.charAt(0).toUpperCase() + postType.slice(1);

    // Prepare tags array from categories/tags if available
    const articleTags = [];
    if (post.categories && Array.isArray(post.categories) && post.categories.length > 0) {
        // For now, we'll use the postType as a tag since we don't fetch category names
        articleTags.push(postType);
    }
    if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
        // Tags would need to be fetched separately, so we'll use postType for now
        articleTags.push('gaming');
    }

    // Generate structured schemas fallback
    const fallbackSchemas = [
        generateArticleSchema({
            headline: articleTitle,
            description: articleExcerpt,
            image: articleImage,
            datePublished: publishedDate,
            dateModified: modifiedDate,
            author: post.authorName ? {
                '@type': 'Person',
                name: post.authorName
            } : {
                '@type': 'Organization',
                name: 'EliteGamerInsights'
            },
            url: articleUrl,
            articleSection: articleSection,
            keywords: articleTags.length > 0 ? articleTags.join(', ') : `${postType}, gaming`,
            articleBody: stripHtml(post.content)
        }),
        generateBreadcrumbSchema({
            items: [
                { name: 'Home', url: SITE_URL },
                { name: articleSection, url: `${SITE_URL}/${postType}` },
                { name: articleTitle, url: articleUrl }
            ]
        })
    ];

    const schemas = wpSchema && wpSchema.length > 0 ? wpSchema : fallbackSchemas;

    const isPalworldPost = (tagsList && tagsList.some(tag => 
        tag.slug === 'palworld' || 
        tag.name.toLowerCase() === 'palworld'
    )) || (post.slug && post.slug.toLowerCase().includes('palworld')) || (post.title && post.title.toLowerCase().includes('palworld'));

    return (
        <>
            <PageMetadata
                title={articleTitle}
                description={articleExcerpt}
                image={articleImage}
                imageAlt={articleTitle}
                type="article"
                author={post.authorName}
                publishedTime={publishedDate}
                modifiedTime={modifiedDate}
                canonicalUrl={articleUrl}
                keywords={`${postType}, gaming, ${articleTitle}`}
                section={articleSection}
                tags={articleTags.length > 0 ? articleTags : [postType, 'gaming']}
                hideSiteNameInTitle={true}
            />
            <StructuredSchema schemas={schemas} />
            {/* ── Desaturated Header Image with Bottom-to-Top Fade Overlay ── */}
            {post.image && (
                <div className="absolute top-0 left-0 right-0 h-[850px] pointer-events-none z-0 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-top"
                        style={{
                            backgroundImage: `url(${post.image})`,
                            filter: 'grayscale(85%) contrast(1.1) brightness(0.65)',
                        }}
                    />
                    {/* Overlay: Solid #0d0f1a at bottom, fading out towards the top */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `
                                linear-gradient(to top, #181C2D 0%, #0d0f1a 35%, rgba(13, 15, 26, 0.82) 70%, rgba(13, 15, 26, 0.2) 100%)
                            `,
                        }}
                    />
                </div>
            )}

            <div className="relative z-10 pt-[220px] md:pt-[260px] pb-16 p-4 container mx-auto">
                <div className="mb-4">
                    <Link
                        to={basePath || '/games'}
                        className="group inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 relative z-20 cursor-pointer"
                    >
                        <svg
                            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-medium">Back to all posts</span>
                    </Link>
                </div>

                <div>
                    <div className="grid gap-6 lg:grid-cols-5 items-start">
                        <div className="lg:col-span-3">
                            {/* Meta & Title in main column matching design mockup */}
                            <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-3">
                                {"// "}POSTED BY {post.authorName || 'Author'} ON {formatDate(post.date)}
                            </p>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight" dangerouslySetInnerHTML={{ __html: post.title }} />


                            {/* Table of Contents - Visible on Mobile, hidden on Desktop */}
                            <div className="lg:hidden mb-6">
                                <TableOfContents defaultOpen={false} />
                            </div>

                            <div
                                ref={contentRef}
                                className="wp-content"
                                dangerouslySetInnerHTML={{ __html: replaceAdShortcodes(post.content) }}
                            />
                            {/* Tags list */}
                            {tagsList && tagsList.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-base-800">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {tagsList.map(tag => (
                                            <Link
                                                key={tag.id}
                                                to={`/tags/${tag.slug}`}
                                                className="bg-base-800 hover:bg-accent-violet-950/40 text-base-300 hover:text-accent-violet-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-base-700 hover:border-accent-violet-500/30 transition-all duration-300"
                                            >
                                                #{tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions & Share Widget - Visible on Mobile */}
                            <div className="lg:hidden mt-6 bg-gradient-to-br from-accent-violet-950/30 to-base-800/50 rounded-2xl p-6 border border-accent-violet-900/20 backdrop-blur-md shadow-xl">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Actions & Share</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-center w-full">
                                        <GooglePreferredSourceButton />
                                    </div>
                                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-base-800 flex-wrap">
                                        <SavePost slug={post.slug} postType={postType} />
                                        
                                        {/* Social Share Buttons */}
                                        <div className="flex items-center gap-3 bg-base-800/40 px-3 py-1.5 rounded-full border border-base-800 text-sm">
                                            <span className="text-gray-400 font-semibold flex items-center gap-1">
                                                <ShareNetwork size={14} className="text-accent-pink-500" /> Share:
                                            </span>
                                            <a 
                                                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`}
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-gray-400 hover:text-accent-pink-500 transition-colors flex items-center"
                                                title="Share on Twitter"
                                            >
                                                <TwitterLogo size={18} />
                                            </a>
                                            <a 
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-gray-400 hover:text-accent-pink-500 transition-colors flex items-center"
                                                title="Share on Facebook"
                                            >
                                                <FacebookLogo size={18} />
                                            </a>
                                            <a 
                                                href={`https://www.reddit.com/submit?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(articleTitle)}`}
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-gray-400 hover:text-accent-pink-500 transition-colors flex items-center"
                                                title="Share on Reddit"
                                            >
                                                <RedditLogo size={18} />
                                            </a>
                                            <button 
                                                onClick={handleCopyLink} 
                                                className="text-gray-400 hover:text-accent-pink-500 transition-colors relative flex items-center justify-center"
                                                title="Copy post link"
                                            >
                                                <LinkSimple size={18} />
                                                {copied && (
                                                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-base-950 text-white text-xs px-2 py-1 rounded shadow-lg border border-base-800 font-semibold z-40 whitespace-nowrap">
                                                        Copied!
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Palworld Banner - Visible on Mobile */}
                            {isPalworldPost && (
                                <div className="lg:hidden mt-6 p-6 bg-gradient-to-r from-accent-pink-950/20 to-accent-violet-950/20 border border-accent-violet-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <span className="text-3xl shrink-0">🎮</span>
                                        <div>
                                            <h4 className="text-white font-bold text-base md:text-lg">Palworld Databases are Live!</h4>
                                            <p className="text-gray-300 text-xs md:text-sm">Find your next companions in our database, or calculate details with our technology tree builder.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 shrink-0 w-full md:w-auto">
                                        <Link to="/palworld/pals" className="flex-1 md:flex-initial text-center text-xs font-bold text-white bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 px-5 py-2.5 rounded-full hover:scale-105 hover:shadow-lg hover:shadow-accent-violet-500/20 transition-all duration-300">
                                            Pals Directory
                                        </Link>
                                        <Link to="/palworld/tech" className="flex-1 md:flex-initial text-center text-xs font-bold text-base-300 border border-base-700 bg-base-900/60 px-5 py-2.5 rounded-full hover:text-white hover:border-white transition-all duration-300">
                                            Technologies
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Pal Directory prompt */}
                            {matchedPal && (
                                <Link
                                    to={`/palworld/pals/${matchedPal.name.toLowerCase().replace(/\s+/g, '-')}/`}
                                    className="group mt-6 flex items-center gap-4 p-4 bg-gradient-to-r from-accent-pink-950/30 to-accent-violet-950/30 border border-accent-violet-500/20 hover:border-accent-violet-400/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-violet-500/10"
                                >
                                    {/* Pal image or icon */}
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-base-800/60 border border-base-700/50 flex-shrink-0 flex items-center justify-center">
                                        {matchedPal.image_url ? (
                                            <img
                                                src={matchedPal.image_url}
                                                alt={matchedPal.name}
                                                className="w-full h-full object-contain p-1"
                                            />
                                        ) : (
                                            <span className="text-2xl">🎮</span>
                                        )}
                                    </div>
                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-accent-pink-400 mb-0.5">Palworld Database</p>
                                        <p className="text-white font-bold text-sm group-hover:text-accent-violet-300 transition-colors">
                                            View <span className="text-accent-violet-300">{matchedPal.name}</span> in the Pal Directory
                                        </p>
                                        <p className="text-[11px] text-base-400 mt-0.5">
                                            Stats, work suitabilities &amp; more →
                                        </p>
                                    </div>
                                </Link>
                            )}
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {/* Table of Contents - Sidebar on Desktop */}
                            <div className="hidden lg:block lg:pt-[130px]">
                                <TableOfContents defaultOpen={false} />
                            </div>

                            {/* Palworld Banner - Sidebar on Desktop */}
                            {isPalworldPost && (
                                <div className="hidden lg:flex p-6 bg-gradient-to-br from-accent-pink-950/20 to-accent-violet-950/20 border border-accent-violet-500/20 rounded-2xl flex-col gap-4 animate-fade-in-up">
                                    <div className="flex items-center gap-4 text-left">
                                        <span className="text-3xl shrink-0">🎮</span>
                                        <div>
                                            <h4 className="text-white font-bold text-base">Palworld Databases</h4>
                                            <p className="text-gray-300 text-xs mt-1">Find companions in our database or calculate details with our tech tree builder.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <Link to="/palworld/pals" className="w-full text-center text-xs font-bold text-white bg-gradient-to-r from-accent-pink-500 to-accent-violet-500 px-5 py-2.5 rounded-full hover:scale-105 hover:shadow-lg hover:shadow-accent-violet-500/20 transition-all duration-300">
                                            Pals Directory
                                        </Link>
                                        <Link to="/palworld/tech" className="w-full text-center text-xs font-bold text-base-300 border border-base-700 bg-base-900/60 px-5 py-2.5 rounded-full hover:text-white hover:border-white transition-all duration-300">
                                            Technologies
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Author Box */}
                            <AuthorBox
                                name={post.authorName}
                                description={post.authorDescription}
                                avatarUrl={post.authorAvatar}
                                slug={post.authorSlug}
                            />

                             {/* Game Related Posts */}
                             {associatedGame && (
                                 <GameRelatedPosts
                                     key={`${post.id}-game`}
                                     gameId={associatedGame.id}
                                     gameName={associatedGame.name}
                                     postType={postType}
                                     currentPostId={post.id}
                                     limit={20}
                                     initialPosts={post.gameRelatedPosts}
                                 />
                             )}

                             {/* Related Posts */}
                             <RelatedPosts
                                 key={`${post.id}-related`}
                                 postId={post.id}
                                 postType={postType}
                                 basePath={basePath}
                                 limit={20}
                                 initialPosts={post.relatedPosts}
                             />

                             {/* Sticky Ad & Actions Widget on Desktop */}
                             <div className="sticky top-28 hidden lg:block space-y-6">
                                 <AdPlacement placement="articleSidebar" className="!my-0" />
                                 
                                 {/* Actions & Share Widget - Sidebar on Desktop */}
                                 <div className="bg-gradient-to-br from-accent-violet-950/30 to-base-800/50 rounded-2xl p-6 border border-accent-violet-900/20 backdrop-blur-md shadow-xl">
                                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Actions & Share</h3>
                                     <div className="space-y-4">
                                         <div className="flex justify-center w-full">
                                             <GooglePreferredSourceButton />
                                         </div>
                                         <div className="flex items-center justify-between gap-4 pt-4 border-t border-base-800 flex-wrap">
                                             <SavePost slug={post.slug} postType={postType} />
                                             
                                             {/* Social Share Buttons */}
                                             <div className="flex items-center gap-3 bg-base-800/40 px-3 py-1.5 rounded-full border border-base-800 text-sm">
                                                 <span className="text-gray-400 font-semibold flex items-center gap-1">
                                                     <ShareNetwork size={14} className="text-accent-pink-500" /> Share:
                                                 </span>
                                                 <a 
                                                     href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`}
                                                     target="_blank" 
                                                     rel="noopener noreferrer" 
                                                     className="text-gray-400 hover:text-accent-pink-500 transition-colors flex items-center"
                                                     title="Share on Twitter"
                                                 >
                                                     <TwitterLogo size={18} />
                                                 </a>
                                                 <a 
                                                     href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                                                     target="_blank" 
                                                     rel="noopener noreferrer" 
                                                     className="text-gray-400 hover:text-accent-pink-500 transition-colors flex items-center"
                                                     title="Share on Facebook"
                                                 >
                                                     <FacebookLogo size={18} />
                                                 </a>
                                                 <a 
                                                     href={`https://www.reddit.com/submit?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(articleTitle)}`}
                                                     target="_blank" 
                                                     rel="noopener noreferrer" 
                                                     className="text-gray-400 hover:text-accent-pink-500 transition-colors flex items-center"
                                                     title="Share on Reddit"
                                                 >
                                                     <RedditLogo size={18} />
                                                 </a>
                                                 <button 
                                                     onClick={handleCopyLink} 
                                                     className="text-gray-400 hover:text-accent-pink-500 transition-colors relative flex items-center justify-center"
                                                     title="Copy post link"
                                                 >
                                                     <LinkSimple size={18} />
                                                     {copied && (
                                                         <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-base-950 text-white text-xs px-2 py-1 rounded shadow-lg border border-base-800 font-semibold z-40 whitespace-nowrap">
                                                             Copied!
                                                         </span>
                                                     )}
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Mobile Fallback Ad Placement */}
                             <div className="lg:hidden">
                                 <AdPlacement placement="articleSidebar" className="!my-0" />
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default PostDetail;
