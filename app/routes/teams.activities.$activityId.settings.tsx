import { data, type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const db = getPrisma();

  const activity = await db.teamActivity.findUnique({
    where: { id: params.activityId },
  });

  if (!activity) {
    throw data({ errorMessage: "Team Activity Not Found" }, { status: 404 });
  }

  return { activity };
};

export default function TeamActivitySettingsRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>team activity settings</h1>
      <h2>{data.activity?.name}</h2>
    </div>
  );
}
