import { data, type LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import userService from "~/services/userService.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const authed = await new Auth().isAuthenticated(request);

  const { slug: userSlug } = params;
  if (!userSlug) {
    throw data({ errorMessage: "Invalid parameter" }, { status: 400 });
  }
  const user = await userService.getBySlug(userSlug, authed?.id);
  if (!user) {
    throw data({ errorMessage: "User not found" }, { status: 404 });
  }
  const followers = await userService.getFollowersById(user.id);

  return { followers: followers ?? [] };
};

export default function UserFollowersRoute() {
  const data = useLoaderData<typeof loader>();
  const { followers } = data;
  return (
    <div className="max-w-md mx-4 my-4">
      <h3>フォロワー一覧 ({followers.length})</h3>
      <ul className="mt-4">
        {followers.map((f) => (
          <li key={f.following.id} className="flex w-full border rounded p-4">
            <Link
              to={`/users/${f.following.slug}`}
              className="flex items-center"
            >
              <img
                src={f.following.profileImageUrl ?? ""}
                alt={f.following.displayName}
                className="mr-2 w-20"
              />
              <span className="text-xl">{f.following.displayName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
