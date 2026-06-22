// store.test.js - Unit tests for store operations
// Run with: node --test js/store.test.js

import test from 'node:test';
import assert from 'node:assert';
import { MemoryAdapter } from '@aetherAssembly/core';

// Mock localStorage for Node environment
const storageMock = {
  data: {},
  getItem(key) { return this.data[key] ?? null; },
  setItem(key, value) { this.data[key] = String(value); },
  removeItem(key) { delete this.data[key]; },
  clear() { this.data = {}; },
};

global.localStorage = storageMock;

import { randomUUID } from 'crypto';
Object.defineProperty(global.crypto, 'randomUUID', {
  value: randomUUID,
  writable: true,
  configurable: true,
});

import * as store from './store.js';

async function resetStore() {
  store._setAdapterForTest(new MemoryAdapter());
  storageMock.clear();
}

// ── Wardrobe items (IDB-backed, async) ─────────────────────────────────────

test('getItems returns empty array when no data exists', async () => {
  await resetStore();
  const items = await store.getItems();
  assert.deepStrictEqual(items, []);
});

test('addItem creates and returns a new item with id and createdAt', async () => {
  await resetStore();
  const item = await store.addItem({ name: 'Test Shirt', category: 'top' });

  assert.ok(item.id);
  assert.strictEqual(item.name, 'Test Shirt');
  assert.strictEqual(item.category, 'top');
  assert.ok(item.createdAt);
});

test('saveItems and getItems round-trip correctly', async () => {
  await resetStore();
  const testItems = [
    { id: '1', name: 'Shirt', category: 'top' },
    { id: '2', name: 'Pants', category: 'bottom' },
  ];
  await store.saveItems(testItems);
  const retrieved = await store.getItems();

  assert.strictEqual(retrieved.length, 2);
  assert.ok(retrieved.some(i => i.name === 'Shirt'));
  assert.ok(retrieved.some(i => i.name === 'Pants'));
});

test('getItemById returns null for non-existent item', async () => {
  await resetStore();
  await store.addItem({ name: 'Shirt', category: 'top' });
  const item = await store.getItemById('nonexistent-id');

  assert.strictEqual(item, null);
});

test('updateItem modifies and returns updated item', async () => {
  await resetStore();
  const newItem = await store.addItem({ name: 'Shirt', category: 'top', color: 'blue' });
  const updated = await store.updateItem(newItem.id, { color: 'red' });

  assert.strictEqual(updated.color, 'red');
  assert.strictEqual(updated.name, 'Shirt');
});

test('deleteItem removes an item', async () => {
  await resetStore();
  const item = await store.addItem({ name: 'Shirt', category: 'top' });
  await store.deleteItem(item.id);
  const retrieved = await store.getItemById(item.id);

  assert.strictEqual(retrieved, null);
});

test('incrementItemUsage increments usage counter', async () => {
  await resetStore();
  const item = await store.addItem({ name: 'Shirt', category: 'top' });

  await store.incrementItemUsage(item.id);
  let updated = await store.getItemById(item.id);
  assert.strictEqual(updated.usage, 1);

  await store.incrementItemUsage(item.id);
  updated = await store.getItemById(item.id);
  assert.strictEqual(updated.usage, 2);
});

test('exportJSON returns JSON string of items', async () => {
  await resetStore();
  await store.addItem({ name: 'Shirt', category: 'top' });
  const json = await store.exportJSON();

  const parsed = JSON.parse(json);
  assert.ok(Array.isArray(parsed));
  assert.strictEqual(parsed[0].name, 'Shirt');
});

test('importJSON throws on invalid JSON', async () => {
  await resetStore();
  await assert.rejects(
    () => store.importJSON('invalid json{'),
    /Invalid JSON format/
  );
});

test('importJSON throws on non-array data', async () => {
  await resetStore();
  await assert.rejects(
    () => store.importJSON('{"not": "array"}'),
    /must be an array/
  );
});

test('importJSON throws on missing required fields', async () => {
  await resetStore();
  const invalidItem = JSON.stringify([{ name: 'Shirt' }]);
  await assert.rejects(
    () => store.importJSON(invalidItem),
    /missing or invalid/
  );
});

test('importJSON validates data types', async () => {
  await resetStore();
  const invalidItem = JSON.stringify([
    { id: 123, name: 'Shirt', category: 'top', createdAt: '2026-04-26' },
  ]);
  await assert.rejects(
    () => store.importJSON(invalidItem),
    /invalid id/
  );
});

// ── Settings (localStorage, sync) ──────────────────────────────────────────

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

// ── Saved outfits (localStorage, sync) ─────────────────────────────────────

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

// ── Outfit dates / calendar (localStorage, sync) ────────────────────────────

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
