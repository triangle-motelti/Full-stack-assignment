export const ALLOWED_PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof ALLOWED_PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

export interface PaginationMeta {
  page: number;
  size: PageSize;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export function parsePage(raw: string | number | undefined | null): number {
  if (raw === undefined || raw === null || raw === "") return 1;
  const parsed = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

export function parsePageSize(raw: string | number | undefined | null): PageSize {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_PAGE_SIZE;
  const parsed = typeof raw === "number" ? raw : Number(raw);
  if (ALLOWED_PAGE_SIZES.includes(parsed as PageSize)) {
    return parsed as PageSize;
  }
  return DEFAULT_PAGE_SIZE;
}

export function clampPage(requestedPage: number, total: number, size: PageSize): {
  page: number;
  totalPages: number;
} {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safeRequested = parsePage(requestedPage);
  const page = Math.min(safeRequested, totalPages);
  return { page, totalPages };
}

export interface PaginateOptions<T> {
  page?: string | number | null;
  size?: string | number | null;
  count: () => Promise<number>;
  findMany: (args: { skip: number; take: number }) => Promise<T[]>;
}

/**
 * Reusable server-side pagination helper.
 * Delegates counting and slicing (skip/take) directly to the database.
 */
export async function paginate<T>(options: PaginateOptions<T>): Promise<PaginatedResult<T>> {
  const validSize = parsePageSize(options.size);
  const requestedPage = parsePage(options.page);

  const total = await options.count();
  const { page, totalPages } = clampPage(requestedPage, total, validSize);

  const skip = (page - 1) * validSize;
  const items = total === 0 ? [] : await options.findMany({ skip, take: validSize });

  return {
    items,
    meta: {
      page,
      size: validSize,
      total,
      totalPages,
    },
  };
}
