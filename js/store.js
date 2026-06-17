// store.js - localStorage management for Attyre

const ITEMS_KEY = 'attyre_items';
const DARK_MODE_KEY = 'attyre_dark_mode';
const SAVED_OUTFITS_KEY = 'attyre_saved_outfits';
const OUTFIT_DATES_KEY = 'attyre_outfit_dates';
const ITEM_ORDER_KEY = 'attyre_item_order';

/**
 * Retrieves all items from storage, handling both compressed and uncompressed data.
 * @returns {Array<Object>} Array of items, or empty array on error
 */
export function getItems() {
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    if (!data) return [];
    const decompressed = LZString.decompress(data);
    if (decompressed !== null) return JSON.parse(decompressed);
    // Legacy path: data stored before compression was introduced
    try {
      return JSON.parse(data);
    } catch {
      console.error('Storage data is corrupted (neither compressed nor valid JSON). Items reset.');
      return [];
    }
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
 */
export function addItem(itemData) {
  const items = getItems();
  const newItem = { id: crypto.randomUUID(), ...itemData, createdAt: new Date().toISOString() };
  items.push(newItem);
  saveItems(items);
  return newItem;
}

/**
 * Updates a specific item in storage.
 * @param {string} id - Item ID to update
 * @param {Object} changes - Partial item data to merge
 * @returns {Object|null} Updated item, or null if not found
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
 * Increments the usage counter for an item and marks it as worn today (dirty).
 * @param {string} id - Item ID
 */
export function incrementItemUsage(id) {
  const item = getItemById(id);
  if (item) {
    const today = new Date().toISOString().slice(0, 10);
    updateItem(id, { usage: (item.usage || 0) + 1, lastWorn: today, laundryStatus: 'dirty' });
  }
}

/**
 * Sets an item's laundry status to clean.
 * @param {string} id - Item ID
 */
export function markItemClean(id) {
  updateItem(id, { laundryStatus: 'clean' });
}

/**
 * Deletes an item from storage.
 * @param {string} id - Item ID to delete
 */
export function deleteItem(id) {
  const items = getItems();
  saveItems(items.filter(item => item.id !== id));
}

/**
 * Retrieves a single item by ID.
 * @param {string} id - Item ID to find
 * @returns {Object|null}
 */
export function getItemById(id) {
  return getItems().find(item => item.id === id) || null;
}

/**
 * Exports all items as a JSON string.
 */
export function exportJSON() {
  return JSON.stringify(getItems(), null, 2);
}

/**
 * Imports items from a JSON string, replacing existing items.
 * @param {string} jsonString
 * @returns {number} Count of imported items
 */
const VALID_CATEGORIES = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'];

export function importJSON(jsonString) {
  let parsed;
  try { parsed = JSON.parse(jsonString); } catch (e) { throw new Error('Invalid JSON format'); }
  if (!Array.isArray(parsed)) throw new Error('Import data must be an array of items');
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item.id || typeof item.id !== 'string') throw new Error(`Item ${i}: missing or invalid id`);
    if (!item.name || typeof item.name !== 'string') throw new Error(`Item ${i}: missing or invalid name`);
    if (!item.category || !VALID_CATEGORIES.includes(item.category)) throw new Error(`Item ${i}: category must be one of ${VALID_CATEGORIES.join(', ')}`);
    if (!item.createdAt || typeof item.createdAt !== 'string') throw new Error(`Item ${i}: missing or invalid createdAt timestamp`);
  }
  saveItems(parsed);
  return parsed.length;
}

export function isDarkMode() { return localStorage.getItem(DARK_MODE_KEY) === 'true'; }
export function setDarkMode(bool) { localStorage.setItem(DARK_MODE_KEY, bool ? 'true' : 'false'); }

const ACCESSIBILITY_KEY = 'attyre_accessibility';
export function isAccessibilityMode() { return localStorage.getItem(ACCESSIBILITY_KEY) === 'true'; }
export function setAccessibilityMode(bool) { localStorage.setItem(ACCESSIBILITY_KEY, bool ? 'true' : 'false'); }

// Saved outfits

export function getSavedOutfits() {
  try {
    const data = localStorage.getItem(SAVED_OUTFITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load saved outfits:', e);
    return [];
  }
}

export function saveOutfit(itemIds, name = 'Unnamed Outfit') {
  const outfits = getSavedOutfits();
  const newOutfit = { id: crypto.randomUUID(), name, itemIds, createdAt: new Date().toISOString() };
  outfits.push(newOutfit);
  try {
    localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(outfits));
  } catch (e) {
    if (e.name === 'QuotaExceededError') throw new Error('Storage quota exceeded. Cannot save outfit.');
    throw e;
  }
  return newOutfit;
}

export function deleteSavedOutfit(id) {
  const filtered = getSavedOutfits().filter(o => o.id !== id);
  try {
    localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(filtered));
  } catch (e) {
    if (e.name === 'QuotaExceededError') throw new Error('Storage quota exceeded.');
    throw e;
  }
}

// Outfit dates (calendar)

export function getOutfitDates() {
  try {
    const data = localStorage.getItem(OUTFIT_DATES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load outfit dates:', e);
    return {};
  }
}

export function saveOutfitDate(date, itemIds) {
  const dates = getOutfitDates();
  dates[date] = itemIds;
  try {
    localStorage.setItem(OUTFIT_DATES_KEY, JSON.stringify(dates));
  } catch (e) {
    if (e.name === 'QuotaExceededError') throw new Error('Storage quota exceeded. Cannot save outfit date.');
    throw e;
  }
}

/**
 * Deletes the outfit assignment for a specific date.
 * @param {string} date - Date string in YYYY-MM-DD format
 */
export function deleteOutfitDate(date) {
  const dates = getOutfitDates();
  delete dates[date];
  try {
    localStorage.setItem(OUTFIT_DATES_KEY, JSON.stringify(dates));
  } catch (e) {
    if (e.name === 'QuotaExceededError') throw new Error('Storage quota exceeded.');
    throw e;
  }
}

export function getOutfitForDate(date) {
  return getOutfitDates()[date] || null;
}

// Item ordering (manual drag-and-drop order)

export function getItemOrder() {
  try {
    const data = localStorage.getItem(ITEM_ORDER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function saveItemOrder(orderedIds) {
  try {
    localStorage.setItem(ITEM_ORDER_KEY, JSON.stringify(orderedIds));
  } catch (e) {
    console.error('Failed to save item order:', e);
  }
}
