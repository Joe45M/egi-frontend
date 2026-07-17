const fs = require('fs');
const path = require('path');

const BASE_PALS_URL = 'https://api.elitegamerinsights.com/wp-json/palworld/v1/pals?limit=100';
const WP_BREEDING_POSTS_URL = 'https://api.elitegamerinsights.com/wp-json/wp/v2/breeding?per_page=100';
const BREEDING_BASE_URL = 'https://api.elitegamerinsights.com/wp-json/palworld/v1/breeding/';

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    return res.json();
}

async function run() {
    console.log('Fetching all Pals with pagination...');
    let palsList = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        try {
            console.log(`Fetching Pals page ${page}...`);
            const url = `${BASE_PALS_URL}&page=${page}`;
            const response = await fetchJson(url);
            const data = response.data || response || [];
            if (data.length === 0) {
                hasMore = false;
            } else {
                palsList = palsList.concat(data);
                page++;
                if (data.length < 100) {
                    hasMore = false;
                }
            }
        } catch (err) {
            console.error(`Error fetching Pals page ${page}:`, err);
            hasMore = false;
        }
    }
    console.log(`Found total of ${palsList.length} Pals.`);

    console.log('Fetching all breeding recipe posts from WordPress...');
    const nameToPostIdMap = {};
    let postsPage = 1;
    let hasMorePosts = true;

    while (hasMorePosts) {
        try {
            console.log(`Fetching breeding posts page ${postsPage}...`);
            const url = `${WP_BREEDING_POSTS_URL}&page=${postsPage}`;
            const posts = await fetchJson(url);
            if (posts.length === 0) {
                hasMorePosts = false;
            } else {
                posts.forEach(post => {
                    const rawName = post.title?.rendered || '';
                    // Decode HTML entities in title (e.g. &amp; or &#8217;) if any, and clean it
                    const nameClean = rawName.replace(/&amp;/g, '&').replace(/&#[0-9]+;/g, '').trim().toLowerCase();
                    const slug = post.slug ? post.slug.toLowerCase().trim() : '';

                    if (nameClean) {
                        nameToPostIdMap[nameClean] = post.id;
                    }
                    if (slug) {
                        nameToPostIdMap[slug] = post.id;
                    }
                });
                postsPage++;
                if (posts.length < 100) {
                    hasMorePosts = false;
                }
            }
        } catch (err) {
            console.error(`Error fetching breeding posts page ${postsPage}:`, err);
            hasMorePosts = false;
        }
    }
    console.log(`Successfully mapped WordPress breeding post IDs.`);

    const breedingMap = {}; // parent1_name + " | " + parent2_name => offspring (name, id, image_url)
    const targetMap = {};   // target_pal_name => parent combinations

    // Initialize self-breeding combinations for ALL Pals
    palsList.forEach(pal => {
        const selfPair = [
            { name: pal.name, internal_id: pal.internal_id, image_url: pal.image_url },
            { name: pal.name, internal_id: pal.internal_id, image_url: pal.image_url }
        ];
        targetMap[pal.name] = [selfPair];

        const key = `${pal.name} | ${pal.name}`;
        breedingMap[key] = {
            id: pal.id,
            name: pal.name,
            internal_id: pal.internal_id,
            image_url: pal.image_url,
            element_types: pal.element_types
        };
    });

    console.log('Querying breeding combinations for each Pal...');
    const batchSize = 15;
    for (let i = 0; i < palsList.length; i += batchSize) {
        const batch = palsList.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(palsList.length / batchSize)}...`);

        await Promise.all(batch.map(async (pal) => {
            try {
                // Find WordPress breeding recipe post ID
                const nameKey = pal.name.toLowerCase().trim();
                const slugKey = pal.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                
                const postId = nameToPostIdMap[nameKey] || nameToPostIdMap[slugKey] || pal.id;

                const recipe = await fetchJson(`${BREEDING_BASE_URL}${postId}`);
                if (recipe && recipe.breeding_parents) {
                    const apiCombos = recipe.breeding_parents.map(pair => {
                        return [
                            { name: pair[0].name, internal_id: pair[0].internal_id, image_url: pair[0].image_url },
                            { name: pair[1].name, internal_id: pair[1].internal_id, image_url: pair[1].image_url }
                        ];
                    });

                    // Merge API combos, preserving the self-combo
                    targetMap[pal.name] = (targetMap[pal.name] || []).concat(apiCombos);

                    // Build reverse mapping (parents => offspring)
                    recipe.breeding_parents.forEach(pair => {
                        if (pair.length === 2) {
                            const p1 = pair[0].name;
                            const p2 = pair[1].name;
                            const key1 = `${p1} | ${p2}`;
                            const key2 = `${p2} | ${p1}`;
                            
                            const offspringInfo = {
                                id: pal.id,
                                name: pal.name,
                                internal_id: pal.internal_id,
                                image_url: pal.image_url,
                                element_types: pal.element_types
                            };

                            breedingMap[key1] = offspringInfo;
                            breedingMap[key2] = offspringInfo;
                        }
                    });
                }
            } catch (err) {
                // Ignore missing recipes
            }
        }));

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 80));
    }

    const outputData = {
        pals: palsList.map(p => ({
            id: p.id,
            name: p.name,
            internal_id: p.internal_id,
            image_url: p.image_url,
            element_types: p.element_types
        })),
        parentToOffspring: breedingMap,
        offspringToParents: targetMap
    };

    const targetPath = path.join(__dirname, '..', 'public', 'assets', 'pals', 'breeding_data.json');
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(outputData, null, 2), 'utf-8');

    console.log(`Successfully generated breeding data JSON with ${outputData.pals.length} Pals.`);
    console.log(`Saved to ${targetPath}`);
}

run();
