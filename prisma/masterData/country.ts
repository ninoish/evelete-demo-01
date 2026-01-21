import fs from "fs";

import type { Country, Sport } from "@prisma/client";

const data = fs
  .readFileSync("./prisma/seedData/countries/countries.csv")
  .toString()
  .split("\n")
  .map((e) => e.trim())
  .map((e) => e.split(",").map((e) => e.trim()))
  .filter((e, indx) => indx >= 1 && e[1])
  .map((e, indx) => {
    const langs = e[5]?.split("|") || [];
    return {
      name: e[0],
      code: e[1],
      latitude: parseFloat(e[2]),
      longitude: parseFloat(e[3]),
      zoom: parseFloat(e[4]),
      languages: langs,
    };
  });

// console.log(data);

const countries: Omit<Country, "id" | "createdAt" | "updatedAt">[] = data;

export default countries;
