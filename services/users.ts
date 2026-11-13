import { Prisma, Role, User } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { paginate, PaginatedResult } from "@/lib/paginate";
import { computeUserStats, UserStats } from "@/lib/stats";
import { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";

export class NotFoundError extends Error {
  readonly status = 404;
  constructor(message = "User not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  readonly status = 409;
  constructor(message = "Email already exists") {
    super(message);
    this.name = "ConflictError";
  }
}

export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  salary: string;
  startDate: string;
  createdAt: string;
}

export interface SerializedUserWithPassword extends SerializedUser {
  password: string;
}

export function serializeUser(user: User): SerializedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    salary: user.salary.toFixed(2),
    startDate: user.startDate.toISOString(),
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeUserWithPassword(user: User): SerializedUserWithPassword {
  return {
    ...serializeUser(user),
    password: user.password ?? "",
  };
}

export interface ListUsersParams {
  page?: string | number | null;
  size?: string | number | null;
  role?: string | null;
  search?: string | null;
}

export interface ListUsersResult extends PaginatedResult<SerializedUser> {
  stats: UserStats;
}

function buildUserWhere(params: { role?: string | null; search?: string | null }): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (params.role === "admin" || params.role === "member") {
    where.role = params.role;
  }

  const trimmedSearch = params.search?.trim();
  if (trimmedSearch) {
    where.name = {
      contains: trimmedSearch,
      mode: "insensitive",
    };
  }

  return where;
}

function isPrismaUniqueError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

function isPrismaNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2025"
  );
}

export async function listUsers(params: ListUsersParams): Promise<ListUsersResult> {
  const where = buildUserWhere(params);

  const [paginated, allFilteredForStats] = await Promise.all([
    paginate({
      page: params.page,
      size: params.size,
      count: () => prisma.user.count({ where }),
      findMany: ({ skip, take }) =>
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
    }),
    prisma.user.findMany({
      where,
      select: {
        salary: true,
        startDate: true,
      },
    }),
  ]);

  const stats = computeUserStats(
    allFilteredForStats.map((u) => ({
      salary: u.salary.toString(),
      startDate: u.startDate,
    }))
  );

  return {
    items: paginated.items.map(serializeUser),
    meta: paginated.meta,
    stats,
  };
}

export async function getUserById(id: string): Promise<SerializedUser> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError(`User with id "${id}" was not found`);
  }
  return serializeUser(user);
}

export async function createUser(input: CreateUserInput): Promise<SerializedUser> {
  try {
    const created = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        salary: input.salary,
        startDate: new Date(input.startDate),
      },
    });
    return serializeUser(created);
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      throw new ConflictError(`A user with email "${input.email}" already exists`);
    }
    throw err;
  }
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<SerializedUser> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`User with id "${id}" was not found`);
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.salary !== undefined ? { salary: input.salary } : {}),
        ...(input.startDate !== undefined ? { startDate: new Date(input.startDate) } : {}),
      },
    });
    return serializeUser(updated);
  } catch (err) {
    if (isPrismaUniqueError(err)) {
      throw new ConflictError(`A user with email "${input.email}" already exists`);
    }
    if (isPrismaNotFoundError(err)) {
      throw new NotFoundError(`User with id "${id}" was not found`);
    }
    throw err;
  }
}

export async function deleteUser(id: string): Promise<SerializedUser> {
  try {
    const deleted = await prisma.user.delete({ where: { id } });
    return serializeUser(deleted);
  } catch (err) {
    if (isPrismaNotFoundError(err)) {
      throw new NotFoundError(`User with id "${id}" was not found`);
    }
    throw err;
  }
}

export async function getUserByEmailWithPassword(email: string): Promise<SerializedUserWithPassword | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return serializeUserWithPassword(user);
}
