import { getPrisma } from "~/services/database.server";

const getById = async ({ id }: { id: string }) => {
  const db = getPrisma();

  const entryPoint = await db.eventEntryPoint.findFirstOrThrow({
    where: {
      id: id,
    },
    include: {
      event: true,
      sports: {
        include: {
          sport: true,
        },
      },
      sportAttributes: true,
    },
  });

  return entryPoint;
};

export default {
  getById,
};
