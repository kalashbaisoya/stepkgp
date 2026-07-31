export type NIDHISitemapNode = {
  category: string;
  url: string;
  path: string;
  description: string;
  fetchingMethod: "WORDPRESS_FEED" | "HTML_DOM" | "DOCUMENT_PDF";
};

export const DST_NIDHI_PORTAL_SITEMAP: NIDHISitemapNode[] = [
  // --- NIDHI PROGRAMMES & SCHEMES ---
  {
    category: "Flagship NIDHI Schemes",
    url: "https://nidhi.dst.gov.in/prayas2-0/",
    path: "/prayas2-0/",
    description: "DST NIDHI-PRAYAS 2.0 PoC Grant (Up to ₹10 Lakhs for Prototype Fabrication).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Flagship NIDHI Schemes",
    url: "https://nidhi.dst.gov.in/nidhieir/",
    path: "/nidhieir/",
    description: "DST NIDHI-EIR Fellowship (₹30,000/month stipend for aspiring entrepreneurs).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Flagship NIDHI Schemes",
    url: "https://nidhi.dst.gov.in/nidhissp/",
    path: "/nidhissp/",
    description: "DST NIDHI-SSP (Seed Support Programme up to ₹1 Crore seed equity per startup).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Flagship NIDHI Schemes",
    url: "https://nidhi.dst.gov.in/nidhitbi/",
    path: "/nidhitbi/",
    description: "DST NIDHI Technology Business Incubator (TBI) Establishment & Scale-up.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Flagship NIDHI Schemes",
    url: "https://nidhi.dst.gov.in/nidhiitbi/",
    path: "/nidhiitbi/",
    description: "DST NIDHI Inclusive TBI (iTBI) for Tier-2/3 & Academic Institutions.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Flagship NIDHI Schemes",
    url: "https://nidhi.dst.gov.in/nidhicoe/",
    path: "/nidhicoe/",
    description: "DST NIDHI Centre of Excellence (CoE) (Grant up to ₹50 Crores).",
    fetchingMethod: "HTML_DOM",
  },

  // --- GUIDELINES & REPORTS ---
  {
    category: "Guidelines & Reports",
    url: "https://nidhi.dst.gov.in/document-category/programme-guidelines/",
    path: "/document-category/programme-guidelines/",
    description: "Official DST NIDHI Scheme Guidelines, Application Formats, & Utilization Certificates.",
    fetchingMethod: "DOCUMENT_PDF",
  },
  {
    category: "Guidelines & Reports",
    url: "https://nidhi.dst.gov.in/document-category/programme-wise-tbi-lists/",
    path: "/document-category/programme-wise-tbi-lists/",
    description: "National Directory of DST-Supported Incubators & PRAYAS Centres.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Guidelines & Reports",
    url: "https://nidhi.dst.gov.in/publication/75-promising-innovators-startups-under-nidhi-eir/",
    path: "/publication/75-promising-innovators-startups-under-nidhi-eir/",
    description: "DST NIDHI 75 Promising Innovators & Startups Coffee Table Publication.",
    fetchingMethod: "DOCUMENT_PDF",
  },
];

export type NIDHIFetchingMethod = {
  methodName: string;
  description: string;
  codeSnippet: string;
};

export const NIDHI_FETCHING_METHODS: NIDHIFetchingMethod[] = [
  {
    methodName: "1. WordPress Feed & Document Indexing",
    description: "Queries https://nidhi.dst.gov.in/feed/ for national DST announcements and call for proposals.",
    codeSnippet: `const res = await fetch("https://nidhi.dst.gov.in/feed/");
const xmlText = await res.text();`,
  },
  {
    methodName: "2. Automatic MD5 Hash Diff & DB Sync Engine",
    description: "Integrated in our backend: parses DST NIDHI scheme pages, calculates content hashes, and upserts into local SQLite DB.",
    codeSnippet: `// Implemented in policies-service.ts
await syncDSTNIDHIPoliciesFromWeb();`,
  },
  {
    methodName: "3. DST NIDHI TBI Directory Indexer",
    description: "Fetches DST-supported incubator directory from https://nidhi.dst.gov.in/document-category/programme-wise-tbi-lists/.",
    codeSnippet: `const res = await fetch("https://nidhi.dst.gov.in/document-category/programme-wise-tbi-lists/");`,
  },
];

export function getDSTNIDHISitemap() {
  return {
    domain: "https://nidhi.dst.gov.in",
    totalNodes: DST_NIDHI_PORTAL_SITEMAP.length,
    sitemap: DST_NIDHI_PORTAL_SITEMAP,
    fetchingMethods: NIDHI_FETCHING_METHODS,
  };
}
