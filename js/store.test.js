// store.test.js - Unit tests for localStorage operations
// Run with: node --test js/store.test.js

import test from 'node:test';
import assert from 'node:assert';

// Mock localStorage for Node environment
const storageMock = {
  data: {},
  getItem(key) {
    return this.data[key] ?? null;
  },
  setItem(key, value) {
    this.data[key] = String(value);
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
};

// Mock LZString for testing
global.LZString = {
  compress: (str) => `compressed:${str}`,
  decompress: (str) => str.startsWith('compressed:') ? str.slice(11) : null,
};

global.localStorage = storageMock;
global.crypto = { randomUUID: () => 'test-id-' + Math.random() };

// Import after mocks are set up
import * as store from './store.js';

test('getItems returns empty array when no data exists', () => {
  storageMock.clear();
  const items = store.getItems();
  assert.deepStrictEqual(items, []);
});

test('addItem creates and returns a new item with id and createdAt', () => {
  storageMock.clear();
  const item = store.addItem({ name: 'Test Shirt', category: 'top' });

  assert.ok(item.id);
  assert.strictEqual(item.name, 'Test Shirt');
  assert.strictEqual(item.category, 'top');
  assert.ok(item.createdAt);
});

test('saveItems and getItems round-trip correctly', () => {
  storageMock.clear();
  const testItems = [
    { id: '1', name: 'Shirt', category: 'top' },
    { id: '2', name: 'Pants', category: 'bottom' },
  ];
  store.saveItems(testItems);
  const retrieved = store.getItems();

  assert.strictEqual(retrieved.length, 2);
  assert.strictEqual(retrieved[0].name, 'Shirt');
  assert.strictEqual(retrieved[1].name, 'Pants');
});

test('getItemById returns null for non-existent item', () => {
  storageMock.clear();
  store.addItem({ name: 'Shirt', category: 'top' });
  const item = store.getItemById('nonexistent-id');

  assert.strictEqual(item, null);
});

test('updateItem modifies and returns updated item', () => {
  storageMock.clear();
  const newItem = store.addItem({ name: 'Shirt', category: 'top', color: 'blue' });
  const updated = store.updateItem(newItem.id, { color: 'red' });

  assert.strictEqual(updated.color, 'red');
  assert.strictEqual(updated.name, 'Shirt'); // Other fields unchanged
});

test('deleteItem removes an item', () => {
  storageMock.clear();
  const item = store.addItem({ name: 'Shirt', category: 'top' });
  store.deleteItem(item.id);
  const retrieved = store.getItemById(item.id);

  assert.strictEqual(retrieved, null);
});

test('incrementItemUsage increments usage counter', () => {
  storageMock.clear();
  const item = store.addItem({ name: 'Shirt', category: 'top' });

  store.incrementItemUsage(item.id);
  let updated = store.getItemById(item.id);
  assert.strictEqual(updated.usage, 1);

  store.incrementItemUsage(item.id);
  updated = store.getItemById(item.id);
  assert.strictEqual(updated.usage, 2);
});

test('exportJSON returns JSON string of items', () => {
  storageMock.clear();
  store.addItem({ name: 'Shirt', category: 'top' });
  const json = store.exportJSON();

  const parsed = JSON.parse(json);
  assert.ok(Array.isArray(parsed));
  assert.strictEqual(parsed[0].name, 'Shirt');
});

test('importJSON throws on invalid JSON', () => {
  assert.throws(
    () => store.importJSON('invalid json{'),
    /Invalid JSON format/
  );
});

test('importJSON throws on non-array data', () => {
  assert.throws(
    () => store.importJSON('{"not": "array"}'),
    /must be an array/
  );
});

test('importJSON throws on missing required fields', () => {
  const invalidItem = JSON.stringify([{ name: 'Shirt' }]); // missing id, category, createdAt
  assert.throws(
    () => store.importJSON(invalidItem),
    /missing or invalid/
  );
});

test('importJSON validates data types', () => {
  const invalidItem = JSON.stringify([
    { id: 123, name: 'Shirt', category: 'top', createdAt: '2026-04-26' }, // id should be string
  ]);
  assert.throws(
    () => store.importJSON(invalidItem),
    /invalid id/
  );
});

test('getDarkMode and setDarkMode work correctly', () => {
  storageMock.clear();
  store.setDarkMode(true);
  assert.strictEqual(store.isDarkMode(), true);

  store.setDarkMode(false);
  assert.strictEqual(store.isDarkMode(), false);
});

test('getAccessibilityMode and setAccessibilityMode work correctly', () => {
  storageMock.clear();
  store.setAccessibilityMode(true);
  assert.strictEqual(store.isAccessibilityMode(), true);

  store.setAccessibilityMode(false);
  assert.strictEqual(store.isAccessibilityMode(), false);
});

test('getSavedOutfits returns empty array initially', () => {
  storageMock.clear();
  const outfits = store.getSavedOutfits();
  assert.deepStrictEqual(outfits, []);
});

test('saveOutfit creates and returns a new outfit', () => {
  storageMock.clear();
  const outfit = store.saveOutfit(['item-1', 'item-2'], 'Summer Look');

  assert.ok(outfit.id);
  assert.strictEqual(outfit.name, 'Summer Look');
  assert.deepStrictEqual(outfit.itemIds, ['item-1', 'item-2']);
  assert.ok(outfit.createdAt);
});

test('deleteSavedOutfit removes an outfit', () => {
  storageMock.clear();
  const outfit = store.saveOutfit(['item-1'], 'Test Outfit');
  store.deleteSavedOutfit(outfit.id);
  const outfits = store.getSavedOutfits();

  assert.strictEqual(outfits.length, 0);
});

test('saveOutfitDate and getOutfitForDate work correctly', () => {
  storageMock.clear();
  store.saveOutfitDate('2026-04-26', ['item-1', 'item-2']);
  const outfit = store.getOutfitForDate('2026-04-26');

  assert.deepStrictEqual(outfit, ['item-1', 'item-2']);
});

test('getOutfitForDate returns null when no outfit assigned', () => {
  storageMock.clear();
  const outfit = store.getOutfitForDate('2026-05-01');
  assert.strictEqual(outfit, null);
});
