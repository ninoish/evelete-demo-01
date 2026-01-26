import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useSubmit } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import { now, toJST } from "~/utils/datetime";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import PersonalActivityFormSchema, {
  type PersonalActivityFormValues,
} from "~/types/validators/PersonalActivityFormSchema";
import SportSelect from "~/components/input/SportSelect";
import userService from "~/services/userService.server";
import newActivityAction from "~/routeActions/new.activity.server";
import {
  PersonalActivityStatus,
  PersonalActivityType,
  PersonalActivityVisibility,
} from "@prisma/client";
import PersonalRecordFormSwitcher from "~/components/personalRecord/PersonalRecordFormSwitcher";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authed = await new Auth().isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const user = await userService.getForProfileById(authed.id);

  return { user };
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  return await newActivityAction(actionArgs);
};

const defaultMeta = { submitAction: null as string | null };

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

type WorkSet = { weight: number; reps: number; order: number };
type OneSet = {
  name: string;
  order: number;
  value: string;
  weights: number[];
  totalReps: number; // ←元の reps:number を改名
  workSets: WorkSet[]; // ←元の reps: WorkSet[] を改名
};

type PersonalRecord = {
  recordId: string;
  order: number;
  sets: OneSet[];
};

export default function NewPersonalActivityRoute() {
  const { user } = useLoaderData<typeof loader>();

  const submit = useSubmit();

  const defaultValues: PersonalActivityFormValues = {
    name: "",
    startDate: toJST(now()).format("YYYY-MM-DD"),
    startTime: toJST(now()).format("HH:mm"),
    endTime: "",
    description: "",
    sport: "",
    sportAttributes: [],
    activityType: PersonalActivityType.PRACTICE,
    files: [],
    place: undefined,
    status: PersonalActivityStatus.PUBLISHED,
    visibility: PersonalActivityVisibility.FOLLOWERS,
    personalRecords: [],
    personalResults: [],
  };

  const form = useAppForm({
    defaultValues,
    onSubmitMeta: defaultMeta,
    validators: {
      onChange: ({ value }) => {
        const res = PersonalActivityFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono2", res, value);
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
      const formData = new FormData();

      // プリミティブ or ファイル はそのまま
      const appendPrimitive = (k: string, v: any) => {
        if (v === undefined || v === null) return;
        if (v instanceof File) formData.append(k, v);
        else formData.append(k, String(v));
      };

      // ネスト配列/オブジェクトは JSON に
      const appendJSON = (k: string, v: any) => {
        if (v === undefined || v === null) return;
        formData.append(k, JSON.stringify(v));
      };

      // 既存フィールド
      appendPrimitive("name", value.name);
      appendPrimitive("startDate", value.startDate);
      appendPrimitive("startTime", value.startTime);
      appendPrimitive("endTime", value.endTime);
      appendPrimitive("description", value.description);
      appendPrimitive("sport", value.sport);
      appendJSON("sportAttributes", value.sportAttributes);
      appendPrimitive("activityType", value.activityType);
      appendJSON("files", value.files);
      if (value.place) appendJSON("place", value.place);

      // ☆重要：ネスト配列は JSON でまとめて渡す
      appendJSON("personalRecords", value.personalRecords);
      appendJSON("personalResults", value.personalResults);

      submit(formData, {
        method: "post",
        // JSON を混ぜるので multipart のほうが無難（ファイルもOK）
        encType: "multipart/form-data",
      });
    },
  });

  const handlePersonalRecordChange = () => {};

  const selectedSport = useStore(form.store, (s) => s.values.sport);
  const selectedActivityType = useStore(
    form.store,
    (s) => s.values.activityType,
  );

  return (
    <div className="w-full md:w-4/5 lg:w-2/3 mx-auto py-4">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        method="post"
      >
        <div className="relative flex justify-center items-center mb-2">
          <h1 className="text-xl">活動を記録する</h1>
          <div className="absolute right-1 z-10">
            <button
              type="submit"
              onClick={() => form.handleSubmit({ submitAction: "done" })}
            >
              記録
            </button>
          </div>
        </div>
        <div className="p-2 lg:p-4">
          <div>
            <div className="flex flex-col">
              <div>
                <div className="w-full flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
                  <form.Field name="sport">
                    {(field) => (
                      <div className="flex-1 space-y-2">
                        <label className="text-sm text-gray-700">
                          活動・スポーツ
                        </label>

                        <SportSelect
                          value={field.state.value || null}
                          onChange={(v) => field.handleChange(v || "")}
                          userSportIds={user.sports?.map((sp) => sp.sportId)}
                        />
                        {field.state.meta.errors?.length ? (
                          <p className="text-sm text-red-600">
                            {field.state.meta.errors[0]}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </form.Field>
                </div>
                <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
                  <form.Field name="startDate">
                    {(field) => (
                      <label className="">
                        <span className="">開始日</span>
                        <input
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="date"
                          required={true}
                          placeholder="Date"
                          className="mr-1 px-3 py-2 bg-white"
                        />
                        <div style={{ color: "red" }}>
                          {field.state.meta.errors[0]}
                        </div>
                      </label>
                    )}
                  </form.Field>

                  <form.Field name="startTime">
                    {(field) => (
                      <label className="">
                        <span className="">開始時間</span>
                        <input
                          type="time"
                          className="px-3 py-2 bg-white"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </label>
                    )}
                  </form.Field>

                  <form.Field name="endTime">
                    {(field) => (
                      <label className="">
                        <span className="">終了時間</span>
                        <span>{field.state.value}</span>
                        <input
                          type="time"
                          className="px-3 py-2 bg-white"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </label>
                    )}
                  </form.Field>
                </div>

                {selectedSport && (
                  <div className="flex items-end gap-x-4 gap-y-2 mb-2">
                    <form.Field name="activityType">
                      {(field) => (
                        <label className="flex-1">
                          <span className="">活動の種類</span>
                          <select
                            className="px-3 py-2 bg-white"
                            required={true}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          >
                            {/* TODO: スポーツごとの呼称や表示/非表示を反映 */}
                            {/* 個人Activity記録で使える Activity Type */}
                            <option value={PersonalActivityType.PRACTICE}>
                              練習
                            </option>
                            <option
                              value={PersonalActivityType.PRACTICAL_PRACTICE}
                            >
                              ラウンド・練習試合
                            </option>
                            <option value={PersonalActivityType.COMPETITION}>
                              大会
                            </option>
                            {/* TODO: これの扱い？ */}
                            <option value={PersonalActivityType.WORKOUT}>
                              ワークアウト・筋トレ
                            </option>
                            <option value={PersonalActivityType.RECORD_TRIAL}>
                              記録会
                            </option>
                            <option value={PersonalActivityType.REHAB}>
                              リハビリ
                            </option>
                            <option value={PersonalActivityType.ENJOY}>
                              エンジョイ
                            </option>
                          </select>
                          <div style={{ color: "red" }}>
                            {field.state.meta.errors[0]}
                          </div>
                        </label>
                      )}
                    </form.Field>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center gap-x-4 gap-y-2 mb-2">
                  <PersonalRecordFormSwitcher
                    form={form}
                    sportId={selectedSport}
                    activityType={selectedActivityType}
                    onChange={async () => {
                      const prs = form.getFieldValue("personalRecords");
                      const description = form.getFieldValue("description");

                      console.log(prs, description);
                      // ここで Cloudflare R2 / Images などにアップロードし、URL を返す
                      //  return files.map((f) => ({ url: await uploadAndGetUrl(f), name: f.name }));
                      return [];
                    }}
                  />
                </div>

                {/* 競技ごとの記録 (records) */}
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
