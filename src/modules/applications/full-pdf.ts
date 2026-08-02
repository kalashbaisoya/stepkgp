import "server-only";
import { PDFDocument } from "pdf-lib";
import { db } from "@/lib/db";
import { getObject } from "@/lib/storage/storage";
import { getApplication } from "./service";

/**
 * Build ONE combined PDF for an application: a rendered summary (form answers +
 * business plan) followed by every uploaded document merged in. PDFs are appended
 * page-by-page, images embedded as full pages. Unsupported types are noted on a
 * cover line. Used by the one-click "download full application" for applicant + staff.
 */
export async function buildFullApplicationPdf(applicationId: string): Promise<Buffer> {
  const app = await getApplication(applicationId);
  if (!app) throw new Error("Application not found");

  const [bp, record] = await Promise.all([
    db.businessPlan.findUnique({ where: { applicationId }, include: { sections: { orderBy: { order: "asc" } } } }),
    db.application.findUnique({ where: { id: applicationId }, include: { user: { select: { name: true, email: true } } } }),
  ]);

  // 1. Rendered summary (react-pdf). Lazy import keeps @react-pdf off other paths.
  const { renderApplicationPdf } = await import("@/modules/businessPlan/pdf");
  const summaryBuf = await renderApplicationPdf({
    startupName: String(app.values["startup_name"] ?? "Application"),
    applicantName: record?.user.name ?? record?.user.email ?? "",
    cycleName: app.cycleName,
    categoryName: app.categoryName,
    status: app.status,
    formSections: app.sections.map((s) => ({
      title: s.title,
      fields: s.fields.map((f) => ({ label: f.label, value: formatValue(app.values[f.key]) })),
    })),
    businessPlan: (bp?.sections ?? []).map((s) => ({ title: s.title, content: s.content })),
    documents: app.documents.map((d) => ({ label: d.requirementKey, fileName: d.fileName })),
  });

  // 2. Merge with pdf-lib.
  const merged = await PDFDocument.load(summaryBuf);

  for (const doc of app.documents) {
    try {
      const bytes = await getObject(doc.storageKey);
      const ext = doc.fileName.split(".").pop()?.toLowerCase() ?? "";
      if (ext === "pdf") {
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      } else if (ext === "png" || ext === "jpg" || ext === "jpeg") {
        const img = ext === "png" ? await merged.embedPng(bytes) : await merged.embedJpg(bytes);
        const page = merged.addPage();
        const { width, height } = page.getSize();
        const scale = Math.min(width / img.width, height / img.height, 1);
        page.drawImage(img, {
          x: (width - img.width * scale) / 2,
          y: (height - img.height * scale) / 2,
          width: img.width * scale,
          height: img.height * scale,
        });
      }
      // other types: skipped (already listed in the summary's Documents table)
    } catch {
      // unreadable/corrupt attachment: skip it, the summary still lists it
    }
  }

  const out = await merged.save();
  return Buffer.from(out);
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null || v === "") return "-";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "-";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}
