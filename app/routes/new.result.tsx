import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import { redirect } from "react-router";
import { useLoaderData, useSubmit } from "react-router";

import { PersonalResultForm } from "~/components/form/PersonalResultForm";
import { Auth } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  for (const pair of body.entries()) {
    console.log(pair[0], pair[1], typeof pair[1]);
  }

  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const result = {};

  return redirect(`/users/${user.slug}/results/${result.id}`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  return { user };
};

export default function NewPersonalResultRoute() {
  const submit = useSubmit();

  const data = useLoaderData<typeof loader>();

  const handleSubmit = (values: Event) => {
    console.log("parent handleSubmit", values);
    submit(values, { method: "post" });
  };

  return (
    <div>
      <h1>競技の結果を登録</h1>
      <h4>順位がつくものがこれ</h4>

      <p>
        競技を選ぶ 競技の種目を選ぶ 日付 詳細入力 大会名 対戦相手 (0 or more)
      </p>

      <p>イベント, 競技, 大会名, </p>

      {/* <PersonalResultForm onSubmit={handleSubmit} /> */}
    </div>
  );
}
