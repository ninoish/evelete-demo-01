import fs from "fs";

import {
  type Sport,
  SportGameEndFactor,
  SportRecordValue,
  SportResultCriteria,
} from "@prisma/client";

function convertRecordValue(value: string) {
  switch (value) {
    case "distance":
      return SportRecordValue.Distance;
    case "weight":
      return SportRecordValue.Weight;
    case "time":
      return SportRecordValue.Time;
    case "score":
      return SportRecordValue.Score;
  }
  return null;
}

function convertResultCriteria(value: string) {
  switch (value) {
    case "point":
      return SportResultCriteria.Point;
    case "judgement":
      return SportResultCriteria.Judgement;
    case "record":
      return SportResultCriteria.Record;
    case "survival":
      return SportResultCriteria.Survival;
    case "none":
      return SportResultCriteria.None;
  }
  return null;
}
function convertGameEndFactor(value: string) {
  switch (value) {
    case "count":
      return SportGameEndFactor.Count;
    case "score":
      return SportGameEndFactor.Score;
    case "survival":
      return SportGameEndFactor.Survival;
    case "time":
      return SportGameEndFactor.Time;
  }
  return null;
}

const data = fs
  .readFileSync("./prisma/seedData/sports20251015.csv")
  .toString()
  .split("\n")
  .map((e) => e.trim())
  .map((row) =>
    row.replace(/"([^"]*)"/g, (match, group1) => {
      // ダブルクォート内の , を | に置き換える
      return group1.replace(/,/g, "|");
    }),
  )
  .map((e) => e.split(",").map((e) => e.trim()))
  .filter((e, indx) => indx >= 1 && e[1])
  .map((e, indx) => {
    return {
      id: e[4],
      emoji: e[1],
      name: e[2],
      name_ja_JP: e[3],
      name_en_US: e[2],
      alias: "",
      alias_ja_JP: [e[3], e[5]].filter((v) => v).join(","),
      alias_en_US: "",
      slug: e[4],
      isUserPref: e[6] === "TRUE",
      isTeamPref: e[7] === "TRUE",
      isUserActivity: e[8] === "TRUE",
      isTeamActivity: e[9] === "TRUE",
      isOrgPref: e[10] === "TRUE",
      isPersonalEvent: e[11] === "TRUE",
      isPersonalEventEntryPoint: e[12] === "TRUE",
      isTeamEvent: e[13] === "TRUE",
      isTeamEventEntryPoint: e[14] === "TRUE",
      isEventResult: e[15] === "TRUE",
      isPersonalRecord: e[16] === "TRUE",
      resultCriteria: e[17]
        .split("|")
        .map((i) => convertResultCriteria(i.trim()))
        .filter((i) => i),
      gameEndFactor: e[18]
        .split("|")
        .map((i) => convertGameEndFactor(i.trim()))
        .filter((i) => i),
      recordValue: e[19] ? convertRecordValue(e[19]) : null,
    };
  });

// console.log(data);

export const sports: Sport[] = data;

export default sports;
