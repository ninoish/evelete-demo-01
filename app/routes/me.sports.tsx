import { type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import MeHeader from "~/components/MeHeader";
import { Auth } from "~/services/auth.server";
import userService from "~/services/userService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/");
  }

  const me = await userService.getDetailsById(user.id);

  return { me };
};

export default function MySportsRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>My sports</h1>

      <div>
        {data.me.sports.map((sp) => {
          return <div key={sp.sportId}>{sp.sportId}</div>;
        })}
      </div>

      <div>
        競技歴。プロフィール。競技歴、競技をしていた/している期間、できごと、コメント、当時の競技レベル。現在の競技レベル。記録。
        所属。役割。
        得意なプレー。前略プロフ的な。パワプロ的なのも面白い。ポジション。レコードとの紐付け。
      </div>
      <section>
        <ul>
          <li>
            <h1>水泳</h1>
            <p>競技歴 : 10年</p>
            <p>
              期間1 : 1990/3 - 2001/4
              <br />
              スクールで0歳からバタフライまで
            </p>
            <p>期間2 : 2008/4 - 2009/1</p>
            <p>できごと1: 1994/4.4 初記録会。25m クロールでクラスで1番になる</p>
            <p>できごと2: 記録。25m 18.4s 1997.8.9</p>
          </li>
        </ul>
      </section>
    </div>
  );
}
