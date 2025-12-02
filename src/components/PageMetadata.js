import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useHead } from '../headContext';

const SITE_URL = 'https://elitegamerinsights.com';
const DEFAULT_IMAGE = `${SITE_URL}/logo512.png`;
const SITE_NAME = 'EliteGamerInsights';
const DEFAULT_DESCRIPTION = 'Gaming news, tutorials, and culture coverage. Everything you need to stay informed about the gaming world.';

/**
 * Helper function to strip HTML tags from text
 */
const stripHtml = (html) => {
  if (!html) return '';
  // Handle SSR or if document is not available
  if (typeof document === 'undefined') {
    // Fallback regex-based stripping for SSR
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();
  }
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
};

/**
 * Helper function to create excerpt from content
 */
const createExcerpt = (content, maxLength = 160) => {
  if (!content) return DEFAULT_DESCRIPTION;
  const text = stripHtml(content);
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Helper function to update or create meta tag
 */
const updateMetaTag = (attribute, value, content) => {
  let tag = document.querySelector(`meta[${attribute}="${value}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

/**
 * Helper function to update or create property meta tag (for OG)
 */
const updatePropertyTag = (property, content) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

/**
 * Helper function to update or create link tag
 */
const updateLinkTag = (rel, href) => {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
};

/**
 * Helper function to remove meta tags by property
 */
const removeMetaTagsByProperty = (propertyPrefix) => {
  const tags = document.querySelectorAll(`meta[property^="${propertyPrefix}"]`);
  tags.forEach(tag => tag.remove());
};

/**
 * PageMetadata Component
 * Handles all page metadata including title, description, Open Graph, Twitter Cards, etc.
 */
function PageMetadata({
  title,
  description,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  keywords,
  canonicalUrl,
  locale = 'en_US',
  section,
  tags,
  noindex = false,
  nofollow = false,
}) {
  const location = useLocation();
  const headContext = useHead();
  // Compute core metadata once so we can use it for both SSR and CSR
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // Use provided description or fallback
  const metaDescription = description || DEFAULT_DESCRIPTION;

  // Build canonical URL
  const fullUrl = canonicalUrl || `${SITE_URL}${location.pathname}${location.search}`;

  // Handle image URL (support relative and absolute)
  let fullImageUrl = image;
  if (image) {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      fullImageUrl = image;
    } else if (image.startsWith('/')) {
      fullImageUrl = `${SITE_URL}${image}`;
    } else {
      fullImageUrl = `${SITE_URL}/${image}`;
    }
  } else {
    fullImageUrl = DEFAULT_IMAGE;
  }

  // Determine image type from URL extension
  const getImageType = (url) => {
    if (!url) return 'image/jpeg';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.png')) return 'image/png';
    if (lowerUrl.includes('.gif')) return 'image/gif';
    if (lowerUrl.includes('.webp')) return 'image/webp';
    return 'image/jpeg'; // default
  };

  const imageType = getImageType(fullImageUrl);

  // Build robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  const robotsMeta = robotsContent.length > 0 ? robotsContent.join(', ') : 'index, follow';

  // On the server, document is not available. Instead of mutating the DOM,
  // we push the relevant head data into the head context so the SSR layer
  // can inject it into the HTML template.
  if (typeof document === 'undefined' && headContext && headContext.setHead) {
    headContext.setHead({
      title: pageTitle,
      description: metaDescription,
      canonicalUrl: fullUrl,
      ogTitle: pageTitle,
      ogDescription: metaDescription,
      ogImage: fullImageUrl,
      ogType: type,
    });
  }

  // On the client, keep the existing behaviour of mutating document.head
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    // Update title
    document.title = pageTitle;

    // Primary Meta Tags
    updateMetaTag('name', 'title', pageTitle);
    updateMetaTag('name', 'description', metaDescription);
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }
    updateMetaTag('name', 'robots', robotsMeta);
    if (author) {
      updateMetaTag('name', 'author', author);
    }

    // Canonical URL
    updateLinkTag('canonical', fullUrl);

    // Open Graph / Facebook
    updatePropertyTag('og:type', type);
    updatePropertyTag('og:url', fullUrl);
    updatePropertyTag('og:title', pageTitle);
    updatePropertyTag('og:description', metaDescription);
    updatePropertyTag('og:image', fullImageUrl);

    // Secure URL for HTTPS images
    if (fullImageUrl.startsWith('https://')) {
      updatePropertyTag('og:image:secure_url', fullImageUrl);
    }

    if (imageAlt) {
      updatePropertyTag('og:image:alt', imageAlt);
    }

    if (imageWidth) {
      updatePropertyTag('og:image:width', imageWidth.toString());
    }

    if (imageHeight) {
      updatePropertyTag('og:image:height', imageHeight.toString());
    }

    updatePropertyTag('og:image:type', imageType);
    updatePropertyTag('og:site_name', SITE_NAME);
    updatePropertyTag('og:locale', locale);

    // Article-specific Open Graph tags
    if (type === 'article') {
      if (publishedTime) {
        updatePropertyTag('article:published_time', publishedTime);
      }
      if (modifiedTime) {
        updatePropertyTag('article:modified_time', modifiedTime);
      }
      if (author) {
        updatePropertyTag('article:author', author);
      }
      if (section) {
        updatePropertyTag('article:section', section);
      }
      if (tags && Array.isArray(tags)) {
        // Remove old article:tag tags first
        const existingTags = document.querySelectorAll('meta[property="article:tag"]');
        existingTags.forEach(tag => tag.remove());

        // Add new tags
        tags.forEach(tag => {
          const metaTag = document.createElement('meta');
          metaTag.setAttribute('property', 'article:tag');
          metaTag.setAttribute('content', tag);
          document.head.appendChild(metaTag);
        });
      }
    } else {
      // Remove article tags if type is not article
      removeMetaTagsByProperty('article:');
    }

    // Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:url', fullUrl);
    updateMetaTag('name', 'twitter:title', pageTitle);
    updateMetaTag('name', 'twitter:description', metaDescription);
    updateMetaTag('name', 'twitter:image', fullImageUrl);

    if (imageAlt) {
      updateMetaTag('name', 'twitter:image:alt', imageAlt);
    }

    // Cleanup function - we intentionally keep tags between navigations
    return () => {
      // No-op: tags will be updated on the next navigation
    };
  }, [
    pageTitle,
    metaDescription,
    fullUrl,
    fullImageUrl,
    imageAlt,
    imageWidth,
    imageHeight,
    type,
    author,
    publishedTime,
    modifiedTime,
    keywords,
    locale,
    section,
    tags,
    noindex,
    nofollow,
    robotsMeta,
    imageType,
    location.pathname,
    location.search,
  ]);

  // This component doesn't render anything visible
  return null;
}

export default PageMetadata;
export { stripHtml, createExcerpt, SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_IMAGE };
