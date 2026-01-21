import { getPrisma } from "./database.server";

const MAX_SPORTS_PER_USER = 10;

const getByUserId = async (userId: string) => {
  const db = getPrisma();
  const data = await db.userSport.findMany({
    where: {
      userId,
    },
    include: {
      sport: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  });
  return data;
};

const upsert = async (
  userId: string,
  sportId: string,
  order: number,
) => {
  const db = getPrisma();

  const result = await db.userSport.upsert({
    create: {
      userId,
      sportId,
      data: {},
      displayOrder: order,
    },
    update: {
      userId,
      sportId,
    },
    where: {
      userId_sportId: {
        userId,
        sportId,
      },
    },
  });

  console.log("upsert", result);
  return result;
};

const register = async (userId: string, sportIds: string[]) => {
  const db = getPrisma();

  if (sportIds.length > MAX_SPORTS_PER_USER) {
    throw new Error("Exceed maximum focuses");
  }

  await db.$transaction(async (t) => {
    // delete all
    await t.userSport.deleteMany({
      where: {
        userId: userId,
      },
    });

    // create new
    const result = await t.userSport.createMany({
      data: sportIds.map((spId, indx) => ({
        userId,
        sportId: spId,
        data: {},
        displayOrder: indx,
      })),
    });

    console.log("upsert", result);
    return result;
  });
};

export default {
  getByUserId,
  upsert,
  register,
};
