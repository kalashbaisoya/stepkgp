import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { getShowcaseForEdit } from "@/modules/directory/service";
import { ShowcaseEditor } from "@/components/directory/showcase-editor";

export default async function ShowcaseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!can(user, "cms:write")) redirect("/admin");
  const entry = await getShowcaseForEdit(id);
  if (!entry) notFound();
  return <ShowcaseEditor entry={entry} />;
}
