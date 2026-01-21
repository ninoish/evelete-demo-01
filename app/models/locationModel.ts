import { getPrisma } from "~/services/database.server";

const getStateAndCitiesByCountryId = async ({
  countryId,
}: {
  countryId: string;
}) => {
  const db = getPrisma();
  return await db.state.findMany({
    include: {
      cities: true, // City は State とリレーションしているため利用可能
    },
    where: {
      countryId,
    },
  });
};

const getPlacesByCityId = async ({ cityId }: { cityId: string }) => {
  const db = getPrisma();

  return await db.place.findMany({
    where: {
      cityId,
    },
  });
};

export default {
  getStateAndCitiesByCountryId,
  getPlacesByCityId,
};
