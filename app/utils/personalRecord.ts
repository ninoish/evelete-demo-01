import type { Prisma } from "@prisma/client";
import { RecordCriteria, UserFocusValueType } from "@prisma/client";
import { date } from "./datetime";

export const convertCriteriaToUnit = (criteria: RecordCriteria) => {
  // TODO: km と m, mile などの差分を考慮
  switch (criteria) {
    case RecordCriteria.Distance: {
      return "km";
    }
    case RecordCriteria.Weight: {
      return "kg";
    }
    case RecordCriteria.CountLessIsBetter: {
      return "回";
    }
    case RecordCriteria.CountMoreIsBetter: {
      return "回";
    }
    case RecordCriteria.Height: {
      return "cm";
    }
    case RecordCriteria.Index: {
      return "";
    }
  }
};

export const shouldUpdateFocus = (
  focus: Prisma.UserFocusGetPayload<{
  include: {
    recordMaster: true
  };
}>,
  recordDatetime: Date,
  recordValue: number,
) => {
  switch (focus.valueType) {
    case UserFocusValueType.LatestValue:
      if (!focus.valueDatetime) {
        return true;
      }
      const dt = date(focus.valueDatetime);
      return dt.diff(recordDatetime) < 0;
    case UserFocusValueType.BestValue:
      if (!focus.value) {
        return true;
      }
      return compareCriteriaValues(
        focus.recordMaster.criteria[0],
        focus.value,
        recordValue,
      );
  }
  return false;
};

export const compareCriteriaValues = (
  criteria: RecordCriteria,
  compared: number | null,
  comparing: number,
) => {
  if (!compared) {
    return true;
  }
  switch (criteria) {
    case RecordCriteria.CountLessIsBetter:
      return compared > comparing;
    case RecordCriteria.CountMoreIsBetter:
      return compared < comparing;
    case RecordCriteria.Distance:
      return compared < comparing;
    case RecordCriteria.Height:
      return compared < comparing;
    case RecordCriteria.Speed:
      return compared < comparing;
    case RecordCriteria.Weight:
      return compared < comparing;
    case RecordCriteria.TimeLongerIsBetter:
      return compared < comparing;
    case RecordCriteria.TimeShorterIsBetter:
      return compared > comparing;
    case RecordCriteria.PointScore:
      return compared < comparing;
    case RecordCriteria.Index:
      return compared < comparing;
    case RecordCriteria.Percentage:
      return compared < comparing;
    default:
      return true; // TODO:
  }
};
