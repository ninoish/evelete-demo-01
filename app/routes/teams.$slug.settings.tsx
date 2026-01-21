import {
  type ActionFunctionArgs,
  data,
  Form,
  Link,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useSubmit,
} from "react-router";
import { useLoaderData } from "react-router";

import {
  createFormHook,
  createFormHookContexts,
  formOptions,
  useForm,
} from "@tanstack/react-form";

import { Auth } from "~/services/auth.server";
import teamMemberService from "~/services/teamMemberService.server";
import teamService from "~/services/teamService.server";
import TeamSettingsFormSchema, {
  type TeamSettingsFormData,
} from "~/types/validators/TeamSettingsFormSchema";
import type { BiologicalGender } from "@prisma/client";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  if (!params.slug) {
    throw data({ errorMessage: "Invalid" }, { status: 400 });
  }

  const team = await teamService.getTeamBySlug(params.slug, user?.id ?? null);

  if (!team) {
    throw data({ errorMessage: "Team Not Found" }, { status: 400 });
  }

  // TODO: もう少しスマートなやり方がありそう
  const userMember = await teamService.getTeamMemberByUserId(
    params.slug,
    user.id,
  );

  if (userMember?.role) {
    throw data({ errorMessage: "Invalid" }, { status: 400 });
  }

  return { user, team, userMember };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (!params.slug) {
    return redirect("/");
  }
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.clone().formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log("rawData");
  console.log(rawData);

  // array は fromEntries だと string にされてしまうので、getAllで配列形式で受け取る。
  const validationResult = TeamSettingsFormSchema.safeParse({
    ...rawData,
    sports: formData.getAll("sports"),
    sportsAttributes: formData.getAll("sportsAttributes"),
    places: formData.getAll("places"),
  });

  console.log(validationResult.error);
  if (!validationResult.success) {
    return Response.json(
      { error: validationResult.error.errors, form: action },
      { status: 400 },
    );
  }

  console.log(params.slug);

  const team = await teamService.getTeamBySlug(params.slug, user.id);
  if (!team) {
    throw new Response(null, {
      status: 404,
      statusText: "Team Not Found",
    });
  }

  // check if use can manage team
  const meMember = await teamMemberService.getByTeamIdAndUserId(
    team.id,
    user.id,
  );

  if (!meMember || !meMember.isAdmin) {
    throw new Response(null, {
      status: 400,
      statusText: "No Permission",
    });
  }

  console.log(validationResult.data);
  try {
    const updatedTeam = await teamService.updateTeamSettings(
      user.id,
      team.id,
      validationResult.data,
    );
    return redirect(`/teams/${updatedTeam.slug}/settings`);
  } catch (error) {
    return new Response(error, {
      status: 400,
      statusText: error.message,
    });
  }
};

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

export default function EditTeamSettingsRoute() {
  const { team, user } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>() as
    | { errors?: Record<string, string[]> }
    | undefined;

  const submit = useSubmit();

  const defaultMeta = { submitAction: null as string | null };

  const form = useAppForm<
    TeamSettingsFormData,
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
      displayName: team.displayName ?? "",
      abbreviation: team.abbreviation ?? "",
      slug: team.slug ?? "",
      description: team.description ?? "",
      themeColor: team.themeColor ?? "#ffffff",
      canRequestToJoin: team.canRequestToJoin ?? true,
      canSearch: team.canSearch ?? true,
      canViewActivities: team.canViewActivities ?? true,
      canViewMembers: team.canViewMembers ?? true,
      acceptMembersAgeUnder18: team.acceptMembersAgeUnder18 ?? false,
      establishedAt: team.establishedAt?.toISOString().slice(0, 10) ?? "",
      iconImageFile: undefined,
      coverImageFile: undefined,

      minMemberSkillLevel: team.minMemberSkillLevel ?? undefined,
      maxMemberSkillLevel: team.maxMemberSkillLevel ?? undefined,
      minJoinSkillLevel: team.minJoinSkillLevel ?? undefined,
      maxJoinSkillLevel: team.maxJoinSkillLevel ?? undefined,
      minJoinAge: team.minJoinAge ?? undefined,
      maxJoinAge: team.maxJoinAge ?? undefined,
      joinPlayerGender: team.joinPlayerGender ?? [],
      teamObjective: team.teamObjective ?? undefined,
      recruitingMessage: team.recruitingMessage ?? undefined,

      places: team.places?.map((pl) => pl.placeId) ?? [],
      sports: team.sports?.map((sp) => sp.sportId) ?? [],
      sportAttributes:
        team.sportAttributes?.map((spa) => spa.sportAttributeId) ?? [],
    },
    onSubmitMeta: defaultMeta, // ここで metadata の型とデフォルト定義
    validators: {
      onChange: ({ value }) => {
        const res = TeamSettingsFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono2", res);
          return res.error.flatten().fieldErrors;
        }
      },
      onSubmit: ({ value }) => {
        console.log(value);
        const res = TeamSettingsFormSchema.safeParse(value);
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
            formData.append(key, item instanceof File ? item : String(item));
          }
        } else {
          formData.append(key, val instanceof File ? val : String(val));
        }
      }

      submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
    },
  });

  console.log(form.getAllErrors());

  return (
    <div className="p-2">
      <h1 className="text-3xl">チーム設定</h1>
      <div>
        <div>
          <Link to="">アクティビティテンプレート設定</Link>
        </div>

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
                      required={true}
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>
            <div>
              <form.Field name="abbreviation">
                {(field) => (
                  <label className="">
                    <span className="">チーム略称</span>
                    <input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      required={true}
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="slug">
                {(field) => (
                  <label className="">
                    <span className="">チームID</span>
                    <input
                      disabled={!!team.prefSlugSetupDatetime}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      required={true}
                      placeholder="evelete.com/teams/..."
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
              {team.prefSlugSetupDatetime ? (
                <div className="text-red-950">
                  すでにチームIDを変更済みのため、編集できません。
                </div>
              ) : (
                <p className="text-red-700">1度だけ変更できます。</p>
              )}
            </div>

            <div>
              <form.Field name="description">
                {(field) => (
                  <label className="">
                    <span className="">チーム説明</span>
                    <textarea
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="themeColor">
                {(field) => (
                  <label className="">
                    <span className="">チームカラー</span>
                    <input
                      type="color"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="establishedAt">
                {(field) => (
                  <label className="">
                    <span className="">チーム創設日</span>
                    <input
                      type="date"
                      name={field.name}
                      value={field.state.value.toString()}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        console.log("??", e.target.value);
                        e.target.value
                          ? field.handleChange(e.target.value)
                          : undefined;
                      }}
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="iconImageFile">
                {(field) => (
                  <label className="">
                    <span className="">アイコン画像</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.handleChange(file);
                        }
                      }}
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="coverImageFile">
                {(field) => (
                  <label className="">
                    <span className="">カバー画像</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log(file);
                          field.handleChange(file);
                        }
                      }}
                    />
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <h5>スポーツ</h5>
              <form.Field name="sports" mode="array">
                {(field) => {
                  return (
                    <div>
                      {field.state.value.map((_, i) => {
                        return (
                          <form.Field key={i} name={`sports[${i}]`}>
                            {(subField) => {
                              return (
                                <div>
                                  <label className="">
                                    <span className="">
                                      {subField.state.value}
                                    </span>
                                    <input
                                      type="checkbox"
                                      value={subField.state.value}
                                      onBlur={subField.handleBlur}
                                      onChange={(e) =>
                                        subField.handleChange(e.target.value)
                                      }
                                    />
                                    <div style={{ color: "red" }}>
                                      {field.state.meta.errors[0]}
                                    </div>
                                  </label>
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
            </div>

            <div>
              <h5>活動場所</h5>
              <form.Field name="places" mode="array">
                {(field) => {
                  return (
                    <div>
                      {field.state.value.map((_, i) => {
                        return (
                          <form.Field key={i} name={`places[${i}]`}>
                            {(subField) => {
                              return (
                                <div>
                                  <label className="">
                                    <span className="">
                                      {subField.state.value}
                                    </span>
                                    <input
                                      type="checkbox"
                                      value={subField.state.value}
                                      onBlur={subField.handleBlur}
                                      onChange={(e) =>
                                        subField.handleChange(e.target.value)
                                      }
                                    />
                                    <div style={{ color: "red" }}>
                                      {field.state.meta.errors[0]}
                                    </div>
                                  </label>
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
            </div>

            <div>
              <form.Field name="canRequestToJoin">
                {(field) => (
                  <label className="">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    <span className="">
                      外部ユーザーがチームに参加リクエストできる
                    </span>
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="canSearch">
                {(field) => (
                  <label className="">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    <span className="">検索に表示</span>
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="canViewActivities">
                {(field) => (
                  <label className="">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    <span className="">
                      外部ユーザーがチーム活動概要を閲覧可能
                    </span>
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="canViewMembers">
                {(field) => (
                  <label className="">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    <span className="">
                      外部ユーザーがチームメンバー一覧を閲覧可能
                    </span>
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="acceptMembersAgeUnder18">
                {(field) => (
                  <label className="">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.checked)}
                    />
                    <span className="">
                      18歳未満のユーザーがチームに参加することができる
                    </span>
                    <div style={{ color: "red" }}>
                      {field.state.meta.errors[0]}
                    </div>
                  </label>
                )}
              </form.Field>
            </div>

            <div>
              <h5>チームメンバーの競技レベル</h5>
              <div className="flex items-center">
                <form.Field name="minMemberSkillLevel">
                  {(field) => (
                    <label className="">
                      <input
                        placeholder="下限"
                        type="number"
                        step="1"
                        min="1"
                        max="100"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            parseInt(e.currentTarget.value, 10),
                          )
                        }
                      />
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>
                <span className="mx-2">-</span>
                <form.Field name="maxMemberSkillLevel">
                  {(field) => (
                    <label className="">
                      <input
                        placeholder="上限"
                        type="number"
                        step="1"
                        min="1"
                        max="100"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value, 10))
                        }
                      />
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>
              </div>
            </div>
          </div>
          <div>
            <h2>外部向けの公開情報</h2>

            <div>
              {/* TODO: 複数スポーツがある場合、スポーツごとに必要では？ */}
              <h5>メンバー募集する競技レベル</h5>
              <div className="flex items-center">
                <form.Field name="minJoinSkillLevel">
                  {(field) => (
                    <label className="">
                      <input
                        placeholder="下限"
                        type="number"
                        step="1"
                        min="1"
                        max="100"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value, 10))
                        }
                      />
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>
                <span className="mx-2">-</span>
                <form.Field name="maxJoinSkillLevel">
                  {(field) => (
                    <label className="">
                      <input
                        placeholder="上限"
                        type="number"
                        step="1"
                        min="1"
                        max="100"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value, 10))
                        }
                      />
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>
              </div>
            </div>

            <div>
              {/* TODO: 複数スポーツがある場合、スポーツごとに必要では？ */}
              <h5>メンバー募集する年齢</h5>
              <div className="flex items-center">
                <form.Field name="minJoinAge">
                  {(field) => (
                    <label className="">
                      <input
                        placeholder="下限"
                        type="number"
                        step="1"
                        min="1"
                        max="100"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value, 10))
                        }
                      />
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>
                <span className="mx-2">-</span>
                <form.Field name="maxJoinAge">
                  {(field) => (
                    <label className="">
                      <input
                        placeholder="上限"
                        type="number"
                        step="1"
                        min="1"
                        max="100"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseInt(e.target.value, 10))
                        }
                      />
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>
              </div>
            </div>

            <div>
              {/* TODO: 複数スポーツがある場合、スポーツごとに必要では？ */}
              <h5>メンバー募集するプレイヤーの性別 (生物学上)</h5>
              <div className="flex items-center">
                <form.Field name="joinPlayerGender">
                  {(field) => (
                    <label className="">
                      <input
                        type="checkbox"
                        name={field.name}
                        value={BiologicalGender.Female}
                        checked={field.state.value?.includes(
                          BiologicalGender.Female,
                        )}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          form.setFieldValue(
                            "joinPlayerGender",
                            checked
                              ? [
                                  ...field.state.value,
                                  value as BiologicalGender,
                                ]
                              : field.state.value.filter(
                                  (item) => item !== value,
                                ),
                          );
                        }}
                      />
                      <span>女性</span>
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>

                <form.Field name="joinPlayerGender">
                  {(field) => (
                    <label className="">
                      <input
                        type="checkbox"
                        name={field.name}
                        value={BiologicalGender.Male}
                        checked={field.state.value?.includes(
                          BiologicalGender.Male,
                        )}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const { checked, value } = e.target;
                          form.setFieldValue(
                            "joinPlayerGender",
                            checked
                              ? [
                                  ...field.state.value,
                                  value as BiologicalGender,
                                ]
                              : field.state.value.filter(
                                  (item) => item !== value,
                                ),
                          );
                        }}
                      />
                      <span>男性</span>
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <form.Field name="recruitingMessage">
                  {(field) => (
                    <label className="">
                      <span>メンバー募集に関するメッセージ</span>
                      <textarea
                        className="w-full"
                        placeholder=""
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <div style={{ color: "red" }}>
                        {field.state.meta.errors[0]}
                      </div>
                    </label>
                  )}
                </form.Field>
              </div>
            </div>
          </div>
          <div>
            <button type="submit">保存</button>
          </div>
        </Form>
      </div>
      {/* <TeamEditForm team={team} onSubmit={handleSubmit}></TeamEditForm> */}
    </div>
  );
}
