import { readDB, writeDB } from "../../../backend/db";

const DB_FILE = "workout-logs.json";

interface WorkoutLog {
  exercise: string;
  sets: number;
  reps: number;
  timestamp: number;
}

interface WorkoutStore {
  logs: WorkoutLog[];
}

export async function GET() {
  const store = readDB<WorkoutStore>(DB_FILE, { logs: [] });
  return Response.json({ logs: store.logs });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support bulk sync
    if (body.logs && Array.isArray(body.logs)) {
      const store: WorkoutStore = { logs: body.logs };
      writeDB(DB_FILE, store);
      return Response.json({ success: true, logs: store.logs });
    }

    // Single add
    const entry: WorkoutLog = {
      exercise: body.exercise,
      sets: body.sets,
      reps: body.reps,
      timestamp: body.timestamp || Date.now(),
    };

    const store = readDB<WorkoutStore>(DB_FILE, { logs: [] });
    store.logs.push(entry);
    writeDB(DB_FILE, store);

    return Response.json({ success: true, entry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/workouts] POST error:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    writeDB(DB_FILE, { logs: [] });
    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/workouts] DELETE error:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
