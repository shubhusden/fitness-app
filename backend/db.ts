import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "backend", "data");

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Read a JSON database file. Returns the parsed data or a default value.
 */
export function readDB<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    console.error(`[db] Error reading ${filename}, returning default`);
    return defaultValue;
  }
}

/**
 * Write data to a JSON database file atomically.
 * Writes to a temp file first, then renames to avoid corruption.
 */
export function writeDB<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = filePath + ".tmp";

  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`[db] Error writing ${filename}:`, err);
    // Clean up temp file if it exists
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {
      // ignore cleanup error
    }
    throw err;
  }
}
