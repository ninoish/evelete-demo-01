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

export const userFocusFormSchema = z.object({
  bodyData: z.array(z.string()),
  behaviours: z.array(z.string()), // 習慣 (週にx日走る)
  records: z.array(z.string()), // 記録
  results: z.array(z.string()), // 結果
  tricks: z.array(z.string()),
}); // => これらすべてレコードでいいかも？

export type UserFocusFormValues = z.infer<typeof userFocusFormSchema>;

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

const formDefaultValues: UserFocusFormValues = {
  prefRecordMasterIds: [],
};

export default function UserFocusForm({
  data,
  errors,
}: {
  data: any;
  errors: any;
}) {
  const submit = useSubmit();

  const form = useAppForm({
    defaultValues: formDefaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const res = userFocusFormSchema.safeParse(value);
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

  return (
    <div>
      <Form
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      ></Form>
    </div>
  );
}
