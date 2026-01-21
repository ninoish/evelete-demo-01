import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // TODO: visibility validation
  const db = getPrisma();
  const post = await db.userPost.findFirstOrThrow({
    where: {
      id: params.postId,
    },
  });
  return { post };
};

export default function PostDetailRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Post Detail</h1>
      <div>
        <pre>{JSON.stringify(data.post, null, 4)}</pre>
      </div>
    </div>
  );
}
