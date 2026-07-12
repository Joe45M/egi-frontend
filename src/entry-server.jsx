import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { createLDReactProvider } from '@launchdarkly/react-sdk';
import { routes } from './routes-server';
import { HeadProvider, createEmptyHead } from './headContext';
import { InitialDataProvider } from './initialDataContext';
import wordpressApi from './services/wordpressApi';
import { palworldApi } from './services/palworldApi';

const LDProvider = createLDReactProvider('6a525a8ccd87b60ba57d0fd3', {
  kind: 'user',
  key: 'anonymous-user',
  name: 'Anonymous User'
});


/**
 * Fetch related posts and game taxonomy details in parallel to fully SSR the page
 */
async function enrichPostWithSidebarData(post, postType) {
  if (!post) return post;
  
  const relatedPromise = wordpressApi.posts.getRelatedByPostType(postType, post.id, 20)
    .catch(e => {
      console.error(`Error preloading related posts for ${postType} ${post.id}:`, e);
      return [];
    });
    
  let gamePromise = Promise.resolve({ associatedGame: null, gameRelatedPosts: [] });
  const gameIds = [post.games, post.game, post.game_taxonomy].find(arr => arr && arr.length > 0) || [];
  if (gameIds && gameIds.length > 0) {
    const gameId = gameIds[0];
    gamePromise = (async () => {
      try {
        const associatedGame = await wordpressApi.taxonomies.getById('game', gameId);
        const result = await wordpressApi.posts.getByPostType(postType, {
          perPage: 21,
          taxonomyFilter: { game: gameId }
        });
        const fetched = Array.isArray(result) ? result : (result.posts || []);
        const gameRelatedPosts = fetched.filter(p => String(p.id) !== String(post.id)).slice(0, 20);
        return { associatedGame, gameRelatedPosts };
      } catch (e) {
        console.error(`Error preloading game posts for gameId ${gameId}:`, e);
        return { associatedGame: null, gameRelatedPosts: [] };
      }
    })();
  }
  
  const [relatedPosts, gameData] = await Promise.all([relatedPromise, gamePromise]);
  
  post.relatedPosts = relatedPosts;
  post.associatedGame = gameData.associatedGame;
  post.gameRelatedPosts = gameData.gameRelatedPosts;
  
  return post;
}

/**
 * Pre-fetch data for routes that need it
 * Parses the URL to determine if we need to fetch post data
 */
async function preloadRouteData(url) {
  try {
    // Parse URL to extract pathname (remove query string and hash)
    const pathname = url.split('?')[0].split('#')[0];

    // Check if this is the Home page route
    if (pathname === '/' || pathname === '') {
      try {
        const sliderPostsResult = await wordpressApi.posts.getByPostType('games', {
          perPage: 3,
          includeImages: true,
          orderBy: 'date',
          order: 'desc'
        });
        const sliderPosts = Array.isArray(sliderPostsResult) ? sliderPostsResult : (sliderPostsResult?.posts || []);

        const postsResult = await wordpressApi.posts.getByPostType('games', {
          perPage: 36,
          includeImages: true,
          orderBy: 'date',
          order: 'desc'
        });
        const allPosts = Array.isArray(postsResult) ? postsResult : (postsResult?.posts || []);

        return {
          sliderPosts,
          allPosts,
          postType: 'home'
        };
      } catch (error) {
        console.error('Error preloading home data:', error);
      }
    }

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
          let post = await wordpressApi.posts.getByPostTypeAndSlug('games', slug, true);
          post = await enrichPostWithSidebarData(post, 'games');
          return { post, postType: 'games', basePath: '/games' };
        } catch (error) {
          console.error('Error preloading game post:', error);
          return { redirect: '/404' };
        }
      }
    }

    // Check if this is the Pals listing route: /palworld/pals
    if (pathname === '/palworld/pals' || pathname === '/palworld/pals/') {
      try {
        const response = await palworldApi.getPals({ limit: 100 });
        return {
          pals: response.data || [],
          totalPages: response.headers?.totalPages || 1,
          totalItems: response.headers?.total || 0,
          postType: 'palworld-list'
        };
      } catch (error) {
        console.error('Error preloading Pal list:', error);
      }
    }

    // Check if this is a Pal details route: /palworld/pals/:id
    const palsMatch = pathname.match(/^\/palworld\/pals\/(.+)$/);
    if (palsMatch) {
      const palId = extractSlug(palsMatch[1]);
      if (palId) {
        try {
          const pal = await palworldApi.getPalById(palId);
          return { pal, postType: 'palworld-detail', id: palId };
        } catch (error) {
          console.error('Error preloading Pal details:', error);
          return { redirect: '/404' };
        }
      }
    }

    // Check if this is a culture post route: /culture/:slug
    const cultureMatch = pathname.match(/^\/culture\/(.+)$/);
    if (cultureMatch) {
      const slug = extractSlug(cultureMatch[1]);
      if (slug) {
        try {
          let post = await wordpressApi.posts.getByPostTypeAndSlug('culture', slug, true);
          post = await enrichPostWithSidebarData(post, 'culture');
          return { post, postType: 'culture', basePath: '/culture' };
        } catch (error) {
          console.error('Error preloading culture post:', error);
          return { redirect: '/404' };
        }
      }
    }

    // Check if this is a game-reviews post route: /game-reviews/:slug
    const gameReviewsMatch = pathname.match(/^\/game-reviews\/(.+)$/);
    if (gameReviewsMatch) {
      const slug = extractSlug(gameReviewsMatch[1]);
      if (slug) {
        try {
          let post = await wordpressApi.posts.getByPostTypeAndSlug('game-reviews', slug, true);
          post = await enrichPostWithSidebarData(post, 'game-reviews');
          return { post, postType: 'game-reviews', basePath: '/game-reviews' };
        } catch (error) {
          console.error('Error preloading game-reviews post:', error);
          return { redirect: '/404' };
        }
      }
    }
  } catch (error) {
    console.error('Error in preloadRouteData:', error);
  }

  return null;
}

export async function render(url) {
  console.log('entry-server: render called with URL:', url);

  const head = createEmptyHead();

  // Pre-fetch data for routes that need it
  const initialData = await preloadRouteData(url);
  console.log('entry-server: initialData:', initialData ? (initialData.redirect ? `redirect=${initialData.redirect}` : `postType=${initialData.postType}, slug=${initialData.post?.slug}`) : 'null');

  if (initialData && initialData.redirect) {
    return {
      html: '',
      status: 302,
      redirect: initialData.redirect,
      head,
    };
  }

  const router = createMemoryRouter(routes, {
    initialEntries: [url],
  });

  const matches = router.state.matches;
  const is404 = matches && matches.some(match => match.route.path === '*');
  if (is404) {
    return {
      html: '',
      status: 302,
      redirect: '/404',
      head,
    };
  }

  const isDedicated404 = matches && matches.some(match => match.route.path === '404');
  const status = isDedicated404 ? 404 : 200;

  const html = renderToString(
    <React.StrictMode>
      <HeadProvider head={head}>
        <InitialDataProvider initialData={initialData}>
          <LDProvider>
            <RouterProvider router={router} />
          </LDProvider>
        </InitialDataProvider>
      </HeadProvider>
    </React.StrictMode>
  );

  // Debug logging - what did we get from the render?
  console.log('entry-server: After render, head.title:', head.title);
  console.log('entry-server: After render, head.ogImage:', head.ogImage);
  console.log('entry-server: HTML rendered, length:', html.length);

  return {
    html,
    status,
    head,
    initialData,
  };
}

// Export routes for the serverless function
export { routes };

