import { type LoaderFunctionArgs, redirect, data } from "react-router";
import { Link, Outlet, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import teamActivityService from "~/services/teamActivityService.server";
import TeamActivityLayout from "~/layouts/TeamActivityLayout";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (!params.activityId) {
    throw data({ errorMessage: "Activity Not Found" }, { status: 404 });
  }
  const auth = new Auth();
  const user = await auth.isAuthenticated(request);
  const activity = await teamActivityService.getById(
    params.activityId,
    user?.id ?? null,
  );

  if (!activity) {
    throw data({ errorMessage: "Activity Not Found" }, { status: 404 });
  }

  const myResponseStatus = user?.id
    ? await teamActivityService.getUserResponse(activity, user.id)
    : null;

  return { user, activity, myResponseStatus };
};

export default function TeamActivityRootRoute() {
  const { activity, user, myResponseStatus } = useLoaderData<typeof loader>();

  // console.log(myResponseStatus);
  return (
    <TeamActivityLayout
      activity={activity}
      user={user}
      myResponseStatus={myResponseStatus}
    >
      <Outlet context={{ activity, myResponseStatus }} />
    </TeamActivityLayout>
  );
}
