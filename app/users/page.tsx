import { listUsers } from "@/services/users";
import { getCurrentUser } from "@/lib/auth";
import { UserStats } from "@/components/UserStats";
import { SearchInput } from "@/components/SearchInput";
import { UsersManager } from "@/components/UsersManager";

export const dynamic = "force-dynamic";

type UsersSearchParams = Promise<{
  page?: string;
  size?: string;
  role?: string;
  search?: string;
}>;

export default async function UsersPage({ searchParams }: { searchParams: UsersSearchParams }) {
  const params = await searchParams;
  const [result, currentUser] = await Promise.all([
    listUsers({
    page: params.page,
      size: params.size,
      role: params.role,
      search: params.search,
    }),
    getCurrentUser(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage team members, filter by name or role, and view salary &amp; seniority stats.
        </p>
      </div>

      <UserStats stats={result.stats} />
      <SearchInput initialSearch={params.search ?? ""} initialRole={params.role ?? ""} />
      <UsersManager users={result.items} meta={result.meta} currentUserRole={currentUser?.role ?? "member"} />
    </main>
  );
}
