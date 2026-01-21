import { type LoaderFunctionArgs } from "react-router";

import { getSportOptions } from "~/services/sportService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const sports = await getSportOptions();

  console.log("sports", sports);
  if (sports === null) {
    return null;
  }

  return sports.map((sport) => {
    return {
      alias: sport.alias_ja_JP,
      label: sport.name_ja_JP,
      value: sport.id,
    };
  });
};
