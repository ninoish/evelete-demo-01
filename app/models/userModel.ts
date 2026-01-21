import {
  BiologicalGender,
  SportAttribute,
  UserPlaceType,
} from "@prisma/client";
import { getPrisma } from "~/services/database.server";

const updatePreferences = async ({
  userId,
  preferences,
}: {
  userId: string;
  preferences: {
    displayName: string;
    slug: string;
    birthday: string;
    bioGender: BiologicalGender;
    livingCountry: string;
    livingState: string;
    livingCity: string;
  };
}) => {
  try {
    const db = getPrisma();

    const user = await db.user.update({
      where: { id: userId },
      data: {
        displayName: preferences.displayName,
        slug: preferences.slug,
        hasSetupMinimumPrefs: true,
        birthday: new Date(preferences.birthday),
        biologicalGender: preferences.bioGender,
      },
    });

    const userLivingPlace = await db.userPlace.findFirst({
      where: {
        userId,
        placeType: UserPlaceType.Living,
      },
      include: {
        place: true,
      },
    });

    const { livingCountry, livingState, livingCity } = preferences;

    if (userLivingPlace) {
      if (
        userLivingPlace.place?.countryId === livingCountry &&
        userLivingPlace.place?.stateId === livingState &&
        userLivingPlace.place?.cityId === livingCity
      ) {
        return {
          user,
          userPlace: userLivingPlace,
        };
      } else {
        //
        userLivingPlace.place.countryId = livingCountry;
        userLivingPlace.place.stateId = livingState;
        userLivingPlace.place.cityId = livingCity;

        await db.userPlace.update({
          where: {
            userId_placeId: {
              userId: userId,
              placeId: userLivingPlace.placeId,
            },
          },
          data: { ...userLivingPlace.place },
        });
      }
    }

    const newPlace = await db.place.create({
      data: {
        countryId: livingCountry,
        stateId: livingState,
        cityId: livingCity,
      },
    });

    const userPlace = await db.userPlace.create({
      data: {
        placeId: newPlace.id,
        userId,
        placeType: UserPlaceType.Living,
      },
    });

    return {
      user,
      userPlace,
    };
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

const updateSportAttributePreference = async ({
  userId,
  sportAttributeIds,
}: {
  userId: string;
  sportAttributeIds: string[];
}) => {
  try {
    const db = getPrisma();
    const currentUserSports = await db.userSport.findMany({
      where: { userId },
      select: { sportId: true },
    });

    const currentSportIds = currentUserSports.map((record) => record.sportId);

    const targetSportAttrs = await db.sportAttribute.findMany({
      where: {
        id: {
          in: sportAttributeIds,
        },
      },
    });

    const validTargetSportAttrs: SportAttribute[] = [];

    for (let i = 0; i < targetSportAttrs.length; i++) {
      if (currentSportIds.indexOf(targetSportAttrs[i].sportId) >= 0) {
        validTargetSportAttrs.push(targetSportAttrs[i]);
      }
    }

    const currentUserSportAttrs = await db.userSportAttribute.findMany({
      where: { userId },
      include: {
        sportAttribute: true,
      },
    });

    // 2. 差分を計算
    const attrsToAdd = validTargetSportAttrs.filter(
      (tarAttr) =>
        !currentUserSportAttrs.find(
          (curAttr) => curAttr.sportAttributeId === tarAttr.id,
        ),
    );
    const attrsToRemove = currentUserSportAttrs.filter((curAttr) =>
      validTargetSportAttrs.find(
        (tarAttr) => tarAttr.id === curAttr.sportAttributeId,
      ),
    );

    // 新規追加
    if (attrsToAdd.length > 0) {
      await db.userSportAttribute.createMany({
        data: attrsToAdd.map((attr, indx) => ({
          userId,
          sportAttributeId: attr.id,
          displayOrder: indx + 1,
        })),
        skipDuplicates: true, // 重複する場合は無視
      });
    }

    // 古いレコードを削除
    if (attrsToRemove.length > 0) {
      await db.userSportAttribute.deleteMany({
        where: {
          userId,
          sportAttributeId: { in: attrsToAdd.map((attr) => attr.id) },
        },
      });
    }

    console.log("attrsToAdd", attrsToAdd);
    console.log("attrsToRemove", attrsToRemove);

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      error: e,
    };
  }
};

const updateSportPreference = async ({
  userId,
  sportIds,
}: {
  userId: string;
  sportIds: string[];
}) => {
  try {
    const db = getPrisma();
    const currentUserSports = await db.userSport.findMany({
      where: { userId },
      select: {
        sportId: true,
      },
    });

    const currentSportIds = currentUserSports.map((record) => record.sportId);
    // 2. 差分を計算
    const sportIdsToAdd = sportIds.filter(
      (id) => !currentSportIds.includes(id),
    );
    const sportIdsToRemove = currentSportIds.filter(
      (id) => !sportIds.includes(id),
    );

    // 新規追加
    if (sportIdsToAdd.length > 0) {
      console.log("yo", sportIdsToAdd);
      await db.userSport.createMany({
        data: sportIdsToAdd.map((sportId, indx) => ({
          userId,
          sportId,
          displayOrder: indx + 1,
        })),
        skipDuplicates: true, // 重複する場合は無視
      });
    }

    // 古いレコードを削除
    if (sportIdsToRemove.length > 0) {
      await db.userSport.deleteMany({
        where: {
          userId,
          sportId: { in: sportIdsToRemove },
        },
      });
    }

    console.log("sportIdsToAdd", sportIdsToAdd);
    console.log("sportIdsToRemove", sportIdsToRemove);

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      error: e,
    };
  }
};

export default {
  updatePreferences,
  updateSportPreference,
  updateSportAttributePreference,
};
