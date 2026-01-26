// チームの新規作成。
// 詳細は作成後に編集から行うとして、新規作成は最低限で済ませる。
// 表示名、user id、やるスポーツ、参加方法 : 招待制 or 承認制、
// 活動エリア、競技カテゴリー
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useSubmit } from "react-router";
import { Form, useLoaderData } from "react-router";
import * as z from "zod";
import {
  createFormHook,
  createFormHookContexts,
  formOptions,
  useForm,
} from "@tanstack/react-form";
import FormDataLib from "form-data";
import axios from "axios";

import locationModel from "~/models/locationModel";
import sportModel from "~/models/sportModel";
import teamModel from "~/models/teamModel";
import { Auth } from "~/services/auth.server";
import { formBooleanSchema } from "~/utils/validator";
import { getPrisma } from "~/services/database.server";
import { UserPlaceType } from "@prisma/client";
import type { City, Sport } from "@prisma/client";
import { useEffect, useState } from "react";
import { SportSchema } from "prisma/generated/zod";

const NewTeamFormSchema = z.object({
  displayName: z.string(),
  // slug: z.string(),
  places: z
    .array(
      z.object({
        countryId: z.string().optional(),
        cityId: z.string().optional(),
        stateId: z.string().optional(),
      }),
    )
    .nonempty("At least one place is required"),
  sports: z.array(SportSchema),
  // z.array(z.string()) だと、なぜか "42" をappendすると => {"0": "4", "1", "3"} と分解されてしまうので、objectにした。
  canRequestToJoin: formBooleanSchema,
  acceptMembersAgeUnder18: formBooleanSchema,
});

export type NewTeamFormData = z.infer<typeof NewTeamFormSchema>;
export type TeamFormPlaces = NewTeamFormData["places"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const db = getPrisma();
  const homeLocation = await db.userPlace.findFirst({
    where: {
      userId: user.id,
      placeType: UserPlaceType.Living,
    },
    include: {
      place: {
        include: {
          country: true,
        },
      },
    },
  });

  if (!homeLocation?.place.countryId) {
    return redirect("/welcome/");
  }

  const ownerTeams = await teamModel.getOwnerTeamsByUserId({
    userId: user.id,
  });

  console.log("ownerTeams", ownerTeams);

  const states = await locationModel.getStateAndCitiesByCountryId({
    countryId: homeLocation.place.countryId,
  });

  const sports = await sportModel.getAll();

  return { user, sports, states, homeLocation, ownerTeams };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.clone().formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log("rawData");
  console.log(rawData);

  console.log("yoyo");
  console.log(formData.getAll("sports"));
  console.log(formData.getAll("places"));

  // object type array is sent as string. decode here.
  const sportsStrArray = formData.getAll("sports") as string[];
  const sports = sportsStrArray.map((str) => JSON.parse(str));
  const placesStrArray = formData.getAll("places") as string[];
  const places = placesStrArray.map((str) => JSON.parse(str));

  // array は fromEntries だと string にされてしまうので、getAllで配列形式で受け取る。
  const validationResult = NewTeamFormSchema.safeParse({
    ...rawData,
    sports: sports,
    places: places,
  });

  console.log(validationResult.error);

  console.log(validationResult.data);

  if (!validationResult.success) {
    return Response.json(
      { error: validationResult.error.errors, form: action },
      { status: 400 },
    );
  }

  const ownerTeams = await teamModel.getOwnerTeamsByUserId({
    userId: user.id,
  });

  if (ownerTeams?.length >= 2) {
    // TODO: Proプラン?
    return Response.json(
      { error: "1人のユーザーで2つ以上のチームは作れません" },
      { status: 400 },
    );
  }

  const createdTeam = await teamModel.createNew({
    userId: user.id,
    data: validationResult.data,
  });

  console.log(createdTeam);

  return redirect(`/teams/${createdTeam.slug}`);
};

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

export default function NewTeamFormRoute() {
  const data = useLoaderData<typeof loader>();
  const { homeLocation, sports, states, ownerTeams } = data;

  console.log("homestate", homeLocation?.place.stateId);
  console.log(sports);

  useEffect(() => {
    if (homeLocation.place.stateId) {
      updateCities(homeLocation.place.stateId);
    }
  }, [homeLocation]);

  const defaultLocationValue = {
    countryId: homeLocation?.place.countryId ?? "",
    stateId: homeLocation?.place.stateId ?? "",
    cityId: "",
  };

  const submit = useSubmit();

  const [filteringSportName, setFilteringSportName] = useState("");
  const [sportOptions, setSportOptions] = useState<Sport[]>([]);
  const [cityOptions, setCityOptions] = useState<
    { stateId: string; cities: City[] }[]
  >([]);

  const handleClickSportOption = (sport: Sport) => {
    form.setFieldValue("sports", [...form.getFieldValue("sports"), sport]);
    setFilteringSportName("");
  };

  const removeSelectedSport = (sportId: string) => {
    form.setFieldValue(
      "sports",
      form.getFieldValue("sports").filter((sp: Sport) => sp.id !== sportId),
    );
  };

  const updateCities = async (stateId: string) => {
    // TODO: fetch via api

    console.log(stateId);

    const formData = new FormDataLib();
    formData.append("countryId", homeLocation?.place.countryId);
    formData.append("stateId", stateId);
    console.log(homeLocation?.place.countryId);

    const citiesApi = await axios.post("/api/place/cities", formData);

    console.log(citiesApi.data);

    if (citiesApi.data.success) {
      setCityOptions([
        ...cityOptions,
        { stateId: stateId, cities: citiesApi.data.result },
      ]);
    }
  };

  const defaultMeta = { submitAction: null as string | null };

  const form = useAppForm<
    NewTeamFormData,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >({
    defaultValues: {
      displayName: "",
      // slug: "",
      places: [
        { ...defaultLocationValue, cityId: homeLocation.place.cityId ?? "" },
      ],
      sports: [],
      canRequestToJoin: false,
      acceptMembersAgeUnder18: false,
    },
    onSubmitMeta: defaultMeta,
    validators: {
      onChange: ({ value }) => {
        const res = NewTeamFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono2", res);
          return res.error.flatten().fieldErrors;
        }
      },
      onSubmit: ({ value }) => {
        console.log(value);
        const res = NewTeamFormSchema.safeParse(value);
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
              if (item instanceof File) {
                formData.append(key, item);
              } else if (typeof item === "object") {
                formData.append(key, JSON.stringify(item));
              } else {
                formData.append(key, String(item));
              }
            }
          }
        } else {
          if (val !== undefined && val !== null) {
            if ((val as any) instanceof File) {
              formData.append(key, val);
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

  useEffect(() => {
    const ops =
      filteringSportName.length >= 1
        ? sports.filter((sport) => {
            return (
              sport.name_ja_JP.includes(filteringSportName) ||
              sport.alias_ja_JP.includes(filteringSportName) ||
              sport.id.includes(filteringSportName)
            );
          })
        : [];

    setSportOptions(ops);
  }, [filteringSportName]);

  return (
    <div className="w-full lg:w-2/3 mx-auto py-4">
      <h1 className="text-2xl mb-2 text-center">新規チーム作成</h1>

      {ownerTeams.length >= 2 ? (
        <p className="text-red-600">
          1人のユーザーで2つ以上のチームは作れません
        </p>
      ) : null}
      <div className="px-2">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(e);
            form.handleSubmit({ submitAction: "teamSettings" });
          }}
          method="post"
        >
          <div className="flex flex-col gap-2">
            <div>
              <form.Field name="displayName">
                {(field) => (
                  <label className="">
                    <span className="">チーム名</span>
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      autoComplete="off"
                      required={true}
                      className="p-2"
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            {/* <label>
              <p>
                <span className="font-bold">チームID</span>
                <span className="text-yellow-600 ml-2">
                  ※ 一度設定すると変更できません。
                </span>
              </p>
              <div className="flex gap-1 items-center">
                <span className="text-slate-500">
                  https://evelete.com/team/
                </span>
                <input
                  type="text"
                  placeholder="team-id-abc"
                  autoComplete="off"
                  {...register("slug")}
                />
              </div>
              <p className="text-sm">
                Allowed characters: alphabet, number, hyphen(-), dot(.),
                underscores(_)
              </p>
              <p className="text-yellow-600">
                企業名、商標、または他者の権利を侵害する名前の使用を禁止しています。違反するとチームIDの自動変更やアカウントの制限や利用停止などの可能性があります。
              </p>
              <p>{errors?.slug?.message}</p>
            </label> */}

            <div>
              <h5>チームへの参加方法</h5>
              <div className="flex gap-4">
                <form.Field name="canRequestToJoin">
                  {(field) => (
                    <>
                      <label className="">
                        <input
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(false)}
                          type="radio"
                        />
                        <span className="ml-1">メンバーによる招待のみ</span>
                      </label>
                      <label className="">
                        <input
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(true)}
                          type="radio"
                        />
                        <span className="ml-1">招待 + リクエスト承認</span>
                      </label>
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </>
                  )}
                </form.Field>
              </div>
            </div>

            <div>
              <form.Field name="acceptMembersAgeUnder18">
                {(field) => (
                  <>
                    <label className="block">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                      <span className="ml-1">
                        メンバーに未成年 (18歳以下) を含む
                      </span>
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                    {/* TODO: 18歳以下のユーザーへの対応 */}
                    <p className="text-red-800">
                      未成年ユーザーの加入およびアプリ利用には保護者の同意が必要です。13歳未満はサービスを利用できません。
                    </p>
                  </>
                )}
              </form.Field>
            </div>

            <div className="my-4">
              <h4 className="font-bold">チームの活動エリア</h4>
              <form.Field name="places" mode="array">
                {(field) => {
                  return (
                    <div>
                      {field.state.value.map((_: any, i: number) => {
                        return (
                          <form.Field key={i} name={`places[${i}]`}>
                            {(subField) => {
                              return (
                                <div className="flex items-center">
                                  {/* country (disabled) */}
                                  <label className="">
                                    <select
                                      className="p-2"
                                      name={`places[${i}].countryId`}
                                      disabled={true}
                                    >
                                      <option
                                        value={subField.state.value.countryId}
                                      >
                                        {homeLocation.place.country?.name}
                                      </option>
                                    </select>
                                    <div style={{ color: "red" }}>
                                      {field.state.meta.errors[0]}
                                    </div>
                                  </label>

                                  {/* State */}
                                  <label className="">
                                    <select
                                      className="p-2"
                                      name={`places[${i}].stateId`}
                                      value={subField.state.value.stateId}
                                      onChange={(e) => {
                                        subField.handleChange({
                                          countryId:
                                            subField.state.value.countryId,
                                          stateId: e.target.value,
                                          cityId: "",
                                        });

                                        updateCities(e.target.value);
                                      }}
                                    >
                                      {states.map((state) => {
                                        return (
                                          <option
                                            key={state.id}
                                            value={state.id}
                                          >
                                            {state.name}
                                          </option>
                                        );
                                      })}
                                    </select>
                                    <div style={{ color: "red" }}>
                                      {field.state.meta.errors[0]}
                                    </div>
                                  </label>

                                  {/* City */}
                                  <label className="">
                                    <select
                                      className="p-2"
                                      name={`places[${i}].cityId`}
                                      value={subField.state.value.cityId}
                                      onChange={(e) => {
                                        subField.handleChange({
                                          countryId:
                                            subField.state.value.countryId,
                                          stateId: subField.state.value.stateId,
                                          cityId: e.target.value,
                                        });
                                      }}
                                    >
                                      {cityOptions
                                        .find(
                                          (co) =>
                                            co.stateId ===
                                            subField.state.value.stateId,
                                        )
                                        ?.cities.map((city) => {
                                          return (
                                            <option
                                              key={city.id}
                                              value={city.id}
                                            >
                                              {city.name}
                                            </option>
                                          );
                                        })}
                                    </select>
                                    <div style={{ color: "red" }}>
                                      {field.state.meta.errors[0]}
                                    </div>
                                  </label>

                                  {i > 0 ? (
                                    <button
                                      className="py-2 px-4 rounded bg-slate-400 text-white"
                                      type="button"
                                      onClick={() => {
                                        form.removeFieldValue(`places`, i);
                                      }}
                                    >
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                              );
                            }}
                          </form.Field>
                        );
                      })}
                    </div>
                  );
                }}
              </form.Field>

              <div className="mt-2">
                <button
                  className="py-2 px-4 rounded bg-slate-600 text-white"
                  type="button"
                  onClick={() =>
                    form.pushFieldValue("places", defaultLocationValue)
                  }
                >
                  エリア追加
                </button>
              </div>
            </div>

            <div className="">
              <div className="flex items-center">
                <h4 className="pr-4">
                  <span className="font-bold">行うスポーツ</span>
                  <span>({form.getFieldValue("sports").length})</span>
                </h4>
                <div className="flex-1">
                  <input
                    className="p-2"
                    type="text"
                    placeholder="スポーツの名前で検索"
                    autoComplete="off"
                    value={filteringSportName}
                    onChange={(e) => {
                      setFilteringSportName(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div>
                {/* オプション */}
                <ul className="sports-options flex gap-x-2 flex-wrap">
                  {sportOptions.map((so) => (
                    <li key={so.id}>
                      <button
                        type="button"
                        className="border rounded py-1 px-2"
                        onClick={(e) => {
                          e.preventDefault();
                          handleClickSportOption(so);
                        }}
                      >
                        <span className="mr-1">{so.emoji}</span>
                        <span>{so.name_ja_JP}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                {/* 選択済み */}
                <ul className="mt-1 flex flex-wrap gap-x-2">
                  {form
                    .getFieldValue("sports")
                    .map((sp: Sport, index: number) => (
                      <li
                        key={sp.id}
                        className="rounded bg-orange-300 flex gap-2 justify-start items-center py-1 px-2"
                      >
                        <div className="flex-1 ">
                          <span className="mr-1">{sp.emoji}</span>
                          <span>{sp.name_ja_JP}</span>
                        </div>
                        <button
                          className="py-1 px-2 rounded bg-slate-100 text-white cursor"
                          type="button"
                          onClick={() => removeSelectedSport(sp.id)}
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end items-center gap-4">
              <div>
                <button
                  className="py-2 px-4 rounded bg-green-600 text-white"
                  type="submit"
                >
                  作成
                </button>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
