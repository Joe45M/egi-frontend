// Netlify Serverless Function for SSR
// This function handles server-side rendering for React Router

const fs = require('fs');
const path = require('path');

// Cache the server bundle
let serverRender;

function loadServerBundle() {
  if (serverRender) {
    return serverRender;
  }
  
  try {
    const serverPath = path.join(__dirname, '../../build/server.js');
    if (fs.existsSync(serverPath)) {
      // Clear require cache to allow hot reloading in development
      delete require.cache[require.resolve(serverPath)];
      serverRender = require(serverPath);
      return serverRender;
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

    const { html, status, head } = await serverModule.render(url);

    // Read the HTML template
    const htmlPath = path.join(__dirname, '../../build/index.html');
    let template = fs.readFileSync(htmlPath, 'utf8');

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

    // Inject canonical URL if present
    if (head && head.canonicalUrl) {
      const escapedUrl = head.canonicalUrl.replace(/"/g, '&quot;');
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
    }

    // Basic Open Graph tags
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

      ensureOgMeta('og:title', head.ogTitle || head.title);
      ensureOgMeta('og:description', head.ogDescription || head.description);
      ensureOgMeta('og:image', head.ogImage);
      ensureOgMeta('og:type', head.ogType || 'website');
      ensureOgMeta('og:url', head.canonicalUrl || '');
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
      const htmlPath = path.join(__dirname, '../../build/index.html');
      const template = fs.readFileSync(htmlPath, 'utf8');
      
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
