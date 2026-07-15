"use client";

import { useState, useTransition } from "react";
import { setRolePermissionsAction } from "@/modules/admin/actions";
import { Button } from "@/components/ui/button";

type Role = { key: string; name: string; permissions: string[] };

export function RolesManager({ roles, allPermissions }: { roles: Role[]; allPermissions: string[] }) {
  const [active, setActive] = useState(roles.find((r) => r.key !== "super_admin")?.key ?? roles[0]?.key);
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr]">
      <aside>
        <ul className="space-y-1 text-sm">
          {roles.map((r) => (
            <li key={r.key}>
              <button onClick={() => setActive(r.key)} className={`w-full rounded-md px-3 py-2 text-left transition-colors ${active === r.key ? "bg-brand/10 font-medium text-brand" : "text-muted-foreground hover:bg-muted"}`}>
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {roles.filter((r) => r.key === active).map((r) => (
        <RoleEditor key={r.key} role={r} allPermissions={allPermissions} />
      ))}
    </div>
  );
}

function RoleEditor({ role, allPermissions }: { role: Role; allPermissions: string[] }) {
  const isSuper = role.key === "super_admin";
  const [selected, setSelected] = useState<string[]>(role.permissions);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const toggle = (p: string) => setSelected((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  // Group permissions by resource prefix.
  const groups: Record<string, string[]> = {};
  for (const p of allPermissions) { const g = p.split(":")[0]; (groups[g] ??= []).push(p); }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{role.name}</h2>
        <div className="flex items-center gap-3">
          {note && <span className="text-sm text-status-success">{note}</span>}
          {!isSuper && (
            <Button onClick={() => start(async () => { await setRolePermissionsAction(role.key, selected); setNote("Saved."); })} disabled={pending}>Save</Button>
          )}
        </div>
      </div>
      {isSuper ? (
        <p className="text-sm text-muted-foreground">Super Administrator implicitly holds all permissions and cannot be restricted.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(groups).map(([g, perms]) => (
            <div key={g}>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g}</div>
              <div className="space-y-1">
                {perms.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selected.includes(p)} onChange={() => toggle(p)} />
                    <span className="font-mono text-xs">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
