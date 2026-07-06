import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { getSectionDefs } from "@/modules/businessPlan/service";
import { BpConfigEditor } from "@/components/businessPlan/bp-config-editor";

export default async function BpConfigPage() {
  const user = await getCurrentUser();
  if (!can(user, "form:manage")) redirect("/admin");
  const defs = await getSectionDefs();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Business plan sections</h1>
      <p className="mt-2 text-muted-foreground">
        Control which business-plan sections applicants complete, whether each is required, and the
        allowed word range. Enforced when applicants submit.
      </p>
      <BpConfigEditor
        initial={defs.map((d) => ({
          key: d.key,
          title: d.title,
          prompt: d.prompt,
          required: d.required,
          minWords: d.minWords,
          maxWords: d.maxWords,
        }))}
      />
    </div>
  );
}
