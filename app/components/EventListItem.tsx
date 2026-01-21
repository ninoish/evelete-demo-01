/* eslint-disable react/prop-types */

import type { Prisma } from "@prisma/client";
import { Link } from "react-router";

type EventWithReferences = Prisma.EventGetPayload<{
  include: {
    organization: true;
    entryPoints: {
      include: {
        sports: {
          include: {
            sport: true;
          };
        };
        sportAttributes: true;
      };
    };
  };
}>;

export default function EventListItem({
  event,
}: {
  event: EventWithReferences;
}) {
  return (
    <Link to={`/events/${event.id}`} className="block">
      <h4 className="font-bold">{event.name}</h4>
      {event.imageUrl ? (
        <div
          className="w-full h-40 bg-cover text-center bg-gray-400 rounded bg-center"
          style={{ backgroundImage: `url(${event.imageUrl})` }}
        ></div>
      ) : null}
      {event.organization ? (
        <p>主催: {event.organization.displayName}</p>
      ) : null}
      <p>{event.startDatetime.toString()}</p>
      <div>
        {event.entryPoints.map((entryPoint) => (
          <div key={entryPoint.id}>
            {entryPoint.sports.map((sp) => (
              <div key={sp.sport.id}>{sp.sport.name_ja_JP}</div>
            ))}
          </div>
        ))}
      </div>
      <p>Description: {event.description}</p>
      {event.entryCount ? <p>エントリー数 : {event.entryCount}</p> : null}
      {event.likeCount ? <p>いいね数 : {event.likeCount}</p> : null}
    </Link>
  );
}
