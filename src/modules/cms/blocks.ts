/**
 * CMS block catalog (Milestone 2). Each block type declares:
 *  - a label (shown in the admin editor)
 *  - default data (used when adding a block)
 *  - a field descriptor list (drives the admin editor's generated inputs)
 * The renderer (block-renderer.tsx) and the admin editor both read this catalog,
 * so adding a block type is a single-place change.
 */

export type BlockType =
  | "hero"
  | "richtext"
  | "statStrip"
  | "facilities"
  | "showcaseTeaser"
  | "directorMessage"
  | "partners"
  | "faq"
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
  /** For `list` fields: the shape of each item (key→label). */
  itemFields?: { key: string; label: string; type: "text" | "textarea" | "url" }[];
};

export type BlockDef = {
  label: string;
  description: string;
  defaultData: Record<string, unknown>;
  fields: FieldDescriptor[];
};

export const BLOCK_CATALOG: Record<BlockType, BlockDef> = {
  hero: {
    label: "Hero",
    description: "Large headline, subheading, and primary call-to-action.",
    defaultData: {
      eyebrow: "STEP · IIT Kharagpur",
      heading: "Building deep-tech ventures since 1986.",
      subheading: "India's pioneering technology incubator at IIT Kharagpur.",
      ctaLabel: "Apply to the 2026 Cohort",
      ctaHref: "/apply",
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heading", label: "Heading", type: "textarea" },
      { key: "subheading", label: "Subheading", type: "textarea" },
      { key: "ctaLabel", label: "CTA label", type: "text" },
      { key: "ctaHref", label: "CTA link", type: "url" },
    ],
  },
  richtext: {
    label: "Rich text",
    description: "A titled block of prose.",
    defaultData: { title: "Section title", body: "Write your content here." },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
  },
  statStrip: {
    label: "Stat strip",
    description: "A row of headline statistics.",
    defaultData: {
      stats: [
        { value: "100+", label: "Startups incubated" },
        { value: "1986", label: "Established" },
      ],
    },
    fields: [
      {
        key: "stats",
        label: "Stats",
        type: "list",
        itemFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
    ],
  },
  facilities: {
    label: "Facilities grid",
    description: "Grid of facilities/offerings.",
    defaultData: {
      title: "Why STEP",
      items: [
        { title: "Facilities", body: "Office and lab infrastructure." },
        { title: "Mentorship", body: "Access to experienced mentors." },
        { title: "Funding", body: "Connections to government and private funding." },
      ],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "items",
        label: "Items",
        type: "list",
        itemFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Body", type: "textarea" },
        ],
      },
    ],
  },
  showcaseTeaser: {
    label: "Showcase teaser",
    description: "Featured startups strip with a link to the directory.",
    defaultData: { title: "Featured startups", ctaLabel: "View all startups", ctaHref: "/startups" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "ctaLabel", label: "CTA label", type: "text" },
      { key: "ctaHref", label: "CTA link", type: "url" },
    ],
  },
  directorMessage: {
    label: "Director's message",
    description: "Photo, quote, and attribution.",
    defaultData: {
      heading: "Director's message",
      quote: "STEP has been nurturing technology ventures for nearly four decades.",
      name: "Prof. Siddhartha Das",
      role: "Managing Director",
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
    description: "Partner / sponsor names.",
    defaultData: {
      title: "Our partners",
      items: [{ name: "DST" }, { name: "IDBI" }, { name: "IFCI" }, { name: "ICICI" }],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Partners", type: "list", itemFields: [{ key: "name", label: "Name", type: "text" }] },
    ],
  },
  faq: {
    label: "FAQ",
    description: "Question and answer list.",
    defaultData: {
      title: "Frequently asked questions",
      items: [{ q: "Who can apply?", a: "Students, faculty, staff, and external startups." }],
    },
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "items",
        label: "Questions",
        type: "list",
        itemFields: [
          { key: "q", label: "Question", type: "text" },
          { key: "a", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
  cta: {
    label: "Call to action",
    description: "A closing prompt with a button.",
    defaultData: { heading: "Ready to build?", ctaLabel: "Apply now", ctaHref: "/apply" },
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "ctaLabel", label: "CTA label", type: "text" },
      { key: "ctaHref", label: "CTA link", type: "url" },
    ],
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_CATALOG) as BlockType[];

export function defaultBlockData(type: BlockType): Record<string, unknown> {
  return structuredClone(BLOCK_CATALOG[type].defaultData);
}
