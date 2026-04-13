export interface FoodItem {
  name: string;
  calories: number;
  emoji?: string;
  color?: string;
}

export const foods: FoodItem[] = [
  // ✅ DEFAULT 15 (shown on dashboard)
  { name: "Apple", calories: 95 },
  { name: "Banana", calories: 105 },
  { name: "Rice", calories: 200 },
  { name: "Chicken", calories: 165 },
  { name: "Egg", calories: 78 },
  { name: "Milk", calories: 150 },
  { name: "Bread", calories: 80 },
  { name: "Pizza", calories: 285 },
  { name: "Burger", calories: 354 },
  { name: "Dosa", calories: 168 },
  { name: "Idli", calories: 58 },
  { name: "Sambar", calories: 120 },
  { name: "Upma", calories: 180 },
  { name: "Poha", calories: 130 },
  { name: "Paneer", calories: 265 },

  // 🔥 South Indian
  { name: "Masala Dosa", calories: 250 },
  { name: "Plain Dosa", calories: 168 },
  { name: "Rava Dosa", calories: 220 },
  { name: "Onion Dosa", calories: 210 },
  { name: "Ghee Dosa", calories: 300 },

  { name: "Medu Vada", calories: 150 },
  { name: "Sambar Vada", calories: 180 },
  { name: "Curd Vada", calories: 200 },

  { name: "Pongal", calories: 250 },
  { name: "Ven Pongal", calories: 270 },

  // 🔥 North Indian
  { name: "Chapati", calories: 120 },
  { name: "Paratha", calories: 260 },
  { name: "Aloo Paratha", calories: 300 },
  { name: "Paneer Paratha", calories: 320 },

  { name: "Dal Tadka", calories: 180 },
  { name: "Dal Fry", calories: 200 },

  { name: "Rajma", calories: 220 },
  { name: "Chole", calories: 250 },

  { name: "Paneer Butter Masala", calories: 350 },
  { name: "Kadai Paneer", calories: 300 },
  { name: "Palak Paneer", calories: 280 },

  { name: "Chicken Curry", calories: 320 },
  { name: "Butter Chicken", calories: 400 },
  { name: "Chicken Biryani", calories: 350 },
  { name: "Mutton Biryani", calories: 420 },
  { name: "Veg Biryani", calories: 280 },

  { name: "Fried Rice", calories: 300 },
  { name: "Veg Fried Rice", calories: 280 },
  { name: "Egg Fried Rice", calories: 320 },

  { name: "Noodles", calories: 300 },
  { name: "Hakka Noodles", calories: 320 },

  { name: "Maggi", calories: 350 },

  { name: "Samosa", calories: 250 },
  { name: "Kachori", calories: 300 },
  { name: "Pakora", calories: 200 },

  { name: "Pav Bhaji", calories: 400 },
  { name: "Vada Pav", calories: 300 },

  { name: "Idiyappam", calories: 200 },
  { name: "Appam", calories: 180 },

  { name: "Fish Curry", calories: 250 },
  { name: "Fish Fry", calories: 300 },

  { name: "Rasam", calories: 80 },

  { name: "Curd Rice", calories: 220 },
  { name: "Lemon Rice", calories: 200 },
  { name: "Tamarind Rice", calories: 250 },

  { name: "Kesari", calories: 300 },
  { name: "Payasam", calories: 250 },

  // 🔁 Deterministic extended list (no Math.random — safe for SSR)
  ...Array.from({ length: 450 }, (_, i) => ({
    name: `Indian Dish ${i + 1}`,
    calories: 50 + ((i * 73 + 29) % 400),
  })),
];