import { NextRequest, NextResponse } from "next/server";
import { createUserSchema, formatZodError } from "@/lib/validations/user";
import { ConflictError, createUser, listUsers } from "@/services/users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await listUsers({
      page: searchParams.get("page"),
      size: searchParams.get("size"),
      role: searchParams.get("role"),
      search: searchParams.get("search"),
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  try {
    const user = await createUser(parsed.data);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (err) {
    if (err instanceof ConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("POST /api/users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
