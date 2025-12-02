/**
 * Readlist utility functions for managing saved post slugs in localStorage
 * Stores items as { slug, postType } objects for better routing
 */

const READLIST_STORAGE_KEY = 'readlist';

/**
 * Get all saved post items from localStorage
 * @returns {Array<{slug: string, postType?: string}>} Array of post items
 */
export function getReadlist() {
  try {
    const stored = localStorage.getItem(READLIST_STORAGE_KEY);
    if (!stored) return [];
    const items = JSON.parse(stored);
    
    // Handle migration from old format (array of strings) to new format (array of objects)
    if (Array.isArray(items)) {
      if (items.length > 0 && typeof items[0] === 'string') {
        // Old format - convert to new format
        return items.map(slug => ({ slug, postType: 'games' })); // Default to 'games' for old entries
      }
      return items;
    }
    return [];
  } catch (error) {
    console.error('Error reading readlist from localStorage:', error);
    return [];
  }
}

/**
 * Get all saved post slugs from localStorage (for backward compatibility)
 * @returns {Array<string>} Array of post slugs
 */
export function getReadlistSlugs() {
  return getReadlist().map(item => item.slug);
}

/**
 * Add a post slug to the readlist
 * @param {string} slug - Post slug to add
 * @param {string} postType - Post type (e.g., 'games', 'culture')
 * @returns {boolean} True if added successfully, false if already exists
 */
export function addToReadlist(slug, postType = 'games') {
  if (!slug) return false;
  
  try {
    const readlist = getReadlist();
    if (readlist.some(item => item.slug === slug)) {
      return false; // Already in readlist
    }
    
    readlist.push({ slug, postType });
    localStorage.setItem(READLIST_STORAGE_KEY, JSON.stringify(readlist));
    return true;
  } catch (error) {
    console.error('Error adding to readlist:', error);
    return false;
  }
}

/**
 * Remove a post slug from the readlist
 * @param {string} slug - Post slug to remove
 * @returns {boolean} True if removed successfully, false if not found
 */
export function removeFromReadlist(slug) {
  if (!slug) return false;
  
  try {
    const readlist = getReadlist();
    const index = readlist.findIndex(item => item.slug === slug);
    if (index === -1) {
      return false; // Not in readlist
    }
    
    readlist.splice(index, 1);
    localStorage.setItem(READLIST_STORAGE_KEY, JSON.stringify(readlist));
    return true;
  } catch (error) {
    console.error('Error removing from readlist:', error);
    return false;
  }
}

/**
 * Check if a post slug is in the readlist
 * @param {string} slug - Post slug to check
 * @returns {boolean} True if slug is in readlist
 */
export function isInReadlist(slug) {
  if (!slug) return false;
  const readlist = getReadlist();
  return readlist.some(item => item.slug === slug);
}

/**
 * Clear the entire readlist
 */
export function clearReadlist() {
  try {
    localStorage.removeItem(READLIST_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing readlist:', error);
  }
}

