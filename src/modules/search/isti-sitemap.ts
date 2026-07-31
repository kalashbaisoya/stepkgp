export type ISTISitemapNode = {
  category: string;
  url: string;
  path: string;
  description: string;
  fetchingMethod: "DRUPAL_JSON_API" | "HTML_DOM" | "RSS_FEED" | "TELEMETRY_API";
  rssUrl?: string;
};

export const ISTI_PORTAL_SITEMAP: ISTISitemapNode[] = [
  // --- POLICIES, GUIDELINES & MISSIONS ---
  {
    category: "Policies & Guidelines",
    url: "https://www.indiascienceandtechnology.gov.in/st-visions/science-and-technology-policies",
    path: "/st-visions/science-and-technology-policies",
    description: "National Science, Technology & Innovation (STI) Policies (STIP 2020, ANRF, Quantum Mission).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Policies & Guidelines",
    url: "https://www.indiascienceandtechnology.gov.in/listingpage/policies-guidelines",
    path: "/listingpage/policies-guidelines",
    description: "Master directory of National S&T Policy Guidelines & Regulatory Protocols.",
    fetchingMethod: "DRUPAL_JSON_API",
  },
  {
    category: "Policies & Guidelines",
    url: "https://www.indiascienceandtechnology.gov.in/st-vision/national-missions",
    path: "/st-vision/national-missions",
    description: "National Flagship S&T Missions (National Quantum Mission, Supercomputing, Deep Ocean Mission).",
    fetchingMethod: "HTML_DOM",
  },

  // --- FUNDING OPPORTUNITIES & STARTUP GRANTS ---
  {
    category: "Funding & Startup Grants",
    url: "https://www.indiascienceandtechnology.gov.in/funding-opportunities/startups",
    path: "/funding-opportunities/startups",
    description: "Central Seed Support, DST NIDHI, BIRAC BIG, and TDB Startup Funding Opportunities.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Funding & Startup Grants",
    url: "https://www.indiascienceandtechnology.gov.in/funding-opportunities/research-grants/individual",
    path: "/funding-opportunities/research-grants/individual",
    description: "Grants for Principal Investigators & Individual Researchers.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Funding & Startup Grants",
    url: "https://www.indiascienceandtechnology.gov.in/funding-opportunities/research-grants/institutional",
    path: "/funding-opportunities/research-grants/institutional",
    description: "Institutional Infrastructure Grants (DST FIST, PURSE, SATHI).",
    fetchingMethod: "HTML_DOM",
  },

  // --- PROGRAMMES, SCHEMES & FELLOWSHIPS ---
  {
    category: "Programmes & Fellowships",
    url: "https://www.indiascienceandtechnology.gov.in/listingpage/all-programmes-schemes",
    path: "/listingpage/all-programmes-schemes",
    description: "Central Master Registry of S&T Schemes & Assistance Programmes.",
    fetchingMethod: "DRUPAL_JSON_API",
  },
  {
    category: "Programmes & Fellowships",
    url: "https://www.indiascienceandtechnology.gov.in/fellowships-scholarships",
    path: "/fellowships-scholarships",
    description: "National Fellowships (Ramanujan, JC Bose, SwarnaJayanti, SERB-POWER).",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Programmes & Fellowships",
    url: "https://www.indiascienceandtechnology.gov.in/programme-schemes/women-schemes",
    path: "/programme-schemes/women-schemes",
    description: "WISE-KIRAN & Women Scientist Funding Schemes.",
    fetchingMethod: "HTML_DOM",
  },

  // --- INNOVATIONS, INCUBATORS & PATENTS ---
  {
    category: "Innovations & Incubators",
    url: "https://www.indiascienceandtechnology.gov.in/innovations/incubators",
    path: "/innovations/incubators",
    description: "DST, BIRAC & MeitY Recognized Technology Business Incubators (TBIs) & Accelerators.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Innovations & Incubators",
    url: "https://www.indiascienceandtechnology.gov.in/innovations/patents",
    path: "/innovations/patents",
    description: "National S&T Patents Showcase & Technology Commercialization Portal.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Innovations & Incubators",
    url: "https://www.indiascienceandtechnology.gov.in/startups/success-stories",
    path: "/startups/success-stories",
    description: "Deep-tech Startup Case Studies & Commercialization Success Stories.",
    fetchingMethod: "HTML_DOM",
  },

  // --- RESEARCH LABS & ORGANISATIONS ---
  {
    category: "Labs & Organisations",
    url: "https://www.indiascienceandtechnology.gov.in/research-institutions-laboratories",
    path: "/research-institutions-laboratories",
    description: "Directory of CSIR, DST, DAE, ISRO, DRDO & DBT National Laboratories.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Labs & Organisations",
    url: "https://www.indiascienceandtechnology.gov.in/organisations/centres-excellence",
    path: "/organisations/centres-excellence",
    description: "National Centres of Excellence (CoEs) & Advanced Research Facilities.",
    fetchingMethod: "HTML_DOM",
  },
  {
    category: "Labs & Organisations",
    url: "https://www.indiascienceandtechnology.gov.in/organisations/ministries-departments",
    path: "/organisations/ministries-departments",
    description: "Central S&T Ministries & Departments (DST, DBT, DSIR, MeitY, MoES, DAE, ISRO).",
    fetchingMethod: "HTML_DOM",
  },
];

export type ISTIFetchingMethod = {
  methodName: string;
  description: string;
  codeSnippet: string;
};

export const ISTI_FETCHING_METHODS: ISTIFetchingMethod[] = [
  {
    methodName: "1. Drupal CMS RSS & JSON Endpoint Fetching",
    description: "Queries Drupal RSS feed endpoints and view lists for structured announcements, grants, and calls for proposals.",
    codeSnippet: `// Fetch national STI policy updates via RSS feed
const res = await fetch("https://www.indiascienceandtechnology.gov.in/rss.xml");
const xmlText = await res.text();`,
  },
  {
    methodName: "2. Automatic MD5 Hash Diff & DB Sync Engine",
    description: "Integrated in our backend: parses ISTI portal scheme cards, calculates content hashes, and upserts into local SQLite DB.",
    codeSnippet: `// Implemented in policies-service.ts
await syncISTIPortalPoliciesFromWeb();`,
  },
  {
    methodName: "3. Drupal Views DOM HTML Parser",
    description: "Extracts Drupal views rows (.views-row, .field-content) across funding opportunities and fellowship listings.",
    codeSnippet: `const response = await fetch("https://www.indiascienceandtechnology.gov.in/funding-opportunities/startups");
const html = await response.text();`,
  },
  {
    methodName: "4. ISTI National Dashboard API Integration",
    description: "Connects to ISTI Portal telemetry APIs for monitoring national R&D indicators, patent numbers, and active grant calls.",
    codeSnippet: `const dashboardRes = await fetch("https://www.indiascienceandtechnology.gov.in/isti-dashboard");`,
  },
];

export function getISTIPortalSitemap() {
  return {
    domain: "https://www.indiascienceandtechnology.gov.in",
    totalNodes: ISTI_PORTAL_SITEMAP.length,
    sitemap: ISTI_PORTAL_SITEMAP,
    fetchingMethods: ISTI_FETCHING_METHODS,
  };
}
