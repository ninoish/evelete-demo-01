import { getPrisma } from "~/services/database.server";

const getAll = async () => {
  const db = getPrisma();
  return await db.sport.findMany({});
};

const getForUserPreference = async () => {
  const db = getPrisma();

  return await db.sport.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: {
      users: {
        _count: "desc",
      },
    },
  });
};

export default {
  getAll,
  getForUserPreference,
};
