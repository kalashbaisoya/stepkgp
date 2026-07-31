export type SitemapNode = {
  category: string;
  url: string;
  path: string;
  description: string;
  fetchingMethod: "REST_API" | "CLIENT_SPA" | "HTML_DOM" | "BUNDLE_PARSER";
  apiEndpoint?: string;
};

export const GUJARAT_STARTUP_SITEMAP: SitemapNode[] = [
  // --- POLICIES & SCHEMES ---
  {
    category: "Policies & Grants",
    url: "https://startup.gujarat.gov.in/policy/startup-policies",
    path: "/policy/startup-policies",
    description: "Main Startup Policy document, Sustenance Allowance, Seed Support (₹30L), and IPR Grants.",
    fetchingMethod: "HTML_DOM",
    apiEndpoint: "https://startup.gujarat.gov.in/api/nodal-app-forms/startup-schemes",
  },
  {
    category: "Policies & Grants",
    url: "https://startup.gujarat.gov.in/policy/standard-operating-procedure",
    path: "/policy/standard-operating-procedure",
    description: "Official Standard Operating Procedures (SOPs 1-5) for registration, DBT allowance, and grant release.",
    fetchingMethod: "HTML_DOM",
    apiEndpoint: "https://startup.gujarat.gov.in/api/disbursement-nodal/startup-schemes",
  },
  {
    category: "Policies & Grants",
    url: "https://startup.gujarat.gov.in/scheme-for-assistance",
    path: "/scheme-for-assistance",
    description: "Detailed financial assistance schemes for prototypes, skill development, and market access.",
    fetchingMethod: "CLIENT_SPA",
    apiEndpoint: "https://startup.gujarat.gov.in/api/disbursement-startup/startup-schemes",
  },
  {
    category: "Policies & Grants",
    url: "https://startup.gujarat.gov.in/intellectual-property",
    path: "/intellectual-property",
    description: "IPR Patent & Trademark reimbursement guidelines (up to ₹2L domestic / ₹10L foreign).",
    fetchingMethod: "CLIENT_SPA",
  },

  // --- ECOSYSTEM DIRECTORIES ---
  {
    category: "Directories & Hubs",
    url: "https://startup.gujarat.gov.in/nodal",
    path: "/nodal",
    description: "Empaneled Nodal Institutes & Incubation Centers directory across Gujarat.",
    fetchingMethod: "REST_API",
    apiEndpoint: "https://startup.gujarat.gov.in/api/disbursement-nodal/all",
  },
  {
    category: "Directories & Hubs",
    url: "https://startup.gujarat.gov.in/company",
    path: "/company",
    description: "Recognized Startups Directory & Product Showcase.",
    fetchingMethod: "REST_API",
    apiEndpoint: "https://startup.gujarat.gov.in/api/nodal-app-forms/get-startup-name",
  },
  {
    category: "Directories & Hubs",
    url: "https://startup.gujarat.gov.in/mentor",
    path: "/mentor",
    description: "Empaneled Mentors Roster & Startup-Mentor Meeting Scheduling Portal.",
    fetchingMethod: "REST_API",
    apiEndpoint: "https://startup.gujarat.gov.in/api/startupto-mentor-meetings",
  },
  {
    category: "Directories & Hubs",
    url: "https://startup.gujarat.gov.in/invester",
    path: "/invester",
    description: "Investor Connect & Startup-Investor Pitch Sessions Portal.",
    fetchingMethod: "REST_API",
    apiEndpoint: "https://startup.gujarat.gov.in/api/invester-startup-meetings",
  },
  {
    category: "Directories & Hubs",
    url: "https://startup.gujarat.gov.in/venture-capital",
    path: "/venture-capital",
    description: "Partner VC Funds & State Angel Investor Networks.",
    fetchingMethod: "CLIENT_SPA",
  },
  {
    category: "Directories & Hubs",
    url: "https://startup.gujarat.gov.in/acceleration-programs",
    path: "/acceleration-programs",
    description: "State Acceleration Programs & Startup Cohorts.",
    fetchingMethod: "CLIENT_SPA",
  },

  // --- GOVERNMENT PORTALS & CIRCULARS ---
  {
    category: "Government Portals",
    url: "https://startup.gujarat.gov.in/startup-lifecycle",
    path: "/startup-lifecycle",
    description: "Startup Lifecycle Stages & Milestone Progression Matrix.",
    fetchingMethod: "CLIENT_SPA",
  },
  {
    category: "Government Portals",
    url: "https://startup.gujarat.gov.in/know-your-approval",
    path: "/know-your-approval",
    description: "Single-Window Clearance & Approval Status Tracker.",
    fetchingMethod: "CLIENT_SPA",
  },
  {
    category: "Government Portals",
    url: "https://startup.gujarat.gov.in/notice-board",
    path: "/notice-board",
    description: "Official Circulars, Government Notifications & Announcements.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Government Portals",
    url: "https://startup.gujarat.gov.in/scrutiny",
    path: "/scrutiny",
    description: "Nodal Scrutiny Committee Application Assessment Portal.",
    fetchingMethod: "REST_API",
    apiEndpoint: "https://startup.gujarat.gov.in/api/scrutiny-app-forms/all",
  },
  {
    category: "Government Portals",
    url: "https://startup.gujarat.gov.in/slec",
    path: "/slec",
    description: "State Level Executive Committee (SLEC) Final Approval Board.",
    fetchingMethod: "REST_API",
  },
];

export type InformationFetchingMethod = {
  methodName: string;
  description: string;
  codeSnippet: string;
};

export const INFORMATION_FETCHING_METHODS: InformationFetchingMethod[] = [
  {
    methodName: "1. Direct REST API Endpoints",
    description: "Queries the underlying Angular REST API services of startup.gujarat.gov.in directly for structured JSON data.",
    codeSnippet: `// Example: Fetch startup schemes JSON
const response = await fetch("https://startup.gujarat.gov.in/api/disbursement-nodal/startup-schemes", {
  headers: {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0",
  }
});
const data = await response.json();`,
  },
  {
    methodName: "2. Automatic MD5 Hash Diff & DB Sync",
    description: "Implemented in our backend: fetches policy/SOP HTML, calculates MD5 hash, diffs changes, and appends newly detected schemes to SQLite.",
    codeSnippet: `// Implemented in src/modules/search/policies-service.ts
await syncGujaratStartupPoliciesFromWeb();`,
  },
  {
    methodName: "3. Angular Client Bundle Extraction",
    description: "Parses main-es2015.js bundle to extract embedded route definitions, component data schemas, and lazy-loaded modules.",
    codeSnippet: `curl -sL "https://startup.gujarat.gov.in/main-es2015.js" | grep -o -E '\{path:"[a-zA-Z0-9_-]+"[^}]*\}'`,
  },
  {
    methodName: "4. Headless Browser Crawling (Puppeteer / Playwright)",
    description: "For executing dynamic Angular SPA client-side rendering and capturing fully rendered DOM trees.",
    codeSnippet: `const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto("https://startup.gujarat.gov.in/policy/standard-operating-procedure");
const content = await page.content();`,
  },
];

export function getGujaratSitemap() {
  return {
    domain: "https://startup.gujarat.gov.in",
    totalNodes: GUJARAT_STARTUP_SITEMAP.length,
    sitemap: GUJARAT_STARTUP_SITEMAP,
    fetchingMethods: INFORMATION_FETCHING_METHODS,
  };
}
