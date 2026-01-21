import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import { redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  return redirect(`/me/`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  return { user };
};

// TODO: 音声入力や、フリーテキスト入力から、アクティビティ入力を補助する。
// 裏側では、スポーツのマスターデータやこのユーザーの嗜好などをグラウンディングして、
// プロンプトとして入力フォームにあった形式で生成AIにレスポンスさせる。
// 入力後は、編集画面に変化する。追加でAI (+音声)で入力させることも可能。
export default function NewPersonalBodyDataRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="w-full md:w-4/5 lg:w-2/3 mx-auto py-4">
      <h1>AIアクティビティ入力</h1>
      <div>
        <textarea placeholder="筋トレメニューのメモや、練習メニューの雑記など" />
        <button type="button">音声入力</button>
      </div>
    </div>
  );
}
