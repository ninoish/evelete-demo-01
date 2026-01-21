// src/forms/builders.tsx
import { useAppForm } from "~/components/recordForm/hooks/form";
import {
  getPersonalRecordDefaultValues,
  getPersonalRecordSchema,
  specificRecordMap,
} from "~/components/recordForm/schemas";
import { DateField } from "~/components/recordForm/fields/DateField";
import { PlaceField } from "~/components/recordForm/fields/PlaceField";
import { FileField } from "~/components/recordForm/fields/FileField";
import { FormButtons } from "~/components/recordForm/FormButtons";
import { TimeField } from "./fields/TimeField";
import { TextareaField } from "./fields/TextareaField";
import { RecordCriteria } from "@prisma/client";
import type { RecordMaster } from "@prisma/client";
import { RecordCriteriaHeightFields } from "./recordFields/RecordCriteriaHeightFields";
import { RecordCriteriaCountLessIsBetterFields } from "./recordFields/RecordCriteriaCountLessIsBetterFields";
import { RecordCriteriaIndexFields } from "./recordFields/RecordCriteriaIndexFields";
import { RecordCriteriaDistanceFields } from "./recordFields/RecordCriteriaDistanceFields";
import { RecordCriteriaCountMoreIsBetterFields } from "./recordFields/RecordCriteriaCountMoreIsBetterFields";
import { RecordCriteriaPercentageFields } from "./recordFields/RecordCriteriaPercentageFields";
import { RecordCriteriaPointScoreFields } from "./recordFields/RecordCriteriaPointScoreFields";
import { RecordCriteriaSpeedFields } from "./recordFields/RecordCriteriaSpeedFields";
import { RecordCriteriaTimeLongerIsBetterFields } from "./recordFields/RecordCriteriaTimeLongerIsBetterFields";
import { RecordCriteriaTimeShorterIsBetterFields } from "./recordFields/RecordCriteriaTimeShorterIsBetterFields";
import { RecordCriteriaWeightFields } from "./recordFields/RecordCriteriaWeightFields";
import { useNavigate, useSubmit } from "react-router";

export function buildFormComponent(recordMaster: RecordMaster) {
  const schema = getPersonalRecordSchema(recordMaster);
  const recordDefaultValues = getPersonalRecordDefaultValues(recordMaster);

  console.log("recordDefaultValues", recordDefaultValues);

  return function FormComponent({ defaultValues }: { defaultValues: any }) {
    const submit = useSubmit();
    const navigate = useNavigate();

    const form = useAppForm({
      defaultValues: {
        ...defaultValues,
        ...recordDefaultValues,
      },
      validators: {
        onChange: ({ value }) => {
          const res = schema.safeParse(value);
          if (!res.success) {
            console.log("nono2", res);
            return res.error.flatten().fieldErrors;
          }
        },
        onSubmit: ({ value }) => {
          console.log(value);
          const res = schema.safeParse(value);
          if (!res.success) {
            console.log("nono", res);
            return res.error.flatten().fieldErrors;
          }
        },
      },
      onSubmit: async ({ value, meta }) => {
        console.log("submit value:", value, "meta:", meta);

        const formData = new FormData();

        for (const [key, val] of Object.entries(value)) {
          if (val === undefined || val === null) {
            continue;
          }

          if (Array.isArray(val)) {
            const appends: any[] = [];
            for (const item of val) {
              if (item !== undefined && item !== null) {
                if (item instanceof File) {
                  formData.append(key, item);
                } else if (typeof item === "object") {
                  appends.push(item);
                  console.log(key, " is object array", item);
                  // formData.append(key, JSON.stringify(item));
                } else {
                  appends.push(item);

                  // formData.append(key, String(item));
                }
              }
            }
            if (appends.length > 0) {
              formData.append(key, JSON.stringify(appends));
            }
          } else {
            if (val !== undefined && val !== null) {
              if ((val as any) instanceof File) {
                formData.append(key, val);
              } else if (typeof val === "object") {
                formData.append(key, JSON.stringify(val));
              } else {
                formData.append(key, String(val));
              }
            }
          }
        }

        submit(formData, {
          method: "post",
          encType: "application/x-www-form-urlencoded",
        });
      },
    });

    const renderForm = (recordMaster: RecordMaster) => {
      if (recordMaster.id in specificRecordMap) {
        const Component = specificRecordMap[recordMaster.id].component;
        return <Component form={form} />;
      }

      if (recordMaster.criteria[0] === RecordCriteria.Height) {
        return (
          <RecordCriteriaHeightFields form={form} recordMaster={recordMaster} />
        );
      }

      if (recordMaster.criteria[0] === RecordCriteria.CountLessIsBetter) {
        return (
          <RecordCriteriaCountLessIsBetterFields
            form={form}
            recordMaster={recordMaster}
          />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.CountMoreIsBetter) {
        return (
          <RecordCriteriaCountMoreIsBetterFields
            form={form}
            recordMaster={recordMaster}
          />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.Distance) {
        return (
          <RecordCriteriaDistanceFields
            form={form}
            recordMaster={recordMaster}
          />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.Index) {
        return (
          <RecordCriteriaIndexFields form={form} recordMaster={recordMaster} />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.Percentage) {
        return (
          <RecordCriteriaPercentageFields
            form={form}
            recordMaster={recordMaster}
          />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.PointScore) {
        return (
          <RecordCriteriaPointScoreFields
            form={form}
            recordMaster={recordMaster}
          />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.Speed) {
        return (
          <RecordCriteriaSpeedFields form={form} recordMaster={recordMaster} />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.TimeLongerIsBetter) {
        return (
          <RecordCriteriaTimeLongerIsBetterFields
            form={form}
            recordMaster={recordMaster}
          />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.TimeShorterIsBetter) {
        return (
          <RecordCriteriaTimeShorterIsBetterFields
            form={form}
            recordMaster={recordMaster}
          />
        );
      }
      if (recordMaster.criteria[0] === RecordCriteria.Weight) {
        return (
          <RecordCriteriaWeightFields form={form} recordMaster={recordMaster} />
        );
      }
      return <p>unknown</p>;
    };

    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FormButtons title={recordMaster.nameJa} />

          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center">
              {/* 共通フィールド */}
              <form.Field name="recordDate">
                {(f) => <DateField label="記録日" field={f} />}
              </form.Field>
              <form.Field name="recordTime">
                {(f) => <TimeField label="記録時間" field={f} />}
              </form.Field>
            </div>

            <div>
              <form.Field name="comment">
                {(f) => <TextareaField label="コメント" field={f} />}
              </form.Field>
            </div>
            <div>{renderForm(recordMaster)}</div>
            <div>
              <form.Field name="place">
                {(f) => <PlaceField label="場所" field={f} />}
              </form.Field>
            </div>
            <div>
              <form.Field name="files">
                {(f) => <FileField label="ファイル" field={f} />}
              </form.Field>
            </div>
          </div>
        </form>
      </div>
    );
  };
}
