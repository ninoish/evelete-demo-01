import { type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  return Response.json({ user });
};

export default function NotificationsRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Notifications</h1>
      <div>
        未返信の所属チームの練習や大会, チームへの招待, 練習への招待,
        フォローされた メンション チーム新規投稿
      </div>
    </div>
  );
}
