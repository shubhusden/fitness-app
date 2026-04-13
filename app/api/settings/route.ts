import { readDB, writeDB } from "../../../backend/db";

const DB_FILE = "settings.json";

interface Settings {
  theme?: string;
  [key: string]: unknown;
}

export async function GET() {
  const settings = readDB<Settings>(DB_FILE, {});
  return Response.json({ settings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Merge new settings with existing
    const existing = readDB<Settings>(DB_FILE, {});
    const updated = { ...existing, ...body };
    writeDB(DB_FILE, updated);

    return Response.json({ success: true, settings: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/settings] POST error:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
