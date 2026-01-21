import fs from "fs";

import { RecordCriteria, RecordUnitType } from "@prisma/client";

const convertToUnitType = (unitValue: string): string | null => {
  const capitalized =
    String(unitValue[0]).toUpperCase() + String(unitValue).slice(1);

  if ((capitalized as keyof typeof RecordUnitType) in RecordUnitType) {
    return RecordUnitType[capitalized as keyof typeof RecordUnitType];
  }

  return RecordUnitType.None;
};

const convertToCriteriaType = (value: string) => {
  if (value === "Distance") {
    return RecordCriteria.Distance;
  }
  if (value === "Height") {
    return RecordCriteria.Height;
  }
  if (value === "Speed") {
    return RecordCriteria.Speed;
  }
  if (value === "Weight") {
    return RecordCriteria.Weight;
  }
  if (value === "TimeLongerIsBetter") {
    return RecordCriteria.TimeLongerIsBetter;
  }
  if (value === "TimeShorterIsBetter") {
    return RecordCriteria.TimeShorterIsBetter;
  }
  if (value === "Time") {
    return RecordCriteria.Time;
  }
  if (value === "CountMoreIsBetter") {
    return RecordCriteria.CountMoreIsBetter;
  }
  if (value === "CountLessIsBetter") {
    return RecordCriteria.CountLessIsBetter;
  }
  if (value === "PointScore") {
    return RecordCriteria.PointScore;
  }
  if (value === "Index") {
    return RecordCriteria.Index;
  }
  if (value === "Percentage") {
    return RecordCriteria.Percentage;
  }
  console.log(value);
  return null;
};

const data = fs
  .readFileSync("./prisma/seedData/record_master_20251013.csv")
  .toString()
  .split("\n")
  .map((e) => e.trim())
  .map((e) => e.split(",").map((e) => e.trim()))
  .filter((e, indx) => indx >= 1 && e[1])
  .map((e) => {
    const criteria = e[3]
      .split("|")
      .map(convertToCriteriaType)
      .filter((c) => c);
    return {
      id: e[0],
      name: e[1],
      nameJa: e[2],
      criteria: criteria as RecordCriteria[],
      isAccumulative: e[4] === "TRUE",
      isTeamRecord: e[5] === "TRUE",
      canbeFocusIndex: e[6] === "TRUE",
      isNotCompetitive: e[7] === "TRUE",
      unitValue: convertToUnitType(e[8]),
      hasSportCompetition: e[9] === "TRUE",
      minValue: e[10] ? parseFloat(e[10]) : null,
      maxValue: e[11] ? parseFloat(e[11]) : null,
      emoji: e[12],
      standardValue: e[13] ? parseFloat(e[13]) : null,
      standardValueMargin: e[14] ? parseFloat(e[14]) : null,
      unitValueSteps: e[15] ? parseFloat(e[15]) : null,
    };
  });

export default data;
