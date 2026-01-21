import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { Link, useLoaderData } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const db = getPrisma();
  const activity = await db.teamActivity.findUnique({
    where: { id: params.activityId },
    include: {
      teamChatChannels: true,
    },
  });
  if (!activity) {
    return redirect("/");
  }

  return { activity };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (!params.activityId) {
    return redirect("/");
  }

  const body = await request.formData();

  for (const pair of body.entries()) {
    console.log(pair[0], pair[1], typeof pair[1]);
  }

  const submitType = body.get("submit-type");

  const db = getPrisma();

  const activity = await db.teamActivity.findUnique({
    where: { id: params.activityId },
    include: {
      teamChatChannels: true,
    },
  });

  const isForGuestUer = submitType === "guest-channel";

  if (
    !activity ||
    activity.teamChatChannels?.find(
      (ch) => ch.isGuestAccessible === isForGuestUer,
    )
  ) {
    return redirect(`/teams/activities/${params.activityId}/chat/`);
  }

  const result = await db.teamChatChannel.create({
    data: {
      channelName: params.activityId,
      teamId: activity.teamId,
      activityId: params.activityId,
      isGuestAccessible: isForGuestUer,
    },
  });

  return redirect(`/teams/activities/${params.activityId}/chat/${result.id}`);
};

export default function TeamActivityAttendeesRoute() {
  const { activity } = useLoaderData<typeof loader>();
  return (
    <div>
      <h4>チャット一覧 ({activity.teamChatChannels.length})</h4>

      <form method="post">
        <input name="submit-type" type="hidden" value="member-channel" />
        <button type="submit">(debug)メンバー用チャット作成</button>
      </form>
      <form method="post">
        <input name="submit-type" type="hidden" value="guest-channel" />

        <button type="submit">(debug)ゲスト用チャット作成</button>
      </form>
      <ul>
        {activity.teamChatChannels.map((ch) => {
          return (
            <li key={ch.id}>
              <Link to={`./${ch.id}`}>
                {ch.isGuestAccessible ? "ゲスト可" : "メンバー専用"} -{" "}
                {ch.channelName}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
