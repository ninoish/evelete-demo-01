import type { Prisma } from "@prisma/client";
import { Link } from "react-router";
import { date } from "~/utils/datetime";

export default function DropInListItem({
  ta,
}: {
  ta: Prisma.TeamActivityGetPayload<{
    include: {
      team: true;
      sport: true;
      sportAttributes: {
        include: {
          sportAttribute: true;
        };
      };
    };
  }>;
}) {
  return (
    <div className="h-full block rounded shadow-lg border border-gray-200 p-4 hover:bg-slate-100">
      <Link to={`/teams/activities/${ta.id}`} className="">
        <div className="flex items-center gap-x-2">
          {ta.team.imageUrl ? (
            <div className="rounded-full h-8 w-8 overflow-hidden">
              <div
                className="bg-cover bg-center h-full w-full"
                style={{ backgroundImage: `url(${ta.team.imageUrl})` }}
              />
            </div>
          ) : null}
          <span>{ta.team.displayName} -</span>
        </div>
        {ta.sport ? (
          <>
            <h1>
              <span>{ta.sport.emoji}</span>
              <span>{ta.sport.name_ja_JP}</span>
            </h1>

            <ul className="flex gap-2">
              {ta.sportAttributes?.map((sa) => {
                return (
                  <li key={sa.sportAttributeId}>{sa.sportAttribute.name}</li>
                );
              })}
            </ul>
          </>
        ) : null}
        <div>
          日時 :
          <span>{date(ta.startDatetime).format("YYYY年MM月DD日 HH:mm")}</span>
          <span className="mx-2">-</span>
          <span>
            {ta.endDatetime ? date(ta.endDatetime).format("HH:mm") : null}
          </span>
        </div>
        <div>
          <span className="mr-4">🏟️ {ta.place}</span>
        </div>
        <div>
          <span>¥{ta.priceForGuest}</span>
        </div>
        <h2 className="text-lg whitespace-nowrap">{ta.name}</h2>
      </Link>
    </div>
  );
}
