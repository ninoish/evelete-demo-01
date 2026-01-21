import { Form } from "react-hook-form";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/");
  }

  return {};
};

export default function MyRecordsNewRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>My records form</h1>
      <div>私の記録新規登録</div>
      <Form>
        <input placeholder="熊本マラソン2024" />
        <p>↑イベントから選べたりする。イベント参加者一覧も見れる。</p>
      </Form>
    </div>
  );
}
