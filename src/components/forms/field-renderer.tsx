"use client";

import { Input, Label, FieldError } from "@/components/ui/input";
import type { FormFieldDef } from "@/modules/forms/field-types";

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: FormFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const id = `f_${field.key}`;
  const options = field.options ?? [];

  return (
    <div>
      {field.type !== "CHECKBOX" && (
        <Label htmlFor={id}>
          {field.label}
          {field.required && <span className="ml-0.5 text-status-danger">*</span>}
        </Label>
      )}

      {(() => {
        switch (field.type) {
          case "TEXTAREA":
          case "RICHTEXT":
            return (
              <textarea
                id={id}
                value={String(value ?? "")}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className="clay-field text-sm"
              />
            );
          case "SELECT":
            return (
              <select
                id={id}
                value={String(value ?? "")}
                onChange={(e) => onChange(e.target.value)}
                className="clay-field h-11 text-sm"
              >
                <option value="">Select…</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            );
          case "RADIO":
            return (
              <div className="space-y-1.5">
                {options.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={id}
                      checked={String(value ?? "") === o.value}
                      onChange={() => onChange(o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            );
          case "MULTISELECT": {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            return (
              <div className="space-y-1.5">
                {options.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={arr.includes(o.value)}
                      onChange={(e) =>
                        onChange(
                          e.target.checked ? [...arr, o.value] : arr.filter((v) => v !== o.value),
                        )
                      }
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            );
          }
          case "CHECKBOX":
            return (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
                {field.label}
                {field.required && <span className="text-status-danger">*</span>}
              </label>
            );
          case "NUMBER":
          case "CURRENCY":
            return (
              <Input id={id} type="number" value={value === undefined || value === null ? "" : String(value)} onChange={(e) => onChange(e.target.value)} />
            );
          case "DATE":
            return <Input id={id} type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
          case "FILE":
            return (
              <p className="text-sm text-muted-foreground">
                File uploads are handled in the Documents step (Milestone 5).
              </p>
            );
          default:
            return (
              <Input
                id={id}
                type={field.type === "EMAIL" ? "email" : field.type === "URL" ? "url" : field.type === "PHONE" ? "tel" : "text"}
                value={String(value ?? "")}
                onChange={(e) => onChange(e.target.value)}
              />
            );
        }
      })()}

      {field.helpText && <p className="mt-1 text-xs text-muted-foreground">{field.helpText}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}
