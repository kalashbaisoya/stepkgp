export type StartupIndiaSitemapNode = {
  category: string;
  url: string;
  path: string;
  description: string;
  fetchingMethod: "AEM_HTML_DOM" | "REST_API" | "PDF_GUIDELINES";
};

export const STARTUP_INDIA_PORTAL_SITEMAP: StartupIndiaSitemapNode[] = [
  // --- FLAGSHIP DPIIT SCHEMES ---
  {
    category: "DPIIT Flagship Schemes",
    url: "https://www.startupindia.gov.in/content/sih/en/startup-scheme.html",
    path: "/content/sih/en/startup-scheme.html",
    description: "Startup India Seed Fund Scheme (SISFS: ₹20L Grant + ₹50L Convertible Debt).",
    fetchingMethod: "AEM_HTML_DOM",
  },
  {
    category: "DPIIT Flagship Schemes",
    url: "https://www.startupindia.gov.in/content/sih/en/credit-guarantee-scheme-for-startups.html",
    path: "/content/sih/en/credit-guarantee-scheme-for-startups.html",
    description: "Credit Guarantee Scheme for Startups (CGSS: Collateral-free loans up to ₹10 Crores).",
    fetchingMethod: "AEM_HTML_DOM",
  },
  {
    category: "DPIIT Flagship Schemes",
    url: "https://www.startupindia.gov.in/content/sih/en/startupgov/imb.html",
    path: "/content/sih/en/startupgov/imb.html",
    description: "Section 80-IAC Income Tax Exemption for 3 Consecutive Years.",
    fetchingMethod: "AEM_HTML_DOM",
  },
  {
    category: "DPIIT Flagship Schemes",
    url: "https://www.startupindia.gov.in/content/sih/en/intellectual-property-rights.html",
    path: "/content/sih/en/intellectual-property-rights.html",
    description: "80% Patent Fee Rebate & Fast-Track Patent Examination.",
    fetchingMethod: "AEM_HTML_DOM",
  },
  {
    category: "DPIIT Flagship Schemes",
    url: "https://www.startupindia.gov.in/content/sih/en/public_procurement.html",
    path: "/content/sih/en/public_procurement.html",
    description: "Public Procurement EMD Exemption & GeM Tender Relaxation.",
    fetchingMethod: "AEM_HTML_DOM",
  },

  // --- RECOGNITION & SELF-CERTIFICATION ---
  {
    category: "Recognition & Compliance",
    url: "https://www.startupindia.gov.in/content/sih/en/startupgov/startup_recognition_page.html",
    path: "/content/sih/en/startupgov/startup_recognition_page.html",
    description: "DPIIT Startup Recognition Certificate Application Workflow.",
    fetchingMethod: "AEM_HTML_DOM",
  },
  {
    category: "Recognition & Compliance",
    url: "https://www.startupindia.gov.in/content/sih/en/startupgov/self-certification.html",
    path: "/content/sih/en/startupgov/self-certification.html",
    description: "Self-Certification under 6 Labor Laws & 3 Environmental Laws.",
    fetchingMethod: "AEM_HTML_DOM",
  },
  {
    category: "Recognition & Compliance",
    url: "https://www.startupindia.gov.in/content/sih/en/state-startup-policies.html",
    path: "/content/sih/en/state-startup-policies.html",
    description: "National States' Startup Ranking Framework Index.",
    fetchingMethod: "AEM_HTML_DOM",
  },
];

export type StartupIndiaFetchingMethod = {
  methodName: string;
  description: string;
  codeSnippet: string;
};

export const STARTUP_INDIA_FETCHING_METHODS: StartupIndiaFetchingMethod[] = [
  {
    methodName: "1. AEM HTML DOM Scraper & Parser",
    description: "Fetches AEM HTML pages from startupindia.gov.in/content/sih/en/ and extracts scheme eligibility & application requirements.",
    codeSnippet: `const res = await fetch("https://www.startupindia.gov.in/content/sih/en/startup-scheme.html");
const html = await res.text();`,
  },
  {
    methodName: "2. Automatic MD5 Hash Diff & DB Sync Engine",
    description: "Integrated in our backend: parses Startup India DPIIT scheme cards, calculates content hashes, and upserts into local SQLite DB.",
    codeSnippet: `// Implemented in policies-service.ts
await syncStartupIndiaPoliciesFromWeb();`,
  },
  {
    methodName: "3. DPIIT Recognition Validation API Integration",
    description: "Connects to https://www.startupindia.gov.in/content/sih/en/verify-dpiit-recognition-mapping.html for verifying certificate numbers.",
    codeSnippet: `const res = await fetch("https://www.startupindia.gov.in/content/sih/en/verify-dpiit-recognition-mapping.html");`,
  },
];

export function getStartupIndiaSitemap() {
  return {
    domain: "https://www.startupindia.gov.in",
    totalNodes: STARTUP_INDIA_PORTAL_SITEMAP.length,
    sitemap: STARTUP_INDIA_PORTAL_SITEMAP,
    fetchingMethods: STARTUP_INDIA_FETCHING_METHODS,
  };
}
