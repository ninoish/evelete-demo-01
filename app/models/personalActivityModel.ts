import {
  DistanceUnit,
  PersonalActivityStatus,
  PersonalActivityType,
  WeightUnit,
} from "@prisma/client";

import { WorkoutFormData } from "~/routes/new.workout";
import { getPrisma } from "~/services/database.server";
import { date, dateFromString } from "~/utils/datetime";

const addWorkout = async ({
  userId,
  data,
}: {
  userId: string;
  data: WorkoutFormData;
}) => {
  const start = dateFromString(data.startDate + " " + data.startTime);
  const startDatetime = start.toDate();
  const end = dateFromString(data.endDate + " " + data.endTime);
  const endDatetime = end.toDate();

  const db = getPrisma();
  const created = await db.personalActivity.create({
    data: {
      userId,
      description: data.description,
      activityType: [PersonalActivityType.WORKOUT],
      startDatetime: startDatetime,
      endDatetime: endDatetime,
      durationMinutes: (end.unix() - start.unix()) / 60,
      status: PersonalActivityStatus.PUBLISHED,
      sportId: data.sportId,
      menus: {
        create:
          data.menus?.map((menu: WorkoutFormMenu) => {
            return {
              name: menu.name,
              order: menu.setCount ? parseInt(menu.setCount, 10) : 1,
              durationSeconds: parseInt(menu.durationSeconds, 10),
              setCount: menu.setCount ? parseInt(menu.setCount, 10) : null,
              repetitionCount: menu.repetition
                ? parseInt(menu.repetition, 10)
                : null,
              totalCount:
                menu.setCount && menu.repetition
                  ? parseInt(menu.setCount, 10) * parseInt(menu.repetition, 10)
                  : null,
              weight: menu.weight ? parseFloat(menu.weight) : null,
              weightUnit: WeightUnit.KILOGRAM, // menu.weightUnit,
              distance: menu.distance ? parseFloat(menu.distance) : null,
              distanceUnit: DistanceUnit.METER, // menu.distanceUnit,
              // workout: menu.workoutMenuId,
            };
          }) ?? [],
      },
    },
  });

  const measurementDatetime = dateFromString(
    data.measurementDate + " " + data.measurementTime,
  ).toDate();

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
  addWorkout,
};
