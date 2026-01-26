import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import { useState } from "react";
import type { Sport } from "@prisma/client";
import { now } from "~/utils/datetime";
import DropInListItem from "~/components/teamActivity/DropInListItem";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  const db = getPrisma();

  const teamActivities = await db.teamActivity.findMany({
    where: {
      startDatetime: {
        gte: now().toDate(),
      },
      isGuestAllowed: true,
      // TODO: status:
    },
    include: {
      team: true,
      sport: true,
      sportAttributes: {
        include: {
          sportAttribute: true,
        },
      },
    },
    take: 20,
    orderBy: {
      startDatetime: "asc",
    },
  });

  const sports = await db.sport.findMany();
  return {
    user,
    teamActivities,
    sports,
  };
};

export default function ExploreTeamActivitiesIndexRoute() {
  const { teamActivities, sports } = useLoaderData<typeof loader>();

  const [sportFilterValue, setSportFilterValue] = useState("");
  const [filteredSports, setFilteredSports] = useState<Sport[]>([]);

  const filterSports = (ev) => {
    const keyword = ev.currentTarget.value;
    setSportFilterValue(keyword);
    if (keyword) {
      const filtered = sports.filter((sp) => sp.name.indexOf(keyword) >= 0);
      setFilteredSports(filtered);
    }
  };
  return (
    <div className="p-4">
      <h1 className="text-lg">ドロップインを探す</h1>

      <section className="mb-4">
        <div className="flex justify-between mb-2">
          <h1 className="text-lg md:text-2xl">競技から探す</h1>
          <input
            placeholder="Filter Sports"
            value={sportFilterValue}
            className="border px-2"
            onChange={filterSports}
          />
        </div>
        <ul className="flex flex-wrap gap-2">
          {filteredSports.length > 0
            ? filteredSports.map((sp) => {
                return (
                  <li key={sp.id}>
                    <Link
                      to={`./${sp.id}`}
                      className="rounded border border-slate-400 block p-3 md:p-4 w-full hover:bg-slate-50"
                    >
                      {sp.emoji ? (
                        <span className="mr-2">{sp.emoji}</span>
                      ) : null}
                      <span>{sp.name}</span>
                    </Link>
                  </li>
                );
              })
            : null}
        </ul>
      </section>

      <h1 className="text-lg font-bold mt-6 mb-2">
        直近開催の or 最近追加されたドロップイン
      </h1>
      <ul className="flex flex-col md:flex-row md:flex-wrap gap-x-2 gap-y-4">
        {teamActivities.map((ta) => {
          return (
            <li
              key={ta.id}
              className="block items-stretch w-full md:w-auto max-w-full"
            >
              <DropInListItem ta={ta} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
