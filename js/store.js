// store.js - localStorage management for Attyre

const ITEMS_KEY = 'attyre_items';
const COLORBLIND_KEY = 'attyre_colorblind';
const DARK_MODE_KEY = 'attyre_dark_mode';
const SAVED_OUTFITS_KEY = 'attyre_saved_outfits';
const OUTFIT_DATES_KEY = 'attyre_outfit_dates';

/**
 * Retrieves all items from storage, handling both compressed and uncompressed data.
 * @returns {Array<Object>} Array of items, or empty array on error
 */
export function getItems() {
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    if (!data) return [];
    const decompressed = LZString.decompress(data);
    return decompressed !== null ? JSON.parse(decompressed) : JSON.parse(data); // Fallback for uncompressed data
  } catch (e) {
    console.error('Failed to get items from storage:', e);
    return [];
  }
}

/**
 * Saves items to storage with LZString compression.
 * @param {Array<Object>} items - Items to save
 * @throws {Error} If storage quota is exceeded
 */
export function saveItems(items) {
  try {
    localStorage.setItem(ITEMS_KEY, LZString.compress(JSON.stringify(items)));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      const error = new Error('Storage quota exceeded. Please delete some items or clear your browser data.');
      error.code = 'QUOTA_EXCEEDED';
      throw error;
    }
    console.error('Failed to save items:', e);
  }
}

/**
 * Creates and saves a new item to storage.
 * @param {Object} itemData - Item data (id and createdAt are auto-generated)
 * @returns {Object} The created item with id and createdAt
 * @throws {Error} If storage quota is exceeded
 */
export function addItem(itemData) {
  const items = getItems();
  const newItem = {
    id: crypto.randomUUID(),
    ...itemData,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveItems(items);
  return newItem;
}

/**
 * Updates a specific item in storage.
 * @param {string} id - Item ID to update
 * @param {Object} changes - Partial item data to merge
 * @returns {Object|null} Updated item, or null if not found
 * @throws {Error} If storage quota is exceeded
 */
export function updateItem(id, changes) {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;

  items[index] = { ...items[index], ...changes };
  saveItems(items);
  return items[index];
}

/**
 * Increments the usage counter for an item (wear count).
 * @param {string} id - Item ID to increment
 * @throws {Error} If storage quota is exceeded
 */
export function incrementItemUsage(id) {
  const item = getItemById(id);
  if (item) {
    const usage = (item.usage || 0) + 1;
    updateItem(id, { usage });
  }
}

/**
 * Deletes an item from storage.
 * @param {string} id - Item ID to delete
 * @throws {Error} If storage quota is exceeded
 */
export function deleteItem(id) {
  const items = getItems();
  const filtered = items.filter(item => item.id !== id);
  saveItems(filtered);
}

/**
 * Retrieves a single item by ID.
 * @param {string} id - Item ID to find
 * @returns {Object|null} Item if found, null otherwise
 */
export function getItemById(id) {
  const items = getItems();
  return items.find(item => item.id === id) || null;
}

/**
 * Checks if colorblind mode is enabled (legacy).
 * @deprecated Use isAccessibilityMode() instead
 * @returns {boolean}
 */
export function isColorblind() {
  const value = localStorage.getItem(COLORBLIND_KEY);
  return value === 'true';
}

/**
 * Sets colorblind mode (legacy).
 * @deprecated Use setAccessibilityMode() instead
 * @param {boolean} bool - Enable/disable
 */
export function setColorblind(bool) {
  localStorage.setItem(COLORBLIND_KEY, bool ? 'true' : 'false');
}

/**
 * Exports all items as a JSON string.
 * @returns {string} JSON-serialized items array
 */
export function exportJSON() {
  const items = getItems();
  return JSON.stringify(items, null, 2);
}

/**
 * Imports items from a JSON string with validation.
 * @param {string} jsonString - JSON string containing items array
 * @returns {number} Count of imported items
 * @throws {Error} If JSON is invalid or items are malformed
 * @throws {Error} If storage quota is exceeded
 */
export function importJSON(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid JSON format');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Import data must be an array of items');
  }

  // Validate required fields for each item
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item.id || typeof item.id !== 'string') {
      throw new Error(`Item ${i}: missing or invalid id`);
    }
    if (!item.name || typeof item.name !== 'string') {
      throw new Error(`Item ${i}: missing or invalid name`);
    }
    if (!item.category || typeof item.category !== 'string') {
      throw new Error(`Item ${i}: missing or invalid category`);
    }
    if (!item.createdAt || typeof item.createdAt !== 'string') {
      throw new Error(`Item ${i}: missing or invalid createdAt timestamp`);
    }
  }

  saveItems(parsed);
  return parsed.length;
}

// Dark mode

/**
 * Checks if dark mode is enabled.
 * @returns {boolean}
 */
export function isDarkMode() {
  const value = localStorage.getItem(DARK_MODE_KEY);
  return value === 'true';
}

/**
 * Enables or disables dark mode.
 * @param {boolean} bool - Enable/disable dark mode
 */
export function setDarkMode(bool) {
  localStorage.setItem(DARK_MODE_KEY, bool ? 'true' : 'false');
}

// Accessibility mode (high-contrast, colorblind-friendly)
const ACCESSIBILITY_KEY = 'attyre_accessibility';

/**
 * Checks if accessibility mode (high-contrast) is enabled.
 * @returns {boolean}
 */
export function isAccessibilityMode() {
  const value = localStorage.getItem(ACCESSIBILITY_KEY);
  return value === 'true';
}

/**
 * Enables or disables accessibility mode.
 * @param {boolean} bool - Enable/disable accessibility mode
 */
export function setAccessibilityMode(bool) {
  localStorage.setItem(ACCESSIBILITY_KEY, bool ? 'true' : 'false');
}

// Saved outfits

/**
 * Retrieves all saved outfit combinations.
 * @returns {Array<Object>} Array of saved outfits
 */
export function getSavedOutfits() {
  try {
    const data = localStorage.getItem(SAVED_OUTFITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load saved outfits:', e);
    return [];
  }
}

/**
 * Saves a new outfit combination.
 * @param {Array<string>} itemIds - Item IDs to include in outfit
 * @param {string} [name='Unnamed Outfit'] - Display name for outfit
 * @returns {Object} The created outfit with id and createdAt
 * @throws {Error} If storage quota is exceeded
 */
export function saveOutfit(itemIds, name = 'Unnamed Outfit') {
  const outfits = getSavedOutfits();
  const newOutfit = {
    id: crypto.randomUUID(),
    name,
    itemIds,
    createdAt: new Date().toISOString(),
  };
  outfits.push(newOutfit);
  try {
    localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(outfits));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Cannot save outfit.');
    }
    throw e;
  }
  return newOutfit;
}

/**
 * Deletes a saved outfit by ID.
 * @param {string} id - Outfit ID to delete
 * @throws {Error} If storage quota is exceeded
 */
export function deleteSavedOutfit(id) {
  const outfits = getSavedOutfits();
  const filtered = outfits.filter(outfit => outfit.id !== id);
  try {
    localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(filtered));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Cannot delete outfit.');
    }
    throw e;
  }
}

// Outfit dates (for calendar)

/**
 * Retrieves all outfit dates and their assigned items.
 * @returns {Object} Object mapping date strings (YYYY-MM-DD) to item ID arrays
 */
export function getOutfitDates() {
  try {
    const data = localStorage.getItem(OUTFIT_DATES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load outfit dates:', e);
    return {};
  }
}

/**
 * Saves an outfit assignment for a specific date.
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {Array<string>} itemIds - Item IDs assigned to this date
 * @throws {Error} If storage quota is exceeded
 */
export function saveOutfitDate(date, itemIds) {
  const dates = getOutfitDates();
  dates[date] = itemIds;
  try {
    localStorage.setItem(OUTFIT_DATES_KEY, JSON.stringify(dates));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Cannot save outfit date.');
    }
    throw e;
  }
}

/**
 * Retrieves the outfit assigned to a specific date.
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Array<string>|null} Array of item IDs, or null if no outfit assigned
 */
export function getOutfitForDate(date) {
  const dates = getOutfitDates();
  return dates[date] || null;
}

