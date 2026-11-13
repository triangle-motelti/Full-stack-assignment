import { NextRequest, NextResponse } from "next/server";
import { getUserByEmailWithPassword } from "@/services/users";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 }); }
  const { email, password } = body;
  if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  try {
    const user = await getUserByEmailWithPassword(email.toLowerCase().trim());
    if (!user || !user.password) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const authUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    await createSession(authUser);
    return NextResponse.json({ data: { user: authUser } }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
