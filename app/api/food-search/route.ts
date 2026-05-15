import { NextRequest } from "next/server";
import { foods as localFoods } from "../../data/foods";

// ─── Comprehensive keyword → accurate Unsplash image map ───────────────────
const IMG: Record<string, string> = {
  apple: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=300&q=80",
  banana: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&q=80",
  orange: "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&q=80",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&q=80",
  grape: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&q=80",
  strawberry: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&q=80",
  watermelon: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80",
  pineapple: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&q=80",
  papaya: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=300&q=80",
  guava: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=300&q=80",
  pomegranate: "https://images.unsplash.com/photo-1615485500704-8e3b5905c373?w=300&q=80",
  kiwi: "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=300&q=80",
  cherry: "https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=300&q=80",
  peach: "https://images.unsplash.com/photo-1595743825637-cdafc8ad4173?w=300&q=80",
  pear: "https://images.unsplash.com/photo-1561918774-9a06d2e8fcfb?w=300&q=80",
  lemon: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&q=80",
  lime: "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=300&q=80",
  coconut: "https://images.unsplash.com/photo-1581375321224-79da6fd16543?w=300&q=80",
  avocado: "https://images.unsplash.com/photo-1601039641847-7857b994d704?w=300&q=80",
  blueberry: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300&q=80",
  jackfruit: "https://images.unsplash.com/photo-1604820319822-12c461a3c5c2?w=300&q=80",
  fig: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=300&q=80",
  // Vegetables
  broccoli: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&q=80",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&q=80",
  tomato: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=300&q=80",
  carrot: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=300&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&q=80",
  onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&q=80",
  cucumber: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&q=80",
  capsicum: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=300&q=80",
  pepper: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?w=300&q=80",
  garlic: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=300&q=80",
  cauliflower: "https://images.unsplash.com/photo-1568584711271-6bf9d62de8eb?w=300&q=80",
  mushroom: "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=300&q=80",
  corn: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&q=80",
  pumpkin: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=300&q=80",
  cabbage: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&q=80",
  lettuce: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&q=80",
  eggplant: "https://images.unsplash.com/photo-1511358524741-d0c5db0ee18b?w=300&q=80",
  beetroot: "https://images.unsplash.com/photo-1541956061639-a9cb8af16e99?w=300&q=80",
  radish: "https://images.unsplash.com/photo-1588450840924-0f56bbbab7ad?w=300&q=80",
  // Proteins — Meat
  chicken: "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=300&q=80",
  beef: "https://images.unsplash.com/photo-1551446591-142875a901a1?w=300&q=80",
  mutton: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&q=80",
  lamb: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&q=80",
  pork: "https://images.unsplash.com/photo-1558030006-450675393462?w=300&q=80",
  turkey: "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=300&q=80",
  // Seafood
  fish: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=80",
  salmon: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=80",
  tuna: "https://images.unsplash.com/photo-1532768778661-1b710643f038?w=300&q=80",
  shrimp: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=300&q=80",
  prawn: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=300&q=80",
  crab: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300&q=80",
  // Veg proteins
  egg: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&q=80",
  paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=80",
  tofu: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80",
  lentil: "https://images.unsplash.com/photo-1599619585752-c3edb42a414c?w=300&q=80",
  dal: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80",
  rajma: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80",
  chickpea: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80",
  chole: "https://images.unsplash.com/photo-1626500155537-45b89ade41ee?w=300&q=80",
  almond: "https://images.unsplash.com/photo-1574184864703-3487b13f0edd?w=300&q=80",
  walnut: "https://images.unsplash.com/photo-1563412580953-4d235b2e7b13?w=300&q=80",
  cashew: "https://images.unsplash.com/photo-1616684000067-36952fde56ec?w=300&q=80",
  peanut: "https://images.unsplash.com/photo-1567892737950-30b5cfb3e5e5?w=300&q=80",
  // Grains
  rice: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=300&q=80",
  bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
  pasta: "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=300&q=80",
  noodle: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&q=80",
  oat: "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=300&q=80",
  chapati: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80",
  roti: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=80",
  paratha: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&q=80",
  naan: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&q=80",
  quinoa: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=300&q=80",
  // Indian dishes — comprehensive
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80",
  curry: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=80",
  dosa: "https://images.unsplash.com/photo-1668236543090-82eb5eada6a8?w=300&q=80",
  idli: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&q=80",
  sambar: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&q=80",
  upma: "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=300&q=80",
  poha: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&q=80",
  tikka: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&q=80",
  korma:    "https://images.unsplash.com/photo-1585949608866-c6a6b965bd44?w=300&q=80",
  aloo:     "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&q=80",
  samosa:   "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&q=80",
  vada:     "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=300&q=80",
  pongal:   "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80",
  khichdi:  "https://images.unsplash.com/photo-1585949608866-c6a6b965bd44?w=300&q=80",
  halwa:    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80",
  kheer:    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&q=80",
  ladoo:    "https://images.unsplash.com/photo-1606313564200-e75d5e30ef07?w=300&q=80",
  pav:      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80",
  bhaji:    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80",
  maggi:    "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&q=80",
  appam:    "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&q=80",
  rasam:    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=80",
  pulao:    "https://images.unsplash.com/photo-1512058556646-c4da40fba323?w=300&q=80",
  pulav:    "https://images.unsplash.com/photo-1512058556646-c4da40fba323?w=300&q=80",
  kebab:    "https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=300&q=80",
  kofta:    "https://images.unsplash.com/photo-1585949608866-c6a6b965bd44?w=300&q=80",
  tandoori: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&q=80",
  masala:   "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=80",
  palak:    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&q=80",
  saag:     "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&q=80",
  chaat:    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&q=80",
  // Dairy — each unique
  milk:    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80",
  cheese:  "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&q=80",
  yogurt:  "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80",
  curd:    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80",
  butter:  "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&q=80",
  ghee:    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80",
  lassi:   "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&q=80",
  // Fast food & snacks
  pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80",
  fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=80",
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&q=80",
  chips: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&q=80",
  chocolate: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&q=80",
  cookie: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&q=80",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80",
  donut: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80",
  waffle: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=300&q=80",
  pancake: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300&q=80",
  icecream: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&q=80",
  "ice cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&q=80",
  // Beverages
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80",
  tea: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80",
  juice: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&q=80",
  smoothie: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300&q=80",
  honey:    "https://images.unsplash.com/photo-1471943038394-4e8d0b0d46e5?w=300&q=80",
  sugar:    "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&q=80",
  oil:      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80",
  omelette: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=300&q=80",
  salad:    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80",
  soup:     "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=80",
  steak:    "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80",
  sushi:    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80",
  tacos:    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&q=80",
  // Extra generic catch-alls (NO cooking methods — they cause wrong matches)
  wrap:    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&q=80",
  cream:   "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80",
  sauce:   "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80",
  chutney: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&q=80",
  snack:   "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&q=80",
  sweet:   "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80",
  dessert: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80",
  cereal:  "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=300&q=80",
  flour:   "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
  drink:   "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&q=80",
  water:   "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&q=80",
  nuts:    "https://images.unsplash.com/photo-1574184864703-3487b13f0edd?w=300&q=80",
  seed:    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
  grain:   "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=300&q=80",
  bean:    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80",
  pea:     "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=300&q=80",
  breast:  "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=300&q=80",
  mince:   "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&q=80",
  bar:     "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&q=80",
};

// Category-tag → image fallbacks (Open Food Facts en: category tags)
const CATEGORY_IMG: Record<string, string> = {
  meat: "https://images.unsplash.com/photo-1551446591-142875a901a1?w=300&q=80",
  poultry: "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=300&q=80",
  seafood: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=80",
  fish: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=80",
  dairy: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80",
  cheese: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&q=80",
  bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
  cereals: "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=300&q=80",
  pasta: "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=300&q=80",
  rice: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=300&q=80",
  vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80",
  fruits: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=300&q=80",
  legumes: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&q=80",
  nuts: "https://images.unsplash.com/photo-1574184864703-3487b13f0edd?w=300&q=80",
  sweets: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80",
  desserts: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80",
  beverages: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=80",
  snacks: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&q=80",
  soups: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=80",
  meals: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=300&q=80",
  pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80",
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&q=80",
  sauces: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80",
};

// Neutral cooked-meal default (not salad-like)
const DEFAULT_IMG = "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=300&q=80";

// Longest-match-first keyword image resolver with optional category fallback
function resolveImage(name: string, categories?: string[]): string {
  const lower = name.toLowerCase();
  const sorted = Object.keys(IMG).sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    if (lower.includes(key)) return IMG[key];
  }
  // Try Open Food Facts category tags
  if (categories?.length) {
    for (const cat of categories) {
      const catLower = cat.replace(/^en:/, "").replace(/-/g, " ").toLowerCase();
      for (const [catKey, catImg] of Object.entries(CATEGORY_IMG)) {
        if (catLower.includes(catKey)) return catImg;
      }
    }
  }
  // Check local foods.ts
  const localMatch = localFoods.find(
    (f) => f.name.toLowerCase() === lower && f.image
  );
  if (localMatch?.image) return localMatch.image;
  return DEFAULT_IMG;
}

interface FoodResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  servingNote: string;
  source: string;
}

// ─── Tier 1: Local foods.ts search ─────────────────────────────────────────
function searchLocal(q: string): FoodResult[] {
  const lower = q.toLowerCase();
  return localFoods
    .filter(
      (f) =>
        f.name.toLowerCase().includes(lower) &&
        !f.name.startsWith("Indian Dish") &&
        f.calories > 0
    )
    .slice(0, 5)
    .map((f) => ({
      name: f.name,
      calories: f.calories,
      protein: f.protein || 0,
      carbs: f.carbs || 0,
      fat: f.fat || 0,
      image: f.image || resolveImage(f.name),
      servingNote: "",
      source: "local",
    }));
}

// ─── Tier 2: USDA FoodData Central (raw ingredients) ──────────────────────
async function searchUSDA(q: string): Promise<FoodResult[]> {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&api_key=DEMO_KEY&dataType=Foundation,SR+Legacy&pageSize=10`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    const ENERGY = 1008, PROTEIN = 1003, CARBS = 1005, FAT = 1004;
    return (data.foods as any[])
      ?.filter((f) => f.description && f.foodNutrients?.length)
      .map((f) => {
        const get = (id: number) =>
          Math.round(f.foodNutrients.find((n: any) => n.nutrientId === id)?.value || 0);
        const cal = get(ENERGY);
        if (cal < 1) return null;
        const name = f.description
          .split(",")[0]
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
          .trim();
        return {
          name,
          calories: cal,
          protein: get(PROTEIN),
          carbs: get(CARBS),
          fat: get(FAT),
          image: resolveImage(f.description),
          servingNote: "per 100g",
          source: "usda",
        } as FoodResult;
      })
      .filter(Boolean)
      .slice(0, 5) as FoodResult[];
  } catch { return []; }
}

// ─── Tier 3: Open Food Facts (global — Indian dishes, cooked food, etc.) ──
async function searchOpenFoodFacts(q: string): Promise<FoodResult[]> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15&fields=product_name,nutriments,categories_tags`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.products as any[])
      ?.filter((p) => {
        const n = p.nutriments;
        return (
          p.product_name?.trim() &&
          n?.["energy-kcal_100g"] > 0
        );
      })
      .map((p) => {
        const n = p.nutriments;
        const cal = Math.round(n["energy-kcal_100g"] || 0);
        const name = p.product_name
          .split(",")[0]
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
          .trim()
          .slice(0, 40);
        return {
          name,
          calories: cal,
          protein: Math.round(n["proteins_100g"] || 0),
          carbs: Math.round(n["carbohydrates_100g"] || 0),
          fat: Math.round(n["fat_100g"] || 0),
          image: resolveImage(p.product_name, p.categories_tags),
          servingNote: "per 100g",
          source: "off",
        } as FoodResult;
      })
      .filter(Boolean)
      .slice(0, 6) as FoodResult[];
  } catch { return []; }
}

// ─── Main handler ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return Response.json([]);

  // Run all three tiers in parallel
  const [local, usda, off] = await Promise.all([
    searchLocal(q),
    searchUSDA(q),
    searchOpenFoodFacts(q),
  ]);

  // Merge: local first (most accurate), then usda, then open food facts
  const merged = [...local, ...usda, ...off];

  // Deduplicate by normalized name
  const seen = new Set<string>();
  const unique = merged.filter((f) => {
    const key = f.name.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return f.calories > 0;
  });

  return Response.json(unique.slice(0, 10));
}
