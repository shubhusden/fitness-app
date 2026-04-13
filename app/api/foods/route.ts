import { readDB, writeDB } from "../../../backend/db";

const DB_FILE = "food-logs.json";

interface FoodEntry {
  name: string;
  calories: number;
  emoji?: string;
  color?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: number;
}

interface FoodStore {
  entries: FoodEntry[];
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || getTodayKey();

  const store = readDB<FoodStore>(DB_FILE, { entries: [] });
  const todayFoods = store.entries.filter((e) => e.date === date);

  return Response.json({ foods: todayFoods });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support bulk set (for syncing from localStorage)
    if (body.foods && Array.isArray(body.foods)) {
      const date = body.date || getTodayKey();
      const store = readDB<FoodStore>(DB_FILE, { entries: [] });

      // Replace today's entries with the provided list
      store.entries = store.entries.filter((e) => e.date !== date);
      const newEntries: FoodEntry[] = body.foods.map(
        (f: { name: string; calories: number; emoji?: string; color?: string }) => ({
          name: f.name,
          calories: f.calories,
          emoji: f.emoji || "🍽️",
          color: f.color || "#2a2a2a",
          date,
          timestamp: Date.now(),
        })
      );
      store.entries.push(...newEntries);
      writeDB(DB_FILE, store);

      return Response.json({ success: true, foods: newEntries });
    }

    // Single add
    const entry: FoodEntry = {
      name: body.name,
      calories: body.calories,
      emoji: body.emoji || "🍽️",
      color: body.color || "#2a2a2a",
      date: body.date || getTodayKey(),
      timestamp: Date.now(),
    };

    const store = readDB<FoodStore>(DB_FILE, { entries: [] });
    store.entries.push(entry);
    writeDB(DB_FILE, store);

    return Response.json({ success: true, entry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/foods] POST error:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const store = readDB<FoodStore>(DB_FILE, { entries: [] });
    const date = body.date || getTodayKey();

    if (body.clearAll) {
      // Clear all entries for the given date
      store.entries = store.entries.filter((e) => e.date !== date);
    } else if (body.name) {
      // Remove the first matching entry for today
      const idx = store.entries.findIndex(
        (e) => e.name === body.name && e.date === date
      );
      if (idx !== -1) {
        store.entries.splice(idx, 1);
      }
    }

    writeDB(DB_FILE, store);

    const todayFoods = store.entries.filter((e) => e.date === date);
    return Response.json({ success: true, foods: todayFoods });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/foods] DELETE error:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
