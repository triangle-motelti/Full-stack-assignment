import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import Decimal from "decimal.js";

interface MockUserRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  salary: Decimal;
  startDate: Date;
  createdAt: Date;
}

const store = new Map<string, MockUserRow>();
let seq = 1;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      count: vi.fn(async () => store.size),
      findMany: vi.fn(async (args?: { skip?: number; take?: number; select?: unknown }) => {
        const all = Array.from(store.values());
        if (args?.skip !== undefined && args?.take !== undefined) {
          return all.slice(args.skip, args.skip + args.take);
        }
        return all;
      }),
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        return store.get(where.id) ?? null;
      }),
      create: vi.fn(async ({ data }: { data: { name: string; email: string; role: "admin" | "member"; salary: string; startDate: Date } }) => {
        for (const existing of store.values()) {
          if (existing.email === data.email) {
            throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
          }
        }
        const row: MockUserRow = {
          id: `user_${seq++}`,
          name: data.name,
          email: data.email,
          role: data.role,
          salary: new Decimal(data.salary),
          startDate: data.startDate,
          createdAt: new Date(),
        };
        store.set(row.id, row);
        return row;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<{ name: string; email: string; role: "admin" | "member"; salary: string; startDate: Date }> }) => {
        const current = store.get(where.id);
        if (!current) {
          throw Object.assign(new Error("Record not found"), { code: "P2025" });
        }
        if (data.email) {
          for (const existing of store.values()) {
            if (existing.email === data.email && existing.id !== where.id) {
              throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
            }
          }
        }
        const updated: MockUserRow = {
          ...current,
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.role !== undefined ? { role: data.role } : {}),
          ...(data.salary !== undefined ? { salary: new Decimal(data.salary) } : {}),
          ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
        };
        store.set(where.id, updated);
        return updated;
      }),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        const current = store.get(where.id);
        if (!current) {
          throw Object.assign(new Error("Record not found"), { code: "P2025" });
        }
        store.delete(where.id);
        return current;
      }),
    },
  },
}));

import { GET as listHandler, POST as createHandler } from "@/app/api/users/route";
import {
  DELETE as deleteHandler,
  GET as getOneHandler,
  PATCH as updateHandler,
} from "@/app/api/users/[id]/route";

describe("/api/users CRUD + error cases", () => {
  beforeEach(() => {
    store.clear();
    seq = 1;
  });

  it("handles create, read, update, delete, 400, 404, and 409", async () => {
    // 1. Create (201)
    const createReq = new NextRequest("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Amina El Idrissi",
        email: "amina@example.com",
        role: "admin",
        salary: "95000.00",
        startDate: "2022-01-15",
      }),
    });
    const createRes = await createHandler(createReq);
    expect(createRes.status).toBe(201);
    const createdBody = (await createRes.json()) as { data: { id: string; salary: string } };
    const userId = createdBody.data.id;
    expect(createdBody.data.salary).toBe("95000.00");

    // 2. Duplicate email -> 409
    const dupReq = new NextRequest("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Another Amina",
        email: "amina@example.com",
        role: "member",
        salary: "50000.00",
        startDate: "2023-01-01",
      }),
    });
    const dupRes = await createHandler(dupReq);
    expect(dupRes.status).toBe(409);

    // 3. Invalid input -> 400
    const badReq = new NextRequest("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "A", email: "not-an-email" }),
    });
    const badRes = await createHandler(badReq);
    expect(badRes.status).toBe(400);

    // 4. Read list + single (200) & unknown id (404)
    const listRes = await listHandler(new NextRequest("http://localhost:3000/api/users?page=1&size=10"));
    expect(listRes.status).toBe(200);
    const listBody = (await listRes.json()) as { items: unknown[]; meta: { total: number } };
    expect(listBody.items).toHaveLength(1);
    expect(listBody.meta.total).toBe(1);

    const getRes = await getOneHandler(new NextRequest(`http://localhost:3000/api/users/${userId}`), {
      params: Promise.resolve({ id: userId }),
    });
    expect(getRes.status).toBe(200);

    const notFoundRes = await getOneHandler(new NextRequest("http://localhost:3000/api/users/unknown_id"), {
      params: Promise.resolve({ id: "unknown_id" }),
    });
    expect(notFoundRes.status).toBe(404);

    // 5. Update (200) & unknown id (404)
    const patchReq = new NextRequest(`http://localhost:3000/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salary: "98000.50" }),
    });
    const patchRes = await updateHandler(patchReq, {
      params: Promise.resolve({ id: userId }),
    });
    expect(patchRes.status).toBe(200);
    const patchedBody = (await patchRes.json()) as { data: { salary: string } };
    expect(patchedBody.data.salary).toBe("98000.50");

    // 6. Delete (200) & subsequent read (404)
    const delRes = await deleteHandler(new NextRequest(`http://localhost:3000/api/users/${userId}`), {
      params: Promise.resolve({ id: userId }),
    });
    expect(delRes.status).toBe(200);

    const afterDelRes = await getOneHandler(new NextRequest(`http://localhost:3000/api/users/${userId}`), {
      params: Promise.resolve({ id: userId }),
    });
    expect(afterDelRes.status).toBe(404);
  });
});
