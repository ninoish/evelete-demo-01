import {
  Form,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router";

import { Auth } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
};

export default function MyRecordsNewRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>My New Activity form</h1>
      <div>私の活動の新規登録</div>
      <Form>
        <button>AI 音声入力</button>
        <input placeholder="日時、内容、" />
        <p>練習とかトレーニング内容とか</p>
      </Form>
    </div>
  );
}
