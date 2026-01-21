import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { Form, Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  const db = getPrisma();

  const entryPoint = await db.eventEntryPoint.findFirstOrThrow({
    where: {
      id: params.entryId,
    },
    include: {
      event: true,
      sports: {
        include: {
          sport: true,
        },
      },
      sportAttributes: true,
    },
  });
  // TOOD: my entry
  return Response.json({
    user,
    entryPoint,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return null;
  }

  console.log(body);
  const { entryPointId } = body as unknown as { entryPointId: string };

  const db = getPrisma();

  await db.personalEventEntry.create({
    data: {
      entryPointId,
      userId: user.id,
    },
  });

  return redirect(`/event-entry-points/${body.get("entryPointId")}/entry`);
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
      <p>{entryPoint.price}</p>
      <p>キャンセル可能日</p>
      <Form method="post">
        <input type="hidden" value={entryPoint.id} name="entryPointId" />
        {entryPoint.entryType === "team"}
        <button type="submit">エントリーする</button>
      </Form>
    </div>
  );
}
