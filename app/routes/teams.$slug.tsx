import { data, type LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData } from "react-router";
import TeamLayout from "~/layouts/TeamLayout";

import { Auth } from "~/services/auth.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (!params.slug) {
    throw data({ errorMessage: "Team Not Found" }, { status: 404 });
  }

  const user = await new Auth().isAuthenticated(request);

  const team = await teamService.getTeamBySlug(params.slug, user?.id ?? null);

  if (team === null) {
    throw data({ errorMessage: "Team Not Found" }, { status: 404 });
  }
  const meMember = team!.members.find((tm) => tm.userId === user?.id);

  return { user, team, meMember };
};

export default function Layout({ params }) {
  const data = useLoaderData<typeof loader>();
  const { team, user, meMember } = data;

  return (
    <TeamLayout team={team} meMember={meMember}>
      <Outlet context={{ user, team, isMember: !!meMember }} />
    </TeamLayout>
  );
}
