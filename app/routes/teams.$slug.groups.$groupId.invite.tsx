import { type LoaderFunctionArgs, redirect } from "react-router";
import { Form, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // TODO: validation + logic
  const user = await new Auth().isAuthenticated(request);
  if (!params.slug) {
    return redirect("/");
  }

  const members = await teamService.getTeamMembersByTeamSlug(params.slug);
  const meAsTeamMember = user
    ? members.find((m) => m.userId === user.id)
    : null;

  if (!meAsTeamMember) {
    return redirect("/");
  }

  return Response.json({ user, members, meAsTeamMember });
};

export default function TeamGroupsInviteRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        <Form>
          <label>
            <span>既存ユーザー</span>
            <input type="text" placeholder="ユーザーID or 名前で検索" />
          </label>
          <button type="submit" name="userId">
            招待する
          </button>

          <label>
            <span>招待メールを送る</span>
            <input placeholder="メールアドレス" type="email" />
          </label>
          <button type="submit" name="email">
            招待メールを送信する
          </button>
        </Form>
      </div>
    </div>
  );
}
