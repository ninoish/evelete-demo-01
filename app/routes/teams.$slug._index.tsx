import type { TeamPostVisibility } from "@prisma/client";
import { data, Link, type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import teamService from "~/services/teamService.server";
import { now } from "~/utils/datetime";
import { displayTeamActivityType, formatStartAndEndDatetime } from "~/utils/display";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!params.slug) {
    throw data({ errorMessage: "Team Not Found" }, { status: 404 });
  }

  const team = await teamService.getTeamBySlug(params.slug, user?.id ?? null);

  if (team === null) {
    throw data({ errorMessage: "Team Not Found" }, { status: 404 });
  }

  const isMember = user
    ? await teamService.checkIfUserIsMember(params.slug, user?.id)
    : false;

  if (isMember) {
    const recentActivities = await teamService.getRecentActivities(
      team.id,
      now().toDate(),
      3,
    );

    const posts = await teamService.getPosts(
      team.id,
      10,
      0,
      TeamPostVisibility.INTERNAL,
    );

    return { user, team, isMember, recentActivities, posts, dropins: null };
  } else {
    const dropins = await teamService.getRecentDropins(
      team.id,
      now().toDate(),
      5,
    );
    const posts = await teamService.getPosts(
      team.id,
      10,
      0,
      TeamPostVisibility.PUBLIC,
    );

    return {
      user,
      team,
      isMember,
      recentActivities: null,
      posts: posts,
      dropins: dropins,
    };
  }
};

export default function TeamIndexRoute() {
  const data = useLoaderData<typeof loader>();

  const { team, user, isMember, dropins, recentActivities, posts } = data;
  if (!team) {
    return null;
  }

  return (
    <div>
      {isMember ? (
        <>
          <div className="px-4 py-2 flex justify-between items-center">
          <h1>直近のスケジュール</h1>
          <Link to="activities" className="text-sm">もっと見る</Link>
          </div>
          <ul className="px-4 my-2 flex flex-col gap-4">
            {recentActivities.map((a) => {
              return (
                <li key={a.id} >
                  <div>
                    <Link to={`/teams/activities/${a.id}`} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div>{displayTeamActivityType(a.teamActivityType)}</div>
                      <div>{formatStartAndEndDatetime(a.startDatetime, a.endDatetime)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.isGuestAllowed ? <div className="font-bold text-xs">ドロップイン</div> : null}
                        <h4>{a.name}</h4>
                        <div>{a.currentAttendees} / {a.maxAttendees}</div>
                        <div>TODO: 私の回答</div>
                      </div>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <>
        <div className="px-4 py-2 flex justify-between items-center">
          <h1>直近のドロップイン</h1>
          <Link to="activities" className="text-sm">もっと見る</Link>
          </div>
          <ul className="px-4">
            {dropins.map((d) => {
              return (
                <li key={d.id}>
                  <div>
                    <Link to={`/teams/activities/${d.id}`}>
                      <div>{d.startDatetime.toISOString()}</div>
                      <div>{d.place}</div>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h1>投稿</h1>
      <ul>
        {posts.map((p) => {
          return (
            <li key={p.id}>
              <p>{p.body}</p>
            </li>
          );
        })}
      </ul>
      {/* 
      <hr />
      <div style={{ wordBreak: "break-all" }}>
        <pre>{JSON.stringify(team, null, 4)}</pre>
      </div> */}
      {/* <hr />
      <div style={{ wordBreak: "break-all" }}>
        <pre>{JSON.stringify(teamSportsAndAttributes, null, 4)}</pre>
      </div> */}
      <div className="h-dvh">dummy</div>
    </div>
  );
}
