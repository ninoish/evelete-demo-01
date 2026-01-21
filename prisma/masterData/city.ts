import fs from "fs";

import type { City } from "@prisma/client";
import { join } from "path";

const dirPath = "./prisma/seedData/countries/japan/cities";
const files = await fs.readdirSync(dirPath, { withFileTypes: true });

interface CitySeed
  extends Omit<City, "id" | "stateId" | "createdAt" | "updatedAt"> {
  stateName: string;
}

let dataJoined: CitySeed[] = [];
for (const file of files) {
  if (file.isFile()) {
    const fullPath = join(dirPath, file.name);
    // const content = await fs.promises.readFile(fullPath, "utf8");
    const data = fs
      .readFileSync(fullPath)
      .toString()
      .split("\n")
      .map((e) => e.trim())
      .map((e) => e.split(",").map((e) => e.trim()))
      .filter((e, indx) => indx >= 1 && e[1])
      .map((e) => {
        return {
          name: e[0],
          code: e[1],
          stateId: "",
          stateName: file.name.split(".")[0],
          latitude: parseFloat(e[2]),
          longitude: parseFloat(e[3]),
          zoom: parseFloat(e[4]),
          countryId: "",
        };
      });

    dataJoined = dataJoined.concat(data);
  }
}

// const data = fs
//   .readFileSync("./prisma/seedData/countries/japan/tokyo_cities.csv")
//   .toString()
//   .split("\n")
//   .map((e) => e.trim())
//   .map((e) => e.split(",").map((e) => e.trim()))
//   .filter((e, indx) => indx >= 1 && e[1])
//   .map((e) => {
//     return {
//       name: e[0],
//       code: e[1],
//       stateId: "",
//       latitude: parseFloat(e[2]),
//       longitude: parseFloat(e[3]),
//       zoom: parseFloat(e[4]),
//     };
//   });

const cities: CitySeed[] = dataJoined;

export default cities;
