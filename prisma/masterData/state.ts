import fs from "fs";

import type { State } from "@prisma/client";

const data = fs
  .readFileSync("./prisma/seedData/countries/japan/japan_prefectures.csv")
  .toString()
  .split("\n")
  .map((e) => e.trim())
  .map((e) => e.split(",").map((e) => e.trim()))
  .filter((e, indx) => indx >= 1 && e[1])
  .map((e) => {
    return {
      name: e[0],
      code: e[1],
      latitude: parseFloat(e[2]),
      longitude: parseFloat(e[3]),
    };
  });

// console.log(data);

const states: Omit<
  State,
  "id" | "zoom" | "countryId" | "createdAt" | "updatedAt"
>[] = data;

export default states;
