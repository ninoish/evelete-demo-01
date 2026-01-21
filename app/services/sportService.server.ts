import { getPrisma } from "./database.server";

export const getSportOptions = async () => {
  const db = getPrisma();

  const sports = await db.sport.findMany({
    orderBy: {
      id: "asc",
    },
  });
  return sports;
};
