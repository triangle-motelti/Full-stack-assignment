"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface FormState { email: string; password: string; }

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/users";
  const [values, setValues] = useState<FormState>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Invalid email or password"); return; }
      router.push(callbackUrl); router.refresh();
    } catch { setError("Network error. Please try again."); }
    finally { setIsLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-slate-900">Team Directory</Link>
          <h1 className="mt-6 text-3xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-2 text-slate-600">Enter your credentials to access the dashboard</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input id="email" type="email" autoComplete="email" value={values.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-600" required disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input id="password" type="password" autoComplete="current-password" value={values.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-600" required disabled={isLoading} />
            </div>
            <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
