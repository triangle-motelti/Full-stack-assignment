import Decimal from "decimal.js";

export interface StatUserInput {
  salary: string | number | Decimal;
  startDate: Date | string;
}

export interface SeniorityStats {
  years: number;
  months: number;
  totalMonths: number;
}

export interface UserStats {
  count: number;
  totalSalary: string;
  averageSalary: string;
  averageSeniority: SeniorityStats;
}

/**
 * Computes full months elapsed between startDate and referenceDate (clamped >= 0).
 */
export function monthsBetween(startDate: Date | string, referenceDate: Date = new Date()): number {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  if (Number.isNaN(start.getTime())) return 0;

  let months =
    (referenceDate.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (referenceDate.getUTCMonth() - start.getUTCMonth());

  if (referenceDate.getUTCDate() < start.getUTCDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

/**
 * Pure calculation function (no DB access) using decimal.js for exact money math.
 * Rounds half-up to 2 decimal places and returns strings for monetary values.
 */
export function computeUserStats(
  users: StatUserInput[],
  referenceDate: Date = new Date()
): UserStats {
  const count = users.length;

  if (count === 0) {
    return {
      count: 0,
      totalSalary: "0.00",
      averageSalary: "0.00",
      averageSeniority: {
        years: 0,
        months: 0,
        totalMonths: 0,
      },
    };
  }

  let totalSalaryDec = new Decimal(0);
  let totalMonthsSum = new Decimal(0);

  for (const user of users) {
    const salaryDec = new Decimal(user.salary.toString());
    totalSalaryDec = totalSalaryDec.plus(salaryDec);
    totalMonthsSum = totalMonthsSum.plus(monthsBetween(user.startDate, referenceDate));
  }

  const totalSalary = totalSalaryDec
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toFixed(2);

  const averageSalary = totalSalaryDec
    .div(count)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toFixed(2);

  const avgTotalMonths = totalMonthsSum
    .div(count)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toNumber();

  return {
    count,
    totalSalary,
    averageSalary,
    averageSeniority: {
      years: Math.floor(avgTotalMonths / 12),
      months: avgTotalMonths % 12,
      totalMonths: avgTotalMonths,
    },
  };
}
