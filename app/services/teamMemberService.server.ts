import { getPrisma } from "./database.server";

const getByTeamIdAndUserId = async (teamId: string, userId: string) => {
  if (!teamId || !userId) {
    return null;
  }

  const db = getPrisma();

  const myMember = await db.teamMember.findFirst({
    where: {
      teamId: teamId,
      userId: userId,
    },
  });

  return myMember;
};

const getMyTeamMembers = async (userId: string) => {
  if (!userId) {
    return null;
  }
  const db = getPrisma();

  const myMembers = await db.teamMember.findMany({
    where: {
      userId: userId,
    },
    include: {
      team: {
        include: {
          sports: true,
          sportAttributes: true,
        },
      },
    },
  });
  if (!myMembers) {
    return null;
  }
  return myMembers;
};

export default {
  getByTeamIdAndUserId,
  getMyTeamMembers,
};
