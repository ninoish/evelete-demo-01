import dayjs from "dayjs";

import { getPrisma } from "./database.server";

const getLatestData = async (userId: string) => {
  const db = getPrisma();

  const data = await db.personalBodyData.findFirst({
    where: {
      userId: userId,
      measurementDatetime: {
        lt: dayjs().toDate(),
      },
    },
    orderBy: {
      measurementDatetime: "desc",
    },
  });

  return data;
};

// TODO: redisなど、かつ表示用にroundしたデータにする
const getRecentData = async (userId: string) => {
  const db = getPrisma();

  const data = await db.personalBodyData.findMany({
    where: {
      userId: userId,
      measurementDatetime: {
        lt: dayjs().toDate(),
      },
    },
    take: 100,
    orderBy: {
      measurementDatetime: "desc",
    },
  });

  return data;
};

const getById = async (userId: string, personalBodyDataId: string) => {
  const db = getPrisma();

  const data = await db.personalBodyData.findUnique({
    where: {
      userId: userId,
      id: personalBodyDataId,
    },
  });

  return data;
};

export default {
  getLatestData,
  getRecentData,
  getById,
};
