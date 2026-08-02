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
    directUrl: "https://www.missionstartupkarnataka.org/elevatekarnataka2022",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "kar-pdf-1",
    state: "Karnataka",
    category: "Policy PDF",
    title: "Karnataka Startup Policy Official Guidelines & Guidelines Booklet",
    description: "Complete policy guidelines for Bengaluru and Beyond-Bengaluru startup incentives.",
    directUrl: "https://static.investindia.gov.in/s3fs-public/2023-06/Startup_Policy_Karnataka.pdf",
    documentType: "PDF",
    isDirectDownload: true,
  },

  // --- KERALA ---
  {
    id: "ker-form-1",
    state: "Kerala",
    category: "Application Form",
    title: "Kerala KSUM Early Stage Innovation & Productisation Grant Portal",
    description: "Direct portal to submit applications for Idea Grant (₹3L), Productisation Grant (₹12L), and Scaleup Grant.",
    directUrl: "https://startupmission.kerala.gov.in/schemes/early-stage-funding",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "ker-form-2",
    state: "Kerala",
    category: "Application Form",
    title: "KSUM Unique ID & Startup Portal Registration",
    description: "Mandatory KSUM Unique ID generator and ecosystem registration.",
    directUrl: "https://startups.startupmission.in/register",
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
    directUrl: "https://msins.in/seed-support",
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
    directUrl: "https://startup.telangana.gov.in/funding-incentives/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- RAJASTHAN ---
  {
    id: "raj-form-1",
    state: "Rajasthan",
    category: "Policy PDF",
    title: "iStart Rajasthan QRate & Sustenance Allowance Process (PDF)",
    description: "Official QRate ranking and sustenance allowance process document for iStart Rajasthan.",
    directUrl: "https://istart.rajasthan.gov.in/public/ss/startup_qrate.pdf",
    documentType: "PDF",
    isDirectDownload: true,
  },

  // --- TAMIL NADU ---
  {
    id: "tn-form-1",
    state: "Tamil Nadu",
    category: "Scheme Portal",
    title: "StartupTN Official Portal (TANSEED Rounds)",
    description: "TANSEED opens in time-boxed rounds with a per-round form; this is the StartupTN portal that lists the open round.",
    directUrl: "https://www.startuptn.in/",
    documentType: "Official Portal",
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
    documentType: "Official Portal",
    isDirectDownload: false,
  },
  {
    id: "guj-form-1",
    state: "Gujarat",
    category: "Application Form",
    title: "Gujarat Startup Portal Online Recognition & Nodal Mapping Application",
    description: "Direct portal form for Gujarat startup recognition and Nodal Institute assignment.",
    directUrl: "https://startup.gujarat.gov.in/register",
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
    directUrl: "https://startinup.up.gov.in/sustenance-allowances/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },

  // --- HARYANA ---
  {
    id: "har-form-1",
    state: "Haryana",
    category: "Policy PDF",
    title: "Startup Haryana Seed Funding Scheme Document (PDF)",
    description: "Official scheme document for the ₹10 Lakhs seed grant across Category A, B, C and D blocks.",
    directUrl: "https://startupharyana.gov.in/download-secure/eyJpdiI6Ill2QWZ6dGk2UXdXWmF0QWJrbFM4ckE9PSIsInZhbHVlIjoid3VWWkJ4ZkVHWFJlZzl5bTF6NERjdG9HeGVJOFVZUHJYSWZYa3czZGJVSWwwOG9HZ09VZmczMFptOVhsMDhBVkYyQUcwYmdxZmh3a1ltaWVzcFdldVYyVkdJM0JpeFFDaWRjcmRVQXRyNE09IiwibWFjIjoiNDllZDIwNWZhMTA3MDViNDk2NjVmMTcwZjIzNWU3ZjgyZDFmZjg1YWM5ZmQxZWY5YmNjMjFiNGNmMGQ0MjYzOCIsInRhZyI6IiJ9/Seed%20Funding%20for%20Startups%20Detail",
    documentType: "PDF",
    isDirectDownload: true,
  },
  {
    id: "har-form-2",
    state: "Haryana",
    category: "Policy PDF",
    title: "Startup Haryana Lease Rental Subsidy Scheme Document (PDF)",
    description: "Official scheme document for 30% lease rent reimbursement, 45% for women founders, up to ₹5 Lakhs.",
    directUrl: "https://startupharyana.gov.in/download-secure/eyJpdiI6ImFtYzFYcDNXZjhFejFWWno1N3BaUlE9PSIsInZhbHVlIjoiUUhYTC9jQlpPWEdKeml4a01URkgyTzBYWGduQzJGdmNjVDcza2lEVlNGSUtYRTMxU1kvVzZPYWo5Zlg0bUE5eTNIaC9VRUFXN0M4NW5lYWRqeW45R0haMXUwaWlGcUY0dkNTUloraEpQM0U9IiwibWFjIjoiZGFiOGY5ZjVkZjg3OTM4MjVmMzM1ODlmYWY5MzE4ZWZhNjdhZDJmOTFhNTJkNDdkMDExZDdlMGY1YjQyZjNkNCIsInRhZyI6IiJ9/Lease%20Rental%20Subsidy%20Scheme%20Detail",
    documentType: "PDF",
    isDirectDownload: true,
  },
  {
    id: "har-form-3",
    state: "Haryana",
    category: "Policy PDF",
    title: "Startup Haryana Patent Cost Reimbursement Scheme Document (PDF)",
    description: "Official scheme document for 100% patent filing reimbursement, ₹2L domestic and ₹5L international.",
    directUrl: "https://startupharyana.gov.in/download-secure/eyJpdiI6ImJzZThZY2tDL2JQVDdLa01BUmRta3c9PSIsInZhbHVlIjoiaHdpR1RGUWJVeEVIS3BLNlJzeDUwaGpKZmFpZWFyMlVQRXAyNFhsVjZHL0pGYWt1Ti9GUU9DamkwTEM5L2d6ZC9BejA4Z24rTXNiNWxWU3RyOEd4WGo4V0dBTWt1cmxNdEtyek9lbDJoTXM9IiwibWFjIjoiN2M1MWYxZGQ4OWM4OGE4NThkOGVjNjA3NmYxNTc3Y2ExNmExMjQ4ZDIxNzMxNWUzMGYyNjJjMTEyNTU2ZTJlZiIsInRhZyI6IiJ9/Patent%20Cost%20Reimbursement%20Scheme%20Detail",
    documentType: "PDF",
    isDirectDownload: true,
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
    directUrl: "https://seedfund.startupindia.gov.in/apply-now",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "ipindia-search-1",
    state: "Central",
    category: "Application Form",
    title: "IP India Official Trademark & Patent Public Search Portal",
    description: "Direct government search engine for Indian NICE Class trademarks and patent register.",
    directUrl: "https://tmrsearch.ipindia.gov.in/tmrpublicsearch/",
    documentType: "Direct Form",
    isDirectDownload: false,
  },
  {
    id: "udyam-form-1",
    state: "Central",
    category: "Application Form",
    title: "MSME Udyam Registration Form",
    description: "Zero-cost MSME Udyam registration with Aadhaar and PAN verification, for entrepreneurs not yet registered.",
    directUrl: "https://udyam.gov.in/UdyamRegistration.aspx",
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
