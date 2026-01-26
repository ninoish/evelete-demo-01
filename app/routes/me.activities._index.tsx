import {
  Link,
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

export default function MyActivitiesRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Index</h1>
      <div>個人の練習、記録</div>
      <div>所属チームの自分が参加した練習や、大会の記録</div>
      <div>なんでもない普通の投稿</div>
      <Link to="new">新規アクティビティ</Link>
    </div>
  );
}
