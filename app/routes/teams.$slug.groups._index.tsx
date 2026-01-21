import { type LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  if (!params.slug) {
    return redirect("/");
  }

  const isMember = teamService.checkIfUserIsMember(params.slug, user.id);
  if (!isMember) {
    return redirect("/");
  }
  console.log(params.slug, user?.id);

  const groups = await teamService.getTeamGroupsByTeamSlug(params.slug);

  const meAsGroupMembers = groups.filter((g) =>
    g.members.find((gm) => gm.member.userId === user.id),
  );

  return Response.json({ user, groups, meAsGroupMembers });
};
export default function TeamGroupsIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {data.meAsGroupMembers ? (
        <div className="mb-4">
          <Link to="invite" className="mr-2">
            招待する
          </Link>
          <Link to="manage">管理する</Link>
        </div>
      ) : null}

      <Link to="new">新規グループ</Link>

      <ul>
        {data.groups.map((g) => (
          <li key={g.id}>
            <Link to={`/teams/${g.team.slug}/${g.id}`}>{g.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
