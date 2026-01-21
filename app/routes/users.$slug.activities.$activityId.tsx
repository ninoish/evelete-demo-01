import { data, type LoaderFunctionArgs, redirect } from "react-router";
import { Link, Outlet, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import personalActivityService from "~/services/personalActivity.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (!params.activityId) {
    return redirect("/");
  }
  const user = await new Auth().isAuthenticated(request);

  // TODO: check only accessibility
  const personalActivity = await personalActivityService.getById(
    params.activityId,
    user?.id ?? null,
  );
  if (!personalActivity) {
    return redirect("/");
  }

  return { user };
};

export default function UserActivityRoute() {
  const data = useLoaderData<typeof loader>();
  // console.log(data);

  return (
    <div>
      <h1>User Activity </h1>
      <ul className="flex gap-4">
        <li>
          <Link to=".">activity</Link>
        </li>
        <li>
          <Link to="comments">comments</Link>
        </li>
        <li>
          <Link to="likes">likes</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
