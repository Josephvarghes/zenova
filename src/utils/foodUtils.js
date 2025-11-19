// src/utils/foodUtils.js
const unitMap = {
  'Oats': { unit: 'g', qty: 50 },
  'Banana': { unit: 'pcs', qty: 1 },
  'Quinoa': { unit: 'g', qty: 60 },
  'Salad': { unit: 'g', qty: 100 },
  'Brown': { unit: 'g', qty: 60 }, // 'Brown Rice' -> 'Brown' fallback isn't great; adjust to more robust parsing
  'Rice': { unit: 'g', qty: 60 },
  'Veggies': { unit: 'g', qty: 150 },
  'Almonds': { unit: 'pcs', qty: 10 },
};

export function parseFoodsToGroceryItems(allFoods = []) {
  const groceryItems = [];
  const seen = new Map();
  allFoods.forEach(foodStr => {
    const parts = foodStr.split(' + ').map(s => s.trim());
    parts.forEach(item => {
      const baseItem = item.split(' ')[0]; // naive
      const config = unitMap[baseItem] || { unit: 'pcs', qty: 1 };
      const key = item.toLowerCase();
      if (seen.has(key)) {
        // accumulate quantity if needed
        const existing = seen.get(key);
        existing.quantity += config.qty;
        seen.set(key, existing);
      } else {
        const gitem = { name: item, quantity: config.qty, unit: config.unit };
        seen.set(key, gitem);
      }
    });
  });
  return Array.from(seen.values());
}
