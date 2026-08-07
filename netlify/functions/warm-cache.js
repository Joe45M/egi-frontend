// Netlify Scheduled Function: Runs every 10 minutes to keep Cloudflare KV and Netlify Edge CDN warm 24/7
// Netlify Cron Expression: */10 * * * *

exports.handler = async (event, context) => {
  console.log('[Cache Warmer] Starting scheduled cache warming cycle...');

  const startTime = Date.now();
  const apiDomain = 'https://api.elitegamerinsights.com';
  const siteDomain = 'https://elitegamerinsights.com';

  try {
    // 1. Fetch latest 50 game posts, 20 culture posts, and all Palworld Pals from WordPress
    const [gamesRes, cultureRes, palsRes] = await Promise.all([
      fetch(`${apiDomain}/wp-json/wp/v2/games?per_page=50&_fields=slug`).catch(() => null),
      fetch(`${apiDomain}/wp-json/wp/v2/culture?per_page=20&_fields=slug`).catch(() => null),
      fetch(`${apiDomain}/wp-json/palworld/v1/pals?limit=150`).catch(() => null)
    ]);

    const gamePosts = (gamesRes && gamesRes.ok) ? await gamesRes.json() : [];
    const culturePosts = (cultureRes && cultureRes.ok) ? await cultureRes.json() : [];
    const palsData = (palsRes && palsRes.ok) ? await palsRes.json() : null;
    const palsList = Array.isArray(palsData) ? palsData : (palsData?.data || []);

    // 2. Build composite API & Palworld target URLs for Cloudflare KV pre-warming
    const kvTargets = [
      ...gamePosts.map(p => `${apiDomain}/wp-json/egi/v1/ssr-post?slug=${encodeURIComponent(p.slug)}&type=games`),
      ...culturePosts.map(p => `${apiDomain}/wp-json/egi/v1/ssr-post?slug=${encodeURIComponent(p.slug)}&type=culture`),
      ...palsList.map(pal => `${apiDomain}/wp-json/palworld/v1/pals?search=${encodeURIComponent(pal.name)}&limit=10`),
      ...palsList.map(pal => `${apiDomain}/wp-json/wp/v2/breeding?slug=${encodeURIComponent(pal.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`)
    ];

    // 3. Build HTML page target URLs for Netlify Edge CDN pre-warming
    const cdnTargets = [
      `${siteDomain}/`,
      `${siteDomain}/games/`,
      `${siteDomain}/culture/`,
      `${siteDomain}/palworld/`,
      `${siteDomain}/palworld/pals/`,
      ...gamePosts.slice(0, 15).map(p => `${siteDomain}/games/${p.slug}/`),
      ...palsList.slice(0, 20).map(pal => `${siteDomain}/palworld/pals/${encodeURIComponent(pal.name)}/`)
    ];

    // 4. Warm Cloudflare KV in parallel batches (10 concurrent requests per batch)
    const BATCH_SIZE = 10;
    let kvCount = 0;
    for (let i = 0; i < kvTargets.length; i += BATCH_SIZE) {
      const batch = kvTargets.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(url =>
          fetch(url, {
            headers: { 'User-Agent': 'Netlify-Cache-Warmer/1.0' }
          }).then(() => { kvCount++; }).catch(() => null)
        )
      );
    }

    // 5. Warm Netlify Edge CDN HTML pages in parallel batches
    let cdnCount = 0;
    for (let i = 0; i < cdnTargets.length; i += BATCH_SIZE) {
      const batch = cdnTargets.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(url =>
          fetch(url, {
            headers: { 'User-Agent': 'Netlify-Cache-Warmer/1.0' }
          }).then(() => { cdnCount++; }).catch(() => null)
        )
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[Cache Warmer] Finished warming ${kvCount} Cloudflare KV entries and ${cdnCount} CDN pages in ${duration}ms!`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Cache warming completed successfully',
        kvEntriesWarmed: kvCount,
        cdnPagesWarmed: cdnCount,
        durationMs: duration
      })
    };
  } catch (error) {
    console.error('[Cache Warmer] Error during scheduled cache warming:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
