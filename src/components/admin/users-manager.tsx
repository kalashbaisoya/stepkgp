"use client";

import { useState, useTransition } from "react";
import { assignRoleAction, revokeRoleAction, setUserStatusAction } from "@/modules/admin/actions";

type User = { id: string; name: string | null; email: string; status: string; roles: string[] };
type Role = { key: string; name: string };
const PRIVILEGED = ["admin", "super_admin"];

export function UsersManager({
  users,
  roles,
  canManageRoles,
}: {
  users: User[];
  roles: Role[];
  canManageRoles: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface-2 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Roles</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3">
                <div className="font-medium">{u.name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {roles.map((r) => {
                    const on = u.roles.includes(r.key);
                    const locked = PRIVILEGED.includes(r.key) && !canManageRoles;
                    return (
                      <button
                        key={r.key}
                        disabled={pending || locked}
                        onClick={() => start(async () => { on ? await revokeRoleAction(u.id, r.key) : await assignRoleAction(u.id, r.key); })}
                        className={`rounded-full border px-2 py-0.5 text-xs transition-colors disabled:opacity-40 ${on ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted"}`}
                        title={locked ? "Requires role:manage" : ""}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </td>
              <td className={`px-4 py-3 ${u.status === "ACTIVE" ? "text-status-success" : u.status === "SUSPENDED" ? "text-status-danger" : "text-muted-foreground"}`}>
                {u.status}
              </td>
              <td className="px-4 py-3 text-right">
                {u.status === "SUSPENDED" ? (
                  <button onClick={() => start(() => setUserStatusAction(u.id, "ACTIVE").then(() => {}))} disabled={pending} className="text-xs text-status-success hover:underline">Reactivate</button>
                ) : (
                  <button onClick={() => start(() => setUserStatusAction(u.id, "SUSPENDED").then(() => {}))} disabled={pending} className="text-xs text-status-danger hover:underline">Suspend</button>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No users found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
