import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useSubmit,
} from "react-router";

import personalBodyDataModel from "~/models/personalBodyDataModel";
import { Auth } from "~/services/auth.server";
import personalBodyDataService from "~/services/personalBodyDataService.server";
import BodyDataFormSchema from "~/types/validators/BodyDataFormSchema";
import {
  createFormHook,
  createFormHookContexts,
  formOptions,
  useForm,
} from "@tanstack/react-form";
import dayjs from "dayjs";
import {
  DistanceUnit,
  PersonalActivityVisibility,
  WeightUnit,
} from "@prisma/client";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { FaUpload } from "react-icons/fa";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  // TODO: このやり方だと、前回の入力内容しか取れない。最新の数字を取ってくる
  // TODO: その上で、全部入力・更新したいわけじゃないので、ユーザーに選ばせたい (but how?)
  const latestBodyData = await personalBodyDataService.getLatestData(user.id);

  return {
    user,
    latestBodyData,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = new Auth();

  const user = await auth.isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.clone().formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log("rawData");
  console.log(rawData);

  const validationResult = BodyDataFormSchema.safeParse(rawData);
  console.log(validationResult.error);
  if (!validationResult.success) {
    return Response.json(
      { error: validationResult.error.errors, form: action },
      { status: 400 },
    );
  }

  const bodyData = await personalBodyDataModel.addBodyData({
    userId: user.id,
    data: validationResult.data,
  });

  console.log(bodyData);

  if (!bodyData || !bodyData.personalActivity?.id) {
    return Response.json(
      { error: "Failed to create the data. Please try again later." },
      { status: 400 },
    );
  }

  // TODO: Activity に飛ばすのか、身体データの変遷が見れる画面に飛ばすのか決める
  return redirect(
    "/me/body",
    // `/users/${user.slug}/activities/${bodyData.personalActivity.id}`,
  );
};

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

export default function NewPersonalBodyDataRoute() {
  const data = useLoaderData<typeof loader>();

  const { prefWeightUnit, prefDistanceUnit } = data.user;
  const { latestBodyData } = data;
  const actionData = useActionData<typeof action>() as
    | { errors?: Record<string, string[]> }
    | undefined;
  const errors = (actionData as unknown as { errors?: Record<string, string> })
    ?.errors;

  const [shouldShowDetails, setShouldShowDetails] = useState(false);
  const submit = useSubmit(); // React Router の useSubmit

  const weightUnitDisplay = useRef<string>(
    prefWeightUnit === WeightUnit.KILOGRAM ? "kg" : "lbs",
  );

  const defaultMeta = { submitAction: null as string | null };

  const form = useAppForm({
    defaultValues: {
      measurementDate: dayjs().format("YYYY-MM-DD"),
      measurementTime: dayjs().format("HH:mm"),
      description: "",
      visibility: PersonalActivityVisibility.FOLLOWERS,
      weight: latestBodyData?.weight ?? "",
      height: "",
      bodyFatPercentage: latestBodyData?.bodyFatPercentage ?? "",
      bodyFatMass: "",
      bodyAge: "",
      consumedCalories: "",
      bodyWater: "",
      proteinAmount: "",
      mineralAmount: "",
      muscleAmount: "",
      abdominalCircumference: "",
      chestCircumference: "",
      waistCircumference: "",
      hipCircumference: "",
      bodyImages: [],
      postTimeline: false,
    },
    onSubmitMeta: defaultMeta, // ここで metadata の型とデフォルト定義
    validators: {
      onChange: ({ value }) => {
        const res = BodyDataFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono2", res);
          return res.error.flatten().fieldErrors;
        }
      },
      onSubmit: ({ value }) => {
        console.log(value);
        const res = BodyDataFormSchema.safeParse(value);
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

  console.log(errors);

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
          <h1 className="text-md md:text-xl">身体データを記録する</h1>
          <div className="absolute right-1 z-10">
            <button
              type="submit"
              onClick={() => form.handleSubmit({ submitAction: "done" })}
              className="w-full md:w-auto py-2 px-4 inline-flex items-center justify-center rounded bg-blue-700 text-white"
            >
              <span>記録する</span>
            </button>
          </div>
        </div>
        <div className="p-2 lg:p-4">
          <div>
            <div className="flex flex-col">
              <div>
                <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
                  <form.Field name="measurementDate">
                    {(field) => (
                      <label className="">
                        <span className="">計測日</span>
                        <input
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="date"
                          required={true}
                          placeholder="Date"
                          className="mr-1 py-2 px-4 !text-lg"
                        />
                        <div style={{ color: "red" }}>
                          {field.state.meta.errors[0] ||
                            actionData?.errors?.["measurementDate"]?.[0]}
                        </div>
                      </label>
                    )}
                  </form.Field>

                  <form.Field name="measurementTime">
                    {(field) => (
                      <label className="">
                        <span className="">計測時間</span>
                        <input
                          type="time"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="py-2 px-4 !text-lg"
                        />
                      </label>
                    )}
                  </form.Field>
                  {/*                 
                <form.Field name="visibility">
                  {(field) => (
                    <label className="flex flex-col">
                      <span>公開範囲の設定</span>
                      <select
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="…"
                      >
                        {[
                          PersonalActivityVisibility.PUBLIC,
                          PersonalActivityVisibility.FOLLOWERS,
                          PersonalActivityVisibility.PRIVATE,
                        ].map((v) => (
                          <option key={v} value={v}>
                            {v === PersonalActivityVisibility.PUBLIC
                              ? "全体公開"
                              : v === PersonalActivityVisibility.FOLLOWERS
                                ? "フォロワー"
                                : "自分のみ"}
                          </option>
                        ))}
                      </select>
                      {field.state.meta.errors[0] && (
                        <div style={{ color: "red" }}>
                          {field.state.meta.errors[0]}
                        </div>
                      )}
                    </label>
                  )}
                </form.Field> */}
                </div>

                <div className="flex items-end gap-x-2 gap-y-2 mb-2">
                  <form.Field name="weight">
                    {(field) => (
                      <label className="flex-1 flex flex-col">
                        <span className="">体重</span>
                        <div className="inline-flex  items-center">
                          <input
                            min={1}
                            max={600}
                            step={0.1}
                            className="py-2 px-4 !font-bold !text-4xl text-right"
                            type="number"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <span className="ml-1 unit">
                            {weightUnitDisplay.current}
                          </span>
                        </div>
                      </label>
                    )}
                  </form.Field>

                  <form.Field name="bodyFatPercentage">
                    {(field) => (
                      <label className="flex-1 flex flex-col">
                        <span className="">体脂肪率</span>
                        <div className="inline-flex  items-center">
                          <input
                            min={0}
                            max={99}
                            step={0.1}
                            type="number"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="py-2 px-4 !font-bold !text-4xl text-right"
                          />
                          <span className="ml-1 unit">%</span>
                        </div>
                      </label>
                    )}
                  </form.Field>
                  {/*             
            <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
              <label className="flex flex-col">
                <span>ステータス</span>
                <select {...register("status")}>
                  {[
                    {
                      label: "公開",
                      value: PersonalActivityStatus.PUBLISHED,
                    },
                    {
                      label: "ドラフト",
                      value: PersonalActivityStatus.DRAFT,
                    },
                  ].map((o) => {
                    return (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    );
                  })}
                </select>
              </label> */}
                </div>
              </div>

              {shouldShowDetails ? (
                <div>
                  {/* 
<div className="mt-4 border-t py-4">
                  <h1 className="text-xl mb-2">詳細データ</h1>

                  <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
                    <label className="flex flex-col">
                      <span className="">体脂肪量</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("bodyFatMass")}
                          min="0"
                          max="1000000"
                          step="0.01"
                        />
                        <span className="ml-1 unit">{weightUnitDisplay}</span>
                      </div>
                    </label>

                    <label className="flex flex-col">
                      <span className="">身体年齢</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("bodyAge")}
                          min="0"
                          max="200"
                          step="1"
                        />
                        <span className="ml-1 unit">歳</span>
                      </div>
                    </label>

                    <label className="flex flex-col">
                      <span className="">基礎代謝</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("consumedCalories")}
                          min="0"
                          max="200"
                          step="1"
                        />
                        <span className="ml-1 unit">kcal</span>
                      </div>
                    </label>

                    <label className="flex flex-col">
                      <span className="">体内水分量</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("bodyWater")}
                          min="0"
                          max="200"
                          step="1"
                        />
                        <span className="ml-1 unit">ℓ</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
                    <label className="flex flex-col">
                      <span className="">タンパク質量</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("proteinAmount")}
                          min="0"
                          max="200"
                          step="1"
                        />
                        <span className="ml-1 unit">g?</span>
                      </div>
                    </label>

                    <label className="flex flex-col">
                      <span className="">ミネラル量</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("mineralAmount")}
                          min="0"
                          max="200"
                          step="1"
                        />
                        <span className="ml-1 unit">g?</span>
                      </div>
                    </label>

                    <label className="flex flex-col">
                      <span className="">筋肉量</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("muscleAmount")}
                          min="0"
                          max="200"
                          step="1"
                        />
                        <span className="ml-1 unit">{weightUnitDisplay}</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
                    <label className="flex flex-col">
                      <span className="">腹囲</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("abdominalCircumference")}
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <span className="ml-1 unit">{smallDistanceUnit}</span>
                      </div>
                    </label>

                    <label className="flex flex-col">
                      <span className="">胸囲</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("chestCircumference")}
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <span className="ml-1 unit">{smallDistanceUnit}</span>
                      </div>
                    </label>
                    <label className="flex flex-col">
                      <span className="">胴囲</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("waistCircumference")}
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <span className="ml-1 unit">{smallDistanceUnit}</span>
                      </div>
                    </label>
                    <label className="flex flex-col">
                      <span className="">腰囲（ヒップ）</span>
                      <div className="inline-flex  items-center">
                        <input
                          type="number"
                          {...register("hipCircumference")}
                          min="0"
                          max="200"
                          step="0.1"
                        />
                        <span className="ml-1 unit">{smallDistanceUnit}</span>
                      </div>
                    </label>
                  </div>
                </div> */}
                </div>
              ) : (
                <div>
                  {/* <Button onClick={() => setShouldShowDetails(true)}>
                    詳細データを記録
                  </Button> */}
                </div>
              )}

              {/* TODO: 実装 */}
              <div className="mb-2 py-4">
                <div className="p-6 border-dotted rounded border border-black flex flex-col items-center justify-center">
                  <FaUpload size={28} />
                  <p>画像・動画をアップロード</p>
                </div>
              </div>

              <div className="mb-2">
                <form.Field name="description">
                  {(field) => (
                    <label className="">
                      <span className="">コメント</span>
                      <textarea
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="py-2 px-4"
                      />
                    </label>
                  )}
                </form.Field>
              </div>

              <div className="mb-2">
                <form.Field name="postTimeline">
                  {(field) => (
                    <label className="flex gap-2">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                      <span>タイムラインに投稿する</span>
                    </label>
                  )}
                </form.Field>
              </div>
              {/* 
              <div className="mb-">
                <label className="">
                  <span className="">身体画像</span>
                  <input type="file" {...register("bodyImages")} />
                </label>
              </div>
              */}
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
