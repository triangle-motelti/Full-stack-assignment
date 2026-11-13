import { describe, expect, it, vi } from "vitest";
import { clampPage, paginate, parsePage, parsePageSize } from "@/lib/paginate";

describe("paginate()", () => {
  it("falls back to page 1 for non-numeric or non-positive page values", async () => {
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("-5")).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage(undefined)).toBe(1);

    const findMany = vi.fn().mockResolvedValue(["u1", "u2"]);
    const result = await paginate({
      page: "abc",
      size: "10",
      count: async () => 25,
      findMany,
    });

    expect(result.meta).toEqual({
      page: 1,
      size: 10,
      total: 25,
      totalPages: 3,
    });
    expect(findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
  });

  it("clamps an out-of-range page like ?page=999 to the last page", async () => {
    const findMany = vi.fn().mockResolvedValue(["u21", "u22"]);
    const result = await paginate({
      page: "999",
      size: "10",
      count: async () => 22,
      findMany,
    });

    expect(result.meta).toEqual({
      page: 3,
      size: 10,
      total: 22,
      totalPages: 3,
    });
    expect(findMany).toHaveBeenCalledWith({ skip: 20, take: 10 });
  });

  it("returns page 1 and skips findMany when total count is 0", async () => {
    const findMany = vi.fn();
    const result = await paginate({
      page: "5",
      size: "20",
      count: async () => 0,
      findMany,
    });

    expect(result.items).toEqual([]);
    expect(result.meta).toEqual({
      page: 1,
      size: 20,
      total: 0,
      totalPages: 1,
    });
    expect(findMany).not.toHaveBeenCalled();
  });

  it("only allows page sizes 10, 20, and 50", () => {
    expect(parsePageSize("10")).toBe(10);
    expect(parsePageSize("20")).toBe(20);
    expect(parsePageSize("50")).toBe(50);
    expect(parsePageSize("35")).toBe(10);
    expect(parsePageSize("bad")).toBe(10);
  });

  it("clamps exact boundary pages correctly", () => {
    expect(clampPage(2, 40, 20)).toEqual({ page: 2, totalPages: 2 });
    expect(clampPage(3, 40, 20)).toEqual({ page: 2, totalPages: 2 });
  });
});
