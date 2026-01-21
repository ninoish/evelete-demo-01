import { AnyFieldApi } from "@tanstack/react-form";
import { useFieldContext } from "~/components/recordForm/hooks/form";

export interface FieldProps {
  label: string;
  placeholder?: string;
  field: AnyFieldApi;
}

export function TextareaField({ label, placeholder, field }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      <textarea
        name={field.name}
        placeholder={placeholder}
        value={field.state.value || ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="py-1 px-2"
      />
    </label>
  );
}
