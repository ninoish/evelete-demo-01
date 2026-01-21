import { type LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";

import EventListItem from "~/components/EventListItem";
import { getPrisma } from "~/services/database.server";
import { now } from "~/utils/datetime";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const db = getPrisma();

  const events = await db.event.findMany({
    where: {
      startDatetime: {
        gte: now().toDate(),
      },
    },
    orderBy: {
      startDatetime: "asc",
    },
    include: {
      organization: true,
      entryPoints: {
        include: {
          sports: {
            include: {
              sport: true,
            },
          },
          sportAttributes: true,
        },
      },
    },
    take: 40,
  });
  return Response.json({
    events,
  });
};

export default function EventsIndexRoute() {
  const data = useLoaderData<typeof loader>();
  const events = data.events;
  return (
    <div>
      <h1 className="text-lg px-4 font-bold mb-2">大会・イベント一覧</h1>
      <ul className="flex flex-wrap">
        {events.map((event) => (
          <li key={event.id} className="mb-4 p-4 shadow mr-4">
            <EventListItem event={event} />
          </li>
        ))}
      </ul>
    </div>
  );
}
