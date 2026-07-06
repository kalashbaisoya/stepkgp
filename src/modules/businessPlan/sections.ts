/**
 * Business Plan section catalog (Milestone 6 / SRS FR-F). The uploaded Word document
 * is replaced by these structured sections, filled online and rendered to a branded PDF.
 */
export const BUSINESS_PLAN_SECTIONS: { key: string; title: string; prompt: string }[] = [
  { key: "executive_summary", title: "Executive Summary", prompt: "A concise overview of your venture, the problem, and the opportunity." },
  { key: "company_description", title: "Company Description", prompt: "What your company does, its legal status, and history." },
  { key: "products", title: "Products & Services", prompt: "The products/services you offer and their value." },
  { key: "technology", title: "Technology", prompt: "The core technology, its novelty, and defensibility." },
  { key: "operations", title: "Operations", prompt: "How the business runs day to day." },
  { key: "market_analysis", title: "Market Analysis", prompt: "Market size, segments, and trends." },
  { key: "customers", title: "Customers", prompt: "Who your customers are and how you reach them." },
  { key: "competition", title: "Competition", prompt: "Competitors and your differentiation." },
  { key: "current_status", title: "Current Status", prompt: "Traction, milestones achieved, and current stage." },
  { key: "financials", title: "Financials", prompt: "Revenue, costs, and key financial figures." },
  { key: "cash_flow", title: "Cash Flow", prompt: "Cash inflows/outflows and runway." },
  { key: "funding_requirement", title: "Funding Requirement", prompt: "How much you need and how it will be used." },
  { key: "milestones", title: "Milestones", prompt: "Key milestones and timeline." },
  { key: "future_projection", title: "Future Projection", prompt: "Where you expect to be in 1–3 years." },
];
