import { getPrisma } from "./database.server";

const getUserById = async (userId: string, authedUserId: string | null) => {
  // TODO: access control by logged-in user id.
  const db = getPrisma();

  const user = await db.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });

  return user;
};

const getFollowersById = async (userId: string) => {
  const db = getPrisma();

  const user = await db.userFollow.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: true,
    },
  });

  return user;
};
const getFollowingsById = async (userId: string) => {
  const db = getPrisma();

  const user = await db.userFollow.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: true,
    },
  });

  return user;
};

const getBySlug = async (slug: string, authedUserId: string | null) => {
  // TODO: access control by logged-in user id.
  const db = getPrisma();

  const user = await db.user.findFirst({
    where: {
      slug: slug,
    },
    include: {
      _count: {
        select: {
          followers: true,
          followings: true,
          friendsWith: true,
        },
      },
      sports: {
        include: {
          sport: true,
        },
      },
      places: true,
    },
  });

  return user;
};

const getDetailsById = async (userId: string) => {
  // TODO: access control by logged-in user id.
  const db = getPrisma();
  const user = await db.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      sports: {
        include: {
          sport: {
            include: {
              attributes: true,
            },
          },
        },
      },
      places: {
        include: {
          place: true,
        },
      },
      userFocuses: true,
    },
  });

  return user;
};

const getForProfileById = async (userId: string) => {
  // TODO: access control by logged-in user id.
  const db = getPrisma();
  const user = await db.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    select: {
      id: true,
      profileImageUrl: true,
      coverImageUrl: true,
      displayName: true,
      slug: true,
      personalActivitySummary: true,
      userFocuses: true,
      organizations: true,
      activities: true,
      eventEntries: true,
      posts: true,
      personalRecords: {
        include: {
          recordMaster: true,
        },
      },
      friendsWith: {
        include: {
          friend: true,
        },
      },
      followers: {
        include: {
          follower: true,
        },
      },
      followings: {
        include: {
          following: true,
        },
      },
      teams: {
        include: {
          team: true,
        },
      },
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
      places: {
        include: {
          place: {
            include: {
              country: true,
              state: true,
              city: true,
            },
          },
        },
      },
      _count: {
        select: {
          friendsWith: true,
          followers: true,
          followings: true,
        },
      },
    },
  });

  return user;
};

export type MyProfileType = Awaited<ReturnType<typeof getForProfileById>>;

export default {
  getUserById,
  getBySlug,
  getDetailsById,
  getForProfileById,
  getFollowersById,
  getFollowingsById,
};
