// store.js — wardrobe storage backed by IndexedDB via @aetherAssembly/core
// Settings, saved outfits, outfit dates, and item order stay in localStorage (small data).

import { IDBAdapter } from '@aetherAssembly/core';

const ITEMS_STORE = 'wardrobe-items';
const DB_NAME = 'attyre';

let _adapter = null;
function getAdapter() {
  if (!_adapter) _adapter = new IDBAdapter(DB_NAME, ITEMS_STORE);
  return _adapter;
}

// For test injection only — do not call in production code.
export function _setAdapterForTest(adapter) {
  _adapter = adapter;
  _initPromise = null;
}

// ── One-time migration from legacy LZString localStorage ────────────────────

const MIGRATION_KEY = 'attyre_idb_migrated_v1';
const LEGACY_ITEMS_KEY = 'attyre_items';

async function migrateFromLocalStorage() {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(MIGRATION_KEY)) return;

  const raw = localStorage.getItem(LEGACY_ITEMS_KEY);
  if (raw) {
    try {
      let items;
      if (typeof LZString !== 'undefined') {
        const decompressed = LZString.decompress(raw);
        items = decompressed ? JSON.parse(decompressed) : JSON.parse(raw);
      } else {
        items = JSON.parse(raw);
      }
      if (Array.isArray(items)) {
        await Promise.all(items.map(item => getAdapter().set(item.id, item)));
      }
    } catch (e) {
      console.error('[Attyre] Migration from localStorage failed:', e);
    }
    localStorage.removeItem(LEGACY_ITEMS_KEY);
  }

  localStorage.setItem(MIGRATION_KEY, '1');
}

// Run migration once at module load; pages await initStore() before first use.
let _initPromise = null;

export function initStore() {
  if (!_initPromise) _initPromise = migrateFromLocalStorage();
  return _initPromise;
}

// ── Wardrobe items (IDB, async) ─────────────────────────────────────────────

export async function getItems() {
  await initStore();
  const keys = await getAdapter().keys();
  const items = await Promise.all(keys.map(k => getAdapter().get(k)));
  return items.filter(Boolean);
}

export async function saveItems(items) {
  await initStore();
  await getAdapter().clear();
  await Promise.all(items.map(item => getAdapter().set(item.id, item)));
}

export async function addItem(itemData) {
  await initStore();
  const newItem = { id: crypto.randomUUID(), ...itemData, createdAt: new Date().toISOString() };
  await getAdapter().set(newItem.id, newItem);
  return newItem;
}

export async function updateItem(id, changes) {
  await initStore();
  const existing = await getAdapter().get(id);
  if (!existing) return null;
  const updated = { ...existing, ...changes };
  await getAdapter().set(id, updated);
  return updated;
}

export async function deleteItem(id) {
  await initStore();
  await getAdapter().delete(id);
}

export async function getItemById(id) {
  await initStore();
  return getAdapter().get(id);
}

export async function incrementItemUsage(id) {
  await initStore();
  const item = await getItemById(id);
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
