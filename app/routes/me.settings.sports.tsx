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

import { Auth } from "~/services/auth.server";
import userService from "~/services/userService.server";
import userSportService from "~/services/userSportService.server";
import { useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getSportOptions } from "~/services/sportService.server";

const UserSportSchema = z.object({
  prefSportIds: z.array(z.string()),
});

type FormValues = z.infer<typeof UserSportSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authed = await new Auth().isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const user = await userService.getDetailsById(authed.id);
  const sports = await getSportOptions();

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
  console.log(prefSportIdsRaw);

  const validationResult = UserSportSchema.safeParse({
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

  console.log("registering", prefSportIds);

  const registerResult = await userSportService.register(
    authed.id,
    prefSportIds,
  );

  if (registerResult?.error) {
    return Response.json(
      { errors: registerResult.error },
      {
        status: 400,
      },
    );
  }

  return;
};

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

export default function MySportSettingsRoute() {
  const { user, sports } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const form = useAppForm({
    defaultValues: {
      prefSportIds: user.sports?.map((sp) => sp.sportId) ?? [],
    } as FormValues,
    validators: {
      onSubmit: ({ value }) => {
        const res = UserSportSchema.safeParse(value);
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

  const toggleSportOption = (id: string) => {
    form.setFieldValue("prefSportIds", (prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const [filter, setFilter] = useState("");
  const filteredSports = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) {
      return sports;
    }
    return sports.filter((s) => {
      return (
        s.name_en_US.toLowerCase().includes(q) ||
        s.name_ja_JP.toLowerCase().includes(q) ||
        s.alias_ja_JP.toLowerCase().includes(q) ||
        s.alias_en_US.toLowerCase().includes(q)
      );
    });
  }, [filter, sports]);

  const removeSelected = (e) => {
    const { sportId } = e.currentTarget.dataset;
    toggleSportOption(sportId);
  };
  const changeOrder = (e) => {
    const { sportId, dir: dirVal } = e.currentTarget.dataset;
    console.log(typeof dirVal);
    const dir = parseInt(dirVal, 10);

    form.setFieldValue("prefSportIds", (prev) => {
      const indx = prev.indexOf(sportId);
      console.log(indx);
      // invalid operation
      if (
        indx === -1 ||
        (indx === 0 && dir === -1) ||
        (indx === prev.length - 1 && dir === 1)
      ) {
        return prev;
      }
      console.log("prev", prev);
      console.log(dir, indx + dir);
      const ids = [...prev];
      ids[indx] = prev[indx + dir];
      ids[indx + dir] = sportId;
      console.log(ids);
      return ids;
    });
  };

  return (
    <div className="max-h-screen flex flex-col">
      <header className="border-b mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="w-full flex items-center px-4 py-3">
          <h1 className="text-gray-700 text-lg font-bold text-left flex-1">
            <span>マイスポーツ</span>
          </h1>

          <label>
            <input
              name="sportFilter"
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="スポーツの名前で検索"
            />
          </label>
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
              <div className="mb-4">
                <ul className="flex flex-wrap gap-1">
                  {selectedIds.map((selectedId, indx) => {
                    const sport = sports.find((r) => r.id === selectedId);
                    return (
                      <li key={selectedId} className="flex flex-col items-end">
                        <div className="border border-black rounded px-4 py-2">
                          <span className="font-bold text-lg mr-1">
                            {indx + 1}.
                          </span>
                          <span>{sport?.name_ja_JP}</span>
                          <button
                            type="button"
                            data-record-id={selectedId}
                            onClick={removeSelected}
                          >
                            <IoClose />
                          </button>
                        </div>
                        {selectedIds.length > 1 && (
                          <div>
                            {indx > 0 && (
                              <button
                                type="button"
                                data-sport-id={selectedId}
                                data-dir={-1}
                                onClick={changeOrder}
                                className="p-2 border border-black rounded-full inline-flex items-center justify-center"
                              >
                                <FaChevronLeft />
                              </button>
                            )}
                            {indx < selectedIds.length - 1 && (
                              <button
                                type="button"
                                data-sport-id={selectedId}
                                data-dir={1}
                                onClick={changeOrder}
                                className="p-2 border border-black rounded-full inline-flex items-center justify-center"
                              >
                                <FaChevronRight />
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <ul className="flex flex-wrap gap-1">
                {filteredSports.map((sport) => {
                  const checked = selectedIds.includes(sport.id);

                  return (
                    <li
                      key={sport.id}
                      className="shadow box-border border rounded"
                    >
                      <label
                        className={`inline-block py-2 px-4 cursor-pointer  ${checked ? "bg-emerald-200" : ""}`}
                      >
                        <input
                          type="checkbox"
                          name="prefRecordMasterIds"
                          value={sport.id}
                          className="w-0 h-0 invisible m-0"
                          checked={checked}
                          onChange={() => toggleSportOption(sport.id)}
                        />
                        <span className="mr-1">{sport.emoji}</span>
                        <span>{sport.name_ja_JP}</span>
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
            保存
          </button>
        </footer>
      </Form>
    </div>
  );
}
