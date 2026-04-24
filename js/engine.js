// engine.js - Pure suggestion logic (no DOM, no storage, no side effects)

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

export function rankItems(items, suggestion) {
  if (!items || items.length === 0) {
    return [];
  }

  const { labels, weatherTags } = suggestion;
  
  // Calculate scores
  const scores = items.map(item => {
    let score = 0;

    // +2 for matching category
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

  // Pick top item per unique category, max 4
  const result = [];
  const usedCategories = new Set();

  for (const { item, score } of scores) {
    if (score === 0) break; // Stop if score reaches 0
    if (usedCategories.has(item.category)) continue;
    
    result.push({ item, score });
    usedCategories.add(item.category);
    
    if (result.length >= 4) break;
  }

  return result;
}
