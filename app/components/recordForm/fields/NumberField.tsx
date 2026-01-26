import type { AnyFieldApi } from "@tanstack/react-form";

export interface FieldProps {
  label: string;
  field: AnyFieldApi;
}

export function NumberField({ label, field }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        name={field.name}
        value={field.state.value || ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(Number(e.target.value))}
        className="py-1 px-2"
      />
    </label>
  );
}
