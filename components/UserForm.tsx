"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserSchema } from "@/lib/validations/user";
import type { SerializedUser } from "@/services/users";

interface UserFormProps {
  editingUser?: SerializedUser | null;
  onCancelEdit?: () => void;
  onSaved?: () => void;
}

interface FormState {
  name: string;
  email: string;
  role: "admin" | "member";
  salary: string;
  startDate: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  role: "member",
  salary: "",
  startDate: new Date().toISOString().slice(0, 10),
};

function toFormState(user: SerializedUser): FormState {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    salary: user.salary,
    startDate: user.startDate.slice(0, 10),
  };
}

function validateFormLive(values: FormState): FieldErrors {
  const result = createUserSchema.safeParse(values);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof FormState | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

export function UserForm({ editingUser, onCancelEdit, onSaved }: UserFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(
    editingUser ? toFormState(editingUser) : EMPTY_FORM
  );
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setValues(editingUser ? toFormState(editingUser) : EMPTY_FORM);
    setTouched({});
    setStatusMessage(null);
  }, [editingUser]);

  const errors = validateFormLive(values);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (statusMessage) setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      role: true,
      salary: true,
      startDate: true,
    });

    const parsed = createUserSchema.safeParse(values);
    if (!parsed.success) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const endpoint = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatusMessage({
          type: "error",
          text: payload.error ?? `Request failed (${res.status})`,
        });
        return;
      }

      setStatusMessage({
        type: "success",
        text: editingUser ? "User updated successfully." : "User created successfully.",
      });

      if (!editingUser) {
        setValues(EMPTY_FORM);
        setTouched({});
      }

      router.refresh();
      onSaved?.();
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error while saving user.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          {editingUser ? `Edit User: ${editingUser.name}` : "Add New User"}
        </h2>
        {editingUser && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="user-name" className="mb-1 block text-xs font-medium text-slate-700">
            Name
          </label>
          <input
            id="user-name"
            type="text"
            value={values.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, name: true }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="user-email" className="mb-1 block text-xs font-medium text-slate-700">
            Email
          </label>
          <input
            id="user-email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="user-role" className="mb-1 block text-xs font-medium text-slate-700">
            Role
          </label>
          <select
            id="user-role"
            value={values.role}
            onChange={(e) => handleChange("role", e.target.value as "admin" | "member")}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          {touched.role && errors.role && (
            <p className="mt-1 text-xs text-red-600">{errors.role}</p>
          )}
        </div>

        <div>
          <label htmlFor="user-salary" className="mb-1 block text-xs font-medium text-slate-700">
            Salary
          </label>
          <input
            id="user-salary"
            type="text"
            inputMode="decimal"
            placeholder="65000.00"
            value={values.salary}
            onChange={(e) => handleChange("salary", e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, salary: true }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
          />
          {touched.salary && errors.salary && (
            <p className="mt-1 text-xs text-red-600">{errors.salary}</p>
          )}
        </div>

        <div>
          <label htmlFor="user-start-date" className="mb-1 block text-xs font-medium text-slate-700">
            Start Date
          </label>
          <input
            id="user-start-date"
            type="date"
            value={values.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, startDate: true }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-600 focus:outline-none"
          />
          {touched.startDate && errors.startDate && (
            <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-5 text-sm">
          {statusMessage && (
            <p
              role="status"
              className={
                statusMessage.type === "success" ? "text-emerald-700 font-medium" : "text-red-600 font-medium"
              }
            >
              {statusMessage.text}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving || !isValid}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
        </button>
      </div>
    </form>
  );
}
