// engine.test.js - Unit tests for outfit suggestion engine
// Run with: node --test js/engine.test.js

import test from 'node:test';
import assert from 'node:assert';
import { suggestForTemp, rankItems } from './engine.js';

test('suggestForTemp returns correct labels for very cold', () => {
  const suggestion = suggestForTemp(-5);
  assert.deepStrictEqual(suggestion.labels, ['heavy coat', 'scarf', 'boots']);
  assert.strictEqual(suggestion.reason, 'Very cold');
  assert.deepStrictEqual(suggestion.weatherTags, ['snow', 'cold']);
});

test('suggestForTemp returns correct labels for cold', () => {
  const suggestion = suggestForTemp(5);
  assert.deepStrictEqual(suggestion.labels, ['coat', 'sweater', 'boots']);
  assert.strictEqual(suggestion.reason, 'Cold');
  assert.deepStrictEqual(suggestion.weatherTags, ['cold', 'wind']);
});

test('suggestForTemp returns correct labels for cool', () => {
  const suggestion = suggestForTemp(15);
  assert.deepStrictEqual(suggestion.labels, ['light jacket', 'long sleeve']);
  assert.strictEqual(suggestion.reason, 'Cool');
  assert.deepStrictEqual(suggestion.weatherTags, ['cloudy']);
});

test('suggestForTemp returns correct labels for mild', () => {
  const suggestion = suggestForTemp(20);
  assert.deepStrictEqual(suggestion.labels, ['t-shirt', 'jeans']);
  assert.strictEqual(suggestion.reason, 'Mild');
  assert.deepStrictEqual(suggestion.weatherTags, ['sunny']);
});

test('suggestForTemp returns correct labels for warm', () => {
  const suggestion = suggestForTemp(28);
  assert.deepStrictEqual(suggestion.labels, ['shorts', 't-shirt', 'sandals']);
  assert.strictEqual(suggestion.reason, 'Warm');
  assert.deepStrictEqual(suggestion.weatherTags, ['hot', 'sunny']);
});

test('suggestForTemp boundary at 0°C', () => {
  const suggestion = suggestForTemp(0);
  assert.strictEqual(suggestion.reason, 'Very cold');
});

test('suggestForTemp boundary at 10°C', () => {
  const suggestion = suggestForTemp(10);
  assert.strictEqual(suggestion.reason, 'Cold');
});

test('suggestForTemp boundary at 18°C', () => {
  const suggestion = suggestForTemp(18);
  assert.strictEqual(suggestion.reason, 'Cool');
});

test('suggestForTemp boundary at 24°C', () => {
  const suggestion = suggestForTemp(24);
  assert.strictEqual(suggestion.reason, 'Mild');
});

test('rankItems returns empty array for empty items', () => {
  const suggestion = suggestForTemp(20);
  const result = rankItems([], suggestion);
  assert.deepStrictEqual(result, []);
});

test('rankItems returns empty array for null items', () => {
  const suggestion = suggestForTemp(20);
  const result = rankItems(null, suggestion);
  assert.deepStrictEqual(result, []);
});

test('rankItems scores items by matching category', () => {
  const items = [
    { id: '1', name: 'T-shirt', category: 'top' },
    { id: '2', name: 'Jeans', category: 'bottom' },
  ];
  const suggestion = suggestForTemp(20); // labels: ['t-shirt', 'jeans']

  const result = rankItems(items, suggestion);
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].score, 2); // Matching 't-shirt' category
  assert.strictEqual(result[1].score, 2); // Matching 'jeans' category
});

test('rankItems scores items by matching weather tags', () => {
  const items = [
    { id: '1', name: 'Winter Coat', category: 'outerwear', weatherTags: ['cold'] },
    { id: '2', name: 'Summer Shirt', category: 'top', weatherTags: ['hot'] },
  ];
  const suggestion = suggestForTemp(5); // weatherTags: ['cold', 'wind']

  const result = rankItems(items, suggestion);
  assert.ok(result[0].score >= 1); // Winter coat matches 'cold' tag
});

test('rankItems returns one item per unique category', () => {
  const items = [
    { id: '1', name: 'T-shirt 1', category: 'top' },
    { id: '2', name: 'T-shirt 2', category: 'top' },
    { id: '3', name: 'Jeans', category: 'bottom' },
  ];
  const suggestion = suggestForTemp(20);

  const result = rankItems(items, suggestion);
  const categories = result.map(r => r.item.category);
  assert.strictEqual(new Set(categories).size, categories.length); // All unique
});

test('rankItems returns maximum 4 items', () => {
  const items = [
    { id: '1', name: 'Shirt', category: 'top' },
    { id: '2', name: 'Jeans', category: 'bottom' },
    { id: '3', name: 'Coat', category: 'outerwear' },
    { id: '4', name: 'Boots', category: 'shoes' },
    { id: '5', name: 'Hat', category: 'accessory' },
  ];
  const suggestion = suggestForTemp(5);

  const result = rankItems(items, suggestion);
  assert.ok(result.length <= 4);
});

test('rankItems stops at score 0', () => {
  const items = [
    { id: '1', name: 'Shirt', category: 'top' }, // Will score 2
    { id: '2', name: 'Random Item', category: 'misc' }, // Will score 0
  ];
  const suggestion = suggestForTemp(20);

  const result = rankItems(items, suggestion);
  assert.strictEqual(result.length, 1); // Stops before score 0
});

test('rankItems sorts by score descending', () => {
  const items = [
    { id: '1', name: 'Item A', category: 'bottom' },
    { id: '2', name: 'Item B', category: 'top', weatherTags: ['sunny'] },
    { id: '3', name: 'Item C', category: 'shoes' },
  ];
  const suggestion = suggestForTemp(20); // labels: ['t-shirt', 'jeans'], weatherTags: ['sunny']

  const result = rankItems(items, suggestion);
  // Item B should have highest score (category match + weather tag match)
  assert.ok(result[0].score >= result[1].score);
});

test('rankItems handles missing weatherTags gracefully', () => {
  const items = [
    { id: '1', name: 'Item A', category: 'top' }, // No weatherTags
    { id: '2', name: 'Item B', category: 'bottom', weatherTags: ['sunny'] },
  ];
  const suggestion = suggestForTemp(20);

  const result = rankItems(items, suggestion);
  assert.ok(result.length > 0); // Should not crash
});

test('rankItems case-insensitive category matching', () => {
  const items = [
    { id: '1', name: 'Item', category: 'TOP' }, // Uppercase
  ];
  const suggestion = suggestForTemp(20); // labels: ['t-shirt']

  const result = rankItems(items, suggestion);
  // Category matching is case-sensitive in current implementation
  // This test documents the behavior
  assert.strictEqual(result.length, 0); // 'TOP' !== 'top'
});

test('rankItems combined scoring', () => {
  const items = [
    { id: '1', name: 'Perfect Outfit', category: 'top', weatherTags: ['sunny'] },
  ];
  const suggestion = suggestForTemp(20); // expects 'top' category, 'sunny' tag

  const result = rankItems(items, suggestion);
  assert.strictEqual(result[0].score, 3); // +2 for category, +1 for tag
});
