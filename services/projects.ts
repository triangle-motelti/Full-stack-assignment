import { Project } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { paginate, PaginatedResult } from "@/lib/paginate";

export interface SerializedProject {
  id: string;
  name: string;
  status: string;
  budget: string;
  createdAt: string;
}

function serializeProject(project: Project): SerializedProject {
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    budget: project.budget.toFixed(2),
    createdAt: project.createdAt.toISOString(),
  };
}

export async function listProjects(params: {
  page?: string | number | null;
  size?: string | number | null;
}): Promise<PaginatedResult<SerializedProject>> {
  const paginated = await paginate({
    page: params.page,
    size: params.size,
    count: () => prisma.project.count(),
    findMany: ({ skip, take }) =>
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
  });

  return {
    items: paginated.items.map(serializeProject),
    meta: paginated.meta,
  };
}
