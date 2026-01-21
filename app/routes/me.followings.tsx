import { type LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import userService from "~/services/userService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = new Auth();
  const user = await auth.isAuthenticated(request);
  if (!user) {
    return redirect("/");
  }
  const followings = await userService.getFollowingsById(user.id);

  return { followings };
};

export default function MyFollowingRoute() {
  const data = useLoaderData<typeof loader>();
  const { followings } = data;
  return (
    <div className="max-w-md mx-4 my-4">
      <div>
        <Link to="/me">戻る</Link>
      </div>
      <h3>フォローしているユーザー一覧 ({followings.length})</h3>
      <ul className="mt-4">
        {followings.map((f) => (
          <li key={f.follower.id} className="flex w-full border rounded p-4">
            <Link
              to={`/users/${f.follower.slug}`}
              className="flex items-center"
            >
              <img
                src={f.follower.profileImageUrl ?? ""}
                alt={f.follower.displayName}
                className="mr-2 w-20"
              />
              <span className="text-xl">{f.follower.displayName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
