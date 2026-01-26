import type { LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const db = getPrisma();
  const activity = await db.teamActivity.findUnique({
    where: { id: params.activityId },
  });

  return { activity };
};

export default function AttendTeamActivityRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>team activity attend</h1>
      <Form>
        <input placeholder="参加コメント" />
      </Form>
    </div>
  );
}
