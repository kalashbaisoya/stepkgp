import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listAllShowcase } from "@/modules/directory/service";
import { createShowcaseAction } from "@/modules/directory/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/directory/company-logo";

export default async function ShowcaseAdmin() {
  const user = await getCurrentUser();
  if (!can(user, "cms:read")) redirect("/admin");
  const entries = await listAllShowcase();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Startup showcase</h1>
      <p className="mt-2 text-muted-foreground">
        Curate the public startup directory. Entries are created when startups graduate, or add one manually.
      </p>

      <form action={createShowcaseAction} className="mt-6 flex max-w-md gap-2">
        <Input name="name" placeholder="New startup name" required />
        <Button type="submit">Add</Button>
      </form>

      <div className="mt-8 overflow-hidden clay">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Startup</th>
              <th className="px-4 py-3 font-medium">Sector</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Where it shows</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CompanyLogo name={e.name} src={e.logoUrl} className="clay-sm h-9 w-9 shrink-0" />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{e.name}</div>
                      <div className="truncate text-xs text-muted-foreground">/startups/{e.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{e.sector ?? "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.batch ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`clay-chip text-[11px] ${e.published ? "clay-mint" : "clay-well"}`}>
                      {e.published ? "Live in directory" : "Hidden"}
                    </span>
                    {e.featured && <span className="clay-chip clay-sun text-[11px]">Homepage</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/cms/showcase/${e.id}`} className="font-medium text-brand hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No showcase entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
