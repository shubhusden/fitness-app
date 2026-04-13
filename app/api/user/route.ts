import { readDB, writeDB } from "../../../backend/db";

const DB_FILE = "users.json";

interface UserData {
  name?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  goal?: number;
  photo?: string;
}

export async function GET() {
  const user = readDB<UserData | null>(DB_FILE, null);
  return Response.json({ user });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userData: UserData = {
      name: body.name,
      age: body.age,
      gender: body.gender,
      height: body.height,
      weight: body.weight,
      goal: body.goal,
      photo: body.photo,
    };

    writeDB(DB_FILE, userData);
    return Response.json({ success: true, user: userData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[api/user] POST error:", message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
