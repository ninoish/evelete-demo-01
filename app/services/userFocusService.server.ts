import { MAX_FOCUS_ITEMS_PER_USER } from "~/constants/userFocus";
import { getPrisma } from "./database.server";
import type { Prisma } from "@prisma/client";

const getByUserId = async (userId: string) => {
  const db = getPrisma();
  const data = await db.userFocus.findMany({
    where: {
      userId,
    },
    include: {
      recordMaster: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
  });
  return data;
};

const upsert = async (
  userId: string,
  recordMasterId: string,
  order: number,
) => {
  const db = getPrisma();

  const result = await db.userFocus.upsert({
    create: {
      userId,
      recordMasterId,
      data: {},
      displayOrder: order,
    },
    update: {
      userId,
      recordMasterId,
    },
    where: {
      userId_recordMasterId: {
        userId,
        recordMasterId,
      },
    },
  });

  console.log("upsert", result);
  return result;
};

const register = async (userId: string, recordMasterIds: string[]) => {
  const db = getPrisma();

  if (recordMasterIds.length > MAX_FOCUS_ITEMS_PER_USER) {
    throw new Error("Exceed maximum focuses");
  }

  await db.$transaction(async (t) => {
    // delete all
    await t.userFocus.deleteMany({
      where: {
        userId: userId,
      },
    });

    // create new
    const result = await t.userFocus.createMany({
      data: recordMasterIds.map((rmId, indx) => ({
        userId,
        recordMasterId: rmId,
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
