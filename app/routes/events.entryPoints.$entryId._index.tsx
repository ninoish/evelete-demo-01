import { type LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";

import eventEntryPointModel from "~/models/eventEntryPointModel";
import { Auth } from "~/services/auth.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (!params.entryId) {
    redirect("/");
  }

  const user = await new Auth().isAuthenticated(request);

  // TODO: access validation
  const entryPoint = await eventEntryPointModel.getById({
    id: params.entryId!,
  });

  return Response.json({
    user,
    entryPoint,
  });
};

export default function EventEntryPointDetailRoute() {
  const data = useLoaderData<typeof loader>();
  const entryPoint = data.entryPoint;
  return (
    <div>
      <h6>
        <Link to={"/events/" + entryPoint.eventId}>
          {entryPoint.event.name}
        </Link>
      </h6>
      <h4>{entryPoint.name}</h4>
      <p>{entryPoint.startDatetime.toString()}</p>
      <p>{entryPoint.description}</p>

      <div>
        <Link to={`/event-entry-points/${entryPoint.id}/entry`}>
          エントリーする
        </Link>
      </div>

      <ul>
        {entryPoint.sports?.map((s) => (
          <li key={s.sportId}>{s.sport.name_ja_JP}</li>
        )) ?? null}
      </ul>
    </div>
  );
}
