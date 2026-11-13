"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ALLOWED_PAGE_SIZES, PageSize } from "@/lib/paginate";

interface PaginationProps {
  page: number;
  size: PageSize;
  total: number;
  totalPages: number;
}

function getPageNumbers(current: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: Array<number | "..."> = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (current < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export function Pagination({ page, size, total, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateUrl = (nextPage: number, nextSize: PageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("size", String(nextSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const startItem = total === 0 ? 0 : (page - 1) * size + 1;
  const endItem = Math.min(page * size, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 pt-4 text-sm text-slate-600">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-slate-900">{startItem}</strong>–
          <strong className="text-slate-900">{endItem}</strong> of{" "}
          <strong className="text-slate-900">{total}</strong>
        </span>

        <label className="flex items-center gap-1.5">
          <span>Rows:</span>
          <select
            aria-label="Page size"
            value={size}
            onChange={(e) => updateUrl(1, Number(e.target.value) as PageSize)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-800 focus:border-slate-500 focus:outline-none"
          >
            {ALLOWED_PAGE_SIZES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => updateUrl(Math.max(1, page - 1), size)}
          disabled={page <= 1}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>

        {pageNumbers.map((item, idx) =>
          item === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => updateUrl(item, size)}
              aria-current={item === page ? "page" : undefined}
              className={`rounded-md border px-2.5 py-1 font-medium transition ${
                item === page
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => updateUrl(Math.min(totalPages, page + 1), size)}
          disabled={page >= totalPages}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
