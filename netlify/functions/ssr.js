// Netlify Serverless Function for SSR
// This function handles server-side rendering for React Router

const fs = require('fs');
const path = require('path');

// Helper to resolve build asset paths in different environments (local development vs Netlify serverless deployment)
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

// Cache the server bundle
let serverRender;

function loadServerBundle() {
  if (serverRender) {
    return serverRender;
  }

  try {
    const serverPath = resolveAssetPath('build/server.js');
    if (serverPath) {
      // Clear require cache to allow hot reloading in development
      delete require.cache[require.resolve(serverPath)];
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

exports.handler = async (event) => {
  // Get the URL from the event - Netlify uses different event structures
  // Try multiple possible properties
  let url = event.path || event.rawPath || (event.requestContext && event.requestContext.path) || '/';

  // If we got the full path with query string, extract just the path
  if (url.includes('?')) {
    url = url.split('?')[0];
  }

  // Log for debugging - this will show in Netlify function logs
  console.log('SSR Function called');
  console.log('Event keys:', Object.keys(event));
  console.log('URL:', url);
  console.log('event.path:', event.path);
  console.log('event.rawPath:', event.rawPath);

  // Static assets should be handled by redirects, but as a safety check
  if (
    url.startsWith('/static/') ||
    url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map|webmanifest)$/i)
  ) {
    return {
      statusCode: 404,
      body: 'Not found',
    };
  }

  try {
    const serverModule = loadServerBundle();

    if (!serverModule || !serverModule.render) {
      // Fallback to static HTML if server bundle not available
      throw new Error('Server bundle not available');
    }

    const { html, status, head, redirect, initialData } = await serverModule.render(url);

    if (redirect || status === 301 || status === 302) {
      const redirectUrl = redirect || '/404';
      console.log(`SSR Redirecting from ${url} to ${redirectUrl} with status ${status || 302}`);
      return {
        statusCode: status || 302,
        headers: {
          'Location': redirectUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: '',
      };
    }

    // Debug logging - check if head has values
    console.log('SSR Debug - URL:', url);
    console.log('SSR Debug - Head values:', JSON.stringify(head, null, 2));
    console.log('SSR Debug - HTML length:', html ? html.length : 0);
    console.log('SSR Debug - Has title:', !!head?.title);
    console.log('SSR Debug - Has ogImage:', !!head?.ogImage);

    // Read the HTML template
    const htmlPath = resolveAssetPath('build/index.html');
    if (!htmlPath) {
      throw new Error('HTML template build/index.html not found');
    }
    let template = fs.readFileSync(htmlPath, 'utf8');

    // Inject initialData for client-side hydration
    if (initialData) {
      const dataScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData).replace(/</g, '\\u003c')};</script>`;
      template = template.replace('</head>', `${dataScript}</head>`);
    }

    // Inject dynamic <title> if we have one from SSR
    if (head && head.title) {
      const escapedTitle = head.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (template.includes('<title>')) {
        template = template.replace(/<title>.*?<\/title>/i, `<title>${escapedTitle}</title>`);
      } else {
        // Insert before closing </head> as a fallback
        template = template.replace('</head>', `<title>${escapedTitle}</title></head>`);
      }
    }

    // Inject / override meta description
    if (head && head.description) {
      const escapedDesc = head.description.replace(/"/g, '&quot;');
      if (template.match(/<meta\s+name="description"[^>]*>/i)) {
        template = template.replace(
          /<meta\s+name="description"[^>]*>/i,
          `<meta name="description" content="${escapedDesc}">`
        );
      } else {
        template = template.replace(
          '</head>',
          `<meta name="description" content="${escapedDesc}"></head>`
        );
      }
    }

    // Inject canonical URL (either from SEO head data or request path)
    const siteUrl = 'https://elitegamerinsights.com';
    const finalCanonicalUrl = head?.canonicalUrl || `${siteUrl}${url}`;
    const escapedUrl = finalCanonicalUrl.replace(/"/g, '&quot;');
    if (template.match(/<link\s+rel="canonical"[^>]*>/i)) {
      template = template.replace(
        /<link\s+rel="canonical"[^>]*>/i,
        `<link rel="canonical" href="${escapedUrl}">`
      );
    } else {
      template = template.replace(
        '</head>',
        `<link rel="canonical" href="${escapedUrl}"></head>`
      );
    }

    // Open Graph meta tags
    if (head && (head.ogTitle || head.ogDescription || head.ogImage)) {
      const ensureOgMeta = (property, content) => {
        if (!content) return;
        const escaped = content.replace(/"/g, '&quot;');
        const pattern = new RegExp(
          `<meta\\s+property="${property}"[^>]*>`,
          'i'
        );
        const tag = `<meta property="${property}" content="${escaped}">`;
        if (pattern.test(template)) {
          template = template.replace(pattern, tag);
        } else {
          template = template.replace('</head>', `${tag}</head>`);
        }
      };

      // Core OG tags
      ensureOgMeta('og:title', head.ogTitle || head.title);
      ensureOgMeta('og:description', head.ogDescription || head.description);
      ensureOgMeta('og:image', head.ogImage);
      ensureOgMeta('og:type', head.ogType || 'website');
      ensureOgMeta('og:url', head.canonicalUrl || '');

      // Additional OG tags
      ensureOgMeta('og:site_name', head.ogSiteName || 'EliteGamerInsights');
      ensureOgMeta('og:locale', head.ogLocale || 'en_US');

      // Image metadata
      if (head.ogImage) {
        ensureOgMeta('og:image:alt', head.ogImageAlt);
        if (head.ogImageWidth) ensureOgMeta('og:image:width', head.ogImageWidth);
        if (head.ogImageHeight) ensureOgMeta('og:image:height', head.ogImageHeight);
        // Add secure_url for HTTPS images
        if (head.ogImage.startsWith('https://')) {
          ensureOgMeta('og:image:secure_url', head.ogImage);
        }
      }

      // Article-specific OG tags (for blog posts)
      if (head.ogType === 'article') {
        if (head.articlePublishedTime) {
          ensureOgMeta('article:published_time', head.articlePublishedTime);
        }
        if (head.articleModifiedTime) {
          ensureOgMeta('article:modified_time', head.articleModifiedTime);
        }
        if (head.articleAuthor) {
          ensureOgMeta('article:author', head.articleAuthor);
        }
        if (head.articleSection) {
          ensureOgMeta('article:section', head.articleSection);
        }
      }
    }

    // Twitter Card meta tags (use name="" attribute, not property="")
    if (head && (head.ogTitle || head.ogDescription || head.ogImage)) {
      const ensureTwitterMeta = (name, content) => {
        if (!content) return;
        const escaped = content.replace(/"/g, '&quot;');
        const pattern = new RegExp(
          `<meta\\s+name="${name}"[^>]*>`,
          'i'
        );
        const tag = `<meta name="${name}" content="${escaped}">`;
        if (pattern.test(template)) {
          template = template.replace(pattern, tag);
        } else {
          template = template.replace('</head>', `${tag}</head>`);
        }
      };

      ensureTwitterMeta('twitter:card', head.twitterCard || 'summary_large_image');
      ensureTwitterMeta('twitter:title', head.ogTitle || head.title);
      ensureTwitterMeta('twitter:description', head.ogDescription || head.description);
      ensureTwitterMeta('twitter:image', head.twitterImage || head.ogImage);
      ensureTwitterMeta('twitter:url', head.canonicalUrl || '');
      ensureTwitterMeta('twitter:image:alt', head.twitterImageAlt || head.ogImageAlt);
    }

    // Inject JSON-LD structured schemas
    if (head && head.schemas && Array.isArray(head.schemas) && head.schemas.length > 0) {
      const schemaScripts = head.schemas
        .map((schema, index) => {
          if (!schema) return '';
          // Safely stringify and escape '<' to prevent XSS/broken HTML tags
          const jsonString = JSON.stringify(schema).replace(/</g, '\\u003c');
          return `<script type="application/ld+json" id="ssr-structured-schema-${index}">${jsonString}</script>`;
        })
        .filter(Boolean)
        .join('\n');
      
      template = template.replace('</head>', `${schemaScripts}\n</head>`);
    }

    // Inject the server-rendered HTML
    // Handle both minified and non-minified HTML
    const rootDivPattern = /<div\s+id="root"\s*><\/div>/gi;
    if (rootDivPattern.test(template)) {
      template = template.replace(rootDivPattern, `<div id="root">${html}</div>`);
    } else {
      // Fallback: try without spaces
      template = template.replace(/<div id="root"><\/div>/g, `<div id="root">${html}</div>`);
    }

    // Verify replacement worked
    if (!template.includes(`<div id="root">${html.substring(0, 50)}`)) {
      console.warn('Warning: HTML replacement may have failed. Template still contains empty root div.');
    }

    return {
      statusCode: status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
      body: template,
    };
  } catch (error) {
    console.error('SSR Error:', error);

    // Fallback to static HTML if SSR fails
    try {
      const htmlPath = resolveAssetPath('build/index.html');
      if (!htmlPath) {
        throw new Error('HTML template build/index.html not found in fallback path');
      }
      let template = fs.readFileSync(htmlPath, 'utf8');

      // Always inject canonical URL even in fallback mode for SEO safety
      const siteUrl = 'https://elitegamerinsights.com';
      const finalCanonicalUrl = `${siteUrl}${url}`;
      const escapedUrl = finalCanonicalUrl.replace(/"/g, '&quot;');
      if (template.match(/<link\s+rel="canonical"[^>]*>/i)) {
        template = template.replace(
          /<link\s+rel="canonical"[^>]*>/i,
          `<link rel="canonical" href="${escapedUrl}">`
        );
      } else {
        template = template.replace(
          '</head>',
          `<link rel="canonical" href="${escapedUrl}"></head>`
        );
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
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
