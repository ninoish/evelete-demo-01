import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // TODO: paging
  const db = getPrisma();

  const channel = await db.teamChatChannel.findUnique({
    where: { id: params.chatChannelId },
    include: {
      activity: true,
      posts: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  if (!channel) {
    return redirect("/");
  }

  return { channel };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  console.log("action ", params.activityId, params.chatChannelId);
  if (!params.activityId || !params.chatChannelId) {
    return redirect("/");
  }
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const body = await request.formData();

  for (const pair of body.entries()) {
    console.log(pair[0], pair[1], typeof pair[1]);
  }

  const comment = body.get("comment") as string;
  if (!comment) {
    return null;
  }

  const db = getPrisma();

  const channel = await db.teamChatChannel.findUnique({
    where: { id: params.chatChannelId },
    include: {
      activity: true,
    },
  });

  console.log("channel", channel?.activity, channel?.activity?.teamId);
  if (!channel?.activity?.teamId) {
    return redirect("/");
  }

  const team = await db.team.findUnique({
    where: { id: channel.activity.teamId },
    include: {
      members: {
        where: {
          userId: user.id,
        },
      },
    },
  });

  const result = await db.teamChatPost.create({
    data: {
      channelId: params.chatChannelId,
      teamId: channel.activity.teamId,
      postBody: comment,
      isGuest: team?.members.length === 0,
      userId: user.id,
    },
  });

  console.log("CREATED", result);

  return null;
};

export default function TeamActivityAttendeesRoute() {
  const { channel } = useLoaderData<typeof loader>();
  return (
    <div>
      <h4>チャット : ({channel.channelName})</h4>

      <form method="post">
        <label>
          <span>コメント</span>
          <inpu type="text" required name="comment" />
          <button type="submit">投稿</button>
        </label>
      </form>

      <ul>
        {channel.posts.map((p) => {
          return (
            <li key={p.id}>
              <div className="flex">
                <Link to={`/users/${p.user.slug}`}>
                  {p.user.name}
                  {p.isGuest ? " (ゲスト)" : null}
                </Link>
                <span>{p.createdAt}</span>
              </div>
              <p>{p.postBody}</p>
            </li>
          );
        })}
      </ul>

      <div>
        <pre>{JSON.stringify(channel, null, 4)}</pre>
      </div>
    </div>
  );
}
