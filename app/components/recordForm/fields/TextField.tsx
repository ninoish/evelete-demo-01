import { AnyFieldApi } from "@tanstack/react-form";
import { useFieldContext } from "~/components/recordForm/hooks/form";

export interface FieldProps {
  label: string;
  field: AnyFieldApi;
}

export function TextField({ label, field }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="text"
        name={field.name}
        value={field.state.value || ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="py-1 px-2"
      />
    </label>
  );
}
