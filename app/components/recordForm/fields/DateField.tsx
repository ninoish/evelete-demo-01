import { AnyFieldApi } from "@tanstack/react-form";

export interface FieldProps {
  label: string;
  field: AnyFieldApi;
}

export function DateField({ label, field }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="date"
        onChange={(e) => field.handleChange(e.target.value)}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        className="py-1 px-2"
      />
    </label>
  );
}
