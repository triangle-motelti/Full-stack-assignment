import type { UserStats as UserStatsData } from "@/lib/stats";

interface UserStatsProps {
  stats: UserStatsData;
}

function formatMoney(amount: string): string {
  const [whole, fraction = "00"] = amount.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${withCommas}.${fraction}`;
}

export function UserStats({ stats }: UserStatsProps) {
  const { count, totalSalary, averageSalary, averageSeniority } = stats;

  return (
    <section
      aria-label="Filtered user statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Filtered Users
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{count}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Total Salary
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {formatMoney(totalSalary)}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Average Salary
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {formatMoney(averageSalary)}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Average Seniority
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {averageSeniority.years}y {averageSeniority.months}m
        </p>
      </div>
    </section>
  );
}
