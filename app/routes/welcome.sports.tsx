import { useMemo, useState } from "react";
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

import sportModel from "~/models/sportModel";
import { Auth } from "~/services/auth.server";
import userService from "~/services/userService.server";
import userModel from "../models/userModel";
import type { Sport } from "@prisma/client";

const WelcomeSportsSchema = z.object({
  prefSportIds: z.array(z.string()).min(1, "少なくとも1つ選択してください"), // 必須でなければ min は削除
});
type FormValues = z.infer<typeof WelcomeSportsSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = new Auth();
  const u = await auth.isAuthenticated(request);
  if (!u) {
    return redirect("/login");
  }
  const user = await userService.getDetailsById(u.id);

  // TODO: check if user has setup. if yes, redirect to setting page.

  const sports = await sportModel.getForUserPreference();

  return { user, sports };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = new Auth();

  const authed = await auth.isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const formData = await request.clone().formData();

  const prefSportIdsRaw = formData.getAll("prefSportIds");
  console.log("raw", prefSportIdsRaw);

  const validationResult = WelcomeSportsSchema.safeParse({
    prefSportIds: prefSportIdsRaw,
  });
  console.log(validationResult);

  if (!validationResult.success) {
    console.log(validationResult.error);

    return Response.json(
      { error: validationResult.error.errors },
      { status: 400 },
    );
  }

  const { prefSportIds } = validationResult.data;

  const updateResult = await userModel.updateSportPreference({
    userId: authed.id,
    sportIds: prefSportIds,
  });

  const cookieHeader = await auth.refresh(request, authed);

  if (updateResult?.error) {
    console.log(updateResult.error);
    return Response.json(
      { errors: updateResult.error },
      {
        status: 400,
        headers: {
          ...cookieHeader,
        },
      },
    );
  }

  return redirect("/welcome/sportAttributes", {
    headers: {
      ...cookieHeader,
    },
  });
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
  prefSportIds: [],
};

const WelcomeSportsPage = () => {
  const { user, sports } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  // フィルターはローカル state でOK（フォーム値にしなくてよい）
  const [filter, setFilter] = useState("");

  const form = useAppForm({
    defaultValues: formDefaultValues,
    // バリデーションは onSubmit だけでもOK。onChangeでやりたいなら同様に。
    validators: {
      onSubmit: ({ value }) => {
        const res = WelcomeSportsSchema.safeParse(value);
        if (!res.success) return res.error.flatten().fieldErrors;
      },
    },
    onSubmit: ({ value }) => {
      // 送信用 FormData を組み立て
      const fd = new FormData();
      for (const id of value.prefSportIds) {
        fd.append("prefSportIds", id); // 同名キーで複数 append
      }
      submit(fd, { method: "post", encType: "multipart/form-data" });
    },
  });

  const selectedIds = useStore(form.store, (s) => s.values.prefSportIds);
  console.log(selectedIds);

  const toggleSport = (id: string) => {
    form.setFieldValue("prefSportIds", (prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredSports = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sports;
    return sports.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.name_ja_JP.toLowerCase().includes(q)
      );
    });
  }, [filter, sports]);

  return (
    <div className="max-h-screen flex flex-col">
      <header className="border-b pb-2 mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="relative w-full flex justify-center items-center py-3 text-gray-700">
          <button type="button" className="absolute left-4 top-3" onClick={() => {history.back();}}>
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-lg text-center">興味がある・好きなスポーツ</h1>
        </div>
        <div className="px-4">
          <label>
            <input
              name="sportFilter"
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="スポーツ名で検索"
              className="p-2"
            />
          </label>
        </div>
      </header>

      {/* TODO: 国ごとに表示順を変える */}
      {/* TODO: セクションを作ってまとめる */}

      <Form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="overflow-hidden flex-1 flex flex-col"
        encType="multipart/form-data"
      >
        <div className="flex-1 overflow-y-scroll">
          <div className="p-4">
            <div className="max-w-7xl mx-auto">
              <ul className="flex flex-wrap gap-4">
                {filteredSports.map((s: Sport) => {
                  const checked = selectedIds.includes(s.id);
                  return (
                    <li key={s.id} className="shadow box-border border rounded">
                      <label
                        className={`inline-block py-2 px-4 cursor-pointer  ${checked ? "bg-emerald-200" : ""}`}
                      >
                        <input
                          type="checkbox"
                          name="prefSportIds"
                          value={s.id}
                          className="w-0 h-0 invisible m-0"
                          checked={checked}
                          onChange={() => toggleSport(s.id)}
                        />
                        <span className="mr-1 text-2xl">{s.emoji}</span>
                        <span>{s.name_ja_JP ?? s.name}</span>
                        <span className="ml-1">({s._count?.users ?? 0})</span>
                      </label>
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

export default WelcomeSportsPage;
