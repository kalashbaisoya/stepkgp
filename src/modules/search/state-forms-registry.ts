export type StateFormOrPDF = {
  id: string;
  state: string;
  category: "Policy PDF" | "Application Form" | "Gazette Notification" | "SOP Document" | "Scheme Portal";
  title: string;
  description: string;
  directUrl: string;
  documentType: "PDF" | "Direct Form" | "Official Portal";
  isDirectDownload: boolean;
};

export const ALL_STATE_DIRECT_FORMS_AND_PDFS: StateFormOrPDF[] = [
  // --- MADHYA PRADESH ---
  {
    id: "mp-pdf-1",
    state: "Madhya Pradesh",
    category: "SOP Document",
    title: "MP Startup Policy 2025 Standard Operating Procedures (S.O.P)",
    description: "Official Gazette & S.O.P application scrutiny, nodal mapping, and disbursement guidelines.",
    directUrl: "https://startup.mp.gov.in/uploads/media/SOP_-_Copy.pdf",
    documentType: "PDF",
    isDirectDownload: true,
  },
  {
    id: "mp-pdf-2",
    state: "Madhya Pradesh",
    category: "Gazette Notification",
    title: "MP Startup Policy 2025 Official Gazette Notification",
    description: "Gazette notification for MP Startup Policy 2025 enacted by Department of MSME.",
    directUrl: "https://startup.mp.gov.in/uploads/media/Gazette_Startup_Policy_2025.pdf",
    documentType: "PDF",
    isDirectDownload: true,
  },
  {
    id: "mp-form-1",
    state: "Madhya Pradesh",
    category: "Application Form",
    title: "MP State & Department Innovation Challenge Application Portal",
    description: "Direct application form for ₹1 Crore Innovation Challenge grants.",
    directUrl: "https://startup.mp.gov.in/Problemstatement/technology/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "mp-form-2",
    state: "Madhya Pradesh",
    category: "Application Form",
    title: "MP Financial Assistance & ₹15L Product Development Application",
    description: "Direct form submission for product assistance, lease subvention, and seed grants.",
    directUrl: "https://startup.mp.gov.in/financial-assistance",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "mp-pdf-3",
    state: "Madhya Pradesh",
    category: "Policy PDF",
    title: "MP Electricity Duty Exemption Rules Notification",
    description: "Official notification for 100% electricity duty exemption for startups.",
    directUrl: "https://startup.mp.gov.in/uploads/media/Notification_for_Electricity_Duty_Exemption_for_Startups.pdf",
    documentType: "PDF",
    isDirectDownload: true,
  },
  {
    id: "mp-pdf-4",
    state: "Madhya Pradesh",
    category: "Policy PDF",
    title: "MP Store Purchase & Service Procurement Rules (100% EMD Waiver)",
    description: "Official procurement rules granting EMD waiver and price preference in MP tenders.",
    directUrl: "https://startup.mp.gov.in/uploads/media/StartupProcurement_with_amendment.pdf",
    documentType: "PDF",
    isDirectDownload: true,
  },

  // --- KARNATAKA ---
  {
    id: "kar-form-1",
    state: "Karnataka",
    category: "Application Form",
    title: "Karnataka ELEVATE 2026 Idea2POC Grant Application Portal",
    description: "Direct application form for ELEVATE (General, Shakti, Unnati, Aspire) up to ₹50 Lakhs grant.",
    directUrl: "https://www.elevatekarnataka.karnataka.gov.in",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "kar-pdf-1",
    state: "Karnataka",
    category: "Policy PDF",
    title: "Karnataka Startup Policy Official Guidelines & Guidelines Booklet",
    description: "Complete policy guidelines for Bengaluru and Beyond-Bengaluru startup incentives.",
    directUrl: "https://startup.karnataka.gov.in/",
    documentType: "Official Portal",
    isDirectDownload: false,
  },

  // --- KERALA ---
  {
    id: "ker-form-1",
    state: "Kerala",
    category: "Application Form",
    title: "Kerala KSUM Early Stage Innovation & Productisation Grant Portal",
    description: "Direct portal to submit applications for Idea Grant (₹3L), Productisation Grant (₹12L), and Scaleup Grant.",
    directUrl: "https://startupmission.kerala.gov.in/schemes",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "ker-form-2",
    state: "Kerala",
    category: "Application Form",
    title: "KSUM Unique ID & Startup Portal Registration",
    description: "Mandatory KSUM Unique ID generator and ecosystem registration.",
    directUrl: "https://startupmission.kerala.gov.in/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- MAHARASHTRA ---
  {
    id: "mah-form-1",
    state: "Maharashtra",
    category: "Application Form",
    title: "MSINS Maharashtra Seed Support & Patent Reimbursement Portal",
    description: "Direct application for ₹10 Lakhs seed support and 100% patent drafting fee reimbursement.",
    directUrl: "https://msins.in/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- TELANGANA ---
  {
    id: "ts-form-1",
    state: "Telangana",
    category: "Application Form",
    title: "Telangana T-Fund Seed Capital Application Portal",
    description: "Direct T-Hub seed fund portal for early-stage deeptech and hardware startups.",
    directUrl: "https://t-hub.co/t-fund/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- RAJASTHAN ---
  {
    id: "raj-form-1",
    state: "Rajasthan",
    category: "Application Form",
    title: "iStart Rajasthan Sustenance Allowance & QRate Ranking Application",
    description: "Direct application form for ₹20,000/month sustenance allowance and QRate incubation.",
    directUrl: "https://istart.rajasthan.gov.in/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- TAMIL NADU ---
  {
    id: "tn-form-1",
    state: "Tamil Nadu",
    category: "Application Form",
    title: "StartupTN TANSEED Innovation Grant Application Form",
    description: "Direct submission form for TANSEED ₹10 Lakhs innovation grant-in-aid.",
    directUrl: "https://startuptn.in/tanseed",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- GUJARAT ---
  {
    id: "guj-pdf-1",
    state: "Gujarat",
    category: "SOP Document",
    title: "Gujarat Startup Policy Standard Operating Procedure (SOP 1-5) Document",
    description: "Official SOP guidelines for Nodal Institute mapping, DBT sustenance allowance, and prototype grant scrutiny.",
    directUrl: "https://startup.gujarat.gov.in/policy/standard-operating-procedure",
    documentType: "PDF",
    isDirectDownload: true,
  },
  {
    id: "guj-form-1",
    state: "Gujarat",
    category: "Application Form",
    title: "Gujarat Startup Portal Online Recognition & Nodal Mapping Application",
    description: "Direct portal form for Gujarat startup recognition and Nodal Institute assignment.",
    directUrl: "https://startup.gujarat.gov.in/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- UTTAR PRADESH ---
  {
    id: "up-form-1",
    state: "Uttar Pradesh",
    category: "Application Form",
    title: "StartInUP Sustenance Allowance & Seed Capital Application Portal",
    description: "Direct submission for UP ₹17,500/month sustenance grant and ₹5 Lakhs seed capital.",
    directUrl: "https://startinup.up.gov.in/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- HARYANA ---
  {
    id: "har-form-1",
    state: "Haryana",
    category: "Application Form",
    title: "Startup Haryana ₹10 Lakhs Seed Grant Application Portal",
    description: "Direct Invest Haryana submission portal for ₹10 Lakhs seed grant across Category A, B, C, and D blocks.",
    directUrl: "https://investharyana.in/#/startupPolicies/withoutlogin",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "har-form-2",
    state: "Haryana",
    category: "Application Form",
    title: "Startup Haryana Lease Rental Subsidy (30%-45%) Application Portal",
    description: "Direct form portal for 30% lease rent reimbursement (45% for women founders) up to ₹5 Lakhs.",
    directUrl: "https://investharyana.in/#/startupPolicies/withoutlogin",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "har-form-3",
    state: "Haryana",
    category: "Application Form",
    title: "Startup Haryana Patent & Net SGST Reimbursement Portal",
    description: "Direct form portal for 100% patent filing reimbursement (₹2L domestic / ₹5L intl) and Net SGST subvention.",
    directUrl: "https://investharyana.in/#/startupPolicies/withoutlogin",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "har-pdf-1",
    state: "Haryana",
    category: "Policy PDF",
    title: "Startup Haryana Fiscal Benefits & Incentives Official Guidelines",
    description: "Official Haryana State Startup Policy fiscal benefits and eligibility documentation.",
    directUrl: "https://startupharyana.gov.in/pages/fiscal-benefits",
    documentType: "Official Portal",
    isDirectDownload: false,
  },

  // --- MINISTRY OF DEFENCE & CENTRAL ---
  {
    id: "idex-form-1",
    state: "Central",
    category: "Application Form",
    title: "iDEX Defence India Startup Challenge (DISC 14) Portal",
    description: "Direct application form for Armed Forces defence challenges, ADITI ₹25Cr scheme, and SPARK ₹1.5Cr grants.",
    directUrl: "https://idex.gov.in/challenges",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "startupindia-form-1",
    state: "Central",
    category: "Application Form",
    title: "Startup India Seed Fund Scheme (SISFS) Direct Portal",
    description: "Direct application portal for SISFS seed grants up to ₹20 Lakhs and debt funding up to ₹50 Lakhs.",
    directUrl: "https://seedfund.startupindia.gov.in",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "ipindia-search-1",
    state: "Central",
    category: "Application Form",
    title: "IP India Official Trademark & Patent Public Search Portal",
    description: "Direct government search engine for Indian NICE Class trademarks and patent register.",
    directUrl: "https://ipindiaservices.gov.in/tmrpublicsearch/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "udyam-form-1",
    state: "Central",
    category: "Application Form",
    title: "MSME Udyam Direct Registration Portal",
    description: "Zero-cost instant MSME Udyam registration portal with Aadhaar & PAN verification.",
    directUrl: "https://udyamregistration.gov.in/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
];

/**
 * Returns direct policy PDFs and application form links for a target state
 */
export function getDirectFormsAndPDFsForState(selectedState?: string) {
  if (!selectedState || selectedState.toLowerCase() === "all") {
    return ALL_STATE_DIRECT_FORMS_AND_PDFS;
  }

  const cleanState = selectedState.trim().toLowerCase();
  return ALL_STATE_DIRECT_FORMS_AND_PDFS.filter(
    (item) => item.state.toLowerCase().includes(cleanState) || cleanState.includes(item.state.toLowerCase())
  );
}
