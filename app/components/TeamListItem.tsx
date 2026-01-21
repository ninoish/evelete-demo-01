import type { Prisma, Sport, TeamSport } from "@prisma/client";
import { Link } from "react-router";

type TeamSportWithSports = Prisma.TeamSportGetPayload<{
  include: {
    sport: true;
  };
}>;

export default function TeamListItem({
  slug,
  displayName,
  imageUrl,
  followerCount,
  memberCount,
  sports,
  attributes,
  notifications,
  relationship,
}: {
  slug: string;
  sports?: TeamSportWithSports[];
  attributes?: string[];
  displayName: string;
  imageUrl?: string;
  followerCount: number | null;
  memberCount: number | null;
  notifications?: string[];
  relationship: string;
}) {
  return (
    <Link to={`/teams/${slug}`} className="block hover:bg-slate-100 rounded">
      <div className="flex md:flex-col gap-2">
        {imageUrl ? (
          <div
            style={{ backgroundImage: `url(${imageUrl})` }}
            className="min-w-20 min-h-20 rounded bg-cover bg-center md:w-full md:min-h-48"
          />
        ) : null}
        <div>
          {notifications ? (
            <ul>
              {notifications.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}
          <h5 className="font-bold text-lg">{displayName}</h5>
          <ul className="flex flex-wrap">
            {sports?.map((s) => (
              <li className="text-sm border rounded p-1" key={s.id}>
                <span>{s.sport.emoji}</span>
                <span>{s.sport.name_ja_JP}</span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap">
            {attributes?.map((a) => (
              <li className="text-sm border rounded p-1" key={a}>
                {a}
              </li>
            ))}
          </ul>
          <p>
            {memberCount ? <span>{memberCount} members</span> : null}
            {followerCount ? <span>{followerCount} followers</span> : null}
          </p>
          <p>{relationship}</p>
        </div>
      </div>
    </Link>
  );
}
