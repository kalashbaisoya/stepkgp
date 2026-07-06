import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { listDocumentRequirements } from "@/modules/cycles/service";
import { DocumentsManager } from "@/components/cycles/documents-manager";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!can(user, "document:configure")) redirect("/admin");

  const categories = await listDocumentRequirements();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Required documents</h1>
      <p className="mt-2 text-muted-foreground">
        Configure the documents each applicant category must upload. Enforced at submission
        (Milestone 5).
      </p>
      <div className="mt-8 space-y-8">
        {categories.map((cat) => (
          <DocumentsManager
            key={cat.key}
            categoryKey={cat.key}
            categoryName={cat.name}
            initial={cat.documentReqs.map((r) => ({
              key: r.key,
              label: r.label,
              required: r.required,
              maxSizeMb: r.maxSizeMb,
              allowedTypes: r.allowedTypes,
            }))}
          />
        ))}
      </div>
    </div>
  );
}
