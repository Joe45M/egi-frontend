import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { Image } from './Editor';
import SavePost from "./SavePost";
import wordpressApi from "../services/wordpressApi";
import NotFound from "../pages/NotFound";
import PageMetadata, { stripHtml, createExcerpt, SITE_URL } from "./PageMetadata";
import { useInitialData } from "../initialDataContext";

// Lazy load RelatedPosts component
const RelatedPosts = lazy(() => import("./RelatedPosts"));

function PostDetail({ postType = 'games', basePath = '/games' }) {
  const { slug } = useParams();
  const initialData = useInitialData();
  
  // Check if we have initial data from SSR that matches this route
  // Compare slugs after decoding to handle URL encoding
  const normalizedSlug = slug ? decodeURIComponent(slug) : '';
  const hasInitialData = initialData && 
    initialData.postType === postType && 
    initialData.post && 
    initialData.post.slug === normalizedSlug;
  
  const [post, setPost] = useState(hasInitialData ? initialData.post : null);
  const [loading, setLoading] = useState(!hasInitialData);
  const [notFound, setNotFound] = useState(false);
  const contentRef = useRef(null);

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
    return <NotFound />;
  }

  // Prepare metadata for article
  const articleTitle = stripHtml(post.title);
  const articleExcerpt = post.excerpt ? stripHtml(post.excerpt) : createExcerpt(post.content);
  const articleImage = post.image || null;
  const articleUrl = `${SITE_URL}${basePath}/${slug}`;
  const publishedDate = post.date ? new Date(post.date).toISOString() : null;
  const modifiedDate = post.modified ? new Date(post.modified).toISOString() : publishedDate;
  
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
      />
      <div className="pt-[200px] p-4 container mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-white" dangerouslySetInnerHTML={{ __html: post.title }}></h1>

        <hr className="border-t border-t-gray-60 mb-4"/>

        <div className="text-gray-400 flex-wrap mb-5 lg:mb-0 flex justify-between">
            <div>
                Posted by <Link to="/profile" className="w-full ">{post.authorName || 'Author'}</Link> on {formatDate(post.date)}
            </div>

            <div>
                <SavePost slug={post.slug} postType={postType} />
            </div>
        </div>

        <div>
            <div className="grid gap-5 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    {post.image && (
                        <Image url={post.image} alt={post.title} />
                    )}
                    <div 
                      ref={contentRef}
                      className="wp-content"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>

                <div className="lg:col-span-2">
                    <Suspense fallback={
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-1 bg-accent-violet-950/10 animate-pulse rounded-lg h-16 mb-5"></div>
                        ))}
                      </div>
                    }>
                      <RelatedPosts postId={post.id} postType={postType} basePath={basePath} />
                    </Suspense>
                </div>
            </div>
        </div>

    </div>
    </>
  );
}

export default PostDetail;

