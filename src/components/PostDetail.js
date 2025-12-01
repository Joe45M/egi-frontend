import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Image, Ad } from './Editor';
import RelatedPosts from "./RelatedPosts";
import wordpressApi from "../services/wordpressApi";
import NotFound from "../pages/NotFound";
import PageMetadata, { stripHtml, createExcerpt, SITE_URL } from "./PageMetadata";

function PostDetail({ postType = 'games', basePath = '/games' }) {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
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
  }, [slug, postType]);

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
                <button className=" flex gap-2 items-center text-white">
                    <svg className="w-5" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M192,24H96A16,16,0,0,0,80,40V56H64A16,16,0,0,0,48,72V224a8,8,0,0,0,12.65,6.51L112,193.83l51.36,36.68A8,8,0,0,0,176,224V184.69l19.35,13.82A8,8,0,0,0,208,192V40A16,16,0,0,0,192,24ZM160,208.46l-43.36-31a8,8,0,0,0-9.3,0L64,208.45V72h96Zm32-32L176,165V72a16,16,0,0,0-16-16H96V40h96Z"></path></svg>
                    <span className="cta">Save this post</span>
                </button>
            </div>
        </div>

        <div>
            <div className="grid gap-5 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    {post.image && (
                        <Image url={post.image} alt={post.title} />
                    )}
                    <div 
                      className="wp-content"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <Ad clientId="ca-pub-xxxxx" slot="1234567890" />
                </div>

                <div className="lg:col-span-2">
                    <RelatedPosts postId={post.id} postType={postType} basePath={basePath} />
                </div>
            </div>
        </div>

    </div>
    </>
  );
}

export default PostDetail;

