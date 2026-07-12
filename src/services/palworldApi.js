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
     * Get a single Pal by ID or internal ID / name
     */
    async getPalById(id) {
        try {
            // Attempt standard single item fetch
            return await fetchFromAPI(`/pals/${id}`);
        } catch (error) {
            console.warn(`Direct fetch for Pal ID ${id} failed, trying search fallback...`, error);
            // Fallback: search/filter pals list
            const response = await this.getPals({ limit: 100 });
            const pals = response.data || [];
            const pal = pals.find(p => p.id === parseInt(id, 10) || p.name.toLowerCase() === id.toString().toLowerCase());
            if (pal) {
                return pal;
            }
            throw new Error(`Pal not found with ID/Name: ${id}`);
        }
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
    }
};
