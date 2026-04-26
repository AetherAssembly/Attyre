// engine.js - Pure suggestion logic (no DOM, no storage, no side effects)

/**
 * Generates clothing labels and weather tags based on temperature.
 * Temperature bands: ≤0°C (very cold), ≤10°C (cold), ≤18°C (cool), ≤24°C (mild), >24°C (warm)
 * @param {number} tempC - Temperature in Celsius
 * @returns {Object} Object with labels (category suggestions), reason (temp description), weatherTags (conditions)
 */
export function suggestForTemp(tempC) {
  let labels, reason, weatherTags;

  if (tempC <= 0) {
    labels = ['heavy coat', 'scarf', 'boots'];
    reason = 'Very cold';
    weatherTags = ['snow', 'cold'];
  } else if (tempC <= 10) {
    labels = ['coat', 'sweater', 'boots'];
    reason = 'Cold';
    weatherTags = ['cold', 'wind'];
  } else if (tempC <= 18) {
    labels = ['light jacket', 'long sleeve'];
    reason = 'Cool';
    weatherTags = ['cloudy'];
  } else if (tempC <= 24) {
    labels = ['t-shirt', 'jeans'];
    reason = 'Mild';
    weatherTags = ['sunny'];
  } else {
    labels = ['shorts', 't-shirt', 'sandals'];
    reason = 'Warm';
    weatherTags = ['hot', 'sunny'];
  }

  return { labels, reason, weatherTags };
}

/**
 * Maps a clothing label to its item category.
 * Used to match temperature suggestions to wardrobe items.
 * @param {string} label - Clothing label (e.g., 'coat', 'boots')
 * @returns {string|null} Category (outerwear, accessory, top, bottom, shoes) or null if unmapped
 */
function mapLabelToCategory(label) {
  const lowerLabel = label.toLowerCase();

  if (['coat', 'jacket', 'heavy coat', 'light jacket'].includes(lowerLabel)) {
    return 'outerwear';
  }
  if (['scarf', 'hat', 'gloves'].includes(lowerLabel)) {
    return 'accessory';
  }
  if (['sweater', 'long sleeve', 'shirt', 't-shirt'].includes(lowerLabel)) {
    return 'top';
  }
  if (['jeans', 'shorts', 'pants'].includes(lowerLabel)) {
    return 'bottom';
  }
  if (['boots', 'sandals', 'shoes'].includes(lowerLabel)) {
    return 'shoes';
  }

  return null;
}

/**
 * Ranks and selects items for a weather-based outfit suggestion.
 *
 * Scoring:
 * - +2 for each category matching a temperature-based clothing label
 * - +1 for each weather tag the item has (e.g., 'cold', 'sunny')
 *
 * Selection:
 * - Returns one top-scoring item per unique category
 * - Maximum 4 items in the result
 * - Stops if score is 0 (no relevant items)
 *
 * @param {Array<Object>} items - Wardrobe items with id, category, weatherTags, etc.
 * @param {Object} suggestion - Output from suggestForTemp() with labels and weatherTags
 * @returns {Array<Object>} Array of {item, score} objects, sorted by score descending
 */
export function rankItems(items, suggestion) {
  if (!items || items.length === 0) {
    return [];
  }

  const { labels, weatherTags } = suggestion;

  // Calculate scores for each item
  const scores = items.map(item => {
    let score = 0;

    // +2 for each matching category
    for (const label of labels) {
      const expectedCategory = mapLabelToCategory(label);
      if (expectedCategory && item.category === expectedCategory) {
        score += 2;
      }
    }

    // +1 for each matching weather tag
    for (const tag of weatherTags) {
      if (item.weatherTags && item.weatherTags.includes(tag)) {
        score += 1;
      }
    }

    return { item, score };
  });

  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);

  // Pick top item per unique category, max 4 items total
  const result = [];
  const usedCategories = new Set();

  for (const { item, score } of scores) {
    if (score === 0) break; // Stop if score reaches 0 (no more relevant items)
    if (usedCategories.has(item.category)) continue; // Skip if we already have this category

    result.push({ item, score });
    usedCategories.add(item.category);

    if (result.length >= 4) break;
  }

  return result;
}
