import { getPrisma } from "~/services/database.server";
import recordData from "../masterData/record";

export const createRecordMaster = async () => {
  const db = getPrisma();
  return db.recordMaster.createManyAndReturn({
    data: recordData.map((record) => {
      return record;
    }),
  });
};
