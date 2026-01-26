import type { AnyFieldApi } from "@tanstack/react-form";

export interface FieldProps {
  label: string;
  field: AnyFieldApi;
}

export function TimeField({ label, field }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="time"
        onChange={(e) => field.handleChange(e.target.value)}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        className="py-1 px-2"
      />
    </label>
  );
}
