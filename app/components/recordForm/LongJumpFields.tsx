// src/forms/LongDistanceJumpFields.tsx
import type { ReactFormExtendedApi } from "@tanstack/react-form";
import { NumberField } from "~/components/recordForm/fields/NumberField";

type JumpFormApi = ReactFormExtendedApi<
  {
    distance?: number;
    wind?: number;
  },
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export function LongJumpFields({ form }: { form: JumpFormApi }) {
  return (
    <>
      <form.Field name="distance">
        {(f) => <NumberField label="Distance (m)" field={f} />}
      </form.Field>
      <form.Field name="wind">
        {(f) => <NumberField label="Wind (m/s)" field={f} />}
      </form.Field>
    </>
  );
}
