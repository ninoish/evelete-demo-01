import { type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";

import eventModel from "~/models/eventModel";
import { Auth } from "~/services/auth.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const { description, title } = data
    ? {
        description: `Enjoy the "${data.event?.name}" `,
        title: `"${data.event?.name}" Event`,
      }
    : { description: "No event found", title: "No event" };

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  const event = await eventModel.getById({
    id: params.eventId,
  });
  return Response.json({
    user,
    event,
  });
};

export default function EventDetailRoute() {
  const data = useLoaderData<typeof loader>();
  const event = data.event;
  return (
    <div>
      <h4>{event.name}</h4>
      {event.imageUrl ? (
        <img src={event.imageUrl} alt={event.name} loading="lazy" />
      ) : null}
      {event.organization ? (
        <p>
          主催:{" "}
          <Link to={`/organizations/${event.organizationId}`}>
            {event.organization.displayName}
          </Link>
        </p>
      ) : null}
      <p>{event.startDatetime.toString()}</p>
      <p>{event.description}</p>
      {event.entryCount ? <p>エントリー数 : {event.entryCount}</p> : null}
      {event.likeCount ? <p>いいね数 : {event.likeCount}</p> : null}

      {event.entryPoints ? (
        event.entryPoints.length === 1 ? (
          <div>
            <Link to={"/event-entry-points/" + event.entryPoints[0].id}>
              {event.entryPoints[0].name}
            </Link>
            <Link
              to={"/event-entry-points/" + event.entryPoints[0].id + "/entry"}
            >
              エントリー
            </Link>
          </div>
        ) : (
          <>
            <h3 className="mt-4">エントリーポイント</h3>
            <ul>
              {event.entryPoints?.map((p) => (
                <li key={p.id}>
                  <Link to={"/event-entry-points/" + p.id}>{p.name}</Link>
                </li>
              )) ?? null}
            </ul>
          </>
        )
      ) : null}
    </div>
  );
}
