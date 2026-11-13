import { describe, expect, it } from "vitest";
import { computeUserStats } from "@/lib/stats";

describe("computeUserStats()", () => {
  it("handles an empty user list without crashing", () => {
    const stats = computeUserStats([], new Date("2026-01-01T00:00:00Z"));

    expect(stats).toEqual({
      count: 0,
      totalSalary: "0.00",
      averageSalary: "0.00",
      averageSeniority: {
        years: 0,
        months: 0,
        totalMonths: 0,
      },
    });
  });

  it("uses decimal.js precision and rounds half-up to 2 decimal places", () => {
    const refDate = new Date("2026-01-01T00:00:00Z");
    const stats = computeUserStats(
      [
        { salary: "100.01", startDate: "2024-01-01T00:00:00Z" }, // 24 months
        { salary: "100.02", startDate: "2025-01-01T00:00:00Z" }, // 12 months
      ],
      refDate
    );

    // 200.03 / 2 = 100.015 -> rounds half-up to 100.02
    expect(stats.count).toBe(2);
    expect(stats.totalSalary).toBe("200.03");
    expect(stats.averageSalary).toBe("100.02");
    expect(stats.averageSeniority).toEqual({
      years: 1,
      months: 6,
      totalMonths: 18,
    });
  });

  it("avoids floating-point drift on decimal addition", () => {
    const refDate = new Date("2026-06-15T00:00:00Z");
    const stats = computeUserStats(
      [
        { salary: "0.10", startDate: "2025-06-15T00:00:00Z" },
        { salary: "0.20", startDate: "2025-06-15T00:00:00Z" },
      ],
      refDate
    );

    expect(stats.totalSalary).toBe("0.30");
    expect(stats.averageSalary).toBe("0.15");
    expect(stats.averageSeniority).toEqual({
      years: 1,
      months: 0,
      totalMonths: 12,
    });
  });
});
