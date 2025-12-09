import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL, SITE_NAME } from './PageMetadata';

/**
 * StructuredSchema Component
 * Generates and injects JSON-LD structured data for SEO
 */
function StructuredSchema({ schemas = [] }) {
  const location = useLocation();

  useEffect(() => {
    // Remove existing schema scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new schema scripts
    schemas.forEach((schema, index) => {
      if (!schema) return;

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `structured-schema-${index}`;
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.id && script.id.startsWith('structured-schema-')) {
          script.remove();
        }
      });
    };
  }, [schemas, location.pathname]);

  return null;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema({
  name = SITE_NAME,
  url = SITE_URL,
  logo = `${SITE_URL}/logo512.png`,
  description = 'Gaming news, tutorials, and culture coverage. Everything you need to stay informed about the gaming world.',
  contactPoint = {
    email: 'contact@elitegamerinsights.com',
    contactType: 'Customer Service'
  },
  sameAs = []
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
      width: 512,
      height: 512
    },
    description,
    contactPoint: {
      '@type': 'ContactPoint',
      email: contactPoint.email,
      contactType: contactPoint.contactType
    },
    ...(sameAs.length > 0 && { sameAs })
  };
}

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema({
  name = SITE_NAME,
  url = SITE_URL,
  description = 'Gaming news, tutorials, and culture coverage. Everything you need to stay informed about the gaming world.',
  potentialAction = {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/?s={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction
  };
}

/**
 * Generate Article/BlogPosting schema
 */
export function generateArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = {
    '@type': 'Person',
    name: 'EliteGamerInsights'
  },
  publisher = {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo512.png`
    }
  },
  url,
  mainEntityOfPage = url,
  articleSection,
  keywords,
  articleBody
} = {}) {
  if (!headline || !url) {
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description: description || headline,
    image: image ? (Array.isArray(image) ? image : [image]) : [`${SITE_URL}/logo512.png`],
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    author,
    publisher,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': mainEntityOfPage
    }
  };

  if (articleSection) {
    schema.articleSection = articleSection;
  }

  if (keywords) {
    schema.keywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;
  }

  if (articleBody) {
    schema.articleBody = articleBody;
  }

  return schema;
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema({
  name,
  description,
  url,
  breadcrumb = null,
  isPartOf = {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL
  }
} = {}) {
  if (!name || !url) {
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description: description || name,
    url,
    isPartOf
  };

  if (breadcrumb) {
    schema.breadcrumb = breadcrumb;
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema({ items = [] } = {}) {
  if (!items || items.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Generate HowTo schema (for tutorials/guides)
 */
export function generateHowToSchema({
  name,
  description,
  image,
  totalTime,
  estimatedCost,
  tool = [],
  supply = [],
  step = []
} = {}) {
  if (!name || !step || step.length === 0) {
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description: description || name,
    ...(image && { image: Array.isArray(image) ? image : [image] }),
    ...(totalTime && { totalTime }),
    ...(estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: estimatedCost
      }
    }),
    ...(tool.length > 0 && { tool }),
    ...(supply.length > 0 && { supply }),
    step: step.map((s, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: s.name,
      text: s.text,
      ...(s.image && { image: s.image }),
      ...(s.url && { url: s.url })
    }))
  };

  return schema;
}

/**
 * Generate SoftwareApplication schema (for calculators)
 */
export function generateSoftwareApplicationSchema({
  name,
  description,
  applicationCategory = 'UtilityApplication',
  operatingSystem = 'Web Browser',
  offers = {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  url,
  screenshot
} = {}) {
  if (!name || !url) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description: description || name,
    applicationCategory,
    operatingSystem,
    offers,
    url,
    ...(screenshot && { screenshot })
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQPageSchema({ questions = [] } = {}) {
  if (!questions || questions.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  };
}

/**
 * Generate CollectionPage schema (for archive/list pages)
 */
export function generateCollectionPageSchema({
  name,
  description,
  url,
  numberOfItems,
  itemListElement = []
} = {}) {
  if (!name || !url) {
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description: description || name,
    url
  };

  if (numberOfItems) {
    schema.numberOfItems = numberOfItems;
  }

  if (itemListElement.length > 0) {
    schema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: itemListElement.length,
      itemListElement: itemListElement.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          '@id': item.url,
          name: item.name,
          ...(item.image && { image: item.image }),
          ...(item.description && { description: item.description })
        }
      }))
    };
  }

  return schema;
}

export default StructuredSchema;

