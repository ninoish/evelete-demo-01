import type { RecordMaster } from "@prisma/client";
import { ReactFormExtendedApi } from "@tanstack/react-form";
import { convertUnitValueToUnitDisplay } from "~/utils/unitConverter";

type CriteriaField = ReactFormExtendedApi<
  {
    recordValue: number;
  },
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

export function RecordCriteriaIndexFields({
  form,
  recordMaster,
}: {
  form: CriteriaField;
  recordMaster: RecordMaster;
}) {
  return (
    <div className="flex items-end gap-1">
      {" "}
      <form.Field name="recordValue">
        {(field) => (
          <input
            type="number"
            name={field.name}
            value={field.state.value || ""}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            step={0.01}
            min={recordMaster.minValue ?? undefined}
            max={recordMaster.maxValue ?? undefined}
          />
        )}
      </form.Field>
      <span>
        {convertUnitValueToUnitDisplay(null, null, recordMaster.unitValue)}
      </span>
    </div>
  );
}
