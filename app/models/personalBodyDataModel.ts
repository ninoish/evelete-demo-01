import { PersonalActivityStatus, PersonalActivityType } from "@prisma/client";

import type { BodyDataFormData } from "~/types/validators/BodyDataFormSchema";
import { getPrisma } from "~/services/database.server";
import { dateFromString } from "~/utils/datetime";

const addBodyData = async ({
  userId,
  data,
}: {
  userId: string;
  data: BodyDataFormData;
}) => {
  const measurementDatetime = dateFromString(
    data.measurementDate + " " + data.measurementTime,
  ).toDate();

  const db = getPrisma();

  return await db.personalBodyData.create({
    data: {
      userId: userId,
      description: data.description,
      measurementDatetime: measurementDatetime,
      weight: data.weight,
      height: data.height,
      bodyFatMass: data.bodyFatMass,
      bodyFatPercentage: data.bodyFatPercentage,
      bodyAge: data.bodyAge,
      consumedCalories: data.consumedCalories,
      bodyWater: data.bodyWater,
      proteinAmount: data.proteinAmount,
      mineralAmount: data.mineralAmount,
      muscleAmount: data.muscleAmount,
      abdominalCircumference: data.abdominalCircumference,
      chestCircumference: data.chestCircumference,
      waistCircumference: data.waistCircumference,
      hipCircumference: data.hipCircumference,
      personalActivity: {
        create: {
          userId: userId,
          name: `Body Data ${data.measurementDate} ${data.measurementTime}`,
          description: data.description,
          activityType: [PersonalActivityType.BODY_DATA],
          startDatetime: measurementDatetime,
          status: PersonalActivityStatus.PUBLISHED,
          visibility: data.visibility,
        },
      },
    },
    include: {
      personalActivity: true,
    },
  });
};

export default {
  addBodyData,
};
