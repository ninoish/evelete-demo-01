import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { useLoaderData } from "react-router";
import { getValidatedFormData } from "remix-hook-form";

import {
  newTeamActivityFormSchema,
  TeamActivityForm,
} from "~/components/form/TeamActivityForm";
import { Auth } from "~/services/auth.server";
import teamActivityService from "~/services/teamActivityService.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!params.slug) {
    return redirect("/");
  }

  const team = await teamService.getTeamBySlug(params.slug, user?.id ?? null);
  if (team === null) {
    redirect("/");
  }

  const meMember = team!.members.find((tm) => tm.userId === user?.id);
  if (!meMember?.canManageTeamActivity) {
    redirect("/");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  return { user, team, meMember, apiKey };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (!params.slug) {
    return redirect("/");
  }

  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const { data, errors } = await getValidatedFormData(
    request,
    zodResolver(newTeamActivityFormSchema),
  );

  console.log(data);
  console.log(errors);

  if (errors) {
    return Response.json({ error: errors }, { status: 400 });
  }

  const parseResult = newTeamActivityFormSchema.safeParse(data);

  if (!parseResult.success) {
    console.log("parseResult", JSON.stringify(parseResult));
    return Response.json(
      { error: parseResult.error.errors[0].message },
      { status: 400 },
    );
  }

  // TODO: get team by slug
  // TODO: check if user can add a new team activity

  const team = await teamService.getTeamBySlug(params.slug, user.id);

  if (!team) {
    return redirect("/?error=noteam");
  }

  const meAsMember = team.members.find((mem) => mem.userId === user.id);

  if (!meAsMember || !meAsMember.canManageTeamActivity) {
    return redirect("/?error=nopermission");
  }

  const result = await teamActivityService.createNew({
    userId: user.id,
    teamId: team.id,
    data: parseResult.data,
  });
  console.log(result);

  return redirect(`/teams/activities/${result.id}`);
};

export default function NewTeamActivityFormRoute() {
  const data = useLoaderData<typeof loader>();
  const { user, team, meMember, apiKey } = data;

  console.log(apiKey);

  return (
    <div className="py-2 px-2 md:p-8 max-w-screen-xl mx-auto">
      <h1 className="text-lg md:text-xl mb-2 font-bold">新規チーム活動予定</h1>

      <div className="max-w-screen-xl mx-auto">
        <TeamActivityForm team={team ?? null} mapsApiKey={apiKey} />
      </div>
    </div>
  );
}
