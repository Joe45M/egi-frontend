// Netlify Serverless Function for SSR
// Optimized for maximum throughput, in-memory caching, and sub-10ms SSR renders

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://elitegamerinsights.com';

// Pre-compiled top-level regular expressions to avoid GC and compilation overhead
const TITLE_REGEX = /<title>.*?<\/title>/i;
const DESC_REGEX = /<meta\s+name="description"[^>]*>/i;
const CANONICAL_REGEX = /<link\s+rel="canonical"[^>]*>/i;
const ROOT_DIV_REGEX = /<div\s+id="root"\s*><\/div>/gi;
const ROOT_DIV_FALLBACK_REGEX = /<div id="root"><\/div>/g;
const STATIC_ASSET_REGEX = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map|webmanifest)$/i;

// In-memory HTML template cache across serverless function container invocations
let cachedHtmlTemplate = null;

function getHtmlTemplate() {
  if (cachedHtmlTemplate) return cachedHtmlTemplate;
  const htmlPath = resolveAssetPath('build/index.html');
  if (!htmlPath) return null;
  cachedHtmlTemplate = fs.readFileSync(htmlPath, 'utf8');
  return cachedHtmlTemplate;
}

function formatCanonicalUrl(rawUrlStr) {
  let formatted = rawUrlStr || SITE_URL;
  if (formatted.startsWith('http://')) {
    formatted = formatted.replace('http://', 'https://');
  }
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    if (!formatted.startsWith('/')) formatted = '/' + formatted;
    formatted = `${SITE_URL}${formatted}`;
  }
  try {
    const parsed = new URL(formatted);
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    }
    return parsed.toString();
  } catch (e) {
    if (formatted.length > 30 && formatted.endsWith('/') && !formatted.endsWith('com/')) {
      formatted = formatted.replace(/\/+$/, '');
    }
    return formatted;
  }
}

// Helper to resolve build asset paths in different environments
function resolveAssetPath(targetFile) {
  const paths = [
    path.join(__dirname, '../..', targetFile),
    path.join(__dirname, '..', targetFile),
    path.join(__dirname, '.', targetFile),
    path.join(process.cwd(), targetFile)
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

// Cache the server bundle in memory
let serverRender;

function loadServerBundle() {
  if (serverRender) {
    return serverRender;
  }

  try {
    const serverPath = resolveAssetPath('build/server.js');
    if (serverPath) {
      serverRender = require(serverPath);
      return serverRender;
    } else {
      console.error('Server bundle build/server.js not found in search paths.');
    }
  } catch (error) {
    console.error('Error loading server bundle:', error);
  }

  return null;
}

function extractRequestedPath(event) {
  const headerPath = event.headers?.['x-original-url'] ||
                     event.headers?.['x-rewrite-url'] ||
                     event.headers?.['x-forwarded-uri'] ||
                     event.headers?.['X-Original-Url'] ||
                     event.headers?.['X-Rewrite-Url'] ||
                     event.headers?.['X-Forwarded-Uri'];
  
  if (headerPath && !headerPath.includes('/.netlify/functions/ssr')) {
    return headerPath;
  }

  if (event.rawUrl) {
    try {
      const parsed = new URL(event.rawUrl);
      if (parsed.pathname && !parsed.pathname.includes('/.netlify/functions/ssr')) {
        return parsed.pathname + (parsed.search || '');
      }
    } catch (e) {}
  }

  if (event.rawPath && !event.rawPath.includes('/.netlify/functions/ssr')) {
    return event.rawPath;
  }

  if (event.path && !event.path.includes('/.netlify/functions/ssr')) {
    return event.path;
  }

  return '/';
}

exports.handler = async (event) => {
  let url = extractRequestedPath(event);

  if (url.includes('?')) {
    url = url.split('?')[0];
  }

  // Enforce trailing slash as canonical form
  const isStaticAsset = url.startsWith('/static/') || STATIC_ASSET_REGEX.test(url);
  if (!isStaticAsset && url !== '/' && !url.endsWith('/')) {
    return {
      statusCode: 301,
      headers: {
        'Location': url + '/',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: '',
    };
  }

  if (isStaticAsset) {
    return {
      statusCode: 404,
      body: 'Not found',
    };
  }

  try {
    const serverModule = loadServerBundle();

    if (!serverModule || !serverModule.render) {
      throw new Error('Server bundle not available');
    }

    const { html, status, head, redirect, initialData } = await serverModule.render(url);

    if (redirect || status === 301 || status === 302) {
      const redirectUrl = redirect || '/404';
      return {
        statusCode: status || 302,
        headers: {
          'Location': redirectUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: '',
      };
    }

    // Retrieve template from in-memory cache (zero file system read latency)
    let template = getHtmlTemplate();
    if (!template) {
      throw new Error('HTML template build/index.html not found');
    }

    let headInjections = '';

    // Inject initialData for client-side hydration
    if (initialData) {
      headInjections += `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData).replace(/</g, '\\u003c')};</script>`;
    }

    // Dynamic title
    if (head && head.title) {
      const escapedTitle = head.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (TITLE_REGEX.test(template)) {
        template = template.replace(TITLE_REGEX, `<title>${escapedTitle}</title>`);
      } else {
        headInjections += `<title>${escapedTitle}</title>`;
      }
    }

    // Meta description
    if (head && head.description) {
      const escapedDesc = head.description.replace(/"/g, '&quot;');
      if (DESC_REGEX.test(template)) {
        template = template.replace(DESC_REGEX, `<meta name="description" content="${escapedDesc}">`);
      } else {
        headInjections += `<meta name="description" content="${escapedDesc}">`;
      }
    }

    // Canonical URL
    const finalCanonicalUrl = formatCanonicalUrl(head?.canonicalUrl || `${SITE_URL}${url}`);
    const escapedUrl = finalCanonicalUrl.replace(/"/g, '&quot;');
    if (CANONICAL_REGEX.test(template)) {
      template = template.replace(CANONICAL_REGEX, `<link rel="canonical" href="${escapedUrl}">`);
    } else {
      headInjections += `<link rel="canonical" href="${escapedUrl}">`;
    }

    // Open Graph meta tags
    if (head && (head.ogTitle || head.ogDescription || head.ogImage)) {
      const ensureOgMeta = (property, content) => {
        if (!content) return;
        const escaped = content.replace(/"/g, '&quot;');
        const pattern = new RegExp(`<meta\\s+property="${property}"[^>]*>`, 'i');
        const tag = `<meta property="${property}" content="${escaped}">`;
        if (pattern.test(template)) {
          template = template.replace(pattern, tag);
        } else {
          headInjections += tag;
        }
      };

      ensureOgMeta('og:title', head.ogTitle || head.title);
      ensureOgMeta('og:description', head.ogDescription || head.description);
      ensureOgMeta('og:image', head.ogImage);
      ensureOgMeta('og:type', head.ogType || 'website');
      ensureOgMeta('og:url', head.canonicalUrl || '');
      ensureOgMeta('og:site_name', head.ogSiteName || 'EliteGamerInsights');
      ensureOgMeta('og:locale', head.ogLocale || 'en_US');

      if (head.ogImage) {
        ensureOgMeta('og:image:alt', head.ogImageAlt);
        if (head.ogImageWidth) ensureOgMeta('og:image:width', head.ogImageWidth);
        if (head.ogImageHeight) ensureOgMeta('og:image:height', head.ogImageHeight);
        if (head.ogImage.startsWith('https://')) {
          ensureOgMeta('og:image:secure_url', head.ogImage);
        }
      }

      if (head.ogType === 'article') {
        if (head.articlePublishedTime) ensureOgMeta('article:published_time', head.articlePublishedTime);
        if (head.articleModifiedTime) ensureOgMeta('article:modified_time', head.articleModifiedTime);
        if (head.articleAuthor) ensureOgMeta('article:author', head.articleAuthor);
        if (head.articleSection) ensureOgMeta('article:section', head.articleSection);
      }
    }

    // Twitter Card meta tags
    if (head && (head.ogTitle || head.ogDescription || head.ogImage)) {
      const ensureTwitterMeta = (name, content) => {
        if (!content) return;
        const escaped = content.replace(/"/g, '&quot;');
        const pattern = new RegExp(`<meta\\s+name="${name}"[^>]*>`, 'i');
        const tag = `<meta name="${name}" content="${escaped}">`;
        if (pattern.test(template)) {
          template = template.replace(pattern, tag);
        } else {
          headInjections += tag;
        }
      };

      ensureTwitterMeta('twitter:card', head.twitterCard || 'summary_large_image');
      ensureTwitterMeta('twitter:title', head.ogTitle || head.title);
      ensureTwitterMeta('twitter:description', head.ogDescription || head.description);
      ensureTwitterMeta('twitter:image', head.twitterImage || head.ogImage);
      ensureTwitterMeta('twitter:url', head.canonicalUrl || '');
      ensureTwitterMeta('twitter:image:alt', head.twitterImageAlt || head.ogImageAlt);
    }

    // JSON-LD structured schemas
    if (head && head.schemas && Array.isArray(head.schemas) && head.schemas.length > 0) {
      const schemaScripts = head.schemas
        .map((schema, index) => {
          if (!schema) return '';
          const jsonString = JSON.stringify(schema).replace(/</g, '\\u003c');
          return `<script type="application/ld+json" id="ssr-structured-schema-${index}">${jsonString}</script>`;
        })
        .filter(Boolean)
        .join('\n');
      
      headInjections += schemaScripts;
    }

    // Single head injection append
    if (headInjections) {
      template = template.replace('</head>', `${headInjections}</head>`);
    }

    // Inject server-rendered React HTML into root div
    if (ROOT_DIV_REGEX.test(template)) {
      template = template.replace(ROOT_DIV_REGEX, `<div id="root">${html}</div>`);
    } else {
      template = template.replace(ROOT_DIV_FALLBACK_REGEX, `<div id="root">${html}</div>`);
    }

    return {
      statusCode: status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
        'Netlify-Vary': 'query=none',
      },
      body: template,
    };
  } catch (error) {
    console.error('SSR Error:', error);

    try {
      let template = getHtmlTemplate();
      if (!template) {
        throw new Error('HTML template build/index.html not found in fallback path');
      }

      const finalCanonicalUrl = formatCanonicalUrl(`${SITE_URL}${url}`);
      const escapedUrl = finalCanonicalUrl.replace(/"/g, '&quot;');
      if (CANONICAL_REGEX.test(template)) {
        template = template.replace(CANONICAL_REGEX, `<link rel="canonical" href="${escapedUrl}">`);
      } else {
        template = template.replace('</head>', `<link rel="canonical" href="${escapedUrl}"></head>`);
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        body: template,
      };
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'Internal Server Error',
      };
    }
  }
};
