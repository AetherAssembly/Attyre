// store.js - localStorage management for Attyre

const ITEMS_KEY = 'attyre_items';
const COLORBLIND_KEY = 'attyre_colorblind';
const DARK_MODE_KEY = 'attyre_dark_mode';
const SAVED_OUTFITS_KEY = 'attyre_saved_outfits';
const OUTFIT_DATES_KEY = 'attyre_outfit_dates';

export function getItems() {
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    if (!data) return [];
    const decompressed = LZString.decompress(data);
    return decompressed !== null ? JSON.parse(decompressed) : JSON.parse(data); // Fallback for uncompressed data
  } catch (e) {
    console.error('Failed to get items:', e);
    return [];
  }
}

export function saveItems(items) {
  try {
    localStorage.setItem(ITEMS_KEY, LZString.compress(JSON.stringify(items)));
  } catch (e) {
    if (e.name === 'QuotaExceededError') throw e;
    console.error('Failed to save items:', e);
  }
}

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

export function updateItem(id, changes) {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...changes };
  saveItems(items);
  return items[index];
}

export function incrementItemUsage(id) {
  const item = getItemById(id);
  if (item) {
    const usage = (item.usage || 0) + 1;
    updateItem(id, { usage });
  }
}

export function deleteItem(id) {
  const items = getItems();
  const filtered = items.filter(item => item.id !== id);
  saveItems(filtered);
}

export function getItemById(id) {
  const items = getItems();
  return items.find(item => item.id === id) || null;
}

export function isColorblind() {
  const value = localStorage.getItem(COLORBLIND_KEY);
  return value === 'true';
}

export function setColorblind(bool) {
  localStorage.setItem(COLORBLIND_KEY, bool ? 'true' : 'false');
}

export function exportJSON() {
  const items = getItems();
  return JSON.stringify(items, null, 2);
}

export function importJSON(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid JSON');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Expected an array of items');
  }

  // Basic validation — check that each item has required fields
  for (const item of parsed) {
    if (!item.id || !item.name || !item.category || !item.createdAt) {
      throw new Error('Invalid item format: missing required fields');
    }
  }

  saveItems(parsed);
  return parsed.length;
}

// Dark mode
export function isDarkMode() {
  const value = localStorage.getItem(DARK_MODE_KEY);
  return value === 'true';
}

export function setDarkMode(bool) {
  localStorage.setItem(DARK_MODE_KEY, bool ? 'true' : 'false');
}

// Accessibility mode (colorblind-friendly)
const ACCESSIBILITY_KEY = 'attyre_accessibility';

export function isAccessibilityMode() {
  const value = localStorage.getItem(ACCESSIBILITY_KEY);
  return value === 'true';
}

export function setAccessibilityMode(bool) {
  localStorage.setItem(ACCESSIBILITY_KEY, bool ? 'true' : 'false');
}

// Saved outfits
export function getSavedOutfits() {
  try {
    const data = localStorage.getItem(SAVED_OUTFITS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to get saved outfits:', e);
    return [];
  }
}

export function saveOutfit(itemIds, name = 'Unnamed Outfit') {
  const outfits = getSavedOutfits();
  const newOutfit = {
    id: crypto.randomUUID(),
    name,
    itemIds,
    createdAt: new Date().toISOString(),
  };
  outfits.push(newOutfit);
  localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(outfits));
  return newOutfit;
}

export function deleteSavedOutfit(id) {
  const outfits = getSavedOutfits();
  const filtered = outfits.filter(outfit => outfit.id !== id);
  localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(filtered));
}

// Outfit dates (for calendar)
export function getOutfitDates() {
  try {
    const data = localStorage.getItem(OUTFIT_DATES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to get outfit dates:', e);
    return {};
  }
}

export function saveOutfitDate(date, itemIds) {
  const dates = getOutfitDates();
  dates[date] = itemIds;
  localStorage.setItem(OUTFIT_DATES_KEY, JSON.stringify(dates));
}

export function getOutfitForDate(date) {
  const dates = getOutfitDates();
  return dates[date] || null;
}

