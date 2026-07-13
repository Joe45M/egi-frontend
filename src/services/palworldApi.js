/**
 * Palworld REST API Service
 */

const API_BASE_URL = 'https://api.elitegamerinsights.com/wp-json/palworld/v1';

async function fetchFromAPI(endpoint, options = {}) {
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (options.includeHeaders) {
            return {
                data,
                headers: {
                    total: parseInt(response.headers.get('X-WP-Total') || '0', 10),
                    totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '0', 10),
                }
            };
        }

        return data;
    } catch (error) {
        console.error(`API Error fetching Palworld ${endpoint}:`, error);
        throw error;
    }
}

export const palworldApi = {
    /**
     * Get Pals listing with filters
     */
    async getPals(params = {}) {
        const queryParams = new URLSearchParams();
        
        // Simple text params
        const keys = [
            'search', 'element', 'work', 'size', 'limit', 'page', 'order_by', 'order',
            'hp', 'hp_min', 'hp_max',
            'attack', 'attack_min', 'attack_max',
            'defense', 'defense_min', 'defense_max',
            'rarity', 'rarity_min', 'rarity_max',
            'run_speed', 'run_speed_min', 'run_speed_max',
            'ride_sprint_speed', 'ride_sprint_speed_min', 'ride_sprint_speed_max',
            'stamina', 'stamina_min', 'stamina_max',
            'food_amount', 'food_amount_min', 'food_amount_max'
        ];

        keys.forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.append(key, params[key].toString());
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/pals${queryString ? `?${queryString}` : ''}`;
        return fetchFromAPI(endpoint, { includeHeaders: true });
    },

    /**
     * Get a single Pal by name slug or numeric ID.
     * The /pals/{id} endpoint does not exist, so we use the search param.
     */
    async getPalById(idOrName) {
        const isNumericId = /^\d+$/.test(String(idOrName));

        if (!isNumericId) {
            // Slug-based lookup: search by name
            const nameDecoded = decodeURIComponent(String(idOrName)).replace(/-/g, ' ');
            const response = await this.getPals({ search: nameDecoded, limit: 10 });
            const pals = response.data || [];
            const pal = pals.find(
                p => p.name.toLowerCase() === nameDecoded.toLowerCase()
            ) || pals[0];
            if (pal) return pal;
            throw new Error(`Pal not found with name: ${idOrName}`);
        }

        // Legacy numeric ID fallback: search across all pals
        // (the /pals/{id} REST endpoint does not exist)
        const response = await this.getPals({ limit: 500 });
        const pals = response.data || [];
        const pal = pals.find(p => p.id === parseInt(idOrName, 10));
        if (pal) return pal;
        throw new Error(`Pal not found with ID: ${idOrName}`);
    },

    /**
     * Get Technologies listing with filters
     */
    async getTech(params = {}) {
        const queryParams = new URLSearchParams();

        const keys = [
            'search', 'level', 'level_min', 'level_max', 'type',
            'cost', 'cost_min', 'cost_max', 'limit', 'page', 'order_by', 'order'
        ];

        keys.forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.append(key, params[key].toString());
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/tech${queryString ? `?${queryString}` : ''}`;
        return fetchFromAPI(endpoint, { includeHeaders: true });
    },

    /**
     * Get Breeding Recipes for a Pal by ID or name
     */
    async getBreedingRecipe(id, name = null) {
        if (name) {
            try {
                // Slugify the name to match the breeding recipe post slug (e.g. "Reptyro Cryst" -> "reptyro-cryst")
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                const response = await fetch(`https://api.elitegamerinsights.com/wp-json/wp/v2/breeding?slug=${slug}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        return fetchFromAPI(`/breeding/${data[0].id}`);
                    }
                }
            } catch (err) {
                console.error(`Error resolving breeding recipe post by slug:`, err);
            }
        }
        return fetchFromAPI(`/breeding/${id}`);
    }
};
