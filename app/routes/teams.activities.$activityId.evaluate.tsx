import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const db = getPrisma();

  const activity = await db.teamActivity.findUnique({
    where: { id: params.activityId },
  });

  return { activity };
};

export default function TeamActivityEvaluateRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>evaluate team activity</h1>
      <div>参加者が参加後に評価する。ゲストのみか。</div>
      <h2>{data.activity?.name}</h2>
    </div>
  );
}
