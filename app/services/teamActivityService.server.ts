import {
  PersonalActivityType,
  PersonalActivityVisibility,
  type TeamActivity,
  TeamActivityAttendanceResponseType,
  TeamActivityPaymentMethod,
  TeamActivityType,
  TeamActivityVisibility,
} from "@prisma/client";
import type { NewTeamActivityFormData } from "~/components/form/TeamActivityForm";
import { AttendeeResponseState } from "~/models/teamActivityModel";
import { getPrisma } from "~/services/database.server";
import { dateFromString, now } from "~/utils/datetime";
import userServiceServer from "./userService.server";

const getUserResponse = async (teamActivity: TeamActivity, userId: string) => {
  const db = getPrisma();

  // レスがあるか
  const response = await db.teamActivityAttendanceResponse.findFirst({
    where: {
      teamActivityId: teamActivity.id,
      userId: userId,
    },
  });

  if (response) {
    return {
      status: response.isGuest
        ? AttendeeResponseState.GUEST
        : response.isInvited
          ? AttendeeResponseState.INVITED
          : AttendeeResponseState.MEMBER,
      response: response,
    };
  }

  // メンバーか
  const teamMember = await db.teamMember.findUnique({
    where: {
      userId_teamId: {
        teamId: teamActivity.teamId,
        userId: userId,
      },
    },
  });
  if (teamMember) {
    return {
      status: AttendeeResponseState.MEMBER,
      response: null,
    };
  }

  // 招待されているか
  const invited = await db.teamActivityInvitation.findUnique({
    where: {
      teamActivityId_userId: {
        teamActivityId: teamActivity.id,
        userId: userId,
      },
    },
  });

  if (invited) {
    return {
      status: AttendeeResponseState.INVITED,
      response: null,
    };
  }

  // ブロックされていないか // TODO: ブロック機能実装

  // ゲスト参加可能か
  // TODO: 参加条件に合致しているか判定を追加する
  if (teamActivity.isGuestAllowed) {
    return {
      status: AttendeeResponseState.GUEST,
      response: null,
    };
  }
};

const getById = async (teamActivityId: string, userId: string | null) => {
  // TODO: access control by userId
  const db = getPrisma();

  const activity = await db.teamActivity.findFirst({
    where: {
      id: teamActivityId,
    },
    include: {
      sport: true,
      sportAttributes: {
        include: {
          sportAttribute: true,
        },
      },
      creator: true,
      participationRequirements: true,
      attendanceResponses: true,
      teamResults: true,
      groups: true,
      teamChatChannels: true,
      team: {
        include: {
          members: true,
        },
      },
      event: true,
      eventEntry: true,
    },
  });

  if (!activity) {
    return null;
  }

  if (activity.isGuestAllowed) {
    return activity;
  }

  if (userId === null) {
    throw new Error();
  }

  const member = activity.team.members.find((m) => m.userId === userId);
  if (!member) {
    throw new Error();
  }

  // TODO:filter グループ限定アクティビティ

  return activity;
};

const getByUserId = async (userId: string, from, to) => {
  const db = getPrisma();

  const members = await db.teamMember.findMany({
    select: {
      teamId: true,
    },
    where: {
      userId,
    },
  });
  const teamIds = members?.map((tm) => tm.teamId);

  const activities = await db.teamActivity.findMany({
    where: {
      startDatetime: {
        gt: now().toDate(),
        lt: now().add(14, "days").toDate(),
      },
      teamId: {
        in: teamIds,
      },
    },
    orderBy: {
      startDatetime: "asc",
    },
    include: {
      team: true,
      sport: true,
      sportAttributes: true,
    },
  });
  return activities;
};

const getDropIns = async (userId: string | null, from: null, to: null) => {
  // TODO: from, to
  const db = getPrisma();

  let preferredSportIds = null;
  let place = null;
  if (userId) {
    const user = await userServiceServer.getDetailsById(userId);
    preferredSportIds = user.sports.map((sp) => sp.sportId);
    place = user.places[0].place;
  }

  const activities = await db.teamActivity.findMany({
    include: {
      team: true,
      sport: true,
      sportAttributes: true,
    },
    where: {
      startDatetime: {
        gt: now().toDate(),
        lt: now().add(14, "days").toDate(),
      },
      teamActivityType: TeamActivityType.PRACTICE,
      isGuestAllowed: true,
      ...(preferredSportIds && {
        sportId: {
          in: preferredSportIds,
        },
      }),
      // TODO: place filtering
      // ...(place?.countryId && { placeCountryId: place.countryId }),
    },
    orderBy: {
      startDatetime: "asc",
    },
    take: 10,
  });
  return activities;
};

const canAttend = async (teamActivity: TeamActivity, userId: string) => {
  const db = getPrisma();

  const member = await db.teamMember.findFirst({
    where: {
      teamId: teamActivity.teamId,
      userId: userId,
    },
  });
  if (member) {
    return {
      canAttend: true,
      status: AttendeeResponseState.MEMBER,
    };
  }

  // TODO: 編集で後から isInvitationAllowe が false になった場合は？
  if (teamActivity.isInvitationAllowed) {
    const invited = await db.teamActivityInvitation.findFirst({
      where: {
        teamActivityId: teamActivity.id,
        userId: userId,
      },
    });

    if (invited) {
      return {
        canAttend: true,
        status: AttendeeResponseState.INVITED,
      };
    }
  }

  if (teamActivity.isGuestAllowed) {
    return {
      canAttend: true,
      status: AttendeeResponseState.GUEST,
    };
  }

  return {
    canAttend: false,
    status: AttendeeResponseState.GUEST,
  };
};

const comment = async (
  userId: string,
  teamActivityId: string,
  comment: string | null,
) => {
  const db = getPrisma();

  const teamActivity = await db.teamActivity.findFirst({
    where: {
      id: teamActivityId,
    },
  });

  if (!teamActivity) {
    throw new Error("No team activity found");
  }

  const existing = await db.personalActivity.findFirst({
    where: {
      teamActivityAttendanceResponse: {
        teamActivityId: teamActivityId,
        userId: userId,
      },
    },
    include: {
      teamActivityAttendanceResponse: true,
    },
  });

  if (!existing || !existing.teamActivityAttendanceResponse) {
    throw new Error("No response found");
  }

  const res = await db.teamActivityAttendanceResponse.update({
    data: {
      responseComment: comment,
    },
    where: {
      userId: existing.teamActivityAttendanceResponse.userId,
      teamActivityId: existing.teamActivityAttendanceResponse.teamActivityId,
      personalActivityId: existing.id,
    },
  });

  return res;
};

const respond = async (
  userId: string,
  teamActivityId: string,
  response: TeamActivityAttendanceResponseType,
  responseStatus: (typeof AttendeeResponseState)[keyof typeof AttendeeResponseState],
) => {
  const db = getPrisma();

  const teamActivity = await db.teamActivity.findFirst({
    where: {
      id: teamActivityId,
    },
  });

  if (!teamActivity) {
    throw new Error("No team activity found");
  }

  // TODO: ロックしてトランザクション内でダブルブッキングや上限超過を防ぐ

  const existing = await db.personalActivity.findFirst({
    where: {
      teamActivityAttendanceResponse: {
        teamActivityId: teamActivityId,
        userId: userId,
      },
    },
    include: {
      teamActivityAttendanceResponse: true,
    },
  });

  if (existing) {
    if (!existing.teamActivityAttendanceResponse) {
      return null;
    }

    const isChangingToAttend =
      response === TeamActivityAttendanceResponseType.GOING &&
      existing.teamActivityAttendanceResponse.response !==
        TeamActivityAttendanceResponseType.GOING;

    const isCancelingAttend =
      response !== TeamActivityAttendanceResponseType.GOING &&
      existing.teamActivityAttendanceResponse.response ===
        TeamActivityAttendanceResponseType.GOING;

    // 参加に変更する場合、上限チェック
    if (isChangingToAttend) {
      const attendees = await db.teamActivityAttendanceResponse.findMany({
        where: {
          teamActivityId: teamActivityId,
          response: TeamActivityAttendanceResponseType.GOING,
        },
      });

      if (
        teamActivity.maxAttendees &&
        response === TeamActivityAttendanceResponseType.GOING &&
        attendees.length > teamActivity.maxAttendees
      ) {
        throw new Error("Exceed max attendees");
      }

      // ゲストの場合
      if (responseStatus === AttendeeResponseState.GUEST) {
        const guests = attendees.filter((a) => a.isGuest);
        if (
          teamActivity.maxGuestAttendees &&
          response === TeamActivityAttendanceResponseType.GOING &&
          guests.length > teamActivity.maxGuestAttendees
        ) {
          throw new Error("Exceed max guest attendees");
        }
      }

      // 招待者の場合
      if (responseStatus === AttendeeResponseState.GUEST) {
        const inviteds = attendees.filter((a) => a.isInvited);

        if (
          teamActivity.maxInvitationAttendees &&
          response === TeamActivityAttendanceResponseType.GOING &&
          inviteds.length > teamActivity.maxInvitationAttendees
        ) {
          throw new Error("Exceed max invited attendees");
        }
      }
    }

    existing.teamActivityAttendanceResponse.response = response;

    const res = await db.$transaction([
      db.teamActivityAttendanceResponse.update({
        data: existing.teamActivityAttendanceResponse,
        where: {
          userId: existing.teamActivityAttendanceResponse.userId,
          teamActivityId:
            existing.teamActivityAttendanceResponse.teamActivityId,
          personalActivityId: existing.id,
          isGuest: responseStatus === AttendeeResponseState.GUEST,
          isInvited: responseStatus === AttendeeResponseState.INVITED,
        },
      }),
      db.teamActivity.update({
        where: {
          id: teamActivityId,
        },
        data: {
          currentAttendees: {
            increment: isChangingToAttend ? 1 : isCancelingAttend ? -1 : 0,
          },
          currentGuestAttendees: {
            increment:
              isChangingToAttend &&
              responseStatus === AttendeeResponseState.GUEST
                ? 1
                : isCancelingAttend &&
                    responseStatus === AttendeeResponseState.GUEST
                  ? -1
                  : 0,
          },
          currentInvitationAttendees: {
            increment:
              isChangingToAttend &&
              responseStatus === AttendeeResponseState.INVITED
                ? 1
                : isCancelingAttend &&
                    responseStatus === AttendeeResponseState.INVITED
                  ? -1
                  : 0,
          },
        },
      }),
    ]);
    return res[0];
  }

  // 新規の場合は参加上限確認
  const attendees = await db.teamActivityAttendanceResponse.findMany({
    where: {
      teamActivityId: teamActivityId,
      response: TeamActivityAttendanceResponseType.GOING,
    },
  });

  if (
    teamActivity.maxAttendees &&
    response === TeamActivityAttendanceResponseType.GOING &&
    attendees.length > teamActivity.maxAttendees
  ) {
    throw new Error("Exceed max attendees");
  }

  // ゲストの場合
  if (responseStatus === AttendeeResponseState.GUEST) {
    const guests = attendees.filter((a) => a.isGuest);
    if (
      teamActivity.maxGuestAttendees &&
      response === TeamActivityAttendanceResponseType.GOING &&
      guests.length > teamActivity.maxGuestAttendees
    ) {
      throw new Error("Exceed max guest attendees");
    }
  }

  // 招待者の場合
  if (responseStatus === AttendeeResponseState.GUEST) {
    const inviteds = attendees.filter((a) => a.isInvited);

    if (
      teamActivity.maxInvitationAttendees &&
      response === TeamActivityAttendanceResponseType.GOING &&
      inviteds.length > teamActivity.maxInvitationAttendees
    ) {
      throw new Error("Exceed max invited attendees");
    }
  }

  const res = await db.$transaction([
    db.personalActivity.create({
      data: {
        userId,
        activityType: [PersonalActivityType.TEAM_ACTIVITY],
        startDatetime: teamActivity.startDatetime,
        endDatetime: teamActivity.endDatetime,
        visibility: PersonalActivityVisibility.FOLLOWERS,
        sportId: teamActivity.sportId,
        teamActivityAttendanceResponse: {
          create: {
            teamActivityId,
            userId,
            response: response ?? TeamActivityAttendanceResponseType.MAYBE,
            isGuest: responseStatus === AttendeeResponseState.GUEST,
            isInvited: responseStatus === AttendeeResponseState.INVITED,
          },
        },
      },
      include: {
        teamActivityAttendanceResponse: true,
      },
    }),

    db.teamActivity.update({
      where: {
        id: teamActivityId,
      },
      data: {
        currentAttendees: {
          increment:
            response === TeamActivityAttendanceResponseType.GOING ? 1 : 0,
        },
        currentGuestAttendees: {
          increment:
            response === TeamActivityAttendanceResponseType.GOING &&
            responseStatus === AttendeeResponseState.GUEST
              ? 1
              : 0,
        },
        currentInvitationAttendees: {
          increment:
            response === TeamActivityAttendanceResponseType.GOING &&
            responseStatus === AttendeeResponseState.INVITED
              ? 1
              : 0,
        },
      },
    }),
  ]);

  const personalActivity = res[0];

  return personalActivity.teamActivityAttendanceResponse;
};

const createNew = async ({
  userId,
  teamId,
  data,
}: {
  userId: string;
  teamId: string;
  data: NewTeamActivityFormData;
}) => {
  if (!data.endDate) {
    data.endDate = data.startDate;
  }

  const startDateTime = dateFromString(data.startDate + " " + data.startTime);
  const endDateTime = dateFromString(data.endDate + " " + data.endTime);
  const db = getPrisma();

  return await db.teamActivity.create({
    data: {
      name: data.name,
      description: data.description,
      teamActivityType: data.teamActivityType,
      startDatetime: startDateTime.toISOString(),
      endDatetime: endDateTime.toISOString(),
      creatorId: userId,
      durationMinutes: endDateTime.diff(startDateTime, "minutes"),
      status: data.status,
      visibility: TeamActivityVisibility.TEAM_INTERNAL,
      teamId: teamId,
      place: data.places.length ? data.places[0].value : null,
      paymentMethod: [TeamActivityPaymentMethod.FACE_TO_FACE],
      priceForInvited: data.priceForInvited
        ? Number.parseInt(data.priceForInvited, 10)
        : null,
      priceForGuest: data.priceForGuest
        ? Number.parseInt(data.priceForGuest, 10)
        : null,
      priceForMember: data.priceForMember
        ? Number.parseInt(data.priceForMember, 10)
        : null,
      isInvitationAllowed: data.isInvitationAllowed ?? false,
      isGuestAllowed: data.isGuestAllowed ?? false,
      maxInvitationAttendees: data.maxInvitationAttendees ?? null,
      maxGuestAttendees: data.maxGuestAttendees ?? null,
      maxAttendees: data.maxAttendees ?? null,
      sportId: data.sportId ? data.sportId : null,
    },
  });
};

export default {
  getById,
  getByUserId,
  getUserResponse,
  getDropIns,
  respond,
  comment,
  createNew,
  canAttend,
};
