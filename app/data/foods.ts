export interface FoodItem {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  emoji?: string;
  color?: string;
  image?: string;
}

export const foods: FoodItem[] = [
  // ✅ DEFAULT 15 (shown on dashboard)
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, image: "https://images.unsplash.com/photo-1584306670957-acf935f5033c?w=300&h=300&fit=crop" },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop" },
  { name: "Rice", calories: 200, protein: 4.3, carbs: 45, fat: 0.4, image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44726?w=300&h=300&fit=crop" },
  { name: "Chicken", calories: 165, protein: 31, carbs: 0, fat: 3.6, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=300&fit=crop" },
  { name: "Egg", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop" },
  { name: "Milk", calories: 150, protein: 8, carbs: 12, fat: 8, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop" },
  { name: "Bread", calories: 80, protein: 2.7, carbs: 15, fat: 1, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop" },
  { name: "Pizza", calories: 285, protein: 12, carbs: 36, fat: 10, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop" },
  { name: "Burger", calories: 354, protein: 20, carbs: 29, fat: 17, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop" },
  { name: "Dosa", calories: 168, protein: 3.9, carbs: 27, fat: 5, image: "https://images.unsplash.com/photo-1668236543090-82eb5eada6a8?w=300&h=300&fit=crop" },
  { name: "Idli", calories: 58, protein: 2, carbs: 12, fat: 0.4, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=300&fit=crop" },
  { name: "Sambar", calories: 120, protein: 5, carbs: 18, fat: 3, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=300&fit=crop" },
  { name: "Upma", calories: 180, protein: 4.5, carbs: 28, fat: 5, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=300&h=300&fit=crop" },
  { name: "Poha", calories: 130, protein: 3.5, carbs: 23, fat: 3, image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=300&h=300&fit=crop" },
  { name: "Paneer", calories: 265, protein: 18, carbs: 1.2, fat: 21, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop" },

  // 🔥 South Indian
  { name: "Masala Dosa", calories: 250, protein: 5, carbs: 32, fat: 10, image: "https://images.unsplash.com/photo-1668236543090-82eb5eada6a8?w=300&h=300&fit=crop" },
  { name: "Plain Dosa", calories: 168, protein: 3.9, carbs: 27, fat: 5, image: "https://images.unsplash.com/photo-1668236543090-82eb5eada6a8?w=300&h=300&fit=crop" },
  { name: "Rava Dosa", calories: 220, protein: 4, carbs: 30, fat: 8 },
  { name: "Onion Dosa", calories: 210, protein: 4, carbs: 29, fat: 7 },
  { name: "Ghee Dosa", calories: 300, protein: 4, carbs: 28, fat: 16 },

  { name: "Medu Vada", calories: 150, protein: 6, carbs: 16, fat: 7, image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=300&h=300&fit=crop" },
  { name: "Sambar Vada", calories: 180, protein: 7, carbs: 20, fat: 8 },
  { name: "Curd Vada", calories: 200, protein: 8, carbs: 22, fat: 9 },

  { name: "Pongal", calories: 250, protein: 6, carbs: 35, fat: 9 },
  { name: "Ven Pongal", calories: 270, protein: 7, carbs: 36, fat: 10 },

  // 🔥 North Indian
  { name: "Chapati", calories: 120, protein: 3.5, carbs: 20, fat: 3.5, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=300&fit=crop" },
  { name: "Paratha", calories: 260, protein: 5, carbs: 32, fat: 13, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&h=300&fit=crop" },
  { name: "Aloo Paratha", calories: 300, protein: 6, carbs: 38, fat: 14 },
  { name: "Paneer Paratha", calories: 320, protein: 10, carbs: 34, fat: 16 },

  { name: "Dal Tadka", calories: 180, protein: 9, carbs: 25, fat: 5, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop" },
  { name: "Dal Fry", calories: 200, protein: 10, carbs: 28, fat: 5 },

  { name: "Rajma", calories: 220, protein: 9, carbs: 30, fat: 6, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop" },
  { name: "Chole", calories: 250, protein: 10, carbs: 33, fat: 8, image: "https://images.unsplash.com/photo-1626500155537-45b89ade41ee?w=300&h=300&fit=crop" },

  { name: "Paneer Butter Masala", calories: 350, protein: 15, carbs: 18, fat: 25, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop" },
  { name: "Kadai Paneer", calories: 300, protein: 14, carbs: 16, fat: 22 },
  { name: "Palak Paneer", calories: 280, protein: 13, carbs: 14, fat: 20 },

  { name: "Chicken Curry", calories: 320, protein: 28, carbs: 12, fat: 18, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=300&fit=crop" },
  { name: "Butter Chicken", calories: 400, protein: 30, carbs: 15, fat: 25, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=300&fit=crop" },
  { name: "Chicken Biryani", calories: 350, protein: 20, carbs: 40, fat: 12, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=300&fit=crop" },
  { name: "Mutton Biryani", calories: 420, protein: 22, carbs: 42, fat: 18 },
  { name: "Veg Biryani", calories: 280, protein: 8, carbs: 40, fat: 8, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&h=300&fit=crop" },

  { name: "Fried Rice", calories: 300, protein: 7, carbs: 42, fat: 10, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop" },
  { name: "Veg Fried Rice", calories: 280, protein: 6, carbs: 40, fat: 9 },
  { name: "Egg Fried Rice", calories: 320, protein: 10, carbs: 42, fat: 12 },

  { name: "Noodles", calories: 300, protein: 8, carbs: 40, fat: 10, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop" },
  { name: "Hakka Noodles", calories: 320, protein: 9, carbs: 42, fat: 11 },

  { name: "Maggi", calories: 350, protein: 8, carbs: 45, fat: 15, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&h=300&fit=crop" },

  { name: "Samosa", calories: 250, protein: 5, carbs: 28, fat: 14, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop" },
  { name: "Kachori", calories: 300, protein: 5, carbs: 32, fat: 16 },
  { name: "Pakora", calories: 200, protein: 4, carbs: 20, fat: 12, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop" },

  { name: "Pav Bhaji", calories: 400, protein: 10, carbs: 48, fat: 18, image: "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=300&h=300&fit=crop" },
  { name: "Vada Pav", calories: 300, protein: 6, carbs: 36, fat: 14 },

  { name: "Idiyappam", calories: 200, protein: 4, carbs: 38, fat: 3 },
  { name: "Appam", calories: 180, protein: 3, carbs: 35, fat: 3 },

  { name: "Fish Curry", calories: 250, protein: 22, carbs: 10, fat: 14 },
  { name: "Fish Fry", calories: 300, protein: 25, carbs: 12, fat: 18 },

  { name: "Rasam", calories: 80, protein: 2, carbs: 14, fat: 1 },

  { name: "Curd Rice", calories: 220, protein: 7, carbs: 35, fat: 5, image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44726?w=300&h=300&fit=crop" },
  { name: "Lemon Rice", calories: 200, protein: 4, carbs: 38, fat: 4 },
  { name: "Tamarind Rice", calories: 250, protein: 4, carbs: 42, fat: 6 },

  { name: "Kesari", calories: 300, protein: 3, carbs: 45, fat: 12 },
  { name: "Payasam", calories: 250, protein: 5, carbs: 40, fat: 8 },

  // 🔁 Deterministic extended list (no Math.random — safe for SSR)
  ...Array.from({ length: 450 }, (_, i) => ({
    name: `Indian Dish ${i + 1}`,
    calories: 50 + ((i * 73 + 29) % 400),
    protein: 2 + ((i * 13 + 7) % 30),
    carbs: 5 + ((i * 17 + 11) % 50),
    fat: 1 + ((i * 11 + 3) % 25),
  })),
];