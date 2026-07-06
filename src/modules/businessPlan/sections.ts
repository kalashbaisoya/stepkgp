/**
 * Business Plan section catalog (SRS FR-F). This is the DEFAULT set used to seed the
 * admin-editable `BusinessPlanSectionDef` table. At runtime the definitions come from
 * the DB (admins control required + min/max words); this array is only the seed source
 * and a fallback if the table is empty.
 */
export type BpSectionDefault = {
  key: string;
  title: string;
  prompt: string;
  required: boolean;
  minWords?: number;
  maxWords?: number;
};

export const BUSINESS_PLAN_SECTIONS: BpSectionDefault[] = [
  { key: "executive_summary", title: "Executive Summary", prompt: "A concise overview of your venture, the problem, and the opportunity.", required: true, minWords: 50, maxWords: 300 },
  { key: "company_description", title: "Company Description", prompt: "What your company does, its legal status, and history.", required: true, minWords: 30, maxWords: 300 },
  { key: "products", title: "Products & Services", prompt: "The products/services you offer and their value.", required: true, minWords: 30, maxWords: 300 },
  { key: "technology", title: "Technology", prompt: "The core technology, its novelty, and defensibility.", required: false, maxWords: 300 },
  { key: "operations", title: "Operations", prompt: "How the business runs day to day.", required: false, maxWords: 250 },
  { key: "market_analysis", title: "Market Analysis", prompt: "Market size, segments, and trends.", required: true, minWords: 30, maxWords: 300 },
  { key: "customers", title: "Customers", prompt: "Who your customers are and how you reach them.", required: false, maxWords: 250 },
  { key: "competition", title: "Competition", prompt: "Competitors and your differentiation.", required: false, maxWords: 250 },
  { key: "current_status", title: "Current Status", prompt: "Traction, milestones achieved, and current stage.", required: false, maxWords: 250 },
  { key: "financials", title: "Financials", prompt: "Revenue, costs, and key financial figures.", required: true, minWords: 20, maxWords: 300 },
  { key: "cash_flow", title: "Cash Flow", prompt: "Cash inflows/outflows and runway.", required: false, maxWords: 250 },
  { key: "funding_requirement", title: "Funding Requirement", prompt: "How much you need and how it will be used.", required: true, minWords: 20, maxWords: 250 },
  { key: "milestones", title: "Milestones", prompt: "Key milestones and timeline.", required: false, maxWords: 250 },
  { key: "future_projection", title: "Future Projection", prompt: "Where you expect to be in 1–3 years.", required: false, maxWords: 250 },
];

/** Count words in a block of text. */
export function wordCount(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
