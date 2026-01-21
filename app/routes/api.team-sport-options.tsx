import { type ActionFunctionArgs } from "react-router";

import { getTeamSportOptions } from "~/services/teamSportService.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw new Error();
  }

  const data = await request.json();
  const teamSports = await getTeamSportOptions(data.teamId);

  console.log("teamSports", teamSports);
  if (teamSports === null) {
    return null;
  }

  return teamSports;
};
