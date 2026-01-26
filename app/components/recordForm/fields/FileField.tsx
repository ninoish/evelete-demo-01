import type { AnyFieldApi } from "@tanstack/react-form";

export interface FieldProps {
  label: string;
  field: AnyFieldApi;
}

export function FileField({ label, field }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="file"
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.files?.[0])}
      />
    </label>
  );
}
