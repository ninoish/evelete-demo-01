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
import recordService from "~/services/recordService.server";
import userFocusService from "~/services/userFocusService.server";
import { useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import UserFocusForm from "~/components/form/UserFocusForm";

const UserFocusSchema = z.object({
  prefRecordMasterIds: z.array(z.string()),
});

type FormValues = z.infer<typeof UserFocusSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authed = await new Auth().isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const user = await userService.getDetailsById(authed.id);
  const userSportIds = user.sports.map((s) => s.sportId);

  const recordOptions =
    await recordService.getRecordMastersForUserFocus(userSportIds);

  console.log(user);
  return { user, recordOptions };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = new Auth();
  const authed = await auth.isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const formData = await request.clone().formData();

  const prefRecordMasterIdsRaw = formData.getAll("prefRecordMasterIds");
  console.log(prefRecordMasterIdsRaw);

  const validationResult = UserFocusSchema.safeParse({
    prefRecordMasterIds: prefRecordMasterIdsRaw,
  });
  console.log(validationResult);

  if (!validationResult.success) {
    console.log(validationResult.error);

    return Response.json(
      { error: validationResult.error.errors },
      { status: 400 },
    );
  }

  const { prefRecordMasterIds } = validationResult.data;

  console.log("registering", prefRecordMasterIds);

  const registerResult = await userFocusService.register(
    authed.id,
    prefRecordMasterIds,
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

export default function FocusSettingsRoute() {
  const { user, recordOptions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const form = useAppForm({
    defaultValues: {
      prefRecordMasterIds:
        user.userFocuses?.map((uf) => uf.recordMasterId) ?? [],
    } as FormValues,
    validators: {
      onSubmit: ({ value }) => {
        const res = UserFocusSchema.safeParse(value);
        if (!res.success) return res.error.flatten().fieldErrors;
      },
    },
    onSubmit: ({ value }) => {
      // 送信用 FormData を組み立て
      const fd = new FormData();
      for (const id of value.prefRecordMasterIds) {
        fd.append("prefRecordMasterIds", id); // 同名キーで複数 append
      }
      submit(fd, { method: "post", encType: "multipart/form-data" });
    },
  });

  const selectedIds = useStore(form.store, (s) => s.values.prefRecordMasterIds);

  const toggleRecordOption = (id: string) => {
    form.setFieldValue("prefRecordMasterIds", (prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const [filter, setFilter] = useState("");
  const filteredRecords = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) {
      return recordOptions;
    }
    return recordOptions.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) || s.nameJa.toLowerCase().includes(q)
      );
    });
  }, [filter, recordOptions]);

  const removeSelected = (e) => {
    const { recordId } = e.currentTarget.dataset;
    toggleRecordOption(recordId);
  };
  const changeOrder = (e) => {
    const { recordId, dir: dirVal } = e.currentTarget.dataset;
    console.log(typeof dirVal);
    const dir = parseInt(dirVal, 10);

    form.setFieldValue("prefRecordMasterIds", (prev) => {
      const indx = prev.indexOf(recordId);
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
      ids[indx + dir] = recordId;
      console.log(ids);
      return ids;
    });
  };

  return (
    <div className="max-h-screen flex flex-col">
      <header className="border-b mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="w-full flex items-center px-4 py-3">
          <h1 className="text-gray-700 text-lg font-bold text-left flex-1">
            <span>フォーカス指標</span>
          </h1>

          <label>
            <input
              name="recordFilter"
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="記録名で検索"
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
                    const record = recordOptions.find(
                      (r) => r.id === selectedId,
                    );
                    return (
                      <li key={selectedId} className="flex flex-col items-end">
                        <div className="border border-black rounded px-4 py-2">
                          <span className="font-bold text-lg mr-1">
                            {indx + 1}.
                          </span>
                          <span>{record?.nameJa}</span>
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
                                data-record-id={selectedId}
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
                                data-record-id={selectedId}
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
                {filteredRecords.map((record) => {
                  const checked = selectedIds.includes(record.id);

                  return (
                    <li
                      key={record.id}
                      className="shadow box-border border rounded"
                    >
                      <label
                        className={`inline-block py-2 px-4 cursor-pointer  ${checked ? "bg-emerald-200" : ""}`}
                      >
                        <input
                          type="checkbox"
                          name="prefRecordMasterIds"
                          value={record.id}
                          className="w-0 h-0 invisible m-0"
                          checked={checked}
                          onChange={() => toggleRecordOption(record.id)}
                        />
                        <span className="mr-1">{record.emoji}</span>
                        <span>{record.nameJa}</span>
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
