import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac/guard";
import { getPageForEdit } from "@/modules/cms/service";
import { PageEditor } from "@/components/cms/page-editor";

export default async function CmsPageEditor({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const user = await getCurrentUser();
  if (!can(user, "cms:write")) redirect("/admin");

  const page = await getPageForEdit(key);
  if (!page) notFound();

  return (
    <PageEditor
      pageKey={page.key}
      title={page.title}
      status={page.status}
      initialBlocks={page.blocks}
      canPublish={can(user, "cms:publish")}
    />
  );
}
