import { getPrisma } from "./database.server";

const getSportAttributeOptions = async (sportIds: string[]) => {
  const db = getPrisma();
  const sportAttributes = await db.sportAttribute.findMany({
    include: {
      sport: true,
    },
    where: {
      sportId: {
        in: sportIds,
      },
    },
  });
  return sportAttributes;
};

export default {
  getSportAttributeOptions,
};
