import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE_NAME = "auth_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

export interface SessionData {
  user: AuthUser;
  expiresAt: number;
}

export const HARDCODED_USERS = [
  { name: "Abdellatif Elfany", email: "abdellatif.elfany@example.com", role: "admin" as const, password: "Admin@2024!SecurePass1", salary: "120000.00", startDate: new Date("2019-01-15") },
  { name: "Mohamed Telti", email: "mohamed.telti@example.com", role: "admin" as const, password: "Mohamed@2024!AdminPass2", salary: "115000.00", startDate: new Date("2020-03-20") },
  { name: "Driss Sijelmassi", email: "driss.sijelmassi@example.com", role: "admin" as const, password: "Driss@2024!SuperAdmin3", salary: "118000.00", startDate: new Date("2018-11-10") },
  { name: "Test Member One", email: "member1@example.com", role: "member" as const, password: "Member@2024!TestPass1", salary: "55000.00", startDate: new Date("2023-06-01") },
  { name: "Test Member Two", email: "member2@example.com", role: "member" as const, password: "Member@2024!TestPass2", salary: "58000.00", startDate: new Date("2024-01-15") },
];

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getHardcodedUsersWithHashes() {
  return Promise.all(HARDCODED_USERS.map(async (u) => ({ ...u, password: await hashPassword(u.password) })));
}

export async function createSession(user: AuthUser): Promise<void> {
  const sessionData: SessionData = { user, expiresAt: Date.now() + SESSION_COOKIE_MAX_AGE * 1000 };
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE, path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  try {
    const sessionData: SessionData = JSON.parse(sessionCookie.value);
    if (Date.now() > sessionData.expiresAt) return null;
    return sessionData;
  } catch { return null; }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "admin") redirect("/users");
  return user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function canViewPersonalData(user: AuthUser | null): boolean {
  return user?.role === "admin";
}

export function canManageUsers(user: AuthUser | null): boolean {
  return user?.role === "admin";
}
