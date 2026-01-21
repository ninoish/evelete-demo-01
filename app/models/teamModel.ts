import type { Sport } from "@prisma/client";
import { TeamFormPlaces } from "~/routes/new.team";
import { getPrisma } from "~/services/database.server";

const generateRandomString = (length: number) => {
  const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const N = Math.floor(length);
  return Array.from(crypto.getRandomValues(new Uint8Array(N)))
    .map((n) => S[n % S.length])
    .join("");
};

const createNew = async ({
  userId,
  data,
}: {
  userId: string;
  data: {
    displayName: string;
    places: TeamFormPlaces;
    canRequestToJoin: boolean;
    sports: { id: string }[];
    acceptMembersAgeUnder18: boolean;
  };
}) => {
  const db = getPrisma();

  return await db.team.create({
    data: {
      displayName: data.displayName,
      slug: generateRandomString(12),
      description: "",
      imageUrl: "",
      canRequestToJoin: data.canRequestToJoin,
      canSearch: true,
      canViewActivities: true,
      canViewMembers: true,
      acceptMembersAgeUnder18: data.acceptMembersAgeUnder18,
      abbreviation: data.displayName.substring(0, 8),
      currency: "JPY",
      sports: {
        create: data.sports.map((sp) => {
          return {
            sportId: sp.id,
          };
        }),
      },
      members: {
        create: [
          {
            userId: userId,
            isOwner: true,
            isAdmin: true,
            canManagePayment: true,
            canManageTeamMember: true,
            canManageEvent: true,
            canManageResult: true,
            canManageTeamActivity: true,
            isPubliclyVisible: true,
          },
        ],
      },
    },
  });
};

const getOwnerTeamsByUserId = async ({ userId }: { userId: string }) => {
  try {
    const db = getPrisma();
    const teamMembers = await db.teamMember.findMany({
      where: {
        userId: userId,
        isOwner: true,
      },
      include: {
        team: true,
      },
    });
    return teamMembers.map((tm) => tm.team);
  } catch (e) {
    console.error(e);
    return [];
  }
};

export default {
  createNew,
  getOwnerTeamsByUserId,
};
