// engine.js - Pure suggestion logic (no DOM, no storage, no side effects)

/**
 * Applies the Environment Canada wind chill formula.
 * Only valid when tempC <= 10 and windspeedKph >= 4.8; otherwise returns tempC unchanged.
 * @param {number} tempC
 * @param {number} windspeedKph
 * @returns {number} Feels-like temperature in Celsius
 */
export function windChillAdjust(tempC, windspeedKph) {
  if (tempC > 10 || windspeedKph < 4.8) return tempC;
  return (
    13.12 +
    0.6215 * tempC -
    11.37 * Math.pow(windspeedKph, 0.16) +
    0.3965 * tempC * Math.pow(windspeedKph, 0.16)
  );
}

/**
 * Maps a WMO weather code to an array of weather tags.
 * @param {number|null} code
 * @returns {string[]}
 */
function weatherCodeToTags(code) {
  if (code == null) return [];
  if (code <= 1)  return ['sunny'];
  if (code <= 3)  return ['cloudy'];
  if (code <= 49) return ['foggy'];
  if (code >= 71 && code <= 77) return ['snow'];
  if (code >= 85 && code <= 86) return ['snow'];
  if (code >= 95) return ['rain', 'wind'];
  if (code >= 63 && code <= 67) return ['rain', 'heavy-rain'];
  if (code >= 51 && code <= 82) return ['rain', 'light-rain'];
  return ['cloudy'];
}

/**
 * Generates clothing labels and weather tags based on temperature.
 * Temperature bands: <=0 (very cold), <=10 (cold), <=18 (cool), <=24 (mild), >24 (warm)
 * @param {number} tempC - Temperature in Celsius
 * @returns {{ labels: string[], reason: string, weatherTags: string[] }}
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
 * Higher-level suggestion that factors in wind chill and weather code.
 * Use this instead of suggestForTemp when full weather data is available.
 * @param {{ tempC: number, windspeedKph?: number, weatherCode?: number|null }} weather
 * @returns {{ labels: string[], reason: string, weatherTags: string[], feelsLike: number }}
 */
export function suggestForWeather({ tempC, windspeedKph = 0, weatherCode = null }) {
  const feelsLike = windChillAdjust(tempC, windspeedKph);
  const base = suggestForTemp(feelsLike);
  const codeTags = weatherCodeToTags(weatherCode);
  return {
    ...base,
    weatherTags: [...new Set([...base.weatherTags, ...codeTags])],
    feelsLike: Math.round(feelsLike * 10) / 10,
  };
}

/**
 * Maps a clothing label to its item category.
 * @param {string} label
 * @returns {string|null}
 */
function mapLabelToCategory(label) {
  const lowerLabel = label.toLowerCase();

  if (['coat', 'jacket', 'heavy coat', 'light jacket'].includes(lowerLabel)) return 'outerwear';
  if (['scarf', 'hat', 'gloves'].includes(lowerLabel)) return 'accessory';
  if (['sweater', 'long sleeve', 'shirt', 't-shirt'].includes(lowerLabel)) return 'top';
  if (['jeans', 'shorts', 'pants'].includes(lowerLabel)) return 'bottom';
  if (['boots', 'sandals', 'shoes'].includes(lowerLabel)) return 'shoes';

  return null;
}

/**
 * Ranks and selects items for a weather-based outfit suggestion.
 *
 * Scoring:
 * - +2 for each category matching a temperature-based clothing label
 * - +1 for each weather tag the item has
 * - +1 if item's occasions include the requested occasion
 * - -1 if item's laundryStatus is 'dirty'
 * - -2 if item was worn within the last 3 days (based on lastWorn + today)
 *
 * Selection: one top-scoring item per unique category, max 4 items, stops at score 0.
 *
 * @param {Array<Object>} items
 * @param {{ labels: string[], weatherTags: string[] }} suggestion - from suggestForTemp or suggestForWeather
 * @param {{ occasion?: string|null, today?: string|null }} [options]
 * @returns {Array<{ item: Object, score: number }>}
 */
export function rankItems(items, suggestion, options = {}) {
  if (!items || items.length === 0) return [];

  const { labels, weatherTags } = suggestion;
  const { occasion = null, today = null } = options;

  const scores = items.map(item => {
    let score = 0;

    for (const label of labels) {
      const expectedCategory = mapLabelToCategory(label);
      if (expectedCategory && item.category?.toLowerCase() === expectedCategory) score += 2;
    }

    for (const tag of weatherTags) {
      if (item.weatherTags && item.weatherTags.includes(tag)) score += 1;
    }

    if (occasion && item.occasions && item.occasions.includes(occasion)) score += 1;

    if (item.laundryStatus === 'dirty') score -= 1;

    if (today && item.lastWorn) {
      const daysSince = Math.round(
        (new Date(today) - new Date(item.lastWorn)) / 86400000
      );
      if (daysSince >= 0 && daysSince <= 3) score -= 2;
    }

    return { item, score };
  });

  scores.sort((a, b) => b.score - a.score);

  const result = [];
  const usedCategories = new Set();

  for (const { item, score } of scores) {
    if (score === 0) break;
    if (usedCategories.has(item.category)) continue;

    result.push({ item, score });
    usedCategories.add(item.category);

    if (result.length >= 4) break;
  }

  return result;
}
