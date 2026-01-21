import {
  Prisma,
  TeamActivityStatus,
  TeamActivityType,
  TeamPostVisibility,
} from "@prisma/client";

import { getPrisma } from "./database.server";
import { type TeamSettingsFormData } from "~/types/validators/TeamSettingsFormSchema";
import imageServer from "~/utils/image.server";

const getTeamActivitiesByTeamSlugForGuest = async (slug: string) => {
  if (!slug) {
    throw new Error();
  }

  const criteria = {
    where: {
      team: {
        slug,
      },
      OR: [
        {
          team: {
            canViewActivities: true,
          },
        },
        { isGuestAllowed: true },
      ],
    },
    take: 10,
    // TODO: filter fetching fields
  };

  const db = getPrisma();

  return await db.teamActivity.findMany(criteria);
};

//
const getTeamActivitiesByTeamSlugForTeamMember = async (
  slug: string,
  userId: string,
) => {
  if (!slug || !userId) {
    throw new Error();
  }
  const criteria = {
    where: {
      team: {
        slug,
      },
    },
    take: 10,
  };

  // TODO : add group filtering

  const db = getPrisma();

  return await db.teamActivity.findMany(criteria);
};

const getTeams = async () => {
  const db = getPrisma();

  const teams = await db.team.findMany({
    take: 100,
    include: {
      sports: {
        include: {
          sport: true,
        },
      },
      sportAttributes: {
        include: {
          sportAttribute: true,
        },
      },
      members: {
        include: {
          user: true,
        },
      },
      groups: {
        include: {
          members: true,
        },
      },
      activities: true,
    },
  });
  return teams;
};

const getTeamById = async (teamId: string, userId: string | null) => {
  const db = getPrisma();

  // TODO: access control by userId
  const team = await db.team.findFirst({
    where: {
      id: teamId,
    },
    include: {
      sports: {
        include: {
          sport: true,
        },
      },
      sportAttributes: {
        include: {
          sportAttribute: true,
        },
      },
      groups: {
        include: {
          members: true,
        },
      },
      members: {
        include: {
          user: true,
        },
      },
      followers: {
        include: {
          user: true,
        },
      },
      activities: true,
      places: {
        include: {
          place: true,
        },
      },
    },
  });

  if (!team) {
    return null;
  }

  return sanitizeDataForMemberRole(team, userId);
};

const getTeamBySlugWithCreds = async (slug: string, userId: string | null) => {
  const db = getPrisma();

  // TODO: access control by userId
  const team = await db.team.findFirst({
    where: {
      slug,
    },
    include: {
      sports: {
        include: {
          sport: true,
        },
      },
      sportAttributes: {
        include: {
          sportAttribute: true,
        },
      },
      groups: {
        include: {
          members: true,
        },
      },
      members: {
        include: {
          user: true,
        },
      },
      followers: {
        include: {
          user: true,
        },
      },
      activities: true,
      places: {
        include: {
          place: true,
        },
      },
    },
  });

  return team;
};

const getTeamBySlug = async (slug: string, userId: string | null) => {
  const team = await getTeamBySlugWithCreds(slug, userId);

  return sanitizeDataForMemberRole(team, userId);
};

export type TeamInfo = Awaited<ReturnType<typeof getTeamBySlug>>;

const sanitizeDataForMemberRole = (
  team: Awaited<ReturnType<typeof getTeamBySlugWithCreds>>,
  myUserId: string | null,
) => {
  if (!team) {
    return team;
  }

  if (team.canSearch) {
    return team;
  }

  const member = team.members.find((tm) => tm.userId === myUserId);
  // console.log("member", userId, member,);
  if (member) {
    return team;
  } else {
    if (!team.canViewActivities) {
      team.activities = [];
    } else {
      team.activities = team.activities.filter(
        (a) => a.status === TeamActivityStatus.PUBLIC,
      );
    }

    if (!team.canViewMembers) {
      team.members = [];
    } else {
      team.members = team.members.filter((m) => m.isPubliclyVisible);
    }
  }

  return team;
};

const getTeamMemberByUserId = async (slug: string, userId: string) => {
  if (!slug) {
    throw new Error();
  }
  if (!userId) {
    throw new Error();
  }

  // TODO: access control by userId

  const db = getPrisma();

  const member = await db.teamMember.findFirst({
    where: {
      team: {
        slug,
      },
      userId: userId,
    },
  });

  return member;
};

const checkIfUserIsMember = async (slug: string, userId: string) => {
  if (!slug || !userId) {
    return false;
  }

  // TODO: access control by userId
  const db = getPrisma();

  const member = await db.teamMember.findFirst({
    where: {
      team: {
        slug,
      },
      userId: userId,
    },
  });

  return !!member;
};

const getUserTeams = async (userId: string) => {
  // TODO: access control by userId
  if (!userId) {
    return Response.json({ error: { message: "userId is required" } });
  }

  const db = getPrisma();

  const teamMembers = await db.teamMember.findMany({
    where: {
      userId,
    },
    include: {
      team: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!teamMembers) {
    return [];
  }
  return teamMembers.map((tm) => tm.team);
};

const deleteTeam = async (id: string, userId: string) => {
  if (!id) {
    return Response.json({ error: { message: "id is required" } });
  }

  const db = getPrisma();

  const team = await db.team.findUnique({
    include: {
      members: true,
    },
    where: { id },
  });

  if (!team) {
    return Response.json({ error: { message: "team is not found" } });
  }

  if (
    team.members.length > 1 ||
    team.members[0].userId !== userId ||
    !team.members[0].isOwner
  ) {
    return Response.json({
      error: {
        message: "team member must be only you to delete the team",
      },
    });
  }

  await db.team.update({
    data: {
      isDeleted: true,
    },
    where: { id },
  });

  return Response.json({
    message: "Team deleted",
    success: "true",
    payload: id,
  });
};

const getTeamMembersByTeamSlug = async (slug: string) => {
  // TODO userId accessControll
  const db = getPrisma();

  return await db.teamMember.findMany({
    where: {
      team: {
        slug: slug,
      },
    },
    include: {
      user: true,
    },
  });
};

const getTeamGroupsByTeamSlug = async (teamSlug: string) => {
  // TODO userId accessControll
  const db = getPrisma();

  const groups = await db.teamGroup.findMany({
    where: {
      team: {
        slug: teamSlug,
      },
    },
    include: {
      members: {
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  return groups;
};

const getTeamGroupByGroupId = async (teamSlug: string, groupId: string) => {
  // TODO userId accessControll
  const db = getPrisma();

  return await db.teamGroup.findFirstOrThrow({
    where: {
      id: groupId,
      team: {
        slug: teamSlug,
      },
    },
    include: {
      members: true,
      activities: true,
    },
  });
};

const combineTeamSportsAndTeamSportAttributes = (
  teamSports: Prisma.TeamSportGetPayload<{
    include: { sport: true };
  }>[],
  teamSportAttributes: Prisma.TeamSportAttributeGetPayload<{
    include: { sportAttribute: true };
  }>[],
) => {
  const result = [];
  for (const teamSport of teamSports) {
    const sportId = teamSport.sport.id;
    const tsas = teamSportAttributes.filter(
      (tsa) => tsa.sportAttribute.sportId === sportId,
    );
    result.push({
      ...teamSport,
      teamSportAttributes: tsas,
    });
  }
  return result;
};

const getRecentActivities = async (
  teamId: string,
  datetime: Date,
  takeCount: number,
) => {
  // TODO userId accessControll
  const db = getPrisma();

  // TODO: ユーザーの所属グループなどを考慮
  return await db.teamActivity.findMany({
    where: {
      teamId: teamId,
      startDatetime: {
        gt: datetime,
      },
    },
    take: takeCount,
    orderBy: {
      startDatetime: "asc",
    },
  });
};

const getPosts = async (
  teamId: string,
  takeCount: number,
  offsetCount: number,
  visibility: TeamPostVisibility,
) => {
  // TODO userId accessControll
  const db = getPrisma();

  // TODO: visibilityなど考慮

  const where = {
    teamId: teamId,
    visibility: undefined,
  } as {
    teamId: string;
    visibility: TeamPostVisibility | undefined;
  };
  if (visibility === TeamPostVisibility.INTERNAL) {
    where.visibility = TeamPostVisibility.INTERNAL;
  }

  return await db.teamPost.findMany({
    where: where,
    take: takeCount,
    skip: offsetCount * takeCount,
    orderBy: {
      postedAt: "desc",
    },
  });
};

const getRecentDropins = async (
  teamId: string,
  datetime: Date,
  takeCount: number,
) => {
  const db = getPrisma();

  // TODO: ユーザーの所属グループなどを考慮
  return await db.teamActivity.findMany({
    where: {
      teamActivityType: TeamActivityType.PRACTICE,
      isGuestAllowed: true,
      teamId: teamId,
      startDatetime: {
        gt: datetime,
      },
    },
    take: takeCount,
    orderBy: {
      startDatetime: "asc",
    },
  });
};

const updateTeamSettings = async (
  userId: string,
  teamId: string,
  formData: TeamSettingsFormData,
) => {
  const db = getPrisma();

  const team = await db.team.findUnique({
    where: {
      id: teamId,
    },
  });

  if (!team) {
    throw new Error("No team found");
  }

  let isChangingSlug = false;
  if (team.slug !== formData.slug) {
    // slug cannot be changed twice.
    if (team.prefSlugSetupDatetime) {
      throw new Error("Invalid request. Slug cannot be changed twice.");
    }

    if (isInvalidTeamSlug(formData.slug)) {
      throw new Error("Invalid slug name");
    }
    isChangingSlug = true;
  }

  const iconImageUrl: string | null =
    await imageServer.uploadToCloudflareImages(formData.iconImageFile, {
      size: {
        width: 1080,
      },
      format: "jpg",
    });

  console.log("iconImageUrl");
  console.log(iconImageUrl);

  const coverImageUrl: string | null =
    await imageServer.uploadToCloudflareImages(formData.coverImageFile, {
      size: {
        width: 1080,
        height: 1080,
      },
      format: "jpg",
    });

  const updateQuery = {
    where: {
      id: teamId,
    },
    data: {
      displayName: formData.displayName,
      slug: formData.slug,
      abbreviation: formData.abbreviation,
      description: formData.description,
      themeColor: formData.themeColor,
      canRequestToJoin: formData.canRequestToJoin,
      canSearch: formData.canSearch,
      canViewActivities: formData.canViewActivities,
      canViewMembers: formData.canViewMembers,
      acceptMembersAgeUnder18: formData.acceptMembersAgeUnder18,
      minMemberSkillLevel: formData.minMemberSkillLevel,
      maxMemberSkillLevel: formData.maxMemberSkillLevel,
      // averageActivityFrequency: formData.averageActivityFrequency,
      // teamObjective: formData.teamObjective,
      // minMemberAge: formData.minMemberAge,
      // maxMemberAge: formData.maxMemberAge,
      minJoinSkillLevel: formData.minJoinSkillLevel,
      maxJoinSkillLevel: formData.maxJoinSkillLevel,
      minJoinAge: formData.minJoinAge,
      maxJoinAge: formData.maxJoinAge,
      joinPlayerGender: formData.joinPlayerGender,
      recruitingMessage: formData.recruitingMessage,
      establishedAt: formData.establishedAt,
    },
    include: {
      sports: true,
      sportAttributes: true,
      places: true,
    },
  } as Prisma.TeamUpdateArgs;

  if (isChangingSlug) {
    updateQuery.data.prefSlugSetupDatetime = new Date();
  }

  if (iconImageUrl) {
    updateQuery.data.imageUrl = iconImageUrl;
  }

  if (coverImageUrl) {
    updateQuery.data.coverImageUrl = coverImageUrl;
  }

  const updatedTeam = await db.team.update(updateQuery);

  const currentSports = await db.teamSport.findMany({
    where: { teamId: teamId },
    select: { sportId: true },
  });
  const currentSportIds = currentSports.map((r) => r.sportId);
  const sportToDisconnect = currentSportIds.filter(
    (id) => !formData.sports?.includes(id),
  );
  const sportToConnect = formData.sports.filter(
    (id) => !currentSportIds.includes(id),
  );

  const currentSporAttrs = await db.teamSportAttribute.findMany({
    where: { teamId: teamId },
    select: { sportAttributeId: true },
  });
  const currentSportAttrIds = currentSporAttrs.map((r) => r.sportAttributeId);
  const sportAttrsToDisconnect = currentSportAttrIds.filter(
    (id) => !formData.sportAttributes?.includes(id),
  );
  const sportAttrsToConnect =
    formData.sportAttributes?.filter(
      (id) => !currentSportAttrIds.includes(id),
    ) ?? [];

  const currentPlaces = await db.teamPlace.findMany({
    where: { teamId: teamId },
    select: { placeId: true },
  });
  const currentPlaceIds = currentPlaces.map((r) => r.placeId);
  const placesToDisconnect = currentPlaceIds.filter(
    (id) => !formData.places?.includes(id),
  );
  const placesToConnect =
    formData.places?.filter((id) => !currentPlaceIds.includes(id)) ?? [];

  await db.$transaction([
    db.teamSport.deleteMany({
      where: {
        teamId: teamId,
        sportId: { in: sportToDisconnect },
      },
    }),
    db.teamSport.createMany({
      data: sportToConnect.map((sportId) => ({ teamId: teamId, sportId })),
    }),
    db.teamSportAttribute.deleteMany({
      where: {
        teamId: teamId,
        sportAttributeId: { in: sportAttrsToDisconnect },
      },
    }),
    db.teamSportAttribute.createMany({
      data: sportAttrsToConnect.map((sportAttributeId) => ({
        teamId: teamId,
        sportAttributeId,
      })),
    }),
    db.teamPlace.deleteMany({
      where: {
        teamId: teamId,
        placeId: { in: placesToDisconnect },
      },
    }),
    db.teamPlace.createMany({
      data: placesToConnect.map((placeId) => ({
        teamId: teamId,
        placeId,
        placeType: "活動場所",
      })),
    }),
  ]);

  console.log(updatedTeam);
  return updatedTeam;
};

const isInvalidTeamSlug = (slug: string) => {
  if (slug === "evelete" || slug === "nike") {
    return true;
  }

  return false;
};

export default {
  getTeams,
  getUserTeams,
  getTeamMemberByUserId,
  checkIfUserIsMember,
  getTeamById,
  getTeamBySlug,
  getTeamActivitiesByTeamSlugForTeamMember,
  getTeamActivitiesByTeamSlugForGuest,
  getTeamMembersByTeamSlug,
  deleteTeam,
  getTeamGroupsByTeamSlug,
  getTeamGroupByGroupId,
  combineTeamSportsAndTeamSportAttributes,
  getRecentActivities,
  getPosts,
  getRecentDropins,
  updateTeamSettings,
};
