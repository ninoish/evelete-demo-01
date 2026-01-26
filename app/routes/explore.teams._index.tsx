import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";

import FilterSportsList from "~/components/FilterSportsList";
import TeamListItem from "~/components/TeamListItem";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  const teams = await teamService.getTeams();

  const db = getPrisma();

  const sports = await db.sport.findMany();

  return { user, teams, sports };
};

export default function ExploreTeamsIndexRoute() {
  const { teams, user, sports } = useLoaderData<typeof loader>();

  console.log(teams, user);
  return (
    <div className="p-4">
      <h1 className="text-4xl">チーム検索</h1>

      <div className="flex gap-4 my-4">
        <Link to="/explore">戻る</Link>
        <Link to="/explore/dropins">ドロップイン検索</Link>
        <Link to="/new/team">新規チーム作成</Link>
      </div>

      <section className="mb-4">
        <FilterSportsList sports={sports} />
      </section>

      <div>
        <ul className="flex flex-col md:flex-row md:flex-wrap gap-y-4">
          {teams.map((t) => {
            return (
              <li key={t.id} className="md:w-1/2 lg:w-1/3 xl:w-1/5 p-1">
                <TeamListItem {...t} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
