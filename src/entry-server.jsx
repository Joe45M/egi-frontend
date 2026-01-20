import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes-server';
import { HeadProvider, createEmptyHead } from './headContext';
import { InitialDataProvider } from './initialDataContext';
import wordpressApi from './services/wordpressApi';

/**
 * Pre-fetch data for routes that need it
 * Parses the URL to determine if we need to fetch post data
 */
async function preloadRouteData(url) {
  try {
    // Parse URL to extract pathname (remove query string and hash)
    const pathname = url.split('?')[0].split('#')[0];

    /**
     * Extract slug from pathname, handling malformed URLs
     * Some bots/crawlers append junk to URLs like:
     * /games/my-post/twsrc%2525...
     * We only want "my-post" as the slug
     */
    function extractSlug(match) {
      if (!match) return null;
      let slug = match;
      // Remove trailing slash
      slug = slug.replace(/\/$/, '');
      // If slug contains another slash, take only the first part
      // This handles cases like "my-post/junk-from-bots"
      if (slug.includes('/')) {
        slug = slug.split('/')[0];
      }
      // Decode the slug
      try {
        slug = decodeURIComponent(slug);
      } catch (e) {
        // If decoding fails, use as-is
      }
      return slug;
    }

    // Check if this is a game post route: /games/:slug
    const gamesMatch = pathname.match(/^\/games\/(.+)$/);
    if (gamesMatch) {
      const slug = extractSlug(gamesMatch[1]);
      if (slug) {
        try {
          const post = await wordpressApi.posts.getByPostTypeAndSlug('games', slug, true);
          return { post, postType: 'games', basePath: '/games' };
        } catch (error) {
          console.error('Error preloading game post:', error);
          return null;
        }
      }
    }

    // Check if this is a culture post route: /culture/:slug
    const cultureMatch = pathname.match(/^\/culture\/(.+)$/);
    if (cultureMatch) {
      const slug = extractSlug(cultureMatch[1]);
      if (slug) {
        try {
          const post = await wordpressApi.posts.getByPostTypeAndSlug('culture', slug, true);
          return { post, postType: 'culture', basePath: '/culture' };
        } catch (error) {
          console.error('Error preloading culture post:', error);
          return null;
        }
      }
    }

    // Check if this is a game-reviews post route: /game-reviews/:slug
    const gameReviewsMatch = pathname.match(/^\/game-reviews\/(.+)$/);
    if (gameReviewsMatch) {
      const slug = extractSlug(gameReviewsMatch[1]);
      if (slug) {
        try {
          const post = await wordpressApi.posts.getByPostTypeAndSlug('game-reviews', slug, true);
          return { post, postType: 'game-reviews', basePath: '/game-reviews' };
        } catch (error) {
          console.error('Error preloading game-reviews post:', error);
          return null;
        }
      }
    }
  } catch (error) {
    console.error('Error in preloadRouteData:', error);
  }

  return null;
}

export async function render(url) {
  // Pre-fetch data for routes that need it
  const initialData = await preloadRouteData(url);

  const router = createMemoryRouter(routes, {
    initialEntries: [url],
  });

  const head = createEmptyHead();

  const html = renderToString(
    <React.StrictMode>
      <HeadProvider head={head}>
        <InitialDataProvider initialData={initialData}>
          <RouterProvider router={router} />
        </InitialDataProvider>
      </HeadProvider>
    </React.StrictMode>
  );

  return {
    html,
    status: 200,
    head,
  };
}

// Export routes for the serverless function
export { routes };

