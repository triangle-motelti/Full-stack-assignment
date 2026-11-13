import { z } from "zod";
import Decimal from "decimal.js";

export const USER_ROLES = ["admin", "member"] as const;

const salaryStringSchema = z
  .string()
  .trim()
  .min(1, "Salary is required")
  .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
    message: "Salary must be a valid non-negative decimal with at most 2 decimal places",
  })
  .refine((val) => {
    try {
      const d = new Decimal(val);
      return d.isFinite() && d.gte(0);
    } catch {
      return false;
    }
  }, "Salary must be a valid non-negative amount");

const startDateSchema = z
  .string()
  .trim()
  .min(1, "Start date is required")
  .refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Start date must be a valid date",
  });

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  role: z.enum(USER_ROLES, {
    message: "Role must be either admin or member",
  }),
  salary: salaryStringSchema,
  startDate: startDateSchema,
});

export const updateUserSchema = createUserSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
    .join("; ");
}
