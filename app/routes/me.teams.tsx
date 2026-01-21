import { type LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import TeamIcon from "~/components/TeamIcon";

import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return;
  }

  const db = getPrisma();

  const myTeamMembers = await db.teamMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      team: {
        include: {
          sports: {
            include: {
              sport: true,
            },
          },
        },
      },
    },
  });

  console.log(myTeamMembers);
  const myTeams = myTeamMembers.map((tm) => tm.team);
  return { myTeams };
};

export default function MyTeamsRoute() {
  const data = useLoaderData<typeof loader>();
  const teams = data?.myTeams ?? [];
  console.log(teams);
  return (
    <div className="py-4">
      <div className="px-4 flex items-center mb-2">
        <h1 className="text-lg lg:text-2xl flex-1">
          所属チーム一覧 ({teams.length})
        </h1>
        <Link to="/new/team">+ 新規チーム作成</Link>
      </div>
      <ul className="mt-4">
        {teams?.map((t) => (
          <li key={t.id} className="py-2 px-4 border-b">
            <Link to={`/teams/${t.slug}`}>
              <div className="flex items-center gap-2">
                <TeamIcon team={t} size="sm" />
                <h2 className="text-md">{t.displayName}</h2>
              </div>
              <ul className="mt-1 flex gap-2">
                {t.sports?.map((ts) => (
                  <li className="p-1 inline-flex gap-1" key={ts.sport.id}>
                    <span>{ts.sport.emoji}</span>
                    <span>{ts.sport.name_ja_JP}</span>
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
