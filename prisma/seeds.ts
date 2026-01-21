/// memo : createManyAndReturn はchild relations を同時作成できない。

import { fakerJA as faker } from "@faker-js/faker";
import {
  type AffiliationCategory,
  EntryTypeEnum,
  TeamActivityAttendanceResponseType,
  TeamActivityStatus,
  TeamActivityVisibility,
  PersonalActivityStatus,
  PersonalActivityVisibility,
  TeamActivityType,
  EventEntryRequirementType,
  DistanceUnit,
  WeightUnit,
  UserPostVisibility,
  TeamActivityPaymentMethod,
  type TeamActivityAttendanceResponse,
} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

import { getPrisma } from "~/services/database.server";
import { date } from "~/utils/datetime";
import {
  getPersonalActivityType,
  getRandom,
  getRandomRange,
  getTeamActivityType,
  getUniqueRandomRange,
} from "./seedServices/utils";
import {
  createCityMaster,
  createCountryMaster,
  createStateMaster,
} from "./seedServices/geolocationMaster";
import {
  createAffiliationCategory,
  createSportAttributeMaster,
  createSportMaster,
} from "./seedServices/sportMaster";
import { createRecordMaster } from "./seedServices/recordMaster";

const USER_COUNT = 50;
const TEAM_COUNT = 30;
const ORG_COUNT = 20;
const MAX_TEAM_MEMBERS = 20;
const MIN_EVENT_PER_ORG = 10;
const MAX_EVENT_PER_ORG = 50;
const MAX_GROUPS_PER_TEAM = 3;
const MIN_TEAM_ACTIVITIES_PER_TEAM = 300;
const MAX_TEAM_ACTIVITIES_PER_TEAM = 450;
const MAX_TEAM_FOLLOWERS = 10;
const MAX_TEAM_INVITED_USERS = 10;
const MAX_TEAM_INVITED_NON_USERS = 4; // 非ログインユーザーへのメールアドレスによる招待
const MIN_PERSONAL_ACTIVITIES_PER_USER = 60;
const MAX_PERSONAL_ACTIVITIES_PER_USER = 160;
const MIN_USER_POSTS_PER_USER = 10;
const MAX_USER_POSTS_PER_USER = 30;
const MIN_ENTRY_POINT_PER_EVENT = 1;
const MAX_ENTRY_POINT_PER_EVENT = 10;

async function seed() {
  const db = getPrisma();

  const countries = await createCountryMaster();

  console.log("countries", countries.length);

  const states = await createStateMaster(countries);

  console.log("states", states.length);

  // TODO: city に zoom 値を持つ
  const cities = await createCityMaster(states);

  console.log("cities", cities.length);

  const sports = await createSportMaster();

  console.log("sports", sports.length);

  const sportAttributes = await createSportAttributeMaster(sports);

  console.log("sportAttributes", sportAttributes.length);

  // TODO: Sport category

  const affiliationCategories = await createAffiliationCategory();
  console.log("affiliationCategories", affiliationCategories.length);

  const recordMasters = await createRecordMaster();
  console.log("recordMasters", recordMasters.length);

  const us = [];
  const emails = faker.helpers.uniqueArray(faker.internet.email, USER_COUNT);

  for (let i = 1; i <= USER_COUNT; i++) {
    const u = {
      slug: faker.string.alphanumeric({ length: 8 }),
      displayName: faker.person.fullName(),
      email: emails[i - 1],
      description: faker.lorem.paragraph(),
      profileImageUrl: faker.image.url(),
      prefDistanceUnit: DistanceUnit.METER,
      prefWeightUnit: WeightUnit.KILOGRAM,
      prefSlugLastUpdatedAt: null,
    };
    us.push(u);
  }

  const users = await db.user.createManyAndReturn({
    data: us,
  });

  console.log("users", users.length);

  const uas = users.map((u) => {
    return {
      userId: u.id,
      provider: "Credentials",
      passwordHash:
        "$2y$12$/IQPi.yabe1FEhl7gDDQC.7LFoq1Y/ItaDBjkUwSg9fuMnhqElrua", // this is a hashed version of "abcd1234"
    };
  });

  const userAuths = await db.userAuth.createManyAndReturn({
    data: uas,
  });

  console.log("userAuths", userAuths.length);

  const uacs = [];
  for (const user of users) {
    const randomAffiliations: AffiliationCategory[] = getUniqueRandomRange(
      affiliationCategories,
      0,
      3,
    );
    for (const ra of randomAffiliations) {
      const uac = {
        userId: user.id,
        affiliationCategoryId: ra.id,
      };
      uacs.push(uac);
    }
  }

  const userAffiliationCategories =
    await db.userAffiliationCategory.createManyAndReturn({
      data: uacs,
    });

  console.log("userAffiliationCategories", userAffiliationCategories.length);

  const uFollows = [];
  for (const user of users) {
    const randomFollowings = getUniqueRandomRange(users, 0, 30);
    for (const following of randomFollowings) {
      uFollows.push({
        followerId: user.id,
        followingId: following.id,
      });
    }
  }

  const userFollows = await db.userFollow.createManyAndReturn({
    data: uFollows,
  });

  console.log("user follows", userFollows.length);

  const uSports = [];
  for (const user of users) {
    const randSports = getUniqueRandomRange(sports, 0, 5);
    let i = 1;
    for (const s of randSports) {
      uSports.push({
        userId: user.id,
        sportId: s.id,
        displayOrder: i
      });
      i++;
    }
  }

  const userSports = await db.userSport.createManyAndReturn({
    data: uSports,
  });

  console.log("user sports", userSports.length);

  const usas = [];
  for (const us of userSports) {
    const sas = sportAttributes.filter((sa) => sa.sportId === us.sportId);
    let i = 1;
    usas.push({
      userId: us.userId,
      sportAttributeId: getRandom(sas).id,
              displayOrder: i
      });
      i++;
  }

  const userSportAttributes = await db.userSportAttribute.createManyAndReturn({
    data: usas,
  });

  console.log("user sport attributes", userSportAttributes.length);

  const ts = [];
  for (let i = 1; i <= TEAM_COUNT; i++) {
    ts.push({
      displayName: faker.animal.dog(),
      abbreviation: faker.person.fullName(),
      slug: faker.string.alphanumeric({ length: 8 }),
      description: faker.lorem.paragraph(),
      imageUrl: faker.image.url(),
      canRequestToJoin: getRandom([true, false]),
      canSearch: getRandom([true, false]),
      canViewActivities: getRandom([true, false]),
      canViewMembers: getRandom([true, false]),
      currency: "JPY",
    });
  }

  const teams = await db.team.createManyAndReturn({
    data: ts,
  });

  console.log("teams", teams.length);

  const tacs = [];
  for (const team of teams) {
    const randomAffiliations: AffiliationCategory[] = getUniqueRandomRange(
      affiliationCategories,
      0,
      3,
    );
    for (const ra of randomAffiliations) {
      tacs.push({
        teamId: team.id,
        affiliationCategoryId: ra.id,
      });
    }
  }

  const teamAffiliationCategories =
    await db.teamAffiliationCategory.createManyAndReturn({
      data: tacs,
    });
  console.log("teamAffiliationCategories", teamAffiliationCategories.length);

  const tSports = [];
  for (const team of teams) {
    const randomSports = getUniqueRandomRange(sports, 0, 3);
    for (const r of randomSports) {
      tSports.push({
        teamId: team.id,
        sportId: r.id,
      });
    }
  }
  const teamSports = await db.teamSport.createManyAndReturn({
    data: tSports,
  });
  console.log("teamSports", teamSports.length);

  const tSportAttributes = [];
  for (const ts of teamSports) {
    const sas = sportAttributes.filter((sa) => sa.sportId === ts.sportId);
    const randomSportAttrs = getUniqueRandomRange(sas, 0, sas.length);
    for (const r of randomSportAttrs) {
      tSportAttributes.push({
        teamId: ts.teamId,
        sportAttributeId: r.id,
      });
    }
  }

  const teamSportAttributes = await db.teamSportAttribute.createManyAndReturn({
    data: tSportAttributes,
  });
  console.log("teamSportAttributes", teamSportAttributes.length);

  // TEAM MBMBERS
  const tMembers = [];
  for (const team of teams) {
    const randomUsers = getUniqueRandomRange(users, 1, MAX_TEAM_MEMBERS);
    let i = 0;
    for (const r of randomUsers) {
      tMembers.push({
        teamId: team.id,
        nickname: faker.hacker.noun(),
        userId: r.id,
        isOwner: false,
        role: "member",
        relationship: "player",
        canManageEvent: i % 2 === 0,
        canManagePayment: i % 3 === 0,
        canManageResult: i % 4 === 0,
        canManageTeamActivity: i % 6 === 0,
        canManageTeamMember: i % 4 === 0,
        isAdmin: i % 12 === 0,
        isPubliclyVisible: i % 4 !== 0,
      });
      i++;
    }
  }

  const teamMembers = await db.teamMember.createManyAndReturn({
    data: tMembers,
  });
  console.log("teamMembers", teamMembers.length);

  // TEAM GROUPS
  const tGroups = [];
  for (const team of teams) {
    const groups = Math.floor(Math.random() * (MAX_GROUPS_PER_TEAM + 1));
    if (groups === 0) {
      continue;
    }
    const tms = teamMembers.filter((tm) => tm.teamId === team.id);
    const randomTeamMembers = getUniqueRandomRange(tms, 0, tms.length);
    for (const r of randomTeamMembers) {
      tGroups.push({
        teamId: team.id,
        name: team.displayName + "グループ" + (tGroups.length + 1),
        description: "",
      });
    }
  }
  const teamGroups = await db.teamGroup.createManyAndReturn({
    data: tGroups,
  });
  console.log("teamGroups", teamGroups.length);

  const tGroupMembers = [];
  for (const tg of teamGroups) {
    const tms = teamMembers.filter((tm) => tm.teamId === tg.teamId);
    const randomTeamMembers = getUniqueRandomRange(tms, 0, tms.length);
    for (const r of randomTeamMembers) {
      tGroupMembers.push({
        teamGroupId: tg.id,
        teamMemberId: r.id,
      });
    }
  }
  const teamGroupMembers = await db.teamGroupMember.createManyAndReturn({
    data: tGroupMembers,
  });
  console.log("teamGroupMembers", teamGroupMembers.length);

  const tActivities = [];

  const japan = countries.find((c) => c.code === "JP");

  for (const team of teams) {
    const numOfActivities =
      Math.floor(
        Math.random() *
          (MAX_TEAM_ACTIVITIES_PER_TEAM - MIN_TEAM_ACTIVITIES_PER_TEAM),
      ) + MIN_TEAM_ACTIVITIES_PER_TEAM;

    const tms = teamMembers.filter((tm) => tm.teamId === team.id);

    const countryId = japan?.id;

    const taState = getRandom(states);

    const taCities = cities.filter((c) => c.stateId === taState.id);
    const taCity = taCities?.length > 0 ? getRandom(taCities) : null;

    for (let i = 1; i <= numOfActivities; i++) {
      const dt = faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2026-12-31T23:59:59.000Z",
      });
      const teamActivityType = getTeamActivityType(tActivities.length);
      const name: string =
        team.displayName + " : " + teamActivityType + (tActivities.length + 1);
      const description = faker.lorem.paragraphs();
      let endDatetime = null;
      if (tActivities.length % 3 === 0) {
        endDatetime = new Date(dt);
        endDatetime.setHours(dt.getHours() + 2 + Math.floor(Math.random() * 4));
      }
      const sport = getRandom(sports);

      const isGuestAllowed: boolean =
        teamActivityType === TeamActivityType.PRACTICE &&
        tActivities.length % 2 === 0;
      const isInvitationAllowed: boolean =
        teamActivityType === TeamActivityType.PRACTICE &&
        tActivities.length % 4 === 0;

      const maxAttendees: number | null =
        isGuestAllowed || isInvitationAllowed
          ? Math.floor(Math.random() * 36) + 4
          : tActivities.length % 4 === 0
            ? Math.floor(Math.random() * 36) + 4
            : null;

      tActivities.push({
        teamId: team.id,
        name,
        description,
        teamActivityType,
        sportId: sport.id,
        status: TeamActivityStatus.PUBLIC,
        visibility:
          i % 3 === 0
            ? TeamActivityVisibility.TEAM_INTERNAL
            : i % 4 === 0
              ? TeamActivityVisibility.TEAM_FOLLOWERS
              : TeamActivityVisibility.PUBLIC,
        priceForInvited: isInvitationAllowed
          ? (Math.floor(Math.random() * 7) + 1) * 200
          : null,
        priceForGuest: isGuestAllowed
          ? (Math.floor(Math.random() * 7) + 1) * 200
          : null,
        priceForMember:
          tActivities.length % 5 === 0
            ? null
            : (Math.floor(Math.random() * 9) + 1) * 100,
        isGuestAllowed: isGuestAllowed,
        isInvitationAllowed: isInvitationAllowed,
        maxAttendees: maxAttendees,
        maxGuestAttendees:
          isGuestAllowed && maxAttendees ? Math.floor(maxAttendees / 2) : null,
        maxInvitationAttendees:
          isInvitationAllowed && maxAttendees
            ? Math.floor(maxAttendees / 2)
            : null,
        startDatetime: dt,
        endDatetime,
        durationMinutes: endDatetime
          ? (endDatetime?.getTime() - dt.getTime()) / (60 * 1000)
          : null,
        place: faker.location.street(),
        placeName: faker.location.buildingNumber(),
        placeNameLanguage: "ja",
        placeCountryId: countryId ?? undefined,
        placeStateId: taState.id ?? undefined,
        placeCityId: taCity?.id ?? undefined,
        placeGoogleMapsPlaceId: undefined, // TODO: 入れたい
        placeDetails:
          "[fake]位置情報の詳細。 " + faker.lorem.lines({ min: 1, max: 10 }),
        paymentMethod: [TeamActivityPaymentMethod.FACE_TO_FACE],
        creatorId: getRandom(tms).userId,
      });
    }
  }
  const teamActivities = await db.teamActivity.createManyAndReturn({
    data: tActivities,
  });
  console.log("teamActivities", teamActivities.length);

  // Team Activity Sports
  const tActivitySportAttrs = [];
  const tActivityGroups = [];
  const tActivityResponses = [];
  let teamActivityCount = 0;
  for (const ta of teamActivities) {
    const attrs = sportAttributes.filter((sa) => sa.sportId === ta.sportId);
    ta.sportId;
    const taSportAttrs = getUniqueRandomRange(attrs, 0, 4);
    for (const taSportAttr of taSportAttrs) {
      tActivitySportAttrs.push({
        sportAttributeId: taSportAttr.id,
        teamActivityId: ta.id,
      });
    }
    // Team Activity Groups
    const taGroups = teamGroups.filter((tg) => tg.teamId === ta.teamId);
    const assignedGroups =
      teamActivityCount % 3 === 0
        ? getUniqueRandomRange(taGroups, 0, Math.max(2, taGroups.length))
        : null;
    if (assignedGroups) {
      for (const ataGroup of assignedGroups) {
        tActivityGroups.push({
          teamGroupId: ataGroup.id,
          teamActivityId: ta.id,
        });
      }
    }
    const taMembers = teamMembers.filter((tm) => tm.teamId === ta.teamId);
    const personalActivityMembers =
      assignedGroups === null
        ? getUniqueRandomRange(taMembers, 0, taMembers.length)
        : null;

    // Team Activity Attendance Responses

    const taResponses =
      personalActivityMembers?.map((pam, indx) => {
        const response = [
          TeamActivityAttendanceResponseType.GOING,
          TeamActivityAttendanceResponseType.NOT_GOING,
          TeamActivityAttendanceResponseType.MAYBE,
          TeamActivityAttendanceResponseType.CANCELED__USER_REASON,
        ][Math.floor(Math.random() * 4)];
        const resComment =
          indx % 4 === 0 ? null : faker.lorem.words({ min: 2, max: 8 });

        const cancelReason =
          response === TeamActivityAttendanceResponseType.CANCELED__USER_REASON
            ? faker.lorem.words({ min: 2, max: 8 })
            : null;
        return {
          isGuest: false,
          isInvited: false,
          userId: pam.userId,
          response: response,
          responseComment: resComment,
          cancelReason: cancelReason,
          teamActivityId: ta.id,
        };
      }) ?? [];
    for (const taResponse of taResponses) {
      tActivityResponses.push(taResponse);
    }

    if (ta.isGuestAllowed && ta.maxGuestAttendees) {
      const dropinAttendees = getUniqueRandomRange(
        users,
        0,
        ta.maxGuestAttendees,
      ).filter((candid) => {
        // メンバーは除外
        return !taMembers.find((mem) => mem.userId === candid.id);
      });

      const dropinResponses =
        dropinAttendees?.map((dat, indx) => {
          const response = [
            TeamActivityAttendanceResponseType.GOING,
            TeamActivityAttendanceResponseType.CANCELED__USER_REASON,
          ][Math.floor(Math.random() * 2)];

          const resComment =
            indx % 4 === 0 ? null : faker.lorem.words({ min: 2, max: 8 });
          const cancelReason =
            response ===
            TeamActivityAttendanceResponseType.CANCELED__USER_REASON
              ? faker.lorem.words({ min: 2, max: 8 })
              : null;
          return {
            isGuest: true,
            isInvited: false,
            userId: dat.id,
            response: response,
            responseComment: resComment,
            cancelReason: cancelReason,
            teamActivityId: ta.id,
          };
        }) ?? [];
      for (const diRes of dropinResponses) {
        tActivityResponses.push(diRes);
      }
    }

    // TODO: invited ユーザーのダミーデータ追加

    teamActivityCount++;
  }

  const teamActivitySportAttributes =
    await db.teamActivitySportAttribute.createManyAndReturn({
      data: tActivitySportAttrs,
    });
  console.log(
    "teamActivitySportAttributes",
    teamActivitySportAttributes.length,
  );

  const teamActivityGroups =
    await db.teamActivityGroupAssignment.createManyAndReturn({
      data: tActivityGroups,
    });
  console.log("teamActivityGroups", teamActivityGroups.length);

  const teamActivityAttendanceResponses =
    await db.teamActivityAttendanceResponse.createManyAndReturn({
      data: tActivityResponses,
    });
  console.log(
    "teamActivityAttendanceResponses",
    teamActivityAttendanceResponses.length,
  );

  const responseGoingSummary = teamActivityAttendanceResponses
    .filter((res) => res.response === TeamActivityAttendanceResponseType.GOING)
    .reduce(
      (sum, res) => {
        const item = sum.find((r) => r.teamActivityId === res.teamActivityId);
        if (item) {
          item.responses.push(res);
        } else {
          sum.push({
            teamActivityId: res.teamActivityId,
            responses: [res],
          });
        }
        return sum;
      },
      [] as {
        teamActivityId: string;
        responses: TeamActivityAttendanceResponse[];
      }[],
    );

  const updateResponses = await db.$transaction(
    responseGoingSummary.map((res) => {
      const upd = {
        where: {
          id: res.teamActivityId,
        },
        data: {
          currentAttendees: res.responses.length,
          currentInvitationAttendees: res.responses.filter((r) => r.isInvited)
            .length,
          currentGuestAttendees: res.responses.filter((r) => r.isGuest).length,
        },
      };
      return db.teamActivity.update(upd);
    }),
  );

  console.log("updateResponses", updateResponses.length);
  const tFollows = [];
  for (const team of teams) {
    const teamMemberUserIds = teamMembers
      .filter((tm) => tm.teamId === team.id)
      .map((tm) => tm.userId);
    const nonMembers = users.filter((u) => !teamMemberUserIds.includes(u.id));
    const followers = getUniqueRandomRange(
      nonMembers,
      0,
      Math.max(nonMembers.length, MAX_TEAM_FOLLOWERS),
    );
    for (const f of followers) {
      tFollows.push({
        teamId: team.id,
        userId: f.id,
      });
    }
  }
  const teamFollows = await db.teamFollow.createManyAndReturn({
    data: tFollows,
  });
  console.log("teamFollows", teamFollows.length);

  const tMemberInvitations = [];
  const statuses = ["送信済み", "承認", "拒否"];
  for (const team of teams) {
    const teamMemberUserIds = teamMembers
      .filter((tm) => tm.teamId === team.id)
      .map((tm) => tm.userId);
    const nonMembers = users.filter((u) => !teamMemberUserIds.includes(u.id));
    const invitedUsers = getUniqueRandomRange(
      nonMembers,
      0,
      Math.max(nonMembers.length, MAX_TEAM_INVITED_USERS),
    );
    for (const u of invitedUsers) {
      const status: string = statuses[tMemberInvitations.length % 3];
      tMemberInvitations.push({
        uuidToken: uuidv4(),
        teamId: team.id,
        userId: u.id,
        status,
        senderId: teamMemberUserIds[0],
      });
    }

    // 未登録のメールアドレスに招待を送る
    for (
      let i = 0;
      i < Math.floor(Math.random() * (MAX_TEAM_INVITED_NON_USERS + 1));
      i++
    ) {
      const status: string = statuses[tMemberInvitations.length % 3];
      tMemberInvitations.push({
        uuidToken: uuidv4(),
        teamId: team.id,
        emailForNonUser: "ninoish.dev@gmail.com",
        status,
        senderId: teamMemberUserIds[0],
      });
    }
  }
  const teamMemberInvitations =
    await db.teamMemberInvitation.createManyAndReturn({
      data: tMemberInvitations,
    });
  console.log("teamMemberInvitations", teamMemberInvitations.length);

  // ORGANIZATIONS
  const orgs = [];
  for (let i = 1; i <= ORG_COUNT; i++) {
    orgs.push({
      slug: faker.string.alphanumeric({ length: 8 }),
      displayName: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      imageUrl: faker.image.url(),
      isVerified: false,
    });
  }
  const organizations = await db.organization.createManyAndReturn({
    data: orgs,
  });
  console.log("organizations", organizations.length);

  const evts = [];
  let orgSports: {
    organizationId: string;
    sportId: string;
  }[] = [];
  let orgSportAttributes: {
    organizationId: string;
    sportAttributeId: string;
  }[] = [];
  let orgMembers: {
    organizationId: string;
    userId: string;
    role: string;
  }[] = [];

  for (const org of organizations) {
    for (
      let i = 0;
      i <
      Math.floor(
        Math.random() * MIN_EVENT_PER_ORG +
          (MAX_EVENT_PER_ORG - MIN_EVENT_PER_ORG),
      );
      i++
    ) {
      const dt = faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2025-12-31T23:59:59.000Z",
      });

      evts.push({
        name: faker.commerce.productName(),
        organizationId: org.id,
        eventType: "",
        imageUrl: faker.image.url(),
        startDatetime: dt,
        endDatetime: date(dt).add(8, "hours").toISOString(),
      });
    }

    const ss = getUniqueRandomRange(sports, 1, 3);
    const orgSportIds = ss.map((os) => os.id);
    const spAttrs = sportAttributes.filter((sa) =>
      orgSportIds.includes(sa.sportId),
    );
    const oSportAttrs = getUniqueRandomRange(spAttrs, 1, 3);
    const oMembers = getUniqueRandomRange(users, 1, 5);

    orgSports = [
      ...orgSports,
      ...ss.map((s) => ({
        organizationId: org.id,
        sportId: s.id,
      })),
    ];
    orgSportAttributes = [
      ...orgSportAttributes,
      ...oSportAttrs.map((sa) => ({
        organizationId: org.id,
        sportAttributeId: sa.id,
      })),
    ];
    orgMembers = [
      ...orgMembers,
      ...oMembers.map((u, indx) => ({
        organizationId: org.id,
        userId: u.id,
        role: indx === 0 ? "admin" : "member",
      })),
    ];
  }
  const events = await db.event.createManyAndReturn({
    data: evts,
  });
  console.log("events", events.length);

  const organizationSports = await db.organizationSport.createManyAndReturn({
    data: orgSports,
  });
  console.log("organizationSports", organizationSports.length);

  const organizationSportAttributes =
    await db.organizationSportAttribute.createManyAndReturn({
      data: orgSportAttributes,
    });
  console.log(
    "organizationSportAttributes",
    organizationSportAttributes.length,
  );

  const organizationMembers = await db.organizationMember.createManyAndReturn({
    data: orgMembers,
  });
  console.log("organizationMembers", organizationMembers.length);

  const evtEntryPoints = [];
  for (const event of events) {
    const numberOfEntryPoints = getRandomRange(
      MIN_ENTRY_POINT_PER_EVENT,
      MAX_ENTRY_POINT_PER_EVENT,
    );

    for (let i = 0; i < numberOfEntryPoints; i++) {
      evtEntryPoints.push({
        eventId: event.id,
        name: faker.airline.airport().name,
        description: faker.lorem.text(),
        startDatetime: date(event.startDatetime).add(i, "days").toDate(),
        endDatetime:
          i % 2 === 0
            ? date(event.startDatetime).add(i, "days").add(3, "hours").toDate()
            : null,
        allowTempTeam: i % 6 === 0,
        entryType: i % 3 === 0 ? EntryTypeEnum.Team : EntryTypeEnum.Personal,
      });
    }
  }

  const eventEntryPoints = await db.eventEntryPoint.createManyAndReturn({
    data: evtEntryPoints,
  });
  console.log("eventEntryPoints", eventEntryPoints.length);

  const evtEntryPointSports = [];
  let evtEntryPointSportAttributes: {
    sportAttributeId: string;
    eventEntryPointId: string;
  }[] = [];
  let evtEntryRequirements: {
    eventEntryPointId: string;
    type: EventEntryRequirementType;
    intValue?: number;
    stringValue?: string;
  }[] = [];

  for (const eventEntryPoint of eventEntryPoints) {
    const entrySport = getRandom(sports);
    evtEntryPointSports.push({
      sportId: entrySport.id,
      eventEntryPointId: eventEntryPoint.id,
    });

    const sas = sportAttributes.filter((sa) => sa.sportId === entrySport.id);
    evtEntryPointSportAttributes = [
      ...evtEntryPointSportAttributes,
      ...getUniqueRandomRange(sas, 0, 5).map((sa) => ({
        sportAttributeId: sa.id,
        eventEntryPointId: eventEntryPoint.id,
      })),
    ];

    evtEntryRequirements = [
      ...evtEntryRequirements,
      ...getUniqueRandomRange(
        Object.values(EventEntryRequirementType),
        0,
        5,
      ).map((reqType) => {
        const valueObj =
          reqType === EventEntryRequirementType.Qualification
            ? {
                stringValue: faker.lorem.slug(),
              }
            : reqType === EventEntryRequirementType.LivingArea ||
                reqType === EventEntryRequirementType.WorkingArea
              ? {
                  stringValue: getRandom(cities).id,
                }
              : reqType === EventEntryRequirementType.AffiliationCategory
                ? {
                    stringValue: faker.lorem.slug(),
                  }
                : {
                    intValue: getRandomRange(0, 100),
                  };
        return {
          eventEntryPointId: eventEntryPoint.id,
          type: reqType,
          ...valueObj,
        };
      }),
    ];
  }

  const eventEntryPointSports =
    await db.eventEntryPointSport.createManyAndReturn({
      data: evtEntryPointSports,
    });
  console.log("eventEntryPointSports", eventEntryPointSports.length);

  const eventEntryPointSportAttributes =
    await db.eventEntryPointSportAttribute.createManyAndReturn({
      data: evtEntryPointSportAttributes,
    });
  console.log(
    "eventEntryPointSportAttributes",
    eventEntryPointSportAttributes.length,
  );

  const eventEntryRequirements =
    await db.eventEntryRequirement.createManyAndReturn({
      data: evtEntryRequirements,
    });
  console.log("eventEntryRequirements", eventEntryRequirements.length);

  // PERSONAL ACTIVITIES

  const pas = [];
  for (const user of users) {



    const userSportIds = userSports
      .filter((us) => us.userId === user.id)
      .map((us) => us.sportId);

    if(!userSportIds.length ) {
      continue;
    }

    const paSports = getUniqueRandomRange(userSportIds, 1, 3);



    for (
      let i = 0;
      i <
      Math.floor(
        Math.random() *
          (MAX_PERSONAL_ACTIVITIES_PER_USER - MIN_PERSONAL_ACTIVITIES_PER_USER),
      ) +
        MIN_PERSONAL_ACTIVITIES_PER_USER;
      i++
    ) {
      const dt = faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2025-12-31T23:59:59.000Z",
      });

      pas.push({
        name: faker.word.noun(),
        userId: user.id,
        description: faker.lorem.paragraphs(),
        activityType: getPersonalActivityType(pas.length),
        startDatetime: dt,
        endDatetime: date(dt).add(2, "hours").toISOString(),
        asGuest: false,
        place: i % 3 === 0 ? null : faker.location.street(),
        sportId: paSports[Math.floor(Math.random() * paSports.length)],
        status:
          i % 10 === 0
            ? PersonalActivityStatus.DRAFT
            : PersonalActivityStatus.PUBLISHED,
        visibility:
          i % 3 === 0
            ? PersonalActivityVisibility.PRIVATE
            : PersonalActivityVisibility.PUBLIC,
      });
    }
  }
  const personalActivities = await db.personalActivity.createManyAndReturn({
    data: pas,
  });
  console.log(
    "personalActivities without team activity",
    personalActivities.length,
  );


  // const personalActivitySports =
  //   await db.personalActivitySport.createManyAndReturn({
  //     data: paSports,
  //   });
  // console.log("personalActivitySports", personalActivitySports.length);

  const paSportAttributes: {
    personalActivityId: string;
    sportAttributeId: string;
  }[] = [];
  for (const pa of personalActivities) {
    const saIds = sportAttributes
      .filter((sa) => sa.sportId === pa.sportId)
      ?.map((sa) => sa.id);
    const psaIds = getUniqueRandomRange(saIds, 0, Math.min(2, saIds.length));
    psaIds.map((psaId) => {
      paSportAttributes.push({
        personalActivityId: pa.id,
        sportAttributeId: psaId,
      });
    });
  }
  const personalActivitySportAttributes =
    await db.personalActivitySportAttribute.createManyAndReturn({
      data: paSportAttributes,
    });
  console.log(
    "personalActivitySportAttributes",
    personalActivitySportAttributes.length,
  );

  // USER POSTS
  const uPosts = [];
  for (const user of users) {
    for (
      let i = 0;
      i <
      Math.floor(
        Math.random() * (MAX_USER_POSTS_PER_USER - MIN_USER_POSTS_PER_USER),
      ) +
        MIN_USER_POSTS_PER_USER;
      i++
    ) {
      const dt = faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2025-12-31T23:59:59.000Z",
      });
      uPosts.push({
        userId: user.id,
        body: faker.lorem.paragraphs(),
        summaryJson: JSON.stringify({
          body: faker.lorem.paragraphs(),
        }),
        visibility: getRandom([
          UserPostVisibility.CONNECTIONS,
          UserPostVisibility.PRIVATE,
          UserPostVisibility.PUBLIC,
        ]),
        createdAt: dt,
        textForSearch: faker.lorem.sentence(),
      });
    }
  }

  const userPosts = await db.userPost.createManyAndReturn({
    data: uPosts,
  });
  console.log("userPosts", userPosts.length);

  let upLikes: {
    userPostId: string;
    userId: string;
    isLiked: boolean;
  }[] = [];
  let upComments: {
    userPostId: string;
    userId: string;
    comment: string;
  }[] = [];
  for (const userPost of userPosts) {
    const otherUserIds = users
      .filter((u) => u.id !== userPost.userId)
      .map((u) => u.id);
    const likedUserIds = getUniqueRandomRange(otherUserIds, 0, 10);
    upLikes = [
      ...upLikes,
      ...likedUserIds.map((uid) => ({
        userPostId: userPost.id,
        userId: uid,
        isLiked: true,
      })),
    ];

    const commentUserIds = getUniqueRandomRange(otherUserIds, 0, 5);
    upComments = [
      ...upComments,
      ...commentUserIds.map((uid) => ({
        userPostId: userPost.id,
        userId: uid,
        comment: faker.lorem.sentences(),
      })),
    ];
  }

  const userPostLikes = await db.userPostLike.createManyAndReturn({
    data: upLikes,
  });
  console.log("userPostLikes", userPostLikes.length);

  const userPostComments = await db.userPostComment.createManyAndReturn({
    data: upComments,
  });
  console.log("userPostComments", userPostComments.length);
}

seed();
