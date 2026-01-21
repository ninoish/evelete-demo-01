import { getPrisma } from "~/services/database.server";
import countryData from "../masterData/country";
import stateData from "../masterData/state";
import cityData from "../masterData/city";

import type { Country, State } from "@prisma/client";

export const createCountryMaster = async () => {
  const db = getPrisma();
  return db.country.createManyAndReturn({
    data: countryData.map((country) => {
      return country;
    }),
  });
};

export const createStateMaster = async (countries: Country[]) => {
  const japan = countries.find((c) => c.code === "JP");
  const db = getPrisma();

  // TODO: state に countryId と zoom 値を持つ
  return db.state.createManyAndReturn({
    data: stateData.map((state) => {
      return { ...state, countryId: japan!.id, zoom: 10 };
    }),
  });
};

export const createCityMaster = async (states: State[]) => {
  const db = getPrisma();
  return db.city.createManyAndReturn({
    data: cityData
      .map((city: any) => {
        const state = states.find((state) => state.code === city.stateName);
        if (!state) {
          console.log("no state info", city);
          return null;
        }
        if (city.stateName) {
          delete city.stateName;
        }
        return {
          ...city,
          countryId: state.countryId,
          stateId: state.id,
        };
      })
      .filter((c: any) => c),
  });
};
