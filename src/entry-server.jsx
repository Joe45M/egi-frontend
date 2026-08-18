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
  
  const relatedPromise = wordpressApi.posts.getRelatedByPostType(postType, post.id, 20, post.categories)
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
        const gameTermPromise = wordpressApi.taxonomies.getById('game', gameId);
        const gamePostsPromise = wordpressApi.posts.getByPostType(postType, {
          perPage: 21,
          taxonomyFilter: { game: gameId }
        });
        const [associatedGame, result] = await Promise.all([gameTermPromise, gamePostsPromise]);
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
        const [sliderPostsResult, postsResult] = await Promise.all([
          wordpressApi.posts.getByPostType('games', {
            perPage: 3,
            includeImages: true,
            orderBy: 'date',
            order: 'desc'
          }),
          wordpressApi.posts.getByPostType('games', {
            perPage: 36,
            includeImages: true,
            orderBy: 'date',
            order: 'desc'
          })
        ]);

        const sliderPosts = Array.isArray(sliderPostsResult) ? sliderPostsResult : (sliderPostsResult?.posts || []);
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

async function loadPostDataWithCompositeFallback(postType, slug, basePath) {
  try {
    const composite = await wordpressApi.posts.getCompositeSSRPost(postType, slug);
    if (composite && composite.post) {
      const post = composite.post;
      post.relatedPosts = composite.relatedPosts || [];
      post.associatedGame = composite.associatedGame || null;
      post.gameRelatedPosts = composite.gameRelatedPosts || [];
      return { post, postType, basePath };
    }
  } catch (compositeError) {
    console.warn(`[Composite API Fallback] ${postType} / ${slug} failed, falling back to standard REST API:`, compositeError?.message || compositeError);
  }

  // Fallback to standard REST API queries if composite endpoint fails
  try {
    let post = await wordpressApi.posts.getByPostTypeAndSlug(postType, slug, true);
    post = await enrichPostWithSidebarData(post, postType);
    return { post, postType, basePath };
  } catch (error) {
    console.error(`Error preloading ${postType} post:`, error);
    return { redirect: '/404' };
  }
}

    // Check if this is a game post route: /games/:slug
    const gamesMatch = pathname.match(/^\/games\/(.+)$/);
    if (gamesMatch) {
      const slug = extractSlug(gamesMatch[1]);
      if (slug) {
        return await loadPostDataWithCompositeFallback('games', slug, '/games');
      }
    }

    // Check if this is the Palworld Hub route: /palworld or /palworld/
    if (pathname === '/palworld' || pathname === '/palworld/') {
      try {
        const palsResponse = await palworldApi.getPals({ limit: 150 }).catch(() => ({ data: [] }));
        
        let articles = [];
        try {
          const gameTerm = await wordpressApi.taxonomies.getBySlug('game', 'palworld');
          if (gameTerm && gameTerm.id) {
            const postsResponse = await wordpressApi.posts.getByPostType('games', {
              taxonomyFilter: { game: gameTerm.id },
              perPage: 12,
              includeImages: true
            });
            articles = Array.isArray(postsResponse) ? postsResponse : (postsResponse?.posts || []);
          }
        } catch (postErr) {
          console.error("Error preloading hub articles:", postErr);
          const postsResponse = await wordpressApi.posts.getByPostType('games', {
            perPage: 12,
            includeImages: true
          });
          articles = Array.isArray(postsResponse) ? postsResponse : (postsResponse?.posts || []);
        }

        return {
          pals: palsResponse.data || [],
          articles,
          postType: 'palworld-hub'
        };
      } catch (error) {
        console.error('Error preloading Palworld Hub data:', error);
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
          const palPromise = palworldApi.getPalById(palId);
          const breedingPromise = palworldApi.getBreedingRecipe(palId, palId).catch(() => null);
          const [pal, breeding] = await Promise.all([palPromise, breedingPromise]);
          return { pal, breeding, postType: 'palworld-detail', id: palId };
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
        return await loadPostDataWithCompositeFallback('culture', slug, '/culture');
      }
    }

    // Check if this is a game-reviews post route: /game-reviews/:slug
    const gameReviewsMatch = pathname.match(/^\/game-reviews\/(.+)$/);
    if (gameReviewsMatch) {
      const slug = extractSlug(gameReviewsMatch[1]);
      if (slug) {
        return await loadPostDataWithCompositeFallback('game-reviews', slug, '/game-reviews');
      }
    }

    // Check if this is a tag archive route: /tags/:slug
    const tagsMatch = pathname.match(/^\/tags\/(.+)$/);
    if (tagsMatch) {
      const slug = extractSlug(tagsMatch[1]);
      if (slug) {
        try {
          const tagData = await wordpressApi.tags.getBySlug(slug);
          if (tagData && tagData.id) {
            const params = {
              page: 1,
              perPage: 24,
              tag: tagData.id,
              includeImages: true,
              orderBy: 'date',
              order: 'desc',
            };
            const result = await wordpressApi.posts.getByPostType('games', params);
            const posts = Array.isArray(result) ? result : (result.posts || []);
            const pagination = result.pagination || null;
            return {
              tag: tagData,
              posts,
              pagination,
              postType: 'tag-archive',
              slug
            };
          }
        } catch (error) {
          console.error('Error preloading tag data:', error);
          if (error.message && error.message.includes('not found')) {
            return { redirect: '/404' };
          }
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

  // Pre-fetch data for routes with a 2.5s timeout safety guard
  let timeoutId;
  const timeoutPromise = new Promise(resolve => {
    timeoutId = setTimeout(() => {
      console.warn(`[SSR Timeout Warning] preloadRouteData exceeded 2500ms for URL: ${url}`);
      resolve(null);
    }, 2500);
  });

  const initialData = await Promise.race([
    preloadRouteData(url),
    timeoutPromise
  ]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });

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
    <HeadProvider head={head}>
      <InitialDataProvider initialData={initialData}>
        <LDProvider>
          <RouterProvider router={router} />
        </LDProvider>
      </InitialDataProvider>
    </HeadProvider>
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

