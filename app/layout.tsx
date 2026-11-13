import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { getCurrentUser, destroySession } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Full-Stack Assignment",
  description: "Users & Projects directory with Next.js App Router, Prisma, PostgreSQL, and Zod",
};

async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/users" className="text-base font-semibold text-slate-900">
          Team Directory
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/users" className="hover:text-slate-900">
            Users
          </Link>
          <Link href="/projects" className="hover:text-slate-900">
            Projects
          </Link>
          {user && (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
