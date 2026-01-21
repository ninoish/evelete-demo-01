// マスターデータだけの更新用
import "dotenv/config";
import {
  createCityMaster,
  createCountryMaster,
  createStateMaster,
} from "./seedServices/geolocationMaster";
import {
  createAffiliationCategory,
  createSportAttributeMaster,
  createSportMaster,
} from "./seedServices/sportMaster";
import { createRecordMaster } from "./seedServices/recordMaster";

async function seedMasters() {
  const countries = await createCountryMaster();
  console.log("countries", countries.length);

  const states = await createStateMaster(countries);
  console.log("states", states.length);

  // TODO: city に zoom 値を持つ
  const cities = await createCityMaster(states);
  console.log("cities", cities.length);

  const sports = await createSportMaster();
  console.log("sports", sports.length);

  const sportAttributes = await createSportAttributeMaster(sports);
  console.log("sportAttributes", sportAttributes.length);

  // TODO: Sport category

  const affiliationCategories = await createAffiliationCategory();
  console.log("affiliationCategories", affiliationCategories.length);

  const recordMasters = await createRecordMaster();
  console.log("recordMasters", recordMasters.length);
}

seedMasters();
