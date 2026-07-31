export type MSHSitemapNode = {
  category: string;
  url: string;
  path: string;
  description: string;
  fetchingMethod: "ANGULAR_SPA" | "REST_API" | "HTML_DOM";
};

export const MEITY_MSH_PORTAL_SITEMAP: MSHSitemapNode[] = [
  // --- FLAGSHIP MEITY SCHEMES ---
  {
    category: "MeitY Flagship Schemes",
    url: "https://msh.meity.gov.in/challenges",
    path: "/challenges",
    description: "SAMRIDH Accelerator Matching Grant (Up to ₹40 Lakhs per startup).",
    fetchingMethod: "ANGULAR_SPA",
  },
  {
    category: "MeitY Flagship Schemes",
    url: "https://msh.meity.gov.in/incubators",
    path: "/incubators",
    description: "TIDE 2.0 Incubation Grants (₹7L Entrepreneurship Grant & ₹40L Seed Grant).",
    fetchingMethod: "REST_API",
  },
  {
    category: "MeitY Flagship Schemes",
    url: "https://msh.meity.gov.in/meityabout",
    path: "/meityabout",
    description: "GENESIS (Gen-Next Support for Innovative Startups in Tier-2/3 Cities - ₹490 Cr Outlay).",
    fetchingMethod: "ANGULAR_SPA",
  },
  {
    category: "MeitY Flagship Schemes",
    url: "https://msh.meity.gov.in/coe",
    path: "/coe",
    description: "MeitY Centres of Excellence Network (STPI CoEs, IoT, AI, Cybersecurity, C2S Semiconductor).",
    fetchingMethod: "REST_API",
  },

  // --- ECOSYSTEM DIRECTORIES ---
  {
    category: "Ecosystem Directories",
    url: "https://msh.meity.gov.in/startups",
    path: "/startups",
    description: "Recognized MeitY Tech Startups & Product Showcase Directory.",
    fetchingMethod: "REST_API",
  },
  {
    category: "Ecosystem Directories",
    url: "https://msh.meity.gov.in/accelerator",
    path: "/accelerator",
    description: "Empaneled SAMRIDH Accelerators & Incubation Partners Network.",
    fetchingMethod: "REST_API",
  },
  {
    category: "Ecosystem Directories",
    url: "https://msh.meity.gov.in/mentor",
    path: "/mentor",
    description: "Empaneled MeitY Mentors Roster & Domain Experts.",
    fetchingMethod: "REST_API",
  },
  {
    category: "Ecosystem Directories",
    url: "https://msh.meity.gov.in/investor",
    path: "/investor",
    description: "MeitY Partner VC Funds & Angel Investor Networks.",
    fetchingMethod: "REST_API",
  },
];

export type MSHFetchingMethod = {
  methodName: string;
  description: string;
  codeSnippet: string;
};

export const MSH_FETCHING_METHODS: MSHFetchingMethod[] = [
  {
    methodName: "1. Angular Client Bundle Route Extraction",
    description: "Parses main.b34414785f79e678.js to extract all Angular SPA routing endpoints and component schemas.",
    codeSnippet: `curl -sL "https://msh.meity.gov.in/main.b34414785f79e678.js" | grep -o -E '\{path:"[^"]+"'`,
  },
  {
    methodName: "2. Automatic MD5 Hash Diff & DB Sync Engine",
    description: "Integrated in our backend: parses MeitY MSH scheme cards, calculates content hashes, and upserts into local SQLite DB.",
    codeSnippet: `// Implemented in policies-service.ts
await syncMeitYMSHPoliciesFromWeb();`,
  },
  {
    methodName: "3. Headless Browser Execution (Puppeteer / Playwright)",
    description: "Executes Angular SPA client-side rendering for /challenges and /incubators pages.",
    codeSnippet: `const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto("https://msh.meity.gov.in/challenges");`,
  },
];

export function getMeitYMSHSitemap() {
  return {
    domain: "https://msh.meity.gov.in",
    totalNodes: MEITY_MSH_PORTAL_SITEMAP.length,
    sitemap: MEITY_MSH_PORTAL_SITEMAP,
    fetchingMethods: MSH_FETCHING_METHODS,
  };
}
