/**
 * WordPress REST API Service
 * Handles all interactions with the WordPress REST API at api.elitegamerinsights.com
 */

const API_BASE_URL = 'https://api.elitegamerinsights.com/wp-json/wp/v2';

/**
 * Generic fetch function with error handling
 */
async function fetchFromAPI(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return data with headers for pagination info
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
    console.error(`API Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get featured image URL from media ID
 */
async function getFeaturedImageUrl(mediaId) {
  if (!mediaId || mediaId === 0) {
    return null;
  }

  try {
    const media = await fetchFromAPI(`/media/${mediaId}`);
    return media?.source_url || null;
  } catch (error) {
    console.error(`Error fetching featured image ${mediaId}:`, error);
    return null;
  }
}

/**
 * Transform WordPress post data to match component expectations
 */
function transformPost(post) {
  return {
    id: post.id,
    title: post.title?.rendered || post.title || '',
    date: post.date || post.modified || '',
    slug: post.slug || '',
    excerpt: post.excerpt?.rendered || post.excerpt || '',
    content: post.content?.rendered || post.content || '',
    link: post.link || '',
    featuredMediaId: post.featured_media || 0,
    categories: post.categories || [],
    tags: post.tags || [],
    author: post.author || null,
    image: null, // Will be populated by getFeaturedImageUrl
  };
}

/**
 * Posts API
 */
export const postsApi = {
  /**
   * Get all posts with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.perPage - Posts per page (default: 10)
   * @param {number} params.category - Category ID to filter by
   * @param {number} params.tag - Tag ID to filter by
   * @param {string} params.search - Search query
   * @param {string} params.orderBy - Order by field (date, title, etc.)
   * @param {string} params.order - Order direction (asc, desc)
   * @param {boolean} params.includeImages - Whether to fetch featured images (default: true)
   */
  async getAll(params = {}) {
    const {
      page = 1,
      perPage = 10,
      category = null,
      tag = null,
      search = null,
      orderBy = 'date',
      order = 'desc',
      includeImages = true,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      orderby: orderBy,
      order: order,
      _embed: includeImages ? '1' : '0', // Include embedded media data
    });

    if (category) {
      queryParams.append('categories', category.toString());
    }

    if (tag) {
      queryParams.append('tags', tag.toString());
    }

    if (search) {
      queryParams.append('search', search);
    }

    try {
      const posts = await fetchFromAPI(`/posts?${queryParams.toString()}`);
      
      const transformedPosts = posts.map(transformPost);

      // Fetch featured images if requested
      if (includeImages) {
        const postsWithImages = await Promise.all(
          transformedPosts.map(async (post) => {
            // Try to get image from _embedded first (faster)
            const originalPost = posts.find(p => p.id === post.id);
            if (originalPost?._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
              post.image = originalPost._embedded['wp:featuredmedia'][0].source_url;
            } else if (post.featuredMediaId) {
              post.image = await getFeaturedImageUrl(post.featuredMediaId);
            }
            return post;
          })
        );
        return postsWithImages;
      }

      return transformedPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  /**
   * Get posts from a specific post type
   * @param {string} postType - Post type name (e.g., 'post', 'page', or custom post type)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.perPage - Posts per page (default: 10)
   * @param {number} params.category - Category ID to filter by
   * @param {number} params.tag - Tag ID to filter by
   * @param {string} params.search - Search query
   * @param {string} params.orderBy - Order by field (date, title, etc.)
   * @param {string} params.order - Order direction (asc, desc)
   * @param {boolean} params.includeImages - Whether to fetch featured images (default: true)
   */
  async getByPostType(postType, params = {}) {
    const {
      page = 1,
      perPage = 10,
      category = null,
      tag = null,
      search = null,
      orderBy = 'date',
      order = 'desc',
      includeImages = true,
      taxonomyFilter = null, // Object with taxonomy name as key and term ID(s) as value, e.g., { games: 5 } or { games: [5, 10] }
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      orderby: orderBy,
      order: order,
      _embed: includeImages ? '1' : '0', // Include embedded media data
    });

    if (category) {
      queryParams.append('categories', category.toString());
    }

    if (tag) {
      queryParams.append('tags', tag.toString());
    }

    if (search) {
      queryParams.append('search', search);
    }

    // Support custom taxonomy filtering
    if (taxonomyFilter && typeof taxonomyFilter === 'object') {
      Object.keys(taxonomyFilter).forEach(taxonomy => {
        const termIds = taxonomyFilter[taxonomy];
        if (termIds) {
          // Support both single ID and array of IDs
          const ids = Array.isArray(termIds) ? termIds.join(',') : termIds.toString();
          queryParams.append(taxonomy, ids);
        }
      });
    }

    try {
      // WordPress REST API endpoint for custom post types: /wp/v2/{post_type}
      const result = await fetchFromAPI(`/${postType}?${queryParams.toString()}`, { includeHeaders: true });
      const posts = result.data || result; // Handle both with and without headers
      const pagination = result.headers || null;
      
      const transformedPosts = posts.map(transformPost);

      // Fetch featured images if requested
      if (includeImages) {
        const postsWithImages = await Promise.all(
          transformedPosts.map(async (post) => {
            // Try to get image from _embedded first (faster)
            const originalPost = posts.find(p => p.id === post.id);
            if (originalPost?._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
              post.image = originalPost._embedded['wp:featuredmedia'][0].source_url;
            } else if (post.featuredMediaId) {
              post.image = await getFeaturedImageUrl(post.featuredMediaId);
            }
            return post;
          })
        );
        
        // Return posts with pagination if available
        if (pagination) {
          return {
            posts: postsWithImages,
            pagination: {
              total: pagination.total,
              totalPages: pagination.totalPages,
              currentPage: page,
              perPage: perPage
            }
          };
        }
        
        return postsWithImages;
      }

      // Return posts with pagination if available
      if (pagination) {
        return {
          posts: transformedPosts,
          pagination: {
            total: pagination.total,
            totalPages: pagination.totalPages,
            currentPage: page,
            perPage: perPage
          }
        };
      }

      return transformedPosts;
    } catch (error) {
      console.error(`Error fetching posts from post type "${postType}":`, error);
      throw error;
    }
  },

  /**
   * Get a single item by ID from a specific post type
   * @param {string} postType - Post type name (e.g., 'post', 'page', or custom post type)
   * @param {number} itemId - Item ID
   * @param {boolean} includeImage - Whether to fetch featured image (default: true)
   */
  async getByPostTypeAndId(postType, itemId, includeImage = true) {
    try {
      const item = await fetchFromAPI(`/${postType}/${itemId}?_embed=1`);
      const transformedItem = transformPost(item);

      if (includeImage) {
        if (item._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
          transformedItem.image = item._embedded['wp:featuredmedia'][0].source_url;
        } else if (transformedItem.featuredMediaId) {
          transformedItem.image = await getFeaturedImageUrl(transformedItem.featuredMediaId);
        }
      }

      return transformedItem;
    } catch (error) {
      console.error(`Error fetching ${postType} ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * Get a single item by slug from a specific post type
   * @param {string} postType - Post type name (e.g., 'post', 'page', or custom post type)
   * @param {string} slug - Item slug
   * @param {boolean} includeImage - Whether to fetch featured image (default: true)
   */
  async getByPostTypeAndSlug(postType, slug, includeImage = true) {
    try {
      // URL encode the slug to handle special characters
      const encodedSlug = encodeURIComponent(slug);
      const items = await fetchFromAPI(`/${postType}?slug=${encodedSlug}&_embed=1`);
      
      if (!items || items.length === 0) {
        throw new Error(`${postType} with slug "${slug}" not found`);
      }

      const item = items[0];
      const transformedItem = transformPost(item);

      // Extract author name from embedded data
      if (item._embedded?.author?.[0]?.name) {
        transformedItem.authorName = item._embedded.author[0].name;
      }

      if (includeImage) {
        if (item._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
          transformedItem.image = item._embedded['wp:featuredmedia'][0].source_url;
        } else if (transformedItem.featuredMediaId) {
          transformedItem.image = await getFeaturedImageUrl(transformedItem.featuredMediaId);
        }
      }

      return transformedItem;
    } catch (error) {
      console.error(`Error fetching ${postType} by slug "${slug}":`, error);
      throw error;
    }
  },

  /**
   * Get a single post by ID
   * @param {number} postId - Post ID
   * @param {boolean} includeImage - Whether to fetch featured image (default: true)
   */
  async getById(postId, includeImage = true) {
    try {
      const post = await fetchFromAPI(`/posts/${postId}?_embed=1`);
      const transformedPost = transformPost(post);

      if (includeImage) {
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
          transformedPost.image = post._embedded['wp:featuredmedia'][0].source_url;
        } else if (transformedPost.featuredMediaId) {
          transformedPost.image = await getFeaturedImageUrl(transformedPost.featuredMediaId);
        }
      }

      return transformedPost;
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Get a single post by slug
   * @param {string} slug - Post slug
   * @param {boolean} includeImage - Whether to fetch featured image (default: true)
   */
  async getBySlug(slug, includeImage = true) {
    try {
      // URL encode the slug to handle special characters
      const encodedSlug = encodeURIComponent(slug);
      const posts = await fetchFromAPI(`/posts?slug=${encodedSlug}&_embed=1`);
      
      if (!posts || posts.length === 0) {
        throw new Error(`Post with slug "${slug}" not found`);
      }

      const post = posts[0];
      const transformedPost = transformPost(post);

      // Extract author name from embedded data
      if (post._embedded?.author?.[0]?.name) {
        transformedPost.authorName = post._embedded.author[0].name;
      }

      if (includeImage) {
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
          transformedPost.image = post._embedded['wp:featuredmedia'][0].source_url;
        } else if (transformedPost.featuredMediaId) {
          transformedPost.image = await getFeaturedImageUrl(transformedPost.featuredMediaId);
        }
      }

      return transformedPost;
    } catch (error) {
      console.error(`Error fetching post by slug "${slug}":`, error);
      throw error;
    }
  },

  /**
   * Get related posts (by category or tags)
   * @param {number} postId - Current post ID
   * @param {number} limit - Maximum number of related posts (default: 4)
   */
  async getRelated(postId, limit = 4) {
    try {
      // First get the current post to get its categories and tags
      const currentPost = await fetchFromAPI(`/posts/${postId}`);
      
      const categories = currentPost.categories || [];

      // Build query to get posts with same categories or tags
      const queryParams = new URLSearchParams({
        per_page: (limit + 1).toString(), // +1 to exclude current post
        exclude: postId.toString(),
        _embed: '1',
      });

      if (categories.length > 0) {
        queryParams.append('categories', categories[0].toString());
      }

      const posts = await fetchFromAPI(`/posts?${queryParams.toString()}`);
      
      // Take only the limit and transform
      const relatedPosts = posts.slice(0, limit).map(post => {
        const transformed = transformPost(post);
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
          transformed.image = post._embedded['wp:featuredmedia'][0].source_url;
        }
        return transformed;
      });

      return relatedPosts;
    } catch (error) {
      console.error(`Error fetching related posts for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Get related posts of the same post type (by category or tags)
   * @param {string} postType - Post type name (e.g., 'post', 'page', or custom post type)
   * @param {number} postId - Current post ID
   * @param {number} limit - Maximum number of related posts (default: 4)
   */
  async getRelatedByPostType(postType, postId, limit = 4) {
    try {
      // First get the current post to get its categories and tags
      const currentPost = await fetchFromAPI(`/${postType}/${postId}`);
      
      const categories = currentPost.categories || [];

      // Build query to get posts with same categories or tags from the same post type
      const queryParams = new URLSearchParams({
        per_page: (limit + 1).toString(), // +1 to exclude current post
        exclude: postId.toString(),
        _embed: '1',
      });

      if (categories.length > 0) {
        queryParams.append('categories', categories[0].toString());
      }

      const posts = await fetchFromAPI(`/${postType}?${queryParams.toString()}`);
      
      // Filter out the current post and take only the limit
      const filteredPosts = posts.filter(post => post.id !== postId).slice(0, limit);
      
      // Transform posts
      const relatedPosts = filteredPosts.map(post => {
        const transformed = transformPost(post);
        if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
          transformed.image = post._embedded['wp:featuredmedia'][0].source_url;
        }
        return transformed;
      });

      return relatedPosts;
    } catch (error) {
      console.error(`Error fetching related posts for ${postType} ${postId}:`, error);
      throw error;
    }
  },
};

/**
 * Categories API
 */
export const categoriesApi = {
  /**
   * Get all categories
   */
  async getAll() {
    try {
      return await fetchFromAPI('/categories?per_page=100');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get a single category by ID
   */
  async getById(categoryId) {
    try {
      return await fetchFromAPI(`/categories/${categoryId}`);
    } catch (error) {
      console.error(`Error fetching category ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Get posts in a category
   */
  async getPosts(categoryId, params = {}) {
    return postsApi.getAll({ ...params, category: categoryId });
  },
};

/**
 * Tags API
 */
export const tagsApi = {
  /**
   * Get all tags
   */
  async getAll() {
    try {
      return await fetchFromAPI('/tags?per_page=100');
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  /**
   * Get a single tag by ID
   */
  async getById(tagId) {
    try {
      return await fetchFromAPI(`/tags/${tagId}`);
    } catch (error) {
      console.error(`Error fetching tag ${tagId}:`, error);
      throw error;
    }
  },

  /**
   * Get posts with a tag
   */
  async getPosts(tagId, params = {}) {
    return postsApi.getAll({ ...params, tag: tagId });
  },
};

/**
 * Media API
 */
export const mediaApi = {
  /**
   * Get media by ID
   */
  async getById(mediaId) {
    try {
      return await fetchFromAPI(`/media/${mediaId}`);
    } catch (error) {
      console.error(`Error fetching media ${mediaId}:`, error);
      throw error;
    }
  },

  /**
   * Get media URL from ID
   */
  async getUrl(mediaId) {
    try {
      const media = await fetchFromAPI(`/media/${mediaId}`);
      return media?.source_url || null;
    } catch (error) {
      console.error(`Error fetching media URL ${mediaId}:`, error);
      return null;
    }
  },
};

/**
 * Search API
 */
export const searchApi = {
  /**
   * Search posts
   * @param {string} query - Search query
   * @param {Object} params - Additional search parameters
   */
  async search(query, params = {}) {
    return postsApi.getAll({ ...params, search: query });
  },
};

/**
 * Taxonomies API
 */
export const taxonomiesApi = {
  /**
   * Get all terms from a taxonomy
   * @param {string} taxonomy - Taxonomy name (e.g., 'games', 'category', 'tag')
   * @param {Object} params - Query parameters
   * @param {number} params.perPage - Terms per page (default: 100)
   * @param {number} params.page - Page number (default: 1)
   */
  async getAll(taxonomy, params = {}) {
    const {
      perPage = 100,
      page = 1,
    } = params;

    const queryParams = new URLSearchParams({
      per_page: perPage.toString(),
      page: page.toString(),
    });

    try {
      return await fetchFromAPI(`/${taxonomy}?${queryParams.toString()}`);
    } catch (error) {
      console.error(`Error fetching taxonomy "${taxonomy}":`, error);
      throw error;
    }
  },

  /**
   * Get a single term by ID from a taxonomy
   * @param {string} taxonomy - Taxonomy name
   * @param {number} termId - Term ID
   */
  async getById(taxonomy, termId) {
    try {
      return await fetchFromAPI(`/${taxonomy}/${termId}`);
    } catch (error) {
      console.error(`Error fetching term ${termId} from taxonomy "${taxonomy}":`, error);
      throw error;
    }
  },

  /**
   * Get a single term by slug from a taxonomy
   * @param {string} taxonomy - Taxonomy name
   * @param {string} slug - Term slug
   */
  async getBySlug(taxonomy, slug) {
    try {
      const encodedSlug = encodeURIComponent(slug);
      const terms = await fetchFromAPI(`/${taxonomy}?slug=${encodedSlug}`);
      
      if (!terms || terms.length === 0) {
        throw new Error(`Term with slug "${slug}" not found in taxonomy "${taxonomy}"`);
      }
      
      return terms[0];
    } catch (error) {
      console.error(`Error fetching term by slug "${slug}" from taxonomy "${taxonomy}":`, error);
      throw error;
    }
  },
};

/**
 * Default export with all API modules
 */
const wordpressApi = {
  posts: postsApi,
  categories: categoriesApi,
  tags: tagsApi,
  media: mediaApi,
  search: searchApi,
  taxonomies: taxonomiesApi,
};

export default wordpressApi;
