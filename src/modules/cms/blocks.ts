/**
 * CMS block catalog (Milestone 2, upgraded). Each block type declares a label,
 * default data, and field descriptors that drive the admin editor. The renderer
 * (block-renderer.tsx) and the admin editor both read this catalog.
 */

export type BlockType =
  | "hero"
  | "heroCarousel"
  | "statStrip"
  | "richtext"
  | "featuredStartups"
  | "testimonials"
  | "facilities"
  | "sectors"
  | "timeline"
  | "showcaseTeaser"
  | "directorMessage"
  | "partners"
  | "faq"
  | "contact"
  | "cta";

export type Block = {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  order: number;
};

export type FieldDescriptor = {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "list";
  itemFields?: { key: string; label: string; type: "text" | "textarea" | "url" }[];
};

export type BlockDef = {
  label: string;
  description: string;
  defaultData: Record<string, unknown>;
  fields: FieldDescriptor[];
};

const cta = (key: string): FieldDescriptor[] => [
  { key: `${key}Label`, label: "CTA label", type: "text" },
  { key: `${key}Href`, label: "CTA link", type: "url" },
];

export const BLOCK_CATALOG: Record<BlockType, BlockDef> = {
  heroCarousel: {
    label: "Hero carousel",
    description: "Full-bleed rotating image hero with headline, CTAs, and stats.",
    defaultData: {
      eyebrow: "Science & Technology Entrepreneurs' Park",
      heading: "Where deep-tech ventures begin.",
      subheading: "India's pioneering technology incubator at IIT Kharagpur, turning research into companies since 1986.",
      ctaLabel: "Apply to the 2026 Cohort",
      ctaHref: "/apply",
      secondaryLabel: "Explore startups",
      secondaryHref: "/startups",
      slides: [
        { src: "/images/kgp-main-building.webp", caption: "IIT Kharagpur" },
        { src: "/images/step-office.webp", caption: "STEP campus" },
        { src: "/images/gopali-tea-garden.webp", caption: "Kharagpur" },
      ],
      stats: [
        { value: "1986", label: "Established" },
        { value: "100+", label: "Startups incubated" },
        { value: "5", label: "Founding partners" },
      ],
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "textarea" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      ...cta("cta"),
      { key: "secondaryLabel", label: "Secondary label", type: "text" },
      { key: "secondaryHref", label: "Secondary link", type: "url" },
      { key: "slides", label: "Slides", type: "list", itemFields: [{ key: "src", label: "Image URL", type: "url" }, { key: "caption", label: "Caption", type: "text" }] },
      { key: "stats", label: "Stats", type: "list", itemFields: [{ key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" }] },
    ],
  },
  hero: {
    label: "Hero",
    description: "Full-width headline with CTAs and inline stats.",
    defaultData: {
      eyebrow: "STEP · IIT Kharagpur",
      heading: "Where deep-tech ventures begin.",
      subheading: "India's pioneering technology incubator at IIT Kharagpur, taking research to market since 1986.",
      ctaLabel: "Apply to the 2026 Cohort",
      ctaHref: "/apply",
      secondaryLabel: "Explore startups",
      secondaryHref: "/startups",
      stats: [
        { value: "100+", label: "Startups incubated" },
        { value: "1986", label: "Established" },
        { value: "₹100Cr+", label: "Value created" },
      ],
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "textarea" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      ...cta("cta"),
      { key: "secondaryLabel", label: "Secondary label", type: "text" },
      { key: "secondaryHref", label: "Secondary link", type: "url" },
      { key: "stats", label: "Stats", type: "list", itemFields: [{ key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" }] },
    ],
  },
  statStrip: {
    label: "Stat strip",
    description: "A row of headline statistics.",
    defaultData: { stats: [{ value: "100+", label: "Startups" }, { value: "1986", label: "Established" }] },
    fields: [{ key: "stats", label: "Stats", type: "list", itemFields: [{ key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" }] }],
  },
  richtext: {
    label: "Rich text",
    description: "A titled block of prose.",
    defaultData: { title: "Section title", body: "Write your content here." },
    fields: [{ key: "title", label: "Title", type: "text" }, { key: "body", label: "Body", type: "textarea" }],
  },
  featuredStartups: {
    label: "Featured startups",
    description: "Live grid of published startups from the directory.",
    defaultData: { title: "Featured startups", subtitle: "A few of the ventures built at STEP." },
    fields: [{ key: "title", label: "Title", type: "text" }, { key: "subtitle", label: "Subtitle", type: "text" }],
  },
  testimonials: {
    label: "Testimonials",
    description: "Founder quotes in a card grid.",
    defaultData: {
      eyebrow: "Founders",
      title: "What founders say",
      items: [{ quote: "STEP gave us the space, mentorship and credibility to get started.", name: "Founder name", role: "CEO", company: "Company" }],
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      {
        key: "items", label: "Quotes", type: "list",
        itemFields: [
          { key: "quote", label: "Quote", type: "textarea" },
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "company", label: "Company", type: "text" },
        ],
      },
    ],
  },
  facilities: {
    label: "Facilities / offerings",
    description: "Grid of facilities or what you offer.",
    defaultData: {
      title: "What STEP offers",
      subtitle: "Everything a founder needs to go from idea to market.",
      items: [
        { title: "Infrastructure", body: "Office and lab space on the IIT Kharagpur campus." },
        { title: "Mentorship", body: "Guidance from experienced founders and faculty." },
        { title: "Funding access", body: "Connections to DST and government & private funding." },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "items", label: "Items", type: "list", itemFields: [{ key: "title", label: "Title", type: "text" }, { key: "body", label: "Body", type: "textarea" }] },
    ],
  },
  sectors: {
    label: "Sectors",
    description: "Pill grid of focus sectors.",
    defaultData: { title: "Sectors we back", items: [{ name: "Deep-tech" }, { name: "Robotics" }, { name: "Life sciences" }] },
    fields: [{ key: "title", label: "Title", type: "text" }, { key: "items", label: "Sectors", type: "list", itemFields: [{ key: "name", label: "Name", type: "text" }] }],
  },
  timeline: {
    label: "Timeline",
    description: "Vertical milestone timeline.",
    defaultData: { title: "Our journey", items: [{ year: "1986", title: "STEP established", body: "" }] },
    fields: [{ key: "title", label: "Title", type: "text" }, { key: "items", label: "Milestones", type: "list", itemFields: [{ key: "year", label: "Year", type: "text" }, { key: "title", label: "Title", type: "text" }, { key: "body", label: "Detail", type: "textarea" }] }],
  },
  showcaseTeaser: {
    label: "Showcase teaser (legacy)",
    description: "Alias of Featured startups.",
    defaultData: { title: "Featured startups" },
    fields: [{ key: "title", label: "Title", type: "text" }],
  },
  directorMessage: {
    label: "Director's message",
    description: "Photo, quote, and attribution.",
    defaultData: {
      heading: "From the Managing Director",
      quote: "For nearly four decades, STEP has turned research into ventures that matter.",
      name: "Prof. Siddhartha Das",
      role: "Managing Director, STEP IIT Kharagpur",
      photoUrl: "",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "photoUrl", label: "Photo URL", type: "url" },
    ],
  },
  partners: {
    label: "Partners",
    description: "Scrolling partner / funder names.",
    defaultData: { title: "Supported by", items: [{ name: "DST" }, { name: "IDBI" }, { name: "IFCI" }, { name: "ICICI" }] },
    fields: [{ key: "title", label: "Title", type: "text" }, { key: "items", label: "Partners", type: "list", itemFields: [{ key: "name", label: "Name", type: "text" }] }],
  },
  faq: {
    label: "FAQ",
    description: "Expandable question and answer list.",
    defaultData: { title: "Frequently asked questions", items: [{ q: "Who can apply?", a: "Students, faculty, staff, and external startups." }] },
    fields: [{ key: "title", label: "Title", type: "text" }, { key: "items", label: "Questions", type: "list", itemFields: [{ key: "q", label: "Question", type: "text" }, { key: "a", label: "Answer", type: "textarea" }] }],
  },
  contact: {
    label: "Contact",
    description: "Address, phone, and email cards.",
    defaultData: { title: "Get in touch", address: "STEP, IIT Kharagpur, West Bengal 721302", phone: "+91-3222-281090", email: "info@stepiitkgp.org" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
    ],
  },
  cta: {
    label: "Call to action",
    description: "Closing gradient panel with a button.",
    defaultData: { heading: "Ready to build the future?", subheading: "Apply to the current cohort and join 100+ ventures.", ctaLabel: "Apply now", ctaHref: "/apply" },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
      ...cta("cta"),
    ],
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_CATALOG) as BlockType[];

export function defaultBlockData(type: BlockType): Record<string, unknown> {
  return structuredClone(BLOCK_CATALOG[type].defaultData);
}
