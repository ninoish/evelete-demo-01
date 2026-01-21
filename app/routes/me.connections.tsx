import { type LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import userConnectionService from "~/services/userConnectionService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/");
  }
  const connections = await userConnectionService.getConnectionList(user.id);

  return {
    connections,
  };
};

export default function MyConnectionsRoute() {
  const data = useLoaderData<typeof loader>();
  const { connections } = data;
  return (
    <div className="max-w-md mx-4 my-4">
      <h3>つながり一覧 ({connections.length})</h3>
      <ul className="mt-4">
        {connections.map((f) => (
          <li key={f.friend.id} className="flex w-full border rounded p-4">
            <Link to={`/users/${f.friend.slug}`} className="flex items-center">
              <img
                src={f.friend.profileImageUrl ?? ""}
                alt={f.friend.displayName}
                className="mr-2 w-20"
              />
              <span className="text-xl">{f.friend.displayName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
