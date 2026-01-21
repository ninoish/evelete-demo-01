import {
  BiologicalGender,
  Sport,
  SportAttribute,
  TeamActivityPaymentMethod,
  TeamActivityStatus,
  TeamActivityType,
  TeamGroup,
  type Prisma,
  type TeamActivity,
} from "@prisma/client";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Form,
  Link,
  useBeforeUnload,
  useBlocker,
  useSubmit,
} from "react-router";
import * as z from "zod";
import useGoogleMapsLoader from "~/hooks/useGoogleMapsLoader";
import { intSchema } from "~/utils/validator";
import SportSelect from "../input/SportSelect";
import TeamSportSelect from "../input/TeamSportSelect";
import { AdjustableRange } from "../input/AdjustableRange";

export const newTeamActivityFormSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  teamActivityType: z.enum([
    TeamActivityType.COMPETITION,
    TeamActivityType.EVENT,
    TeamActivityType.PRACTICE,
    // TeamActivityType.RECORD,
    // TeamActivityType.RESULT,
    // TeamActivityType.DROPIN,
    TeamActivityType.PRACTICAL_PRACTICE,
  ]),
  teamId: z.string(),
  groupIds: z.array(z.string()),
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string().optional(),
  endTime: z.string(),
  status: z.enum([TeamActivityStatus.PUBLIC]),
  places: z.array(z.object({ value: z.string() })),
  paymentMethod: z.enum([TeamActivityPaymentMethod.FACE_TO_FACE]).optional(),
  priceForInvited: z.string().optional(),
  priceForGuest: z.string().optional(),
  priceForMember: z.string().optional(),
  isGuestAllowed: z.coerce.boolean().optional(),
  isInvitationAllowed: z.coerce.boolean().optional(),
  maxAttendees: intSchema.optional(),
  maxGuestAttendees: intSchema.optional(),
  maxInvitationAttendees: intSchema.optional(),
  sportId: z.string(),
  sportAttributeIds: z.array(z.string()),
  dropinAgeRange: z.array(z.number()).optional(),
  dropinGender: z
    .enum([BiologicalGender.Female, BiologicalGender.Male])
    .optional(),
  shouldSaveGuestTemplate: z.coerce.boolean().optional(),
});

export type NewTeamActivityFormData = z.infer<typeof newTeamActivityFormSchema>;

interface TeamActivityFormProps {
  team?: TeamWithSports;
  teams?: TeamWithSports[];
  activity?: TeamActivity;
  mapsApiKey: string | undefined;
}

type TeamWithSports = Prisma.TeamGetPayload<{
  include: {
    groups: true;
    sports: {
      include: {
        sport: true;
      };
    };
    sportAttributes: {
      include: {
        sportAttribute: true;
      };
    };
  };
}>;

// 開催日まで余裕があればドロップインとして公開できる
const isDropinAvailableDatetime = (startDatetime?: Date) => {
  if (!startDatetime) {
    return false;
  }
  const now = new Date();
  console.log(startDatetime.getTime() - now.getTime() > 1000 * 60 * 60 * 8);
  // 8時間前
  return startDatetime.getTime() - now.getTime() > 1000 * 60 * 60 * 8;
};

export function TeamActivityForm({
  team,
  teams,
  activity, // for Edit
  mapsApiKey,
}: TeamActivityFormProps) {
  const threeDaysAhead = dayjs()
    .add(7, "days")
    .set("hour", 18)
    .set("minute", 0)
    .set("second", 0);

  console.log("teamId", team?.id);

  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
    getValues,
  } = useForm<NewTeamActivityFormData>({
    defaultValues: {
      name: "",
      description: "",
      teamId: team?.id ?? undefined,
      groupIds: [],
      teamActivityType: TeamActivityType.PRACTICE,
      startDate: threeDaysAhead.format("YYYY-MM-DD"),
      startTime: threeDaysAhead.format("HH:mm"),
      // endDate: threeDaysAhead.format("YYYY-MM-DD"),
      endTime: threeDaysAhead.add(2, "hours").format("HH:mm"),
      status: TeamActivityStatus.PUBLIC,
      places: [{ value: "" }],
      paymentMethod: undefined,
      priceForGuest: "",
      priceForMember: "",
      priceForInvited: "",
      isGuestAllowed: false,
      isInvitationAllowed: false,
      maxAttendees: undefined,
      maxGuestAttendees: undefined,
      maxInvitationAttendees: undefined,
      sportId: "",
      sportAttributeIds: [],
      dropinAgeRange: [18, 100],
      dropinGender: undefined,
    },
  });

  const [myTeamOptions, setMyTeamOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamWithSports | null>(null);
  const [sportOptions, setSportOptions] = useState<Sport[]>([]);
  const [sportAttributeOptions, setSportAttributeOptions] = useState<
    SportAttribute[] | null
  >([]);
  const [filteredSportAttributeOptions, setFilteredSportAttributeOptions] =
    useState<SportAttribute[] | null>([]);

  const [shouldOpenSportSelectInput, setShouldOpenSportSelectInput] =
    useState<Boolean>(false);

  const [groupOptions, setGroupOptions] = useState<TeamGroup[]>([]);

  const [selectedPlace, setSelectedPlace] = useState<{
    id: string;
    displayName: string;
    formattedAddress: string;
    location: {
      lat: number;
      lng: number;
    };
  } | null>(null);

  const [teamActivityType, setTeamActivityType] = useState<string>(
    TeamActivityType.PRACTICE,
  );

  console.log(errors);

  const teamId = watch("teamId");
  const isGuestAllowed = watch("isGuestAllowed");
  const isInvitationAllowed = watch("isInvitationAllowed");
  const startDate = watch("startDate");
  const startTime = watch("startTime");

  const sportId = watch("sportId");

  // 活動場所入力補助 Google Maps

  console.log(mapsApiKey);

  const isApiLoaded = useGoogleMapsLoader({
    apiKey: mapsApiKey ?? "",
    libraries: ["places"],
    version: "weekly",
  });

  const [placeService, setPlaceService] =
    useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (isApiLoaded && !placeService) {
      // Now you can safely use google.maps.importLibrary
      const loadPlacesLibrary = async () => {
        try {
          const { Place, PlacesService } = (await google.maps.importLibrary(
            "places",
          )) as google.maps.places.PlacesLibrary;
          // You can now use the Place and PlacesService classes
          console.log("Places library loaded successfully!");
          //@ts-ignore
          const placeAutocomplete =
            new google.maps.places.PlaceAutocompleteElement();

          placeAutocomplete.addEventListener("gmp-placeselect", (ev) => {
            console.log("gmp-placeselect", ev);
          });

          placeAutocomplete.addEventListener(
            "gmp-select",
            async ({ placePrediction }) => {
              const place = placePrediction.toPlace();
              await place.fetchFields({
                fields: [
                  "displayName",
                  "formattedAddress",
                  "addressComponents",
                  "location",
                ],
              });

              setSelectedPlace(place.toJSON());

              console.log(
                JSON.stringify(
                  place.toJSON(),
                  /* replacer */ null,
                  /* space */ 2,
                ),
              );
            },
          );

          document
            .getElementById("googlePlaceAutocomplete")
            ?.appendChild(placeAutocomplete);
        } catch (error) {
          console.error("Error loading Places library:", error);
        }
      };
      loadPlacesLibrary();
    }
  }, [isApiLoaded, placeService]);

  useEffect(() => {
    // チームを指定しないで決める場合もあるため。
    const selected = teamId
      ? (teams?.find((t) => t.id === teamId) ?? null)
      : null;
    setSelectedTeam(selected);

    setSportOptions(
      team
        ? team.sports?.map((teamSport) => teamSport.sport)
        : selected
          ? selected.sports?.map((teamSport) => teamSport.sport)
          : [],
    );
    setSportAttributeOptions(
      team
        ? team.sportAttributes?.map(
            (teamSportAttribute) => teamSportAttribute.sportAttribute,
          )
        : selected
          ? selected.sportAttributes?.map(
              (teamSportAttribute) => teamSportAttribute.sportAttribute,
            )
          : [],
    );

    setGroupOptions(
      team
        ? team.groups?.map((group) => group)
        : selectedTeam
          ? selectedTeam.groups?.map((group) => group)
          : [],
    );
  }, [teamId]);

  const placeFields = useFieldArray({
    control,
    name: "places",
  });

  useEffect(() => {
    console.log("sportId", sportId);
    if (!sportId) {
      return;
    }

    const fetchSportsAttributes = async () => {
      try {
        const res = await fetch(
          `/api/sport-attribute-options?sportIds=${sportId}`,
        );
        const data = await res.json();
        console.log("API result:", data);

        setFilteredSportAttributeOptions(data as SportAttribute[]);
      } catch (e) {
        console.error(e);
      }
    };

    fetchSportsAttributes();
  }, [sportId]);

  useEffect(() => {
    const options =
      teams?.map((t) => ({
        label: t.displayName,
        value: t.id,
      })) ?? [];
    setMyTeamOptions(options);
  }, [teams]);

  const [isDirty, setIsDirty] = useState(true);

  const blocker = useBlocker(isDirty);
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; // 表示される警告文はブラウザ依存
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <>
      {/* ナビゲーションブロッカー表示 */}
      {blocker.state === "blocked" && (
        <div className="fixed z-30 top-0 right-0 bottom-0 left-0 flex items-center justify-center">
          <div className="relative z-20 bg-white p-4 rounded w-11/12">
            <p>
              このページから移動すると、未保存の変更が失われます。移動してよろしいですか？
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => blocker.proceed()}
                type="button"
                className="bg-gray-800 text-white p-2 rounded"
              >
                移動する
              </button>
              <button
                onClick={() => blocker.reset()}
                type="button"
                className="bg-white p-2 border rounded"
              >
                キャンセル
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-black opacity-70 z-10"></div>
        </div>
      )}

      {/* TODO: テンプレートから選ぶ */}

      <Form
        method="POST"
        onSubmit={() => {
          if (blocker.state === "blocked") {
            blocker.proceed();
          }
        }}
      >
        <div className="flex flex-col">
          {!team ? (
            <select {...register("teamId")} className="p-2">
              {myTeamOptions.map((op) => {
                return (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                );
              })}
            </select>
          ) : (
            <input type="hidden" {...register("teamId")} />
          )}

          <div className="flex flex-col gap-2 mb-4">
            <label>
              <span className="text-red-500">*</span>
              <span>予定の種類</span>
              <select
                className="p-2"
                name="teamActivityType"
                value={teamActivityType}
                onChange={(ev) => {
                  setTeamActivityType(ev.currentTarget.value);
                }}
              >
                {[
                  {
                    label: "練習",
                    value: TeamActivityType.PRACTICE,
                  },
                  {
                    label: "大会",
                    value: TeamActivityType.COMPETITION,
                  },
                  // {
                  //   label: "ドロップイン",
                  //   value: TeamActivityType.DROPIN,
                  // },
                  {
                    label: "練習試合",
                    value: TeamActivityType.PRACTICAL_PRACTICE,
                  },
                  {
                    label: "イベント",
                    value: TeamActivityType.EVENT,
                  },
                ].map((op) => {
                  return (
                    <option value={op.value} key={op.value}>
                      {op.label}
                    </option>
                  );
                })}
              </select>
            </label>

            {/* 日時 */}
            <div className="flex flex-wrap gap-y-1 gap-x-2 items-end">
              <div className="">
                <label className="">
                  <span className="text-red-500">*</span>
                  <span className="">日付</span>
                  <input
                    type="date"
                    required={true}
                    placeholder="Start Date"
                    className="mr-1 p-2"
                    {...register("startDate")}
                  />
                </label>
              </div>
              <div className="flex flex-1 gap-x-2 items-end">
                <label className="">
                  <span className="">開始時間</span>
                  <input
                    type="time"
                    className="p-2"
                    {...register("startTime")}
                  />
                </label>
                <span className="pb-2">~</span>

                {/* <label className="">
                <span className="">終了</span>
                <input
                  type="date"
                  required={true}
                  placeholder="End Date"
                  className="mr-1"
                  {...register("endDate")}
                />
              </label> */}

                <label className="">
                  <span className="">終了時間</span>
                  <input type="time" className="p-2" {...register("endTime")} />
                </label>
              </div>
            </div>

            {/* TODO: if type === sports */}
            <div className="my-2">
              <h2 className="text-lg">スポーツ</h2>

              {/* TODO: 競技名のテキスト入力にする。チームのスポーツは、未入力(未決定)の時にだけおすすめとして表示する */}
              <ul className="flex flex-wrap gap-2">
                {sportOptions?.map((ts) => {
                  return (
                    <li key={ts.id}>
                      <label className="checkbox-container p-2 shadow rounded inline-flex items-center gap-1">
                        <span>
                          <input
                            type="radio"
                            value={ts.id}
                            {...register("sportId")}
                            className="invisible w-0 h-0"
                          />
                          {ts.emoji}
                        </span>
                        <span>{ts.name_ja_JP}</span>
                      </label>
                    </li>
                  );
                })}
                <li>
                  {/* TODO: その他スポーツを検索 */}
                  <button
                    type="button"
                    className="p-2 inline-flex items-center gap-1 bg-none outline-none"
                    onClick={() => {
                      setShouldOpenSportSelectInput(true);
                    }}
                  >
                    <span>その他</span>
                  </button>
                </li>
              </ul>
              {shouldOpenSportSelectInput ? (
                <div className="mt-2">
                  <TeamSportSelect
                    teamSportIds={sportOptions.map((sp) => sp.id)}
                    placeholder=""
                    value={getValues("sportId")}
                    {...register("sportId")}
                    buttonStyle={
                      getValues("sportId")
                        ? { border: `2px solid #535881`, fontWeight: "bold" }
                        : {}
                    }
                    onChange={(v) => {
                      if (v === null) {
                        return;
                      }
                      console.log("setvalue", v);
                      setValue("sportId", v);
                    }}
                  ></TeamSportSelect>
                </div>
              ) : null}
            </div>

            {sportId ? (
              <div className="my-2">
                <h5>スポーツの属性</h5>
                <ul className="flex">
                  {filteredSportAttributeOptions?.map((tsa) => {
                    return (
                      <li key={tsa.id}>
                        <label className="checkbox-container p-2 shadow rounded inline-flex items-center gap-1">
                          <span>
                            <input
                              type="checkbox"
                              value={tsa.id}
                              {...register("sportAttributeIds")}
                              className="invisible w-0 h-0"
                            />
                          </span>
                          <span>{tsa.name}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="my-2">
            <h4>活動場所</h4>
            {/* TODO: 過去の活動場所からサジェストする (API回避のためにも) */}
            <div>
              {!isApiLoaded && <p>Loading Google Maps API...</p>}
              <div
                id="googlePlaceAutocomplete"
                className="border rounded"
              ></div>
            </div>

            {selectedPlace ? (
              <div className="mt-1 rounded">
                <Link
                  target="_blank"
                  to={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.location.lat},${selectedPlace.location.lng}&query_place_id=${selectedPlace.id}`}
                >
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedPlace.location.lat},${selectedPlace.location.lng}&zoom=15&size=720x480&markers=color:red|${selectedPlace.location.lat},${selectedPlace.location.lng}&key=${mapsApiKey}`}
                  />
                </Link>
              </div>
            ) : null}

            <div className="mt-2">
              <h4>活動場所詳細</h4>
              <div>
                <textarea
                  className="h-64 p-2"
                  name="placeDetails"
                  placeholder="参加者に活動場所のわかりやすい情報を入力してください。
集合場所や集合時間、予約しているスペースの番号、活動場所への行き方、注意事項など"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="my-4">
            <label>
              <span>活動タイトル</span>
              <input
                type="text"
                className="p-2"
                placeholder="活動の名前 (任意)"
                {...register("name")}
              />
            </label>

            <label>
              <span>説明</span>
              <textarea
                rows={8}
                className="p-2"
                placeholder="活動内容や、1日の流れ、持ち物、注意点など"
                {...register("description")}
              />
            </label>
          </div>

          <input type="hidden" {...register("status")} />

          {/* <div className="my-2">
          <label>
            <span>ステータス</span>
            <select {...register("status")}>
              {[
                {
                  label: "公開",
                  value: TeamActivityStatus.PUBLIC,
                },
                {
                  label: "ドラフト",
                  value: TeamActivityStatus.DRAFT,
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
        </div> */}

          <div>
            <label>
              <span>参加費の支払い方法</span>
              <select className="p-2">
                <option value={TeamActivityPaymentMethod.FACE_TO_FACE}>
                  対面支払い
                </option>
              </select>
            </label>
          </div>

          <div className="my-2">
            <label>
              <span>チームメンバー参加費</span>
              <input
                type="number"
                placeholder="¥"
                step="1"
                className="p-2"
                {...register("priceForMember")}
              />
            </label>
          </div>

          <div className="my-2">
            <div>
              <label>
                <span>最大参加者</span>
                <input
                  type="number"
                  placeholder=""
                  step="1"
                  className="p-2"
                  {...register("maxAttendees")}
                  min={1}
                  max={100}
                />
              </label>
            </div>

            {teamActivityType === TeamActivityType.PRACTICE ? (
              <div className="my-2 p-2">
                <label className="flex gap-2 items-center">
                  <input
                    className="w-6 h-6"
                    type="checkbox"
                    {...register("isInvitationAllowed", {
                      setValueAs: (v) => v === true,
                    })}
                  />
                  <span>チームメンバーのつながりを練習に招待を許可</span>
                </label>
              </div>
            ) : null}

            {teamActivityType === TeamActivityType.PRACTICE &&
            isInvitationAllowed ? (
              <div className="my-4 py-4 border-t border-b">
                <h2 className="text-xl font-bold">招待されたゲスト向け設定</h2>
                <div>
                  <label>
                    <span>招待されたゲストの参加費</span>
                    <input
                      type="number"
                      placeholder="¥"
                      step="1"
                      {...register("priceForInvited")}
                    />
                  </label>
                  <p className="text-red-500">
                    招待ゲストの参加費は公開後に変更できません。
                  </p>
                </div>
                <div>
                  <label>
                    <span>最大招待参加者数</span>
                    <input
                      type="number"
                      placeholder=""
                      step="1"
                      {...register("maxInvitationAttendees")}
                      min={1}
                      max={100}
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {teamActivityType === TeamActivityType.PRACTICE ? (
              <div className="my-2 p-2">
                <label className="flex gap-2 items-center">
                  <input
                    className="w-6 h-6"
                    type="checkbox"
                    {...register("isGuestAllowed", {
                      setValueAs: (v) => v === true,
                    })}
                    disabled={
                      !isDropinAvailableDatetime(
                        startDate && startTime
                          ? new Date(startDate + " " + startTime)
                          : undefined,
                      )
                    }
                  />
                  <span className="leading-none">
                    ドロップイン{" "}
                    {isDropinAvailableDatetime(
                      startDate && startTime
                        ? new Date(startDate + " " + startTime)
                        : undefined,
                    ) ? (
                      ""
                    ) : (
                      <span className="text-xs text-red-500">
                        未来の日付のみで利用可
                      </span>
                    )}
                    <br />
                    <span className="text-xs">
                      チーム活動予定を公開し、メンバー以外のゲスト参加を許可
                    </span>
                  </span>
                </label>

                {/* TODO: ドロップインの解説モーダルを表示できるようにする */}
              </div>
            ) : null}

            {teamActivityType === TeamActivityType.PRACTICE &&
            isGuestAllowed ? (
              <div className="my-4 py-4 border-t border-b">
                <h2 className="text-xl font-bold">ドロップインゲスト設定</h2>

                <div>
                  <label>
                    <span>ドロップイン ゲスト参加費</span>
                    <input
                      type="number"
                      placeholder="¥"
                      step="1"
                      className="p-2"
                      {...register("priceForGuest")}
                    />
                  </label>
                  <p className="text-red-500">
                    ドロップイン参加費は公開後に変更できません。
                  </p>
                </div>

                <div>
                  <h4>ドロップイン ゲスト参加条件</h4>

                  <h6>性別</h6>
                  <div>
                    <label>
                      <input
                        className="w-6 h-6"
                        type="checkbox"
                        value={BiologicalGender.Male}
                        {...register("dropinGender")}
                      />
                      <span>男性</span>
                    </label>
                    <label>
                      <input
                        className="w-6 h-6"
                        type="checkbox"
                        value={BiologicalGender.Female}
                        {...register("dropinGender")}
                      />
                      <span>女性</span>
                    </label>
                  </div>

                  <label>
                    <h6>年齢</h6>

                    <Controller
                      name="dropinAgeRange"
                      control={control}
                      render={({ field }) => (
                        <AdjustableRange
                          min={18}
                          max={120}
                          step={1}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </label>

                  <label>
                    <h6>競技レベル</h6>
                  </label>
                </div>

                <div>
                  <label>
                    <span>最大ゲスト参加者数</span>
                    <input
                      type="number"
                      placeholder=""
                      step="1"
                      {...register("maxGuestAttendees")}
                      min={1}
                      max={100}
                    />
                  </label>
                </div>

                <div>
                  <label>
                    <h6>ゲスト向け注意事項</h6>
                    <textarea placeholder="ゆるさ、プレールール、施設の利用方法"></textarea>
                  </label>
                  <label>
                    <input
                      className="w-6 h-6"
                      type="checkbox"
                      value="true"
                      {...register("shouldSaveGuestTemplate")}
                    />
                    <span>ゲスト参加の内容 (条件・注意事項) を保存する</span>
                  </label>
                </div>
              </div>
            ) : null}
          </div>

          {/* TODO: チームグループ指定する Multi Select or Checkbox */}
          {/* {groupOptions?.length ? (

          <MultiSelect
            label="チームグループ"
            placeholder=""
            data={teamGroupOptions.map((tg) => {
              return {
                label: tg.name,
                value: "" + tg.id,
              };
            })}
            searchable
            {...register("teamGroups")}
          />
        ) : null}

        <pre>{errors?.teamGroups}</pre>
         */}

          <div className="mt-4 flex justify-center items-center">
            <button
              type="submit"
              className="border shadow bg-blue-600 text-white text-xl py-2 px-8 rounded"
            >
              作成
            </button>
          </div>
        </div>
      </Form>
    </>
  );
}
