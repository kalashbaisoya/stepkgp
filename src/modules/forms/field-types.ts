/**
 * Field-type catalog (Milestone 3). Declares each form field type's traits so the
 * renderer, the validation compiler, and the admin builder all agree. Adding a field
 * type is a single-place change here + a case in field-renderer.tsx.
 */

export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "EMAIL"
  | "PHONE"
  | "DATE"
  | "SELECT"
  | "MULTISELECT"
  | "RADIO"
  | "CHECKBOX"
  | "FILE"
  | "CURRENCY"
  | "URL"
  | "RICHTEXT";

export type FieldValidation = {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

export type FieldConditional = { field: string; equals: string };

export type FormFieldDef = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  helpText?: string | null;
  validation?: FieldValidation | null;
  conditional?: FieldConditional | null;
  options?: { value: string; label: string }[]; // for SELECT/MULTISELECT/RADIO
};

export type FormSectionDef = {
  id: string;
  key: string;
  title: string;
  order: number;
  fields: FormFieldDef[];
};

export type FieldTypeMeta = {
  label: string;
  hasOptions: boolean;
  valueKind: "string" | "number" | "boolean" | "string[]" | "file";
  supports: (keyof FieldValidation)[];
};

export const FIELD_TYPES: Record<FieldType, FieldTypeMeta> = {
  TEXT: { label: "Short text", hasOptions: false, valueKind: "string", supports: ["minLength", "maxLength", "pattern"] },
  TEXTAREA: { label: "Long text", hasOptions: false, valueKind: "string", supports: ["minLength", "maxLength"] },
  NUMBER: { label: "Number", hasOptions: false, valueKind: "number", supports: ["min", "max"] },
  EMAIL: { label: "Email", hasOptions: false, valueKind: "string", supports: ["maxLength"] },
  PHONE: { label: "Phone", hasOptions: false, valueKind: "string", supports: ["pattern"] },
  DATE: { label: "Date", hasOptions: false, valueKind: "string", supports: [] },
  SELECT: { label: "Dropdown", hasOptions: true, valueKind: "string", supports: [] },
  MULTISELECT: { label: "Multi-select", hasOptions: true, valueKind: "string[]", supports: [] },
  RADIO: { label: "Radio group", hasOptions: true, valueKind: "string", supports: [] },
  CHECKBOX: { label: "Checkbox", hasOptions: false, valueKind: "boolean", supports: [] },
  FILE: { label: "File upload", hasOptions: false, valueKind: "file", supports: [] },
  CURRENCY: { label: "Currency", hasOptions: false, valueKind: "number", supports: ["min", "max"] },
  URL: { label: "URL", hasOptions: false, valueKind: "string", supports: ["maxLength"] },
  RICHTEXT: { label: "Rich text", hasOptions: false, valueKind: "string", supports: ["maxLength"] },
};

export const FIELD_TYPE_KEYS = Object.keys(FIELD_TYPES) as FieldType[];

/** Whether a conditional field should be visible given current values. */
export function isVisible(field: FormFieldDef, values: Record<string, unknown>): boolean {
  if (!field.conditional) return true;
  return String(values[field.conditional.field] ?? "") === field.conditional.equals;
}
