import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  redirect,
  Form,
  useLoaderData,
  useSubmit,
  useActionData,
} from "react-router";

import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { Auth } from "~/services/auth.server";
import z from "zod";

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  for (const pair of body.entries()) {
    console.log(pair[0], pair[1], typeof pair[1]);
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  return { user };
};

const IMAGE_TYPES = ["image/jpg", "image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 5; // 5MB
const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};
const PersonalPostFormSchema = z.object({
  body: z.string().optional(),
  files: z
    .array(
      z
        .instanceof(File, { message: "画像ファイルを選択してください" })
        .optional()
        // .refine((file) => file.length !== 0, { message: "必須です" })
        .refine((file) => !file || sizeInMB(file.size) <= MAX_IMAGE_SIZE, {
          message: "ファイルサイズは最大5MBです",
        })
        .refine((file) => !file || IMAGE_TYPES.includes(file.type), {
          message: ".jpgもしくは.pngのみ可能です",
        }),
    )
    .optional(),
  location: z.object({}).optional(),
});

export type PersonalPostFormData = z.infer<typeof PersonalPostFormSchema>;

export default function NewPersonalPostFormRoute() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const actionData = useActionData<typeof action>() as
    | { errors?: Record<string, string[]> }
    | undefined;

  const defaultMeta = { submitAction: null as string | null };

  const form = useAppForm<
    PersonalPostFormData,
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
      body: "",
      files: [],
      location: undefined,
    },
    onSubmitMeta: defaultMeta, // ここで metadata の型とデフォルト定義
    validators: {
      onChange: ({ value }) => {
        const res = PersonalPostFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono2", res);
          return res.error.flatten().fieldErrors;
        }
      },
      onSubmit: ({ value }) => {
        console.log(value);
        const res = PersonalPostFormSchema.safeParse(value);
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
        encType: "application/x-www-form-urlencoded",
      });
    },
  });

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
          <h1 className="text-xl">投稿</h1>
          <div className="absolute right-1 z-10">
            <button
              className="text-blue-600"
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
                <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
                  <form.Field name="files">
                    {(field) => (
                      <label className="">
                        <span className="">画像・動画</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          // TODO: 動画
                          multiple={true}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              const fs = Array.from(files);
                              console.log(fs);
                              field.handleChange(fs);
                            }
                          }}
                        />
                      </label>
                    )}
                  </form.Field>

                  <form.Field name="body">
                    {(field) => (
                      <label className="w-full">
                        <span className="">本文</span>
                        <textarea
                          className="w-full h-48"
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <div style={{ color: "red" }}>
                          {field.state.meta.errors[0] ||
                            actionData?.errors?.["body"]?.[0]}
                        </div>
                      </label>
                    )}
                  </form.Field>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
