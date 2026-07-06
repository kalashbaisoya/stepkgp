import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

// Branded Business Plan PDF (Milestone 6). Rendered server-side to a Buffer and
// stored in object storage; the applicant no longer uploads a Word document.

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, lineHeight: 1.5, color: "#1e2130" },
  header: { marginBottom: 24, borderBottom: "2 solid #3a3f8a", paddingBottom: 12 },
  brand: { fontSize: 10, letterSpacing: 2, color: "#3a3f8a", textTransform: "uppercase" },
  title: { fontSize: 22, marginTop: 6, fontWeight: 700 },
  meta: { fontSize: 9, color: "#6b7080", marginTop: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#3a3f8a", marginBottom: 4 },
  body: { fontSize: 11, color: "#2a2d3a" },
  empty: { fontSize: 10, color: "#9aa0b0", fontStyle: "italic" },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, fontSize: 8, color: "#9aa0b0", textAlign: "center", borderTop: "1 solid #e0e2ec", paddingTop: 6 },
});

export type BusinessPlanPdfData = {
  startupName: string;
  applicantName: string;
  cycleName: string;
  sections: { title: string; content: string }[];
};

function BusinessPlanDoc({ data }: { data: BusinessPlanPdfData }) {
  return (
    <Document title={`Business Plan — ${data.startupName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>STEP · IIT Kharagpur</Text>
          <Text style={styles.title}>{data.startupName || "Business Plan"}</Text>
          <Text style={styles.meta}>
            {data.cycleName} · Prepared by {data.applicantName}
          </Text>
        </View>
        {data.sections.map((s, i) => (
          <View key={i} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            {s.content.trim() ? (
              <Text style={styles.body}>{s.content}</Text>
            ) : (
              <Text style={styles.empty}>Not provided.</Text>
            )}
          </View>
        ))}
        <Text style={styles.footer} fixed>
          Science &amp; Technology Entrepreneurs&apos; Park, IIT Kharagpur — Confidential
        </Text>
      </Page>
    </Document>
  );
}

export function renderBusinessPlanPdf(data: BusinessPlanPdfData): Promise<Buffer> {
  return renderToBuffer(<BusinessPlanDoc data={data} />);
}
