import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];
const PROTECTED_PATHS = ["/users", "/projects", "/api/users"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const session = await getSession();

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname === "/login" && session) return NextResponse.redirect(new URL("/users", request.url));
  if (pathname === "/" && session) return NextResponse.redirect(new URL("/users", request.url));

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"] };
