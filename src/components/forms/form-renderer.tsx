"use client";

import { FieldRenderer } from "./field-renderer";
import { isVisible, type FormSectionDef } from "@/modules/forms/field-types";

/**
 * Generic form renderer. Renders a template's sections + fields from data, evaluates
 * conditional visibility, and surfaces per-field errors. Used by the admin builder
 * preview and (Milestone 5) the application wizard steps.
 */
export function FormRenderer({
  sections,
  values,
  onChange,
  errors = {},
}: {
  sections: FormSectionDef[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="space-y-10">
      {sections
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <section key={section.id}>
            <h3 className="text-lg font-semibold tracking-tight">{section.title}</h3>
            <div className="mt-4 space-y-5">
              {section.fields
                .filter((f) => isVisible(f, values))
                .map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={values[field.key]}
                    onChange={(v) => onChange(field.key, v)}
                    error={errors[field.key]}
                  />
                ))}
            </div>
          </section>
        ))}
    </div>
  );
}
