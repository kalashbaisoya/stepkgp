export type IDEXSitemapNode = {
  id: string;
  category: "Grant Scheme" | "Defence Challenge" | "Partner Incubator" | "Procurement Order";
  title: string;
  url: string;
  grantAssistance: string;
  targetArmedForce: string;
  summary: string;
};

export const IDEX_DEFENCE_SITEMAP_NODES: IDEXSitemapNode[] = [
  {
    id: "idex-disc-14",
    category: "Defence Challenge",
    title: "Defence India Startup Challenge 14 (DISC 14)",
    url: "https://idex.gov.in/challenges",
    grantAssistance: "Grant up to ₹1.5 Crores + Armed Forces Procurement Orders",
    targetArmedForce: "Indian Army, Indian Navy, Indian Air Force, Coast Guard, DPSUs",
    summary: "Active problem statements released by the Armed Forces for direct prototype development and defence procurement.",
  },
  {
    id: "idex-aditi-4",
    category: "Grant Scheme",
    title: "ADITI 4 Scheme (Acing Development of Innovative Technologies)",
    url: "https://idex.gov.in/challenges",
    grantAssistance: "Grant up to ₹25 Crores for Strategic Critical Technologies",
    targetArmedForce: "Strategic Defence Production & Quantum Cryptography",
    summary: "Deep-tech defence scheme developing critical strategic technologies, hypersonic systems, and underwater sonar arrays.",
  },
  {
    id: "idex-prime-reopen",
    category: "Grant Scheme",
    title: "iDEX Prime Grant (Defence & Aerospace Hardware)",
    url: "https://idex.gov.in/challenges",
    grantAssistance: "Grant-in-aid up to ₹10 Crores per Venture",
    targetArmedForce: "High-Capital Aerospace & Autonomous Weapon Systems",
    summary: "High-tier defence innovation grant for scaling complex defence & aerospace hardware and radar platforms.",
  },
  {
    id: "idex-spark-grant",
    category: "Grant Scheme",
    title: "iDEX SPARK Grant (Defence Innovation Organisation)",
    url: "https://idex.gov.in/challenges",
    grantAssistance: "Grant up to ₹1.5 Crores for Prototype Fabrication",
    targetArmedForce: "Tri-Services (Army, Navy, Air Force)",
    summary: "Flagship grant supporting startups developing prototype hardware/software for defence applications.",
  },
  {
    id: "idex-open-challenge",
    category: "Defence Challenge",
    title: "iDEX Open Challenge (Unsolicited Innovation Portal)",
    url: "https://idex.gov.in/challenges",
    grantAssistance: "Grant up to ₹1.5 Crores + Tri-Services Testing Grounds",
    targetArmedForce: "Tri-Services Dual-Use Technologies",
    summary: "Year-round portal for startups proposing novel dual-use or defence innovations to the Ministry of Defence.",
  },
];

export function getIDEXDefenceSitemap() {
  return {
    domain: "idex.gov.in",
    totalNodes: IDEX_DEFENCE_SITEMAP_NODES.length,
    sitemap: IDEX_DEFENCE_SITEMAP_NODES,
    fetchingMethods: ["HTML_DOM_SCRAPER", "DEFENCE_INNOVATION_ORGANISATION_API"],
  };
}
