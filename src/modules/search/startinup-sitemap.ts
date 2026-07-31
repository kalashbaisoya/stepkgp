export type StartInUPSitemapNode = {
  category: string;
  url: string;
  path: string;
  description: string;
  fetchingMethod: "REST_API" | "WORDPRESS_FEED" | "HTML_DOM";
};

export const STARTINUP_PORTAL_SITEMAP: StartInUPSitemapNode[] = [
  // --- POLICIES & OBJECTIVES ---
  {
    category: "Policies & Objectives",
    url: "https://startinup.up.gov.in/policy-objectives/",
    path: "/policy-objectives/",
    description: "Uttar Pradesh Startup Policy objectives, incentives, and government directives.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Policies & Objectives",
    url: "https://startinup.up.gov.in/government-policies-2/",
    path: "/government-policies-2/",
    description: "Official UP IT & Electronics Startup Policy Gazette Notifications.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Policies & Objectives",
    url: "https://startinup.up.gov.in/government-orders/",
    path: "/government-orders/",
    description: "UP Government Orders & Circulars regarding startup disbursements.",
    fetchingMethod: "HTML_DOM",
  },

  // --- FUNDING & FINANCIAL INCENTIVES ---
  {
    category: "Funding & Incentives",
    url: "https://startinup.up.gov.in/seed-capital-marketing-assistance/",
    path: "/seed-capital-marketing-assistance/",
    description: "Sustenance Allowance (₹17,500/mo) and Seed Capital Grant (₹5 Lakhs).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Funding & Incentives",
    url: "https://startinup.up.gov.in/prototype-development-sartups/",
    path: "/prototype-development-sartups/",
    description: "Prototype Development Grant & MVP Fabrication Assistance.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Funding & Incentives",
    url: "https://startinup.up.gov.in/funding/",
    path: "/funding/",
    description: "UP Startup Fund (₹1,000 Crore Fund of Funds with SIDBI).",
    fetchingMethod: "HTML_DOM",
  },

  // --- CENTRES OF EXCELLENCE (CoEs) & INCUBATORS ---
  {
    category: "Centres of Excellence & Incubators",
    url: "https://startinup.up.gov.in/coes-list/",
    path: "/coes-list/",
    description: "List of UP State-funded Centres of Excellence (AI Noida, Blockchain, Drones, MedTech).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Centres of Excellence & Incubators",
    url: "https://startinup.up.gov.in/recognized-incubators/",
    path: "/recognized-incubators/",
    description: "Directory of Recognized UP Incubation Centers (IIT Kanpur, IIT BHU, IIM Lucknow, etc.).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Centres of Excellence & Incubators",
    url: "https://startinup.up.gov.in/aiide-coe-noida/",
    path: "/aiide-coe-noida/",
    description: "Artificial Intelligence & Innovation Centre of Excellence (Noida).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Centres of Excellence & Incubators",
    url: "https://startinup.up.gov.in/coe-blockchain-technology/",
    path: "/coe-blockchain-technology/",
    description: "Blockchain Technology Centre of Excellence (IIT Kanpur).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Centres of Excellence & Incubators",
    url: "https://startinup.up.gov.in/drone-coe-kanpur/",
    path: "/drone-coe-kanpur/",
    description: "Unmanned Aerial Vehicles & Drone Technology Centre of Excellence (Kanpur).",
    fetchingMethod: "HTML_DOM",
  },

  // --- MENTORSHIP & FEEDBACK ---
  {
    category: "Mentorship & Grievance",
    url: "https://startinup.up.gov.in/mentors/",
    path: "/mentors/",
    description: "StartInUP Empaneled Mentors & Industry Experts Network.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Mentorship & Grievance",
    url: "https://startinup.up.gov.in/grievance-feedback/",
    path: "/grievance-feedback/",
    description: "Online Startup Grievance & Redressal Mechanism.",
    fetchingMethod: "WORDPRESS_FEED",
  },
];

export type StartInUPFetchingMethod = {
  methodName: string;
  description: string;
  codeSnippet: string;
};

export const STARTINUP_FETCHING_METHODS: StartInUPFetchingMethod[] = [
  {
    methodName: "1. WordPress RSS Feed XML Fetching",
    description: "Queries https://startinup.up.gov.in/feed/ for live announcements and news.",
    codeSnippet: `const res = await fetch("https://startinup.up.gov.in/feed/");
const xmlText = await res.text();`,
  },
  {
    methodName: "2. Automatic MD5 Hash Diff & DB Sync Engine",
    description: "Integrated in our backend: parses UP StartInUP policy pages, calculates content hashes, and upserts into local SQLite DB.",
    codeSnippet: `// Implemented in policies-service.ts
await syncStartInUPPoliciesFromWeb();`,
  },
  {
    methodName: "3. StartInUP CRM Registration Portal API",
    description: "Connects to https://startinup.up.gov.in/crm/welcome/registration_new for startup registration workflows.",
    codeSnippet: `const res = await fetch("https://startinup.up.gov.in/crm/welcome/registration_new");`,
  },
];

export function getStartInUPSitemap() {
  return {
    domain: "https://startinup.up.gov.in",
    totalNodes: STARTINUP_PORTAL_SITEMAP.length,
    sitemap: STARTINUP_PORTAL_SITEMAP,
    fetchingMethods: STARTINUP_FETCHING_METHODS,
  };
}
