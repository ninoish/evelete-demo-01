import { type LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const db = getPrisma();
  const activity = await db.teamActivity.findUnique({
    where: { id: params.activityId },
  });

  return { activity };
};

export default function CancelTeamActivityAttendanceRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Cancel team activity attendance</h1>
      <h2>{data.activity?.name}</h2>
      <Form>
        <input placeholder="理由・コメント" />
      </Form>
    </div>
  );
}
