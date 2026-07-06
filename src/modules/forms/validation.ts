import { z } from "zod";
import {
  isVisible,
  type FormFieldDef,
  type FormSectionDef,
} from "./field-types";

/** Compile a single field into a Zod schema from its type + validation rules. */
export function fieldSchema(field: FormFieldDef): z.ZodTypeAny {
  const v = field.validation ?? {};
  let base: z.ZodTypeAny;

  switch (field.type) {
    case "NUMBER":
    case "CURRENCY": {
      let n = z.coerce.number();
      if (v.min !== undefined) n = n.min(v.min);
      if (v.max !== undefined) n = n.max(v.max);
      base = n;
      break;
    }
    case "EMAIL":
      base = z.string().email("Enter a valid email.");
      break;
    case "URL":
      base = z.string().url("Enter a valid URL.");
      break;
    case "CHECKBOX":
      base = z.coerce.boolean();
      break;
    case "MULTISELECT":
      base = z.array(z.string());
      break;
    case "DATE":
      base = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");
      break;
    default: {
      let s = z.string();
      if (v.minLength !== undefined) s = s.min(v.minLength, `Minimum ${v.minLength} characters.`);
      if (v.maxLength !== undefined) s = s.max(v.maxLength, `Maximum ${v.maxLength} characters.`);
      if (v.pattern) {
        try {
          s = s.regex(new RegExp(v.pattern), "Invalid format.");
        } catch {
          /* ignore malformed admin-entered pattern */
        }
      }
      base = s;
    }
  }

  // Optional fields accept empty/undefined.
  if (!field.required) {
    return base.optional().or(z.literal("")).or(z.undefined());
  }
  // Required: reject empty string for string-like fields.
  if (base instanceof z.ZodString) {
    return base.min(1, "This field is required.");
  }
  return base;
}

export type ValidationResult = {
  ok: boolean;
  errors: Record<string, string>; // fieldKey -> message
};

/**
 * Validate a set of values against visible fields of a template snapshot.
 * Hidden (conditional) fields are skipped. Returns per-field errors.
 */
export function validateValues(
  sections: FormSectionDef[],
  values: Record<string, unknown>,
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const section of sections) {
    for (const field of section.fields) {
      if (!isVisible(field, values)) continue;
      const schema = fieldSchema(field);
      const result = schema.safeParse(values[field.key]);
      if (!result.success) {
        errors[field.key] = result.error.issues[0]?.message ?? "Invalid value.";
      }
    }
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
