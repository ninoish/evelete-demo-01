import {
  PersonalActivityStatus,
  PersonalActivityType,
  PersonalActivityVisibility,
} from "@prisma/client";
import { getPrisma } from "./database.server";
import {
  shouldUpdateFocus,
  compareCriteriaValues,
} from "~/utils/personalRecord";

const getRecordMastersForUserFocus = async (sportIds: string[]) => {
  const db = getPrisma();
  const recordMasters = await db.recordMaster.findMany({
    where: {
      canbeFocusIndex: true,
    },
  });
  return recordMasters;
};

const addPersonalRecord = async (
  userId: string,
  recordDatetime: Date,
  recordMasterId: string,
  recordValue: number,
  comment?: string,
  files?: File[],
  details?: Object,
) => {
  const db = getPrisma();

  // TODO: upload files

  const record = await db.personalRecord.create({
    data: {
      userId,
      isHighlighted: false,
      recordDatetime: recordDatetime,
      recordValue: recordValue,
      formatVersion: 1,
      recordMasterId,
      summary: JSON.stringify({
        recordValue: recordValue,
        ...details,
      }),
      detail: JSON.stringify({
        recordValue: recordValue,
        comment,
        ...details,
      }),
    },
  });

  // TODO : 集計やfocusの更新

  // focus の更新
  const focus = await db.userFocus.findFirst({
    where: {
      userId,
      recordMasterId,
    },
    include: {
      recordMaster: true,
    },
  });

  console.log("focus", focus);

  if (focus) {
    if (shouldUpdateFocus(focus, recordDatetime, recordValue)) {
      await db.userFocus.upsert({
        create: {
          userId,
          recordMasterId,
          value: recordValue,
          valueDatetime: recordDatetime,
          data: {
            value: recordValue,
          },
          displayOrder: 1,
        },
        update: {
          userId,
          recordMasterId,
          value: recordValue,
          valueDatetime: recordDatetime,
          data: {
            value: recordValue,
          },
        },
        where: {
          userId_recordMasterId: {
            userId,
            recordMasterId,
          },
        },
      });
    }
  }

  const activity = await db.personalActivity.create({
    data: {
      userId: userId,
      startDatetime: recordDatetime,
      status: PersonalActivityStatus.PUBLISHED,
      visibility: PersonalActivityVisibility.PUBLIC,
      activityType: [PersonalActivityType.RECORD],
      sportId: null,
      personalRecords: {
        connect: {
          id: record.id,
        },
      },
    },
  });

  return record;
};

export default {
  getRecordMastersForUserFocus,
  addPersonalRecord,
};
