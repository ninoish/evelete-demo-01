import { redirect, type LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import userService from "~/services/userService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const me = await userService.getForProfileById(user.id);

  console.log(user);
  return { me };
};

export default function MeSettingsRoute() {
  const { me } = useLoaderData<typeof loader>();
  console.log(me);
  return (
    <div className="p-4">
      <h1 className="font-bold text-xl mb-3">アカウント設定</h1>
      <div className="flex flex-col gap-2">
        <p>
          <Link to="focus">Focus 設定</Link>
        </p>
        <p>
          <Link to="sports">スポーツ 設定</Link>
        </p>
        <p>チーム設定</p>
        <p>チームメンバー設定</p>
        <p>Google Calendar 連携</p>
        <p>Google アカウント 連携</p>
        <p>メール通知設定</p>
        <p>メール変更</p>
        <p>パスワード変更</p>
      </div>
      <ul className="my-4 flex flex-col gap-2">
        <li className="flex gap-2 flex-wrap">
          <h5>ユーザー名</h5>
          <Link
            to={`/users/${me.slug}`}
            className="text-blue-500 inline-flex gap-2 flex-wrap"
          >
            <span className="font-bold">{me.displayName}</span>
            <span className="text-gray-500">{me.slug}</span>
          </Link>
        </li>
        <li>
          <h5>活動エリア</h5>
          {me.places.map((p) => {
            return (
              <p key={p.place.id} className="inline-flex gap-1 flex-wrap">
                <span>{p.place.country?.name}</span>
                <span>{p.place.state?.name}</span>
                <span>{p.place.city?.name}</span>
              </p>
            );
          })}
        </li>
      </ul>
      <button type="button" className="bg-slate-700 p-2 rounded">
        <Link to="/logout" className="text-white ">
          Logout
        </Link>
      </button>
    </div>
  );
}
