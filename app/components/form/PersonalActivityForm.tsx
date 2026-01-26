import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Form, useSubmit } from "react-router";

import type { PersonalActivityForm } from "~/types/personalActivity";

import { PersonalBodyDataForm } from "./PersonalBodyDataForm";
import { PersonalWorkoutForm } from "./PersonalWorkoutForm";
import PersonalActivityFormSchema from "~/types/validators/PersonalActivityFormSchema";
import { PersonalActivityStatus, PersonalActivityType } from "@prisma/client";

interface PersonalActivityFormProps {
  activity?: PersonalActivityForm;
  onSubmit: (event: Event) => void;
}

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

export function PersonalActivityForm({ activity }: PersonalActivityFormProps) {
  const now = new Date();

  const submit = useSubmit();

  const defaultMeta = { submitAction: null as string | null };

  const form = useAppForm({
    defaultValues: {
      id: activity?.id ?? "",
      name: activity?.name ?? "",
      description: activity?.description ?? "",
      activityType: activity?.activityType ?? [PersonalActivityType.WORKOUT],
      sports: activity?.sports ?? [],
      sportAttributes: activity?.sportAttributes ?? [],
      startDate: activity?.startDatetime ?? now,
      startTime: activity?.startDatetime ?? now,
      endDate: activity?.endDatetime ?? now,
      endTime: activity?.endDatetime ?? now,
      durationMinutes: activity?.durationMinutes ?? 0,
      status: activity?.status ?? PersonalActivityStatus.PUBLISHED,
      place: activity?.place ?? "",
      menus: [],
    },
    onSubmitMeta: defaultMeta, // ここで metadata の型とデフォルト定義
    validators: {
      onChange: ({ value }) => {
        const res = PersonalActivityFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono2", res);
          return res.error.flatten().fieldErrors;
        }
      },
      onSubmit: ({ value }) => {
        console.log(value);
        const res = PersonalActivityFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono", res);
          return res.error.flatten().fieldErrors;
        }
      },
    },

    onSubmit: ({ value, meta }) => {
      console.log("submit value:", value, "meta:", meta);
      const formData = new FormData();

      for (const [key, val] of Object.entries(value)) {
        if (val === undefined || val === null) continue;

        if (Array.isArray(val)) {
          for (const item of val) {
            if (item !== undefined && item !== null) {
              formData.append(key, item instanceof File ? item : String(item));
            }
          }
        } else {
          formData.append(key, val instanceof File ? val : String(val));
        }
      }

      submit(formData, {
        method: "post",
        encType: "application/x-www-form-urlencoded",
      });
    },
  });

  return (
    <Form
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-end">
        <form.Field name="startDate">
          {(field) => (
            <label className="">
              <span>活動日</span>
              <input
                type="date"
                required={true}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="開始時間"
              />
              <div style={{ color: "red" }}>{field.state.meta.errors[0]}</div>
            </label>
          )}
        </form.Field>

        <form.Field name="startTime">
          {(field) => (
            <label className="">
              <span>開始時間</span>
              <input
                type="time"
                required={true}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="開始時間"
              />
              <div style={{ color: "red" }}>{field.state.meta.errors[0]}</div>
            </label>
          )}
        </form.Field>

        <form.Field name="endTime">
          {(field) => (
            <label className="mr-8">
              <span>終了時間</span>
              <input
                type="time"
                required={true}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="終了時間"
              />
            </label>
          )}
        </form.Field>
      </div>

      <div className="flex flex-wrap items-start">
        <form.Field name="activityType">
          {(field) => (
            <label className="mr-8">
              <span>活動種別</span>
              <select
                required={true}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              >
                <option value="body">ボディデータ</option>
                <option value="workout">ワークアウト・練習</option>
                <option value="event">大会・イベント参加</option>
                <option value="other">その他</option>
              </select>
            </label>
          )}
        </form.Field>
      </div>
      {form.getFieldValue("activityType")}
      {form.getValues().activityType === "workout" ? (
        <PersonalWorkoutForm form={form} />
      ) : null}

      {form.getValues().activityType === "body" ? (
        <PersonalBodyDataForm form={form} />
      ) : null}

      {form.getValues().activityType === "event" ? <div>Event form</div> : null}

      {form.getValues().activityType === "other" ? <div>Other form</div> : null}

      <div className="flex flex-wrap items-start"></div>
    </Form>
  );
}
