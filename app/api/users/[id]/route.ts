import { NextRequest, NextResponse } from "next/server";
import { formatZodError, updateUserSchema } from "@/lib/validations/user";
import {
  ConflictError,
  deleteUser,
  getUserById,
  NotFoundError,
  updateUser,
} from "@/services/users";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id.trim()) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  try {
    const user = await getUserById(id);
    return NextResponse.json({ data: user }, { status: 200 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(`GET /api/users/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id.trim()) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  try {
    const updated = await updateUser(id, parsed.data);
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof ConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(`PATCH /api/users/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id.trim()) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  try {
    const deleted = await deleteUser(id);
    return NextResponse.json({ data: deleted }, { status: 200 });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(`DELETE /api/users/${id} error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
