import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const db = getPrisma();

  const organization = await db.organization.findFirstOrThrow({
    where: {
      id: params.organizationId,
    },
    include: {
      events: true,
    },
  });
  return Response.json({
    organization,
  });
};

export default function OrganizationDetailRoute() {
  const data = useLoaderData<typeof loader>();
  const organization = data.organization;
  return (
    <div>
      <h4>{organization.displayName}</h4>
      {organization.imageUrl ? (
        <img src={organization.imageUrl} alt={organization.displayName} />
      ) : null}

      <h3 className="mt-4">主催イベント</h3>
      <ul>
        {organization.events?.map((e) => (
          <li key={e.id}>
            <Link to={"/events/" + e.id}>{e.name}</Link>
          </li>
        )) ?? null}
      </ul>
    </div>
  );
}
