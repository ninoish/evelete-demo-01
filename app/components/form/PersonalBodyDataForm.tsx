import { zodResolver } from "@hookform/resolvers/zod";
import {
  PersonalActivityVisibility,
  PersonalBodyData,
  WeightUnit,
  DistanceUnit,
} from "@prisma/client";
import dayjs from "dayjs";
import { useState } from "react";
import { Form } from "react-router";
import { useRemixForm } from "remix-hook-form";

import BodyDataFormSchema, {
  type BodyDataFormData,
} from "~/types/validators/BodyDataFormSchema";

export function PersonalBodyDataForm({
  weightUnit,
  distanceUnit,
  latestData,
}: {
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  latestData: PersonalBodyData | null;
}) {
  const weightUnitDisplay = weightUnit === WeightUnit.KILOGRAM ? "kg" : "lbs";
  const smallDistanceUnit =
    distanceUnit === DistanceUnit.METER ? "cm" : "inches";

  const [shouldShowDetails, setShouldShowDetails] = useState(false);

  const methods = useRemixForm<BodyDataFormData>({
    mode: "onSubmit",
    resolver: zodResolver(BodyDataFormSchema),
    defaultValues: {
      measurementDate: dayjs().format("YYYY-MM-DD"),
      measurementTime: dayjs().format("HH:mm"),
      description: "",
      visibility: PersonalActivityVisibility.FOLLOWERS,
      weight: undefined,
      height: undefined,
      bodyFatPercentage: undefined,
      bodyFatMass: undefined,
      bodyAge: undefined,
      consumedCalories: undefined,
      bodyWater: undefined,
      proteinAmount: undefined,
      mineralAmount: undefined,
      muscleAmount: undefined,
      abdominalCircumference: undefined,
      chestCircumference: undefined,
      waistCircumference: undefined,
      hipCircumference: undefined,
      bodyImages: [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  console.log(errors);

  return (
    <div>
      <Form onSubmit={handleSubmit} method="POST">
        <input type="hidden" name="activityType" value="workout" />
        <div className="flex flex-col">
          <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
            <label className="">
              <span className="">計測日</span>
              <input
                type="date"
                required={true}
                placeholder="Date"
                className="mr-1"
                {...register("measurementDate")}
              />
            </label>

            <label className="">
              <span className="">計測時間</span>
              <input type="time" {...register("measurementTime")} />
            </label>

            <label className="flex flex-col">
              <span>公開範囲の設定</span>
              <select {...register("visibility")}>
                {[
                  {
                    label: "全体公開",
                    value: PersonalActivityVisibility.PUBLIC,
                  },
                  {
                    label: "フォロワー",
                    value: PersonalActivityVisibility.FOLLOWERS,
                  },
                  {
                    label: "自分のみ",
                    value: PersonalActivityVisibility.PRIVATE,
                  },
                ].map((o) => {
                  return (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
            <label className="flex flex-col">
              <span className="">体重</span>
              <div className="inline-flex  items-center">
                <input type="text" {...register("weight")} />
                <span className="ml-1 unit">{weightUnitDisplay}</span>
              </div>
            </label>

            <label className="flex flex-col">
              <span className="">体脂肪率</span>
              <div className="inline-flex  items-center">
                <input type="text" {...register("bodyFatPercentage")} />
                <span className="ml-1 unit">%</span>
              </div>
            </label>
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

          <div className="mb-2">
            <label className="">
              <span className="">コメント</span>
              <textarea {...register("description")} />
            </label>
          </div>

          <div className="mb-">
            <label className="">
              <span className="">身体画像</span>
              <input type="file" {...register("bodyImages")} />
            </label>
          </div>

          {!shouldShowDetails ? (
            <div className="my-6 flex justify-center items-center">
              <button type="button" onClick={() => setShouldShowDetails(true)}>
                詳細データを記録
              </button>
            </div>
          ) : null}

          {shouldShowDetails ? (
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
                    {/* TODO: preference化 */}
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
                    {/* TODO: preference化 */}
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
                    {/* TODO: preference化 */}
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
                    {/* TODO: preference化 */}
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
                    {/* TODO: preference化 */}
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
                    {/* TODO: preference化 */}
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
                    {/* TODO: preference化 */}
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
                    {/* TODO: preference化 */}
                    <span className="ml-1 unit">{smallDistanceUnit}</span>
                  </div>
                </label>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-center">
            <button type="submit">記録</button>
          </div>
        </div>
      </Form>
    </div>
  );
}
