import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listCycles, listCategories } from "@/modules/cycles/service";
import { listTemplates } from "@/modules/forms/service";
import { CyclesManager } from "@/components/cycles/cycles-manager";

export default async function CyclesPage() {
  const user = await getCurrentUser();
  if (!can(user, "cycle:manage")) redirect("/admin");

  const [cycles, categories, templates] = await Promise.all([
    listCycles(),
    listCategories(),
    listTemplates(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Cycles</h1>
      <p className="mt-2 text-muted-foreground">
        Open and configure annual cohorts. Bind a form template and the categories each
        cohort accepts. Only an open cycle appears on the public apply page.
      </p>
      <CyclesManager
        cycles={cycles.map((c) => ({
          id: c.id,
          year: c.year,
          name: c.name,
          status: c.status,
          opensAt: c.opensAt ? c.opensAt.toISOString().slice(0, 10) : "",
          closesAt: c.closesAt ? c.closesAt.toISOString().slice(0, 10) : "",
          formTemplateKey: c.formTemplate?.key ?? "",
          categoryKeys: c.categories.map((cc) => cc.category.key),
        }))}
        categories={categories.map((c) => ({ key: c.key, name: c.name }))}
        templates={templates.map((t) => ({ key: t.key, name: t.name }))}
      />
    </div>
  );
}
