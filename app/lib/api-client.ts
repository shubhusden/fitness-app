/**
 * Centralized API client for NourishFit backend.
 * All functions call the backend API and update localStorage as cache.
 */

// ─── User ───────────────────────────────────────────────

export interface UserData {
  name?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  goal?: number;
  photo?: string;
}

export async function fetchUser(): Promise<UserData | null> {
  try {
    const res = await fetch("/api/user");
    const data = await res.json();
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    }
    // Fallback: check localStorage
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    // Offline fallback
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }
}

export async function saveUser(user: UserData): Promise<boolean> {
  // Always save to localStorage immediately for instant access
  localStorage.setItem("user", JSON.stringify(user));

  try {
    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    return data.success;
  } catch {
    console.warn("[api-client] Failed to save user to backend, using localStorage only");
    return false;
  }
}

// ─── Foods ──────────────────────────────────────────────

export interface FoodEntry {
  name: string;
  calories: number;
  emoji?: string;
  color?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export async function fetchFoods(): Promise<FoodEntry[]> {
  try {
    const res = await fetch("/api/foods");
    const data = await res.json();
    if (data.foods && data.foods.length > 0) {
      localStorage.setItem("foods", JSON.stringify(data.foods));
      return data.foods;
    }
    // Fallback
    const stored = localStorage.getItem("foods");
    return stored ? JSON.parse(stored) : [];
  } catch {
    const stored = localStorage.getItem("foods");
    return stored ? JSON.parse(stored) : [];
  }
}

export async function addFood(food: FoodEntry): Promise<boolean> {
  try {
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(food),
    });
    const data = await res.json();
    return data.success;
  } catch {
    console.warn("[api-client] Failed to add food to backend");
    return false;
  }
}

export async function removeFood(name: string): Promise<FoodEntry[]> {
  try {
    const res = await fetch("/api/foods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.foods) {
      localStorage.setItem("foods", JSON.stringify(data.foods));
      return data.foods;
    }
    return [];
  } catch {
    console.warn("[api-client] Failed to remove food from backend");
    return [];
  }
}

export async function clearFoods(): Promise<boolean> {
  localStorage.removeItem("foods");
  try {
    const res = await fetch("/api/foods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function syncFoods(foods: FoodEntry[]): Promise<boolean> {
  localStorage.setItem("foods", JSON.stringify(foods));
  try {
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foods }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

// ─── Workouts ───────────────────────────────────────────

export interface WorkoutLogEntry {
  exercise: string;
  sets: number;
  reps: number;
  timestamp: number;
  duration?: number; // Duration in minutes
  intensity?: "Low" | "Moderate" | "High";
  caloriesBurned?: number;
}

export async function fetchWorkoutLogs(): Promise<WorkoutLogEntry[]> {
  try {
    const res = await fetch("/api/workouts");
    const data = await res.json();
    if (data.logs && data.logs.length > 0) {
      localStorage.setItem("workoutLogs", JSON.stringify(data.logs));
      return data.logs;
    }
    const stored = localStorage.getItem("workoutLogs");
    return stored ? JSON.parse(stored) : [];
  } catch {
    const stored = localStorage.getItem("workoutLogs");
    return stored ? JSON.parse(stored) : [];
  }
}

export async function logWorkout(entry: WorkoutLogEntry): Promise<boolean> {
  try {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const data = await res.json();
    return data.success;
  } catch {
    console.warn("[api-client] Failed to log workout to backend");
    return false;
  }
}

export async function syncWorkoutLogs(logs: WorkoutLogEntry[]): Promise<boolean> {
  localStorage.setItem("workoutLogs", JSON.stringify(logs));
  try {
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs }),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

// ─── Settings ───────────────────────────────────────────

export interface AppSettings {
  theme?: string;
  [key: string]: unknown;
}

export async function fetchSettings(): Promise<AppSettings> {
  try {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (data.settings) {
      // Sync individual settings to localStorage for backward compat
      if (data.settings.theme) {
        localStorage.setItem("theme", data.settings.theme);
      }
      return data.settings;
    }
    return {};
  } catch {
    return {};
  }
}

export async function saveSettings(settings: AppSettings): Promise<boolean> {
  // Sync to localStorage
  if (settings.theme) {
    localStorage.setItem("theme", settings.theme);
  }

  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}
