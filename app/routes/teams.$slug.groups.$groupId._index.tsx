import { type LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!params.slug || !params.groupId) {
    return redirect("/");
  }

  console.log(params.slug, user?.id);

  const group = await teamService.getTeamGroupByGroupId(
    params.slug,
    params.groupId,
  );

  return Response.json({ user, group });
};
export default function TeamGroupDetailsRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {data.meAsTeamGroupMember ? (
        <div className="mb-4">
          <Link to="invite" className="mr-2">
            招待する
          </Link>
          <Link to="manage">管理する</Link>
        </div>
      ) : null}

      <pre>{JSON.stringify(data.group, null, 2)}</pre>
    </div>
  );
}
