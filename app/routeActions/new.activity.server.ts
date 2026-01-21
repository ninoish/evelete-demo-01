import { DistanceUnit, WeightUnit } from "@prisma/client";
import type { RecordMaster } from "@prisma/client";
import dayjs from "dayjs";
import { redirect, type ActionFunctionArgs } from "react-router";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import { dateFromString } from "~/utils/datetime";
import { type PersonalActivityFormValues } from "~/types/validators/PersonalActivityFormSchema";

type RecordMasterValue = {
  recordMasterId: string;
  recordValue?: number;
  recordData?: any;
};

export default async function newActivityAction({
  request,
}: ActionFunctionArgs) {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.clone().formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log("rawData");
  console.log(rawData);

  const {
    activityType,
    name,
    description,
    status,
    sport,
    visibility,
    place,
    menus,
    startDate,
    startTime,
    endDate,
    endTime,
  } = rawData as PersonalActivityFormValues;

  const personalRecords = JSON.parse(rawData.personalRecords);
  const personalResults = JSON.parse(rawData.personalResults);
  const sportAttributes = JSON.parse(rawData.sportAttributes);
  const files = JSON.parse(rawData.files);

  // TODO: apply all activity type validations or throw error

  const start = dateFromString(startDate + " " + startTime).toDate();
  const end =
    endDate && endTime ? dayjs(endDate + " " + endTime).toDate() : null;

  const durationMinutes = end
    ? (end.getTime() - start.getTime()) / (60 * 1000)
    : null;

  const activityId = undefined;
  // TODO:
  const teamActivityId = undefined;

  console.log("user", user);
  console.log("menus", menus);

  if (activityId) {
    // TODO: edit
    return;
  }

  const db = getPrisma();

  let recordMasters = [] as RecordMaster[];
  if (personalRecords.length) {
    console.log(personalRecords);
    const recordMasterIds = personalRecords.reduce(
      (ids: Set<string>, pr: RecordMasterValue) => {
        ids.add(pr.recordMasterId);
        return ids;
      },
      new Set(),
    );
    recordMasters = await db.recordMaster.findMany({
      where: {
        id: {
          in: Array.from(recordMasterIds),
        },
      },
    });
  }

  const created = await db.personalActivity.create({
    data: {
      userId: user.id,
      name,
      description,
      activityType: [activityType],
      startDatetime: start,
      endDatetime: end,
      durationMinutes,
      status,
      place,
      sports: {
        create: {
          sportId: sport,
        },
      },
      personalRecords: {
        createMany: {
          data: personalRecords.map((pr: RecordMasterValue) => {
            const recordMaster = recordMasters.find(
              (rm) => rm.id === pr.recordMasterId,
            );
            return {
              userId: user.id,
              isHighlighted: false,
              formatVersion: 1,
              recordDatetime: start,
              recordMasterId: recordMaster?.id,
              recordValue: pr.recordValue,
            };
          }),
        },
      },
      menus: {
        create:
          menus?.map((menu: WorkoutFormMenu) => {
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

  if (!created) {
    return {
      formErrors: ["Failed to create the activity. Please try again later."],
    };
  }

  return redirect(`/users/${user.slug}/activities/${created.id}`);
}
