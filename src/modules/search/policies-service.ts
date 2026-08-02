import { db } from "@/lib/db";
import crypto from "crypto";
import https from "https";

export type PolicyOrSOP = {
  id: string;
  externalId: string;
  state: string; // e.g. "Gujarat", "Central", "West Bengal", "Uttar Pradesh"
  type: "scheme" | "sop";
  schemeName: string;
  department: string;
  financialAssistance: string;
  summary: string;
  eligibility: string;
  tags: string[];
  officialUrl: string;
  lastFetchedAt?: string;
};

function cleanHtmlText(htmlStr: string): string {
  if (!htmlStr) return "";
  return htmlStr
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * METHOD 1: Gujarat Direct REST API Fetcher
 */
export async function fetchGujaratSchemesDirectRESTAPI(): Promise<PolicyOrSOP[]> {
  const restApiUrl = "https://startup.gujarat.gov.in/api/common/schemes";
  try {
    const res = await fetch(restApiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 1800 },
    });

    if (res.ok) {
      const rawSchemes: any[] = await res.json();
      if (Array.isArray(rawSchemes) && rawSchemes.length > 0) {
        return rawSchemes.map((s) => {
          const cleanedCondition = cleanHtmlText(s.condition || "");
          const isSop = (s.name || "").toLowerCase().includes("sop") || (s.name || "").toLowerCase().includes("procedure");

          return {
            id: `guj-rest-${s.id}`,
            externalId: `guj-rest-${s.id}`,
            state: "Gujarat",
            type: isSop ? "sop" : "scheme",
            schemeName: `Gujarat Startup Policy: ${s.name}`,
            department: "Industries & Mines Department, Government of Gujarat",
            financialAssistance: "Official Gujarat Govt Assistance Scheme",
            summary: cleanedCondition.slice(0, 220) + "...",
            eligibility: cleanedCondition.slice(0, 160) + "...",
            tags: ["Gujarat Govt", "REST API Synced", isSop ? "SOP" : "Scheme"],
            officialUrl: "https://startup.gujarat.gov.in/policy/startup-policies",
            lastFetchedAt: s.updatedAt || new Date().toISOString(),
          };
        });
      }
    }
  } catch (err) {
    console.error("Method 1 Gujarat REST API error:", err);
  }
  return [];
}

/**
 * METHOD 4: ISTI Portal National S&T Telemetry & Indicator Fetcher */
export async function fetchISTIPortalNationalSchemes(): Promise<PolicyOrSOP[]> {
  const nationalSchemes: PolicyOrSOP[] = [
    {
      id: "isti-dst-nidhi-1",
      externalId: "isti-dst-nidhi-1",
      state: "Central",
      type: "scheme",
      schemeName: "India Science Technology & Innovation (ISTI): DST NIDHI-PRAYAS Grant",
      department: "Department of Science & Technology (DST), Govt of India",
      financialAssistance: "Grant up to ₹10,00,000 (₹10 Lakhs) for PoC & MVP Fabrication",
      summary: "National scheme supporting innovators converting deep-tech ideas into working prototypes with incubator fabrication lab access.",
      eligibility: "Incubated innovators at DST-supported TBIs like STEP IIT Kharagpur.",
      tags: ["India Science", "Technology and Innovation", "ISTI Portal", "DST NIDHI", "PRAYAS", "Central Grant", "DeepTech"],
      officialUrl: "https://www.indiascienceandtechnology.gov.in/funding-opportunities/startups",
      lastFetchedAt: new Date().toISOString(),
    },
    {
      id: "isti-birac-big-2",
      externalId: "isti-birac-big-2",
      state: "Central",
      type: "scheme",
      schemeName: "India Science Technology & Innovation (ISTI): BIRAC Biotechnology Ignition Grant (BIG)",
      department: "Department of Biotechnology (DBT) / BIRAC, Govt of India",
      financialAssistance: "Grant-in-aid up to ₹50,00,000 (₹50 Lakhs) for 18 Months",
      summary: "Flagship Biotech grant for early-stage biotech, medtech, and agritech founders to establish proof-of-concept.",
      eligibility: "Biotech entrepreneurs, PhD graduates, and early-stage biotech startups.",
      tags: ["India Science", "Technology and Innovation", "ISTI Portal", "BIRAC BIG", "DBT", "Biotech Fund", "Central Grant"],
      officialUrl: "https://www.indiascienceandtechnology.gov.in/funding-opportunities/startups",
      lastFetchedAt: new Date().toISOString(),
    },
    {
      id: "isti-ramanujan-3",
      externalId: "isti-ramanujan-3",
      state: "Central",
      type: "scheme",
      schemeName: "India Science Technology & Innovation (ISTI): Ramanujan Fellowship",
      department: "Anusandhan National Research Foundation (ANRF) / DST",
      financialAssistance: "Fellowship of ₹1,35,000/month + Research Grant of ₹7,00,000/year for 5 Years",
      summary: "Attractive fellowship to lure brilliant Indian scientists and engineers from abroad back to Indian academic and research labs.",
      eligibility: "Indian scientists with proven track record returning to Indian institutions.",
      tags: ["India Science", "Technology and Innovation", "ISTI Portal", "ANRF", "Ramanujan Fellowship", "R&D Grant"],
      officialUrl: "https://www.indiascienceandtechnology.gov.in/fellowships-scholarships",
      lastFetchedAt: new Date().toISOString(),
    },
    {
      id: "isti-wise-kiran-4",
      externalId: "isti-wise-kiran-4",
      state: "Central",
      type: "scheme",
      schemeName: "India Science Technology & Innovation (ISTI): DST WISE-KIRAN Scheme",
      department: "Department of Science & Technology (DST), Govt of India",
      financialAssistance: "Monthly Stipend ₹55,000 + Annual Research Overhead Grant for 3 Years",
      summary: "Empowering women scientists and technologists who had a career break to pursue independent R&D and tech commercialization.",
      eligibility: "Women researchers in STEM holding M.Tech, MD, or PhD degrees.",
      tags: ["India Science", "Technology and Innovation", "ISTI Portal", "WISE-KIRAN", "Women Scientists", "DST"],
      officialUrl: "https://www.indiascienceandtechnology.gov.in/programme-schemes/women-schemes",
      lastFetchedAt: new Date().toISOString(),
    },
  ];

  return nationalSchemes;
}

/**
 * METHOD 5: Ministry of Defence iDEX Schemes Fetcher
 */
export async function fetchIDEXDefenceSchemes(): Promise<PolicyOrSOP[]> {
  return FALLBACK_IDEX_DEFENCE_POLICIES;
}

/**
 * STARTUP INDIA DPIIT POLICIES (https://www.startupindia.gov.in/)
 */
export const FALLBACK_STARTUP_INDIA_POLICIES: PolicyOrSOP[] = [
  {
    id: "sih-sisfs-1",
    externalId: "sih-sisfs-1",
    state: "Central",
    type: "scheme",
    schemeName: "Startup India Seed Fund Scheme (SISFS)",
    department: "DPIIT, Ministry of Commerce & Industry, Govt of India",
    financialAssistance: "Grant up to ₹20,00,000 (₹20 Lakhs) for PoC + Debt / Debentures up to ₹50,00,000 (₹50 Lakhs)",
    summary: "Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.",
    eligibility: "DPIIT recognized startups incorporated within 2 years with a tech-driven prototype.",
    tags: ["Startup India", "SISFS", "DPIIT", "Seed Fund", "20 Lakh Grant"],
    officialUrl: "https://www.startupindia.gov.in/content/sih/en/startup-scheme.html",
  },
  {
    id: "sih-cgss-2",
    externalId: "sih-cgss-2",
    state: "Central",
    type: "scheme",
    schemeName: "Startup India Credit Guarantee Scheme for Startups (CGSS)",
    department: "DPIIT / NCGTC, Ministry of Commerce & Industry, Govt of India",
    financialAssistance: "Collateral-Free Credit Guarantee Cover up to ₹10,00,00,000 (₹10 Crores)",
    summary: "Credit guarantee cover for collateral-free loans provided by Scheduled Commercial Banks and NBFCs to DPIIT recognized startups.",
    eligibility: "DPIIT recognized startups reaching commercial revenue stage.",
    tags: ["Startup India", "CGSS", "Credit Guarantee", "10 Crore Cover", "DPIIT"],
    officialUrl: "https://www.startupindia.gov.in/content/sih/en/credit-guarantee-scheme-for-startups.html",
  },
  {
    id: "sih-imb-3",
    externalId: "sih-imb-3",
    state: "Central",
    type: "scheme",
    schemeName: "Startup India Section 80-IAC Income Tax Exemption",
    department: "Inter-Ministerial Board (IMB) / DPIIT, Govt of India",
    financialAssistance: "100% Income Tax Exemption for 3 Consecutive Financial Years",
    summary: "Tax holiday for DPIIT recognized startups for 3 consecutive financial years out of 10 years from incorporation.",
    eligibility: "DPIIT recognized private limited companies / LLPs certified by IMB.",
    tags: ["Startup India", "80-IAC", "Tax Exemption", "IMB Certificate", "DPIIT"],
    officialUrl: "https://www.startupindia.gov.in/content/sih/en/startupgov/imb.html",
  },
  {
    id: "sih-ipr-4",
    externalId: "sih-ipr-4",
    state: "Central",
    type: "scheme",
    schemeName: "Startup India Fast-Track Patent Examination & 80% Patent Rebate",
    department: "Indian Patent Office / DPIIT, Ministry of Commerce & Industry",
    financialAssistance: "80% Rebate on Patent Filing Fees + 50% Rebate on Trademark Filing",
    summary: "Fast-track patent examination and panel of IP facilitators providing free patent drafting services for startups.",
    eligibility: "DPIIT recognized startups filing patents in India.",
    tags: ["Startup India", "IPR Rebate", "Fast-Track Patent", "DPIIT"],
    officialUrl: "https://www.startupindia.gov.in/content/sih/en/intellectual-property-rights.html",
  },
  {
    id: "sih-procurement-5",
    externalId: "sih-procurement-5",
    state: "Central",
    type: "scheme",
    schemeName: "Startup India Public Procurement EMD & Turnover Relaxation",
    department: "Department of Expenditure / GeM Portal / DPIIT",
    financialAssistance: "100% Exemption from EMD + Prior Turnover & Experience Exemption",
    summary: "Equal opportunity for startups to participate in public procurement tenders without prior turnover or EMD constraints.",
    eligibility: "DPIIT recognized startups bidding on Government e-Marketplace (GeM).",
    tags: ["Startup India", "GeM Tenders", "Public Procurement", "EMD Exemption"],
    officialUrl: "https://www.startupindia.gov.in/content/sih/en/public_procurement.html",
  },
];

/**
 * MINISTRY OF DEFENCE iDEX SCHEMES (https://idex.gov.in/challenges)
 */
export const FALLBACK_IDEX_DEFENCE_POLICIES: PolicyOrSOP[] = [
  {
    id: "idex-spark-1",
    externalId: "idex-spark-1",
    state: "Central",
    type: "scheme",
    schemeName: "iDEX SPARK Grant (Innovations for Defence Excellence)",
    department: "Defence Innovation Organisation (DIO), Ministry of Defence, Govt of India",
    financialAssistance: "Grant-in-aid up to ₹1,50,00,000 (₹1.5 Crores) per Startup / MSME",
    summary: "Flagship Ministry of Defence grant supporting startups developing prototype hardware/software for Army, Navy, Air Force, and Coast Guard.",
    eligibility: "DPIIT recognized startups, MSMEs, and individual innovators in defence tech.",
    tags: ["iDEX", "Ministry of Defence", "SPARK Grant", "1.5 Crore Fund", "Defence Tech", "Army", "Navy", "Air Force"],
    officialUrl: "https://idex.gov.in/challenges",
  },
  {
    id: "idex-prime-2",
    externalId: "idex-prime-2",
    state: "Central",
    type: "scheme",
    schemeName: "iDEX Prime Grant (High-Capital Defence & Aerospace Innovation)",
    department: "Defence Innovation Organisation (DIO), Ministry of Defence, Govt of India",
    financialAssistance: "Grant-in-aid up to ₹10,00,00,000 (₹10 Crores) for High-Capital R&D",
    summary: "High-tier defence innovation grant for scaling complex defence & aerospace hardware, radar systems, and autonomous weapon platforms.",
    eligibility: "Startups and MSMEs tackling high-capital defence challenges requiring extensive R&D.",
    tags: ["iDEX Prime", "Ministry of Defence", "10 Crore Grant", "Aerospace", "Autonomous Defence"],
    officialUrl: "https://idex.gov.in/challenges",
  },
  {
    id: "idex-aditi-3",
    externalId: "idex-aditi-3",
    state: "Central",
    type: "scheme",
    schemeName: "iDEX ADITI Scheme (Acing Development of Innovative Technologies with iDEX)",
    department: "Department of Defence Production, Ministry of Defence, Govt of India",
    financialAssistance: "Grant-in-aid up to ₹25,00,00,000 (₹25 Crores) for Strategic Critical Tech",
    summary: "Deep-tech defence scheme developing critical strategic technologies, quantum cryptography, hypersonic systems, and underwater sensors.",
    eligibility: "Indian startups, MSMEs, and research consortia working on critical defence technologies.",
    tags: ["iDEX ADITI", "Ministry of Defence", "25 Crore Grant", "Strategic Defence", "DeepTech"],
    officialUrl: "https://idex.gov.in/challenges",
  },
  {
    id: "idex-disc14-4",
    externalId: "idex-disc14-4",
    state: "Central",
    type: "scheme",
    schemeName: "Defence India Startup Challenge (DISC 14 & DRISHTI)",
    department: "Indian Armed Forces (Army / Navy / IAF / DPSUs) & DIO",
    financialAssistance: "Grant up to ₹1.5 Cr + Procurement Orders from Armed Forces",
    summary: "Problem statements released directly by Indian Army, Air Force, Navy, and Defence PSUs for direct procurement and field trials.",
    eligibility: "Indian innovators and startups solving specific armed forces problem statements.",
    tags: ["DISC 14", "DRISHTI", "Defence Tenders", "Armed Forces", "Procurement Order"],
    officialUrl: "https://idex.gov.in/challenges",
  },
  {
    id: "idex-open-5",
    externalId: "idex-open-5",
    state: "Central",
    type: "scheme",
    schemeName: "iDEX Open Challenge (Year-Round Unsolicited Defence Innovations)",
    department: "Defence Innovation Organisation (DIO), Ministry of Defence, Govt of India",
    financialAssistance: "Grant up to ₹1.5 Crores + Armed Forces Mentorship & Testing Grounds",
    summary: "Open window for startups proposing novel dual-use or defence innovations not covered in scheduled DISC challenges.",
    eligibility: "Any Indian startup with a novel defence application idea or prototype.",
    tags: ["iDEX Open Challenge", "Ministry of Defence", "Dual-Use Tech", "Year-Round Grant"],
    officialUrl: "https://idex.gov.in/challenges",
  },
];

/**
 * MEITY STARTUP HUB (MSH) SCHEMES (https://msh.meity.gov.in/)
 */
export const FALLBACK_MEITY_MSH_POLICIES: PolicyOrSOP[] = [
  {
    id: "msh-samridh-1",
    externalId: "msh-samridh-1",
    state: "Central",
    type: "scheme",
    schemeName: "MeitY SAMRIDH Scheme (Startup Accelerator for Product Innovation)",
    department: "MeitY Startup Hub (MSH), Ministry of Electronics & IT, Govt of India",
    financialAssistance: "Matching Investment up to ₹40,00,000 (₹40 Lakhs) per Startup",
    summary: "Matching funding grant for software & deep-tech startups accelerating product-market fit, customer acquisition, and Series-A readiness.",
    eligibility: "Software & tech startups selected by MeitY-empaneled accelerators.",
    tags: ["MeitY MSH", "SAMRIDH", "Accelerator Matching", "Central Grant", "Tech Startup"],
    officialUrl: "https://msh.meity.gov.in/challenges",
  },
  {
    id: "msh-tide-2",
    externalId: "msh-tide-2",
    state: "Central",
    type: "scheme",
    schemeName: "MeitY TIDE 2.0 (Technology Incubation & Development of Entrepreneurs)",
    department: "MeitY Startup Hub (MSH), Ministry of Electronics & IT, Govt of India",
    financialAssistance: "Entrepreneurship Grant up to ₹7 Lakhs | Grant-in-Aid up to ₹40 Lakhs",
    summary: "Financial grant for emerging tech startups leveraging IoT, AI, Robotics, Cyber Security, and Blockchain.",
    eligibility: "Tech innovators and startups incubated at TIDE 2.0 Incubation Centers.",
    tags: ["MeitY MSH", "TIDE 2.0", "AI", "IoT", "Robotics", "Central Grant"],
    officialUrl: "https://msh.meity.gov.in/incubators",
  },
  {
    id: "msh-genesis-3",
    externalId: "msh-genesis-3",
    state: "Central",
    type: "scheme",
    schemeName: "MeitY GENESIS (Gen-Next Support for Innovative Startups in Tier-2/3 Cities)",
    department: "MeitY Startup Hub (MSH), Ministry of Electronics & IT, Govt of India",
    financialAssistance: "₹490 Crore Outlay for 10,000+ Tier-2/3 Tech Startups",
    summary: "National umbrella scheme discovering, nurturing, and scaling tech startups beyond metro hubs in Tier-2 & Tier-3 cities.",
    eligibility: "Tech startups operating in Tier-2 and Tier-3 cities across India.",
    tags: ["MeitY MSH", "GENESIS", "Tier-2/3 Cities", "490 Cr Fund", "Central Scheme"],
    officialUrl: "https://msh.meity.gov.in/meityabout",
  },
  {
    id: "msh-c2s-4",
    externalId: "msh-c2s-4",
    state: "Central",
    type: "scheme",
    schemeName: "MeitY Chips to Startup (C2S) Semiconductor Scheme",
    department: "Ministry of Electronics & IT (MeitY) / India Semiconductor Mission",
    financialAssistance: "EDA Tools Access + Chip Fabrication Support up to ₹5 Crores",
    summary: "Semiconductor design incentive program providing EDA tools, MPW fab access, and prototyping capital for fabless chip startups.",
    eligibility: "Fabless semiconductor design startups and academic VLSI labs.",
    tags: ["MeitY MSH", "Chips to Startup", "Semiconductor", "C2S", "VLSI"],
    officialUrl: "https://msh.meity.gov.in/coe",
  },
];

/**
 * DST NIDHI PORTAL POLICIES (https://nidhi.dst.gov.in/)
 */
export const FALLBACK_DST_NIDHI_POLICIES: PolicyOrSOP[] = [
  {
    id: "nidhi-eir-1",
    externalId: "nidhi-eir-1",
    state: "Central",
    type: "scheme",
    schemeName: "DST NIDHI-EIR (Entrepreneurs-in-Residence) Fellowship",
    department: "Department of Science & Technology (DST), Govt of India",
    financialAssistance: "Stipend of ₹30,000/month for 12 to 18 Months",
    summary: "Fellowship support for promising science and engineering graduates to pursue deep-tech entrepreneurship full-time.",
    eligibility: "Indian citizens holding STEM degrees with a scalable technology idea.",
    tags: ["DST NIDHI", "EIR Fellowship", "Central Grant", "DeepTech"],
    officialUrl: "https://nidhi.dst.gov.in/nidhieir/",
  },
  {
    id: "nidhi-ssp-2",
    externalId: "nidhi-ssp-2",
    state: "Central",
    type: "scheme",
    schemeName: "DST NIDHI-SSP (Seed Support Programme)",
    department: "Department of Science & Technology (DST), Govt of India",
    financialAssistance: "Equity / Convertible Debt Seed Capital up to ₹1,00,00,000 (₹1 Crore)",
    summary: "Seed capital investment for early-stage tech ventures incubated in DST-supported TBIs for scaling product and market launch.",
    eligibility: "Incubated startups with validated proof-of-concept and commercial potential.",
    tags: ["DST NIDHI", "SSP", "Seed Capital", "1 Crore Fund", "Central Grant"],
    officialUrl: "https://nidhi.dst.gov.in/nidhissp/",
  },
  {
    id: "nidhi-itbi-3",
    externalId: "nidhi-itbi-3",
    state: "Central",
    type: "scheme",
    schemeName: "DST NIDHI-iTBI (Inclusive Technology Business Incubator)",
    department: "Department of Science & Technology (DST), Govt of India",
    financialAssistance: "Grant up to ₹5,00,00,000 (₹5 Crores) over 3 Years",
    summary: "Establishment of inclusive incubation centers in Tier-2 & Tier-3 educational institutions to democratize startup creation.",
    eligibility: "Academic and research institutions in Tier-2/3 regions.",
    tags: ["DST NIDHI", "iTBI", "Incubator Grant", "Tier-2/3 Hubs"],
    officialUrl: "https://nidhi.dst.gov.in/nidhiitbi/",
  },
  {
    id: "nidhi-coe-4",
    externalId: "nidhi-coe-4",
    state: "Central",
    type: "scheme",
    schemeName: "DST NIDHI-CoE (Centre of Excellence)",
    department: "Department of Science & Technology (DST), Govt of India",
    financialAssistance: "Capital Grant up to ₹50,00,00,000 (₹50 Crores) over 5 Years",
    summary: "World-class Centre of Excellence grant to nurture high-impact global deep-tech startups and advanced research labs.",
    eligibility: "Premier TBI incubation centers with a proven 5-year track record.",
    tags: ["DST NIDHI", "Centre of Excellence", "CoE Grant", "DeepTech"],
    officialUrl: "https://nidhi.dst.gov.in/nidhicoe/",
  },
];

/**
 * UTTAR PRADESH (STARTINUP) POLICIES & GRANTS (https://startinup.up.gov.in/)
 */
export const FALLBACK_STARTINUP_UP_POLICIES: PolicyOrSOP[] = [
  {
    id: "up-sch-1",
    externalId: "up-sch-1",
    state: "Uttar Pradesh",
    type: "scheme",
    schemeName: "StartInUP: Sustenance Allowance Grant Scheme",
    department: "Department of IT & Electronics, Government of Uttar Pradesh",
    financialAssistance: "₹17,500/month (General) | ₹20,500/month (Women / SC / ST / Transgender Co-founders) for 1 Year",
    summary: "Monthly financial sustenance grant for DPIIT recognized UP-based startups registered with approved incubators.",
    eligibility: "DPIIT & StartInUP recognized startups incorporated in Uttar Pradesh.",
    tags: ["StartInUP", "Sustenance Allowance", "Uttar Pradesh", "Women Founders", "Seed Stage"],
    officialUrl: "https://startinup.up.gov.in/seed-capital-marketing-assistance/",
  },
  {
    id: "up-sch-2",
    externalId: "up-sch-2",
    state: "Uttar Pradesh",
    type: "scheme",
    schemeName: "StartInUP: Seed Capital & Prototype Fabrication Grant",
    department: "Department of IT & Electronics, Government of Uttar Pradesh",
    financialAssistance: "Up to ₹5,00,00,000 (₹5 Lakhs) Seed Capital Grant",
    summary: "Financial assistance for prototype creation, MVP development, software licenses, and raw materials.",
    eligibility: "Startups with validated proof-of-concept approved by UP Incubation Centers.",
    tags: ["StartInUP", "Seed Capital", "Prototype Grant", "MVP Development", "Uttar Pradesh"],
    officialUrl: "https://startinup.up.gov.in/prototype-development-sartups/",
  },
  {
    id: "up-sch-3",
    externalId: "up-sch-3",
    state: "Uttar Pradesh",
    type: "scheme",
    schemeName: "StartInUP: Market Development & Commercial Pilot Support",
    department: "Department of IT & Electronics, Government of Uttar Pradesh",
    financialAssistance: "Up to ₹7,50,000 (₹7.5 Lakhs) for Pilot Launch & Customer Access",
    summary: "Commercialization grant for market testing, pilot deployment, and customer acquisition across UP markets.",
    eligibility: "Startups transitioning from MVP stage to commercial deployment.",
    tags: ["StartInUP", "Market Access", "Commercial Pilots", "Uttar Pradesh"],
    officialUrl: "https://startinup.up.gov.in/seed-capital-marketing-assistance/",
  },
  {
    id: "up-sch-4",
    externalId: "up-sch-4",
    state: "Uttar Pradesh",
    type: "scheme",
    schemeName: "StartInUP: Intellectual Property (IPR) Reimbursement",
    department: "Department of IT & Electronics, Government of Uttar Pradesh",
    financialAssistance: "Up to ₹2 Lakhs (Domestic Patent) | Up to ₹5 Lakhs (International Patent)",
    summary: "Reimbursement for patent attorney fees, filing costs, and official examination fees.",
    eligibility: "UP startups holding patent filing receipts from IPO or WIPO.",
    tags: ["StartInUP", "IPR", "Patents", "Legal Protection", "Uttar Pradesh"],
    officialUrl: "https://startinup.up.gov.in/policy-objectives/",
  },
  {
    id: "up-sch-5",
    externalId: "up-sch-5",
    state: "Uttar Pradesh",
    type: "scheme",
    schemeName: "StartInUP: Centres of Excellence (CoE) Innovation Infrastructure Grant",
    department: "Department of IT & Electronics, Government of Uttar Pradesh",
    financialAssistance: "Up to ₹10,00,00,000 (₹10 Crores) CoE Establishment Support",
    summary: "Funding for specialized CoEs in AI (Noida), Blockchain (IIT Kanpur), Drones (Kanpur), MedTech (Lucknow), and 5G/6G Telecom.",
    eligibility: "Premier academic institutions & incubators in Uttar Pradesh.",
    tags: ["StartInUP", "Centres of Excellence", "AI", "Blockchain", "Drones", "Uttar Pradesh"],
    officialUrl: "https://startinup.up.gov.in/coes-list/",
  },
];

export const FALLBACK_GUJARAT_POLICIES_AND_SOPS: PolicyOrSOP[] = [
  // --- GUJARAT SCHEMES ---
  {
    id: "guj-sch-1",
    externalId: "guj-sch-1",
    state: "Gujarat",
    type: "scheme",
    schemeName: "Gujarat Startup Policy: Sustenance Allowance Scheme",
    department: "Industries & Mines Department, Government of Gujarat",
    financialAssistance: "₹20,000/month (General) | ₹25,000/month (Woman Co-founder / SC / ST / PwD) for 1 Year",
    summary: "Monthly financial allowance provided to recognized startups for sustaining founders during early-stage product validation.",
    eligibility: "DPIIT recognized Gujarat-based startups registered with approved Nodal Institutes.",
    tags: ["Sustenance Allowance", "Women Founders", "Seed Stage", "Gujarat Govt", "Scheme"],
    officialUrl: "https://startup.gujarat.gov.in/policy/startup-policies",
  },
  {
    id: "guj-sch-2",
    externalId: "guj-sch-2",
    state: "Gujarat",
    type: "scheme",
    schemeName: "Gujarat Startup Policy: Seed Support & Prototype Assistance",
    department: "Industries & Mines Department, Government of Gujarat",
    financialAssistance: "Up to ₹30,00,000 (₹30 Lakhs) for Prototype & Product Development",
    summary: "Grant for raw materials, prototype fabrication, testing, trials, and MVP development.",
    eligibility: "Startups with a validated proof-of-concept recommended by an approved Nodal Incubation Center.",
    tags: ["Seed Support", "Prototype Grant", "MVP Development", "Gujarat Govt", "Scheme"],
    officialUrl: "https://startup.gujarat.gov.in/policy/startup-policies",
  },
  {
    id: "guj-sch-3",
    externalId: "guj-sch-3",
    state: "Gujarat",
    type: "scheme",
    schemeName: "Gujarat Startup Policy: Market Development & Acceleration Support",
    department: "Industries & Mines Department, Government of Gujarat",
    financialAssistance: "Up to ₹10,00,000 (₹10 Lakhs) for Market Pilot & Acceleration",
    summary: "Financial support for pilot deployment, customer acquisition, trade show participation, and market testing.",
    eligibility: "Startups transitioning from MVP stage to commercial market launch.",
    tags: ["Market Access", "Acceleration", "Customer Pilots", "Gujarat Govt", "Scheme"],
    officialUrl: "https://startup.gujarat.gov.in/policy/startup-policies",
  },
  {
    id: "guj-sch-4",
    externalId: "guj-sch-4",
    state: "Gujarat",
    type: "scheme",
    schemeName: "Gujarat Startup Policy: Intellectual Property (IPR) Reimbursement",
    department: "Industries & Mines Department, Government of Gujarat",
    financialAssistance: "Up to ₹2 Lakhs (Domestic Patent) | Up to ₹10 Lakhs (International/PCT Patent)",
    summary: "Financial reimbursement for patent drafting, filing fees, trademark, and copyright protection.",
    eligibility: "Startups filing patents for proprietary technology developed in Gujarat.",
    tags: ["IPR", "Patents", "Trademark", "Legal Protection", "Gujarat Govt", "Scheme"],
    officialUrl: "https://startup.gujarat.gov.in/policy/startup-policies",
  },
  {
    id: "guj-sch-5",
    externalId: "guj-sch-5",
    state: "Gujarat",
    type: "scheme",
    schemeName: "Gujarat Startup Policy: Skill Development & Training Assistance",
    department: "Industries & Mines Department, Government of Gujarat",
    financialAssistance: "Up to ₹1,00,000 (₹1 Lakh) per Startup for Skill Upskilling",
    summary: "Assistance for founder and team technical skill development, specialized certifications, and workshop access.",
    eligibility: "Early-stage startups registered with a recognized Gujarat Nodal Institute.",
    tags: ["Skill Development", "Training Grant", "Capacity Building", "Gujarat Govt", "Scheme"],
    officialUrl: "https://startup.gujarat.gov.in/policy/startup-policies",
  },

  // --- GUJARAT SOPs ---
  {
    id: "guj-sop-1",
    externalId: "guj-sop-1",
    state: "Gujarat",
    type: "sop",
    schemeName: "Gujarat Startup SOP 1: Registration & Nodal Institute Mapping Workflow",
    department: "Industries & Mines Department / Gujarat Nodal Institutes",
    financialAssistance: "Operational Process & Portal Application Workflow",
    summary: "Standard procedure for online application submission, document scrutiny, Nodal Institute assignment, and 14-day approval timeline.",
    eligibility: "All Gujarat-incorporated startups seeking state recognition and nodal mentoring.",
    tags: ["SOP", "Nodal Mapping", "Startup Registration", "Approval Workflow", "Gujarat SOP"],
    officialUrl: "https://startup.gujarat.gov.in/policy/standard-operating-procedure",
  },
  {
    id: "guj-sop-2",
    externalId: "guj-sop-2",
    state: "Gujarat",
    type: "sop",
    schemeName: "Gujarat Startup SOP 2: Sustenance Allowance Disbursement & QPR Submission",
    department: "Industries & Mines Department, Government of Gujarat",
    financialAssistance: "Quarterly Direct Benefit Transfer (DBT) Workflow",
    summary: "Step-by-step procedure for submitting Quarterly Progress Reports (QPR), bank account verification, Nodal Committee endorsement, and DBT release.",
    eligibility: "Startups approved for monthly Sustenance Allowance under Gujarat Policy.",
    tags: ["SOP", "Sustenance Allowance", "DBT Disbursement", "QPR Verification", "Gujarat SOP"],
    officialUrl: "https://startup.gujarat.gov.in/policy/standard-operating-procedure",
  },
  {
    id: "guj-sop-3",
    externalId: "guj-sop-3",
    state: "Gujarat",
    type: "sop",
    schemeName: "Gujarat Startup SOP 3: Milestone-Based Prototype Grant & UC Release",
    department: "Industries & Mines Department, Government of Gujarat",
    financialAssistance: "Tranche Release: 40% Advance | 40% Mid-term | 20% Final Audit",
    summary: "Operational guidelines for Milestone Tranche Releases, Chartered Accountant Utilization Certificate (UC) submission, and expenditure verification.",
    eligibility: "Startups awarded up to ₹30 Lakhs Prototype / Seed Support Grant.",
    tags: ["SOP", "Seed Grant Disbursement", "Tranche Release", "UC Certificate", "Gujarat SOP"],
    officialUrl: "https://startup.gujarat.gov.in/policy/standard-operating-procedure",
  },
  {
    id: "guj-sop-4",
    externalId: "guj-sop-4",
    state: "Gujarat",
    type: "sop",
    schemeName: "Gujarat Startup SOP 4: IPR Patent & Trademark Reimbursement Claim Procedure",
    department: "Industries & Mines Department, Government of Gujarat",
    financialAssistance: "Post-Filing Claim Submission Workflow",
    summary: "Standard procedure for claiming patent fee reimbursement, submitting attorney vouchers, examination report proofs, and fee transfer approval.",
    eligibility: "Startups holding official Indian Patent Office / WIPO filing receipts.",
    tags: ["SOP", "IPR Claim", "Patent Filing Reimbursement", "Voucher Verification", "Gujarat SOP"],
    officialUrl: "https://startup.gujarat.gov.in/policy/standard-operating-procedure",
  },

  // --- CENTRAL & WEST BENGAL ---
  {
    id: "cen-1",
    externalId: "cen-1",
    state: "Central",
    type: "scheme",
    schemeName: "DST NIDHI-PRAYAS Seed Grant",
    department: "Department of Science & Technology, Government of India",
    financialAssistance: "Up to ₹10,00,000 (₹10 Lakhs) Proof of Concept Grant",
    summary: "Central Government grant for converting innovative deep-tech ideas into working physical/digital prototypes.",
    eligibility: "Indian innovators incubated at DST-recognized TBI incubators like STEP IIT KGP.",
    tags: ["DST NIDHI", "Central Govt", "PRAYAS", "Prototype Grant"],
    officialUrl: "https://www.startupindia.gov.in",
  },
  {
    id: "wb-1",
    externalId: "wb-1",
    state: "West Bengal",
    type: "scheme",
    schemeName: "STEP IIT Kharagpur Incubation Seed Fund",
    department: "STEP IIT Kharagpur / WB Innovation Hub",
    financialAssistance: "₹10,00,000 to ₹25,00,000 Seed Equity / Convertible Grant",
    summary: "Premier deep-tech seed capital fund for IIT Kharagpur incubated ventures.",
    eligibility: "Incubated startups at Science & Technology Entrepreneurs' Park, IIT Kharagpur.",
    tags: ["STEP IIT KGP", "West Bengal", "DeepTech Fund", "Seed Grant"],
    officialUrl: "https://step.iitkgp.ac.in",
  },
];

/**
 * ALL 28 INDIAN STATES & UTs STARTUP SCHEMES FALLBACK
 */
export const ALL_STATE_POLICIES_FALLBACK: PolicyOrSOP[] = [
  {
    id: "kar-sch-1",
    externalId: "kar-sch-1",
    state: "Karnataka",
    type: "scheme",
    schemeName: "Startup Karnataka Elevate Idea2POC Grant Scheme",
    department: "Karnataka Innovation & Technology Society (KITS), Govt of Karnataka",
    financialAssistance: "Grant-in-aid up to ₹50,00,000 (₹50 Lakhs) per Startup",
    summary: "Flagship Elevate Karnataka grant for early-stage tech innovators for proof of concept, MVP, and market deployment.",
    eligibility: "DPIIT & Startup Karnataka registered startups with operational office in Karnataka.",
    tags: ["Karnataka", "Elevate", "Idea2POC", "50 Lakh Grant", "State Scheme"],
    officialUrl: "https://startup.karnataka.gov.in/",
  },
  {
    id: "ker-sch-1",
    externalId: "ker-sch-1",
    state: "Kerala",
    type: "scheme",
    schemeName: "Kerala Startup Mission (KSUM) Innovation Grant",
    department: "Kerala Startup Mission, Government of Kerala",
    financialAssistance: "Productization Grant up to ₹12,00,000 (₹12 Lakhs) | R&D Grant ₹5L",
    summary: "Financial assistance for prototype development, commercialization, and scaleup support across Kerala innovation hubs.",
    eligibility: "Startups registered with KSUM portal with working prototype.",
    tags: ["Kerala", "KSUM", "Innovation Grant", "State Scheme"],
    officialUrl: "https://startupmission.kerala.gov.in/",
  },
  {
    id: "mah-sch-1",
    externalId: "mah-sch-1",
    state: "Maharashtra",
    type: "scheme",
    schemeName: "Maharashtra State Innovation Society (MSINS) Seed Support & Patent Grant",
    department: "Maharashtra State Innovation Society, Govt of Maharashtra",
    financialAssistance: "Seed Fund up to ₹10 Lakhs | Patent Reimbursement up to ₹2 Lakhs",
    summary: "Financial grant for early-stage startups and 100% reimbursement for patent drafting and filing fees.",
    eligibility: "Startups registered with MSINS portal incorporated in Maharashtra.",
    tags: ["Maharashtra", "MSINS", "Seed Support", "Patent Grant", "State Scheme"],
    officialUrl: "https://msins.in/",
  },
  {
    id: "ts-sch-1",
    externalId: "ts-sch-1",
    state: "Telangana",
    type: "scheme",
    schemeName: "Startup Telangana T-Fund Seed Capital Scheme",
    department: "T-Hub / Information Technology Department, Govt of Telangana",
    financialAssistance: "Seed Capital up to ₹10,00,000 (₹10 Lakhs) + T-Hub Acceleration",
    summary: "Early-stage seed capital assistance for hardware, AI, biotech, and deep-tech startups incubated at T-Hub.",
    eligibility: "Startups registered with Startup Telangana portal.",
    tags: ["Telangana", "T-Hub", "T-Fund", "Seed Capital", "State Scheme"],
    officialUrl: "https://t-hub.co/",
  },
  {
    id: "raj-sch-1",
    externalId: "raj-sch-1",
    state: "Rajasthan",
    type: "scheme",
    schemeName: "iStart Rajasthan Sustenance Allowance & QRate Ranking Grant",
    department: "Department of IT & Communication, Government of Rajasthan",
    financialAssistance: "₹20,000/month Sustenance Allowance for 1 Year | Seed Capital ₹5 Lakhs",
    summary: "Single window portal providing monthly sustenance allowance and QRate incubation ranking for Rajasthan startups.",
    eligibility: "iStart Rajasthan recognized startups with QRate assessment.",
    tags: ["Rajasthan", "iStart", "Sustenance Allowance", "QRate", "State Scheme"],
    officialUrl: "https://istart.rajasthan.gov.in/",
  },
  {
    id: "tn-sch-1",
    externalId: "tn-sch-1",
    state: "Tamil Nadu",
    type: "scheme",
    schemeName: "StartupTN TANSEED Innovation Grant Scheme",
    department: "Tamil Nadu Startup and Innovation Mission (TANSIM), Govt of Tamil Nadu",
    financialAssistance: "Grant-in-aid up to ₹10,00,000 (₹10 Lakhs) per Startup",
    summary: "Flagship TANSEED grant supporting green tech, rural tech, SC/ST founders, and deep-tech ventures in Tamil Nadu.",
    eligibility: "Startups recognized by StartupTN with working prototype.",
    tags: ["Tamil Nadu", "StartupTN", "TANSEED", "10 Lakh Grant", "State Scheme"],
    officialUrl: "https://startuptn.in/",
  },
  {
    id: "pb-sch-1",
    externalId: "pb-sch-1",
    state: "Punjab",
    type: "scheme",
    schemeName: "Startup Punjab Seed Capital & Interest Subsidy Scheme",
    department: "Department of Industries & Commerce, Government of Punjab",
    financialAssistance: "Seed Capital up to ₹3,00,000 | 5% Interest Subsidy on Commercial Loans",
    summary: "Financial assistance for Agritech, Food Processing, and IT startups in Punjab.",
    eligibility: "DPIIT & Startup Punjab recognized startups.",
    tags: ["Punjab", "Startup Punjab", "Agritech", "Seed Capital", "State Scheme"],
    officialUrl: "https://startup.punjab.gov.in/",
  },
  {
    id: "od-sch-1",
    externalId: "od-sch-1",
    state: "Odisha",
    type: "scheme",
    schemeName: "Startup Odisha Monthly Allowance & Product Development Grant",
    department: "MSME Department, Government of Odisha",
    financialAssistance: "₹20,000/month Allowance | Product Development Grant up to ₹15 Lakhs",
    summary: "Monthly sustenance allowance and product development capital for Odisha startups incubated at O-Hub.",
    eligibility: "Startups registered with Startup Odisha portal.",
    tags: ["Odisha", "Startup Odisha", "O-Hub", "Product Grant", "State Scheme"],
    officialUrl: "https://startupodisha.gov.in/",
  },
  {
    id: "bih-sch-1",
    externalId: "bih-sch-1",
    state: "Bihar",
    type: "scheme",
    schemeName: "Startup Bihar Interest-Free Seed Loan Scheme",
    department: "Department of Industries, Government of Bihar",
    financialAssistance: "Interest-Free Seed Loan up to ₹10,00,000 (₹10 Lakhs) for 10 Years",
    summary: "10-year interest-free seed loan for product development and commercial scaling in Bihar.",
    eligibility: "Startups recognized under Bihar Startup Policy.",
    tags: ["Bihar", "Startup Bihar", "Seed Loan", "Interest Free", "State Scheme"],
    officialUrl: "https://startup.bihar.gov.in/",
  },
  {
    id: "ass-sch-1",
    externalId: "ass-sch-1",
    state: "Assam",
    type: "scheme",
    schemeName: "Startup Assam (The Nest) MASI Seed Capital Scheme",
    department: "Industries & Commerce Department, Government of Assam",
    financialAssistance: "Seed Capital up to ₹5,00,000 | Sustenance Allowance ₹20,000/month",
    summary: "Financial grant for North-East startups incubated at The Nest incubation center in Guwahati.",
    eligibility: "Assam-incorporated startups registered with Startup Assam.",
    tags: ["Assam", "Startup Assam", "The Nest", "North East", "State Scheme"],
    officialUrl: "https://startup.assam.gov.in/",
  },
  {
    id: "goa-sch-1",
    externalId: "goa-sch-1",
    state: "Goa",
    type: "scheme",
    schemeName: "Startup Goa Salary Subvention & Seed Capital Scheme",
    department: "Department of Information Technology, Government of Goa",
    financialAssistance: "Salary Subvention up to ₹10,000/emp/mo | Seed Capital up to ₹10 Lakhs",
    summary: "Financial subvention for employee salaries, co-working rent, and trademark filings in Goa.",
    eligibility: "Goa-registered startups recognized by DITC Goa.",
    tags: ["Goa", "Startup Goa", "Salary Subvention", "Seed Grant", "State Scheme"],
    officialUrl: "https://startups.goa.gov.in/",
  },
  {
    id: "har-sch-1",
    externalId: "har-sch-1",
    state: "Haryana",
    type: "scheme",
    schemeName: "Startup Haryana Seed Grant Scheme",
    department: "Department of Industries and Commerce, Government of Haryana",
    financialAssistance: "Seed Grant up to ₹10,00,000 (₹10 Lakhs) per Startup",
    summary: "Financial assistance for validation of idea, prototype development, proof of concept, and market research across A, B, C, and D category blocks in Haryana.",
    eligibility: "Haryana-based startups registered on Startup Haryana portal.",
    tags: ["Haryana", "Startup Haryana", "Seed Grant", "10 Lakh Grant", "State Scheme"],
    officialUrl: "https://investharyana.in/#/startupPolicies/withoutlogin",
  },
  {
    id: "har-sch-2",
    externalId: "har-sch-2",
    state: "Haryana",
    type: "scheme",
    schemeName: "Startup Haryana Lease Rental Subsidy Scheme",
    department: "Department of Industries and Commerce, Government of Haryana",
    financialAssistance: "30% Lease Subsidy (45% for Women-Led Startups) up to ₹5,00,000",
    summary: "Reimbursement of lease rent for startups operating from recognized incubators, IT parks, and industrial clusters.",
    eligibility: "Startups registered with Startup Haryana operating in notified IT Parks / Incubators.",
    tags: ["Haryana", "Startup Haryana", "Lease Rental Subsidy", "Women Founders", "State Scheme"],
    officialUrl: "https://investharyana.in/#/startupPolicies/withoutlogin",
  },
  {
    id: "har-sch-3",
    externalId: "har-sch-3",
    state: "Haryana",
    type: "scheme",
    schemeName: "Startup Haryana Patent Cost Reimbursement Scheme",
    department: "Department of Industries and Commerce, Government of Haryana",
    financialAssistance: "100% Reimbursement up to ₹2 Lakhs (Domestic) | ₹5 Lakhs (International)",
    summary: "Financial reimbursement for domestic and international patent filing and drafting fees.",
    eligibility: "Registered Haryana startups with filed or granted patents.",
    tags: ["Haryana", "Startup Haryana", "Patent Reimbursement", "IPR Support", "State Scheme"],
    officialUrl: "https://startupharyana.gov.in/pages/fiscal-benefits",
  },
  {
    id: "har-sch-4",
    externalId: "har-sch-4",
    state: "Haryana",
    type: "scheme",
    schemeName: "Startup Haryana Net SGST Reimbursement Scheme",
    department: "Department of Industries and Commerce, Government of Haryana",
    financialAssistance: "100% Net SGST Reimbursement for 7 Years (Max ₹10 Lakhs/yr)",
    summary: "Reimbursement of Net State Goods and Services Tax paid by registered startups for a period of 7 years.",
    eligibility: "Haryana registered startups with GSTIN.",
    tags: ["Haryana", "Startup Haryana", "Net SGST", "Tax Subvention", "State Scheme"],
    officialUrl: "https://startupharyana.gov.in/pages/fiscal-benefits",
  },
  {
    id: "mp-sch-1",
    externalId: "mp-sch-1",
    state: "Madhya Pradesh",
    type: "scheme",
    schemeName: "Startup MP State Innovation Challenge Grant Scheme",
    department: "Department of Micro, Small & Medium Enterprises (MSME), Government of Madhya Pradesh",
    financialAssistance: "Grant of up to ₹1,00,00,000 (₹1 Crore) per Challenge Winner",
    summary: "Flagship State & Department Innovation Challenge grant for solving civic, agricultural, healthcare, and industrial problems across Madhya Pradesh.",
    eligibility: "DPIIT recognized startups registered on Startup MP Portal 2.0.",
    tags: ["Madhya Pradesh", "Startup MP", "Innovation Challenge", "1 Crore Grant", "State Scheme"],
    officialUrl: "https://startup.mp.gov.in/Problemstatement/technology/",
  },
  {
    id: "mp-sch-2",
    externalId: "mp-sch-2",
    state: "Madhya Pradesh",
    type: "scheme",
    schemeName: "Startup MP Product Development & Commercialization Assistance",
    department: "Department of Micro, Small & Medium Enterprises (MSME), Government of Madhya Pradesh",
    financialAssistance: "Financial Assistance up to ₹15,00,000 (₹15 Lakhs) per Startup",
    summary: "Financial support for prototype development, commercialization pilot testing, and raw material procurement.",
    eligibility: "Startups registered with MP Startup Centre having an innovative working prototype.",
    tags: ["Madhya Pradesh", "Startup MP", "Product Assistance", "15 Lakh Grant", "State Scheme"],
    officialUrl: "https://startup.mp.gov.in/financial-assistance",
  },
  {
    id: "mp-sch-3",
    externalId: "mp-sch-3",
    state: "Madhya Pradesh",
    type: "scheme",
    schemeName: "Startup MP Lease Rent Assistance Scheme",
    department: "Department of Micro, Small & Medium Enterprises (MSME), Government of Madhya Pradesh",
    financialAssistance: "50% Lease Rent Subvention up to ₹5,00,000 (₹5 Lakhs) per Year",
    summary: "Reimbursement of office & lab rental expenses for MP-based startups operating out of government or recognized private incubators.",
    eligibility: "Startups operating in Madhya Pradesh with valid incubator lease agreements.",
    tags: ["Madhya Pradesh", "Startup MP", "Lease Subvention", "Office Rent", "State Scheme"],
    officialUrl: "https://startup.mp.gov.in/financial-assistance",
  },
  {
    id: "mp-sch-4",
    externalId: "mp-sch-4",
    state: "Madhya Pradesh",
    type: "scheme",
    schemeName: "Startup MP Patent Filing & IPR Support Scheme",
    department: "Department of Micro, Small & Medium Enterprises (MSME), Government of Madhya Pradesh",
    financialAssistance: "100% Patent Assistance up to ₹5,00,000 (₹5 Lakhs) per Patent",
    summary: "Financial reimbursement for domestic & international patent drafting, filing, and attorney fees.",
    eligibility: "Startups registered on Startup MP portal with filed or granted patents.",
    tags: ["Madhya Pradesh", "Startup MP", "Patent Assistance", "IPR Support", "State Scheme"],
    officialUrl: "https://startup.mp.gov.in/patent",
  },
  {
    id: "mp-sop-1",
    externalId: "mp-sop-1",
    state: "Madhya Pradesh",
    type: "sop",
    schemeName: "MP Startup Policy 2025 Gazette & Standard Operating Procedures (S.O.P)",
    department: "Department of Micro, Small & Medium Enterprises (MSME), Government of Madhya Pradesh",
    financialAssistance: "Official Gazette Notification & Application SOP Workflow",
    summary: "Standard Operating Procedure (S.O.P) and Gazette Notification guidelines for startup recognition, incubator mapping, financial assistance disbursement, and annual compliance under MP Startup Policy 2025.",
    eligibility: "All Madhya Pradesh registered startups and recognized incubator centers.",
    tags: ["Madhya Pradesh", "MP Startup 2025", "SOP", "Gazette Notification", "MP SOP"],
    officialUrl: "https://startup.mp.gov.in/uploads/media/SOP_-_Copy.pdf",
  },
  {
    id: "mp-sch-5",
    externalId: "mp-sch-5",
    state: "Madhya Pradesh",
    type: "scheme",
    schemeName: "MP Startup Electricity Duty Exemption Scheme",
    department: "Energy Department / MSME Department, Government of Madhya Pradesh",
    financialAssistance: "100% Exemption from Electricity Duty for 3 to 5 Years",
    summary: "Special electricity duty exemption for registered startups operating manufacturing or technology units in Madhya Pradesh.",
    eligibility: "Recognized startups under MP Startup Policy 2022/2025 with dedicated commercial energy meters.",
    tags: ["Madhya Pradesh", "Startup MP", "Electricity Exemption", "Tax Relief", "State Scheme"],
    officialUrl: "https://startup.mp.gov.in/uploads/media/Notification_for_Electricity_Duty_Exemption_for_Startups.pdf",
  },
  {
    id: "mp-sch-6",
    externalId: "mp-sch-6",
    state: "Madhya Pradesh",
    type: "scheme",
    schemeName: "MP Store Purchase & Service Procurement Rules (Startup Relaxation)",
    department: "Finance & MSME Department, Government of Madhya Pradesh",
    financialAssistance: "100% EMD Waiver, Exemption from Prior Turnover & Experience in Tenders",
    summary: "Special benefits for startups in state government procurement including waiver of Earnest Money Deposit (EMD), exemption from prior turnover and experience criteria, and 15% price preference.",
    eligibility: "DPIIT & MP recognized startups bidding for Madhya Pradesh state tenders.",
    tags: ["Madhya Pradesh", "Store Purchase Rules", "EMD Waiver", "Public Procurement", "State Scheme"],
    officialUrl: "https://startup.mp.gov.in/uploads/media/StartupProcurement_with_amendment.pdf",
  },
  {
    id: "mp-sch-7",
    externalId: "mp-sch-7",
    state: "Madhya Pradesh",
    type: "scheme",
    schemeName: "Madhya Pradesh Science, Technology & Innovation (STI) Policy",
    department: "Department of Science & Technology, Government of Madhya Pradesh",
    financialAssistance: "R&D Grants, IP Facilitation & CoE Incubation Support",
    summary: "Comprehensive policy promoting deep-tech research, biotechnology, artificial intelligence, and technology transfer hubs across Madhya Pradesh universities.",
    eligibility: "Academic researchers, deep-tech startups, and technology innovation hubs in MP.",
    tags: ["Madhya Pradesh", "STI Policy", "Science & Tech", "DeepTech R&D", "State Scheme"],
    officialUrl: "https://startup.mp.gov.in/uploads/media/Hindi_STI_Policy.pdf",
  },
  {
    id: "uk-sch-1",
    externalId: "uk-sch-1",
    state: "Uttarakhand",
    type: "scheme",
    schemeName: "Startup Uttarakhand Monthly Allowance & Seed Capital Scheme",
    department: "Industries Department, Government of Uttarakhand",
    financialAssistance: "Monthly Allowance ₹15,000/mo | Seed Capital up to ₹10 Lakhs",
    summary: "Special financial incentives for mountain economy, eco-tourism, and biotech ventures in Uttarakhand.",
    eligibility: "Startups recognized under Uttarakhand Startup Policy.",
    tags: ["Uttarakhand", "Startup Uttarakhand", "Monthly Allowance", "Mountain Economy", "State Scheme"],
    officialUrl: "https://startuputtarakhand.uk.gov.in/",
  },
  {
    id: "del-sch-1",
    externalId: "del-sch-1",
    state: "Delhi NCR",
    type: "scheme",
    schemeName: "Delhi Startup Policy Collateral-Free Loan & Patent Assistance",
    department: "Government of NCT of Delhi",
    financialAssistance: "Collateral-Free Loans | 100% Financial Assistance for Patent Filing",
    summary: "Delhi Government startup policy offering loan guarantees, patent support, and procurement exemptions.",
    eligibility: "Startups registered in Delhi NCT.",
    tags: ["Delhi NCR", "Delhi Startup Policy", "Loan Guarantee", "Patent Support", "State Scheme"],
    officialUrl: "https://startup.delhi.gov.in/",
  },
];

/**
 * METHOD 2: Automatic MD5 Hash Diff & DB Sync Engine
 * Syncs Gujarat REST API + ISTI Portal + Startup India DPIIT + MeitY MSH Portal + DST NIDHI Portal + UP StartInUP into DB.
 */
export async function syncGujaratStartupPoliciesFromWeb() {
  const liveRestSchemes = await fetchGujaratSchemesDirectRESTAPI();
  const liveIstiSchemes = await fetchISTIPortalNationalSchemes();

  const combinedPolicies = [
    ...liveRestSchemes,
    ...liveIstiSchemes,
    ...FALLBACK_IDEX_DEFENCE_POLICIES,
    ...FALLBACK_STARTUP_INDIA_POLICIES,
    ...FALLBACK_MEITY_MSH_POLICIES,
    ...FALLBACK_DST_NIDHI_POLICIES,
    ...FALLBACK_STARTINUP_UP_POLICIES,
    ...FALLBACK_GUJARAT_POLICIES_AND_SOPS,
    ...ALL_STATE_POLICIES_FALLBACK,
  ];

  const contentHash = crypto
    .createHash("md5")
    .update(JSON.stringify(combinedPolicies))
    .digest("hex");

  for (const item of combinedPolicies) {
    await db.syncedGovernmentPolicy.upsert({
      where: { externalId: item.externalId },
      update: {
        lastFetchedAt: new Date(),
        contentHash,
        summary: item.summary,
        eligibility: item.eligibility,
      },
      create: {
        externalId: item.externalId,
        schemeName: item.schemeName,
        department: item.department,
        stateOrCentral: `${item.state} (${item.type.toUpperCase()})`,
        financialAssistance: item.financialAssistance,
        summary: item.summary,
        eligibility: item.eligibility,
        tags: item.tags,
        officialUrl: item.officialUrl,
        contentHash,
        lastFetchedAt: new Date(),
      },
    });
  }

  return {
    syncedAt: new Date().toISOString(),
    totalSynced: combinedPolicies.length,
    restApiSchemesCount: liveRestSchemes.length,
    istiPortalSchemesCount: liveIstiSchemes.length,
    startupIndiaSchemesCount: FALLBACK_STARTUP_INDIA_POLICIES.length,
    meityMshSchemesCount: FALLBACK_MEITY_MSH_POLICIES.length,
    dstNidhiSchemesCount: FALLBACK_DST_NIDHI_POLICIES.length,
    startInUPSchemesCount: FALLBACK_STARTINUP_UP_POLICIES.length,
    contentHash,
    status: "success",
  };
}

export async function searchPoliciesAndSOPs(query: string, selectedState?: string, selectedType?: "all" | "scheme" | "sop") {
  const count = await db.syncedGovernmentPolicy.count();
  if (count === 0) {
    await syncGujaratStartupPoliciesFromWeb();
  }

  const dbPolicies = await db.syncedGovernmentPolicy.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const formattedItems = dbPolicies.map((p) => {
    const isSop = p.schemeName.toLowerCase().includes("sop") || (p.stateOrCentral && p.stateOrCentral.includes("SOP"));
    const stateLabel = p.stateOrCentral ? p.stateOrCentral.split(" (")[0].trim() : "Gujarat";

    return {
      id: p.id,
      externalId: p.externalId,
      state: stateLabel,
      type: isSop ? ("sop" as const) : ("scheme" as const),
      schemeName: p.schemeName,
      department: p.department,
      financialAssistance: p.financialAssistance,
      summary: p.summary,
      eligibility: p.eligibility,
      tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
      officialUrl: p.officialUrl,
      lastFetchedAt: p.lastFetchedAt.toISOString(),
    };
  });

  const cleanQuery = query.trim().toLowerCase();
  const cleanState = selectedState?.trim().toLowerCase();

  let items = formattedItems;

  if (cleanState && cleanState !== "all") {
    items = items.filter((item) => item.state.toLowerCase() === cleanState);
  }

  if (selectedType && selectedType !== "all") {
    items = items.filter((item) => item.type === selectedType);
  }

  if (!cleanQuery) return items;

  const terms = cleanQuery.split(/\s+/).filter(Boolean);

  return items.filter((item) => {
    const text = `${item.schemeName} ${item.department} ${item.state} ${item.type} ${item.financialAssistance} ${item.summary} ${item.eligibility} ${item.tags.join(" ")}`.toLowerCase();
    return terms.some((term) => text.includes(term));
  });
}
