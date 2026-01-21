// ユーザーの関心
import type { Sport, SportAttribute } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  redirect,
} from "react-router";
import * as z from "zod";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";

import sportAttributeService from "~/services/sportAttributeService.server";
import userModel from "~/models/userModel";
import { Auth } from "~/services/auth.server";
import userService from "~/services/userService.server";

const WelcomeSportAttributesSchema = z.object({
  prefSportAttributeIds: z.array(z.string()),
});

type FormValues = z.infer<typeof WelcomeSportAttributesSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const u = await new Auth().isAuthenticated(request);
  if (!u) {
    return redirect("/login");
  }

  const user = await userService.getDetailsById(u.id);

  const userSportIds = user.sports.map((s) => s.sportId);

  const sportAttributes =
    await sportAttributeService.getSportAttributeOptions(userSportIds);

  console.log(userSportIds);
  console.log(sportAttributes);

  return { user, sportAttributes };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = new Auth();

  const authed = await auth.isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const formData = await request.clone().formData();

  const prefSportAttrIdsRaw = formData.getAll("prefSportAttributeIds");
  console.log(prefSportAttrIdsRaw);

  const validationResult = WelcomeSportAttributesSchema.safeParse({
    prefSportAttributeIds: prefSportAttrIdsRaw,
  });
  console.log(validationResult);

  if (!validationResult.success) {
    console.log(validationResult.error);

    return Response.json(
      { error: validationResult.error.errors },
      { status: 400 },
    );
  }

  const { prefSportAttributeIds } = validationResult.data;

  const updateResult = await userModel.updateSportAttributePreference({
    userId: authed.id,
    sportAttributeIds: prefSportAttributeIds,
  });

  if (updateResult?.error) {
    return Response.json(
      { errors: updateResult.error },
      {
        status: 400,
      },
    );
  }

  return redirect("/welcome/measurement");
};

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

const formDefaultValues: FormValues = {
  prefSportAttributeIds: [],
};

const WelcomeSportAttributePage = () => {
  const { user, sportAttributes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const formattedAttributes = sportAttributes.reduce(
    (sum, sa) => {
      let target = sum.find((sport) => sport.id === sa.sportId);
      if (!target) {
        target = {
          ...sa.sport,
          attributes: [],
        };
        sum.push(target);
      }
      target.attributes.push(sa);
      return sum;
    },
    [] as (Sport & { attributes: SportAttribute[] })[],
  );

  const form = useAppForm({
    defaultValues: formDefaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const res = WelcomeSportAttributesSchema.safeParse(value);
        if (!res.success) return res.error.flatten().fieldErrors;
      },
    },
    onSubmit: ({ value }) => {
      // 送信用 FormData を組み立て
      const fd = new FormData();
      for (const id of value.prefSportAttributeIds) {
        fd.append("prefSportAttributeIds", id); // 同名キーで複数 append
      }
      submit(fd, { method: "post", encType: "multipart/form-data" });
    },
  });

  const selectedIds = useStore(
    form.store,
    (s) => s.values.prefSportAttributeIds,
  );

  const toggleSport = (id: string) => {
    form.setFieldValue("prefSportAttributeIds", (prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="max-h-screen flex flex-col">
      <header className="border-b pb-2 mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="relative w-full flex justify-center items-center py-3 text-gray-700">
          <button type="button" className="absolute left-4 top-3" onClick={() => {history.back();}}>
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-lg text-center">
            <span>関心があるスポーツの属性</span>
          </h1>
        </div>

        {/* TODO: 国ごとに表示順を変える */}
        {/* TODO: セクションを作ってまとめる */}
      </header>
      <Form
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="overflow-hidden flex-1 flex flex-col"
      >
        <div className="flex-1 overflow-y-scroll">
          <div className="p-4">
            <div className="max-w-7xl mx-auto">
              <ul>
                {formattedAttributes.map((sport) => {
                  return (
                    <li key={sport.id}>
                      <h4 className="font-bold text-xl">{sport.name_ja_JP}</h4>

                      <ul className="flex flex-wrap gap-4">
                        {sport.attributes.map((sa) => {
                          const checked = selectedIds.includes(sa.id);

                          return (
                            <li
                              key={sa.id}
                              className="shadow box-border border rounded"
                            >
                              <label
                                className={`inline-block py-2 px-4 cursor-pointer  ${checked ? "bg-emerald-200" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  name="prefSportAttributeIds"
                                  value={sa.id}
                                  className="w-0 h-0 invisible m-0"
                                  checked={checked}
                                  onChange={() => toggleSport(sa.id)}
                                />
                                <span>{sa.name}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>

            {actionData?.error ? (
              <p style={{ color: "red" }}>{actionData.error}</p>
            ) : null}
          </div>
        </div>
        <footer className="flex justify-center p-4 border-t">
          <button
            type="submit"
            className="py-2 rounded-md bg-black text-white text-center text-base font-bold w-full"
          >
            次へ
          </button>
        </footer>
      </Form>
    </div>
  );
};

export default WelcomeSportAttributePage;
