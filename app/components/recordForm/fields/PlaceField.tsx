import { AnyFieldApi } from "@tanstack/react-form";
export interface FieldProps {
  label: string;
  field: AnyFieldApi;
}

export function PlaceField({ label, field }: FieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="text"
        name={field.name}
        value={field.state.value.name || ""}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange({ ...field.state.value, name: e.target.value })
        }
        className="py-1 px-2"
      />
    </label>
  );
}
