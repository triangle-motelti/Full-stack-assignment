import Link from "next/link";
import { listUsers } from "@/services/users";
import { listProjects } from "@/services/projects";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [usersResult, projectsResult] = await Promise.all([
    listUsers({ page: 1, size: 5 }),
    listProjects({ page: 1, size: 5 }),
  ]);

  const { stats: userStats, meta: userMeta } = usersResult;
  const { items: projects, meta: projectMeta } = projectsResult;

  const formatMoney = (amount: string) => {
    const [whole, fraction = "00"] = amount.split(".");
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$${withCommas}.${fraction}`;
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Hero Section */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Team Directory Dashboard
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            Manage users, projects, and view real-time statistics. Built with Next.js,
            Prisma, PostgreSQL, and Zod.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/users"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
            >
              Manage Users
            </Link>
            <Link
              href="/projects"
              className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section aria-label="Summary statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={userStats.count}
          icon={<UsersIcon />}
          trend={`${userMeta.totalPages} pages`}
          color="blue"
        />
        <StatCard
          title="Total Salary"
          value={formatMoney(userStats.totalSalary)}
          icon={<DollarIcon />}
          trend={`Avg: ${formatMoney(userStats.averageSalary)}`}
          color="emerald"
        />
        <StatCard
          title="Total Projects"
          value={projectMeta.total}
          icon={<ProjectsIcon />}
          trend={`${projectMeta.totalPages} pages`}
          color="indigo"
        />
        <StatCard
          title="Total Budget"
          value={formatMoney(
            projects.reduce((sum, p) => sum + parseFloat(p.budget), 0).toFixed(2)
          )}
          icon={<BudgetIcon />}
          trend={`${projects.filter((p) => p.status === "active").length} active`}
          color="amber"
        />
      </section>

      {/* Quick Actions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/users"
            className="group flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-5 text-center transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <UsersIcon className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
              Add New User
            </span>
            <span className="text-xs text-slate-500">Create team member</span>
          </Link>

          <Link
            href="/users?role=admin"
            className="group flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-5 text-center transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <AdminIcon className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
              View Admins
            </span>
            <span className="text-xs text-slate-500">Filter by role</span>
          </Link>

          <Link
            href="/projects"
            className="group flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-5 text-center transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <ProjectsIcon className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
              Browse Projects
            </span>
            <span className="text-xs text-slate-500">View all projects</span>
          </Link>

          <Link
            href="/users?search="
            className="group flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-5 text-center transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <SearchIcon className="h-6 w-6" />
            </div>
            <span className="font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
              Search Users
            </span>
            <span className="text-xs text-slate-500">Find by name</span>
          </Link>
        </div>
      </section>

      {/* Recent Activity - Latest Users & Projects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
            <Link
              href="/users"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {usersResult.items.slice(0, 5).map((user) => (
              <Link
                key={user.id}
                href={`/users#${user.id}`}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-medium">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{user.name}</p>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {user.role}
                </span>
              </Link>
            ))}
            {usersResult.items.length === 0 && (
              <p className="text-center text-slate-500 py-4">No users yet</p>
            )}
          </div>
        </section>

        {/* Recent Projects */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Projects</h2>
            <Link
              href="/projects"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href="/projects"
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-medium">
                  {project.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{project.name}</p>
                  <p className="text-sm text-slate-500">{formatMoney(project.budget)}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    project.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : project.status === "completed"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {project.status}
                </span>
              </Link>
            ))}
            {projects.length === 0 && (
              <p className="text-center text-slate-500 py-4">No projects yet</p>
            )}
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <footer className="rounded-t-xl border-t border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        <p>
          Full-Stack Assignment — Next.js App Router, TypeScript, Prisma, PostgreSQL, Zod, Tailwind
        </p>
        <p className="mt-1">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
            View on GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  color: "blue" | "emerald" | "indigo" | "amber";
}

const colorStyles: Record<StatCardProps["color"], { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
};

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const styles = colorStyles[color];
  return (
    <div className={`rounded-xl border ${styles.border} bg-white p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{trend}</p>
        </div>
        <div className={`rounded-lg p-3 ${styles.bg} ${styles.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// SVG Icons
function UsersIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.94 3.197M15.649 12.75c0-1.632.791-3.092 2.018-4.002A5.98 5.98 0 0112 8.75c-1.736 0-3.35.771-4.488 2.003 1.227.91 2.017 2.37 2.017 4.002" />
    </svg>
  );
}

function DollarIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M12 6a2 2 0 110 4 2 2 0 010-4zm0 12a2 2 0 110 4 2 2 0 010-4zM3 12h18M5 12a1 1 0 110-2 1 1 0 010 2zm14 0a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

function ProjectsIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 019 10.172V5L8 4z" />
    </svg>
  );
}

function BudgetIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.054v15.892M15 3.054v15.892m-6-1.902h15.902M6.096 19.938a1 1 0 00.844 1.006H17.1a1 1 0 00.844-1.006l2.162-13.056a1 1 0 00-.844-1.006H7.852a1 1 0 00-.844 1.006l-2.162 13.056z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m0-4h4" />
    </svg>
  );
}

function AdminIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  );
}

function SearchIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}