import { type LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);

  const slug = params.slug;
  if (!slug) {
    return redirect("/");
  }

  if (user) {
    const userTeamMember = await teamService.getTeamMemberByUserId(
      slug,
      user.id,
    );
    if (userTeamMember) {
      const activities =
        await teamService.getTeamActivitiesByTeamSlugForTeamMember(
          slug,
          user.id,
        );
      if (activities === null) {
        return redirect("/");
      }
      return { user, activities };
    }
  }

  const activities =
    await teamService.getTeamActivitiesByTeamSlugForGuest(slug);
  if (activities === null || activities === undefined) {
    return redirect("/");
  }
  return { user, activities };
};
export default function TeamActivitiesIndexRoute() {
  const data = useLoaderData<typeof loader>();
  console.log(JSON.stringify(data));

  return (
    <div className="py-4">
      <div>
        <Link to="./new" className="rounded border p-2">
          New Team Activity
        </Link>
      </div>
      <div>
        <ul>
          {data.activities.map((a) => {
            return (
              <li key={a.id}>
                <Link to={`/teams/activities/${a.id}`}>
                  <h5>{a.name}</h5>
                  <div className="flex gap-4">
                    <p>{a.startDatetime.toISOString()}</p>
                    <p>{a.place}</p>
                    <p>{a.isGuestAllowed ? "ゲスト✅" : "ゲスト❌"}</p>
                    <p>{a.status}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="h-dvh">dummy</div>
    </div>
  );
}
