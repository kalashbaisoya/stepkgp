import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { getTemplateForEdit } from "@/modules/forms/service";
import { FormBuilder } from "@/components/forms/form-builder";

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const user = await getCurrentUser();
  if (!can(user, "form:manage")) redirect("/admin");

  const template = await getTemplateForEdit(key);
  if (!template) notFound();

  return <FormBuilder templateKey={template.key} name={template.name} initialSections={template.sections} />;
}
