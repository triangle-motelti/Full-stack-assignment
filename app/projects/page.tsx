import { listProjects } from "@/services/projects";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

type ProjectsSearchParams = Promise<{
  page?: string;
  size?: string;
}>;

export default async function ProjectsPage({ searchParams }: { searchParams: ProjectsSearchParams }) {
  const params = await searchParams;
  const { items, meta } = await listProjects({
    page: params.page,
    size: params.size,
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
        <p className="mt-1 text-sm text-slate-600">
          Secondary list reusing the same paginate() helper and &lt;Pagination /&gt; component.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Project Name</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Budget</th>
                <th className="py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No projects found.
                  </td>
                </tr>
              ) : (
                items.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium text-slate-900">{project.name}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-slate-800">
                      ${project.budget}
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      {project.createdAt.slice(0, 10)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            page={meta.page}
            size={meta.size}
            total={meta.total}
            totalPages={meta.totalPages}
          />
        </div>
      </div>
    </main>
  );
}
