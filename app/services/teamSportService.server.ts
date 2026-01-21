import { getPrisma } from "./database.server";

export const getTeamSportOptions = async (teamId: string) => {
  if (!teamId) {
    return null;
  }

  const db = getPrisma();

  const sports = await db.teamSport.findMany({
    where: {
      teamId: teamId,
    },
    include: {
      sport: true,
    },
  });
  return sports;
};
