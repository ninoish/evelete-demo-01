import { type LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!params.slug) {
    return redirect("/");
  }

  console.log(params.slug, user?.id);

  const members = await teamService.getTeamMembersByTeamSlug(params.slug);

  const meAsTeamMember = user
    ? members.find((m) => m.userId === user.id)
    : null;

  return { user, members, meAsTeamMember };
};
export default function TeamMembersIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="py-4">
      <div className="px-2 flex justify-between items-center mb-2">
        <h3 className="text-lg">メンバー ({data.members.length})</h3>
        {data.meAsTeamMember?.canManageTeamMember ? (
          <div className="flex gap-2">
            <Link to="invite">招待する</Link>
            <Link to="manage">編集する</Link>
          </div>
        ) : null}
      </div>

      <ul className="flex flex-col">
        {data.members.map((m) => (
          <li key={m.id} className="w-full">
            <Link
              to={`/users/${m.user.slug}`}
              className="flex text-base px-2 py-3 border-b gap-3 items-center"
            >
              {m.user.profileImageUrl ? (
                <img
                  className="w-8 h-8 rounded"
                  src={m.user.profileImageUrl}
                  alt={m.user.displayName}
                />
              ) : null}
              <h5 className="flex-1">
                {m.user.displayName} {m.nickname ? `(${m.nickname})` : null}
              </h5>
              <span>{m.role}</span>
              <span>{m.relationship}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
