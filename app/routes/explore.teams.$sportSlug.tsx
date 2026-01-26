import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  return Response.json({ sport: params.sportId });
};

export default function ExploreTeamsBySportRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Explore {data.sport} teams</h1>
      <div></div>
    </div>
  );
}
