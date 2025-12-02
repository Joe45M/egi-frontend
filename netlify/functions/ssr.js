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
  const url = event.path || event.rawPath || '/';
  
  // Skip SSR for static assets - Netlify should serve these directly
  // Return 404 so Netlify can try to serve the file from the build directory
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

    const { html, status } = serverModule.render(url);

    // Read the HTML template
    const htmlPath = path.join(__dirname, '../../build/index.html');
    let template = fs.readFileSync(htmlPath, 'utf8');
    
    // Inject the server-rendered HTML
    template = template.replace(
      '<div id="root"></div>',
      `<div id="root">${html}</div>`
    );

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
