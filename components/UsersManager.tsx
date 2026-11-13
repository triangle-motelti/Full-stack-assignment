"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedUser } from "@/services/users";
import type { PaginationMeta } from "@/lib/paginate";
import { UserForm } from "./UserForm";
import { Pagination } from "./Pagination";

interface UsersManagerProps {
  users: SerializedUser[];
  meta: PaginationMeta;
  currentUserRole: "admin" | "member";
}

export function UsersManager({ users, meta, currentUserRole }: UsersManagerProps) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<SerializedUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (user: SerializedUser) => {
    setDeletingId(user.id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setDeleteError(data.error ?? "Failed to delete user.");
        return;
      }
      if (editingUser?.id === user.id) {
        setEditingUser(null);
      }
      router.refresh();
    } catch {
      setDeleteError("Network error while deleting user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <UserForm
        editingUser={editingUser}
        onCancelEdit={() => setEditingUser(null)}
        onSaved={() => {
          if (editingUser) setEditingUser(null);
        }}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {deleteError && (
          <p role="alert" className="mb-3 text-sm font-medium text-red-600">
            {deleteError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                {currentUserRole === "admin" && (
                  <>
                    <th className="py-3 pr-4 text-right">Salary</th>
                    <th className="py-3 pr-4">Start Date</th>
                    <th className="py-3 text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={currentUserRole === "admin" ? 6 : 3} className="py-8 text-center text-slate-500">
                    No users match the current filter.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium text-slate-900">{user.name}</td>
                    <td className="py-3 pr-4 text-slate-600">{user.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    {currentUserRole === "admin" && (
                      <>
                        <td className="py-3 pr-4 text-right font-mono text-slate-800">
                          ${user.salary}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {user.startDate.slice(0, 10)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingUser(user)}
                              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === user.id}
                              onClick={() => handleDelete(user)}
                              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === user.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
    </div>
  );
}
