import { getPrisma } from "./database.server";

const getByUserSlug = async (
  slug: string,
  meId: string | null, // guest is null
  from: Date,
  to: Date,
) => {
  const db = getPrisma();

  const user = await db.user.findUnique({
    where: {
      slug: slug,
    },
    include: {
      followers: true,
    },
  });

  if (!user) {
    // TODO:
    return [];
  }
  if (
    user.id !== meId &&
    user.prefIsPrivateAccount &&
    user.followers.find((f) => f.followerId === meId)
  ) {
    // TODO:
    return [];
  }
  // console.log("getByUserSlug", slug, from, to);

  const activities = await db.personalActivity.findMany({
    where: {
      startDatetime: {
        gt: from,
        lt: to,
      },
      userId: user.id,
    },
    include: {
      user: true,
    },
    orderBy: {
      startDatetime: "asc",
    },
  });

  //  console.log(activities);
  return activities;
};

const getById = async (personalActivityId: string, userId: string | null) => {
  const db = getPrisma();
  // TODO: access control
  const activity = await db.personalActivity.findFirstOrThrow({
    where: {
      id: personalActivityId,
    },
    include: {
      personalRecords: {
        include: {
          recordMaster: true
        }
      },
      personalResults: {
        include: {
          
        }
      },
    bodyData: true,
    event: true,
    sport: true,
    sportAttributes: true,
    teamActivityAttendanceResponse: true,
    menus: true,
    }
  });
  return activity;
};

export default {
  getByUserSlug,
  getById,
};
