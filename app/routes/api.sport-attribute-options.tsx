import { type LoaderFunctionArgs } from "react-router";

import sportAttributeService from "~/services/sportAttributeService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const paramSportIds = url.searchParams.get("sportIds");

  console.log("paramSportIds", paramSportIds, url.searchParams);

  if (!paramSportIds) {
    return null;
  }

  const sportIds = paramSportIds.split(",").filter((si) => !!si.trim()) ?? [];
  if (!sportIds?.length) {
    return null;
  }

  console.log(sportIds);
  const sportAttributes =
    await sportAttributeService.getSportAttributeOptions(sportIds);

  console.log("sportAttributes", sportAttributes);
  if (sportAttributes === null) {
    return null;
  }

  return sportAttributes;
};
