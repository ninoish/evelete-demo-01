import { type LoaderFunctionArgs } from "react-router";

import { getAffiliationCategoryOptions } from "~/services/affiliationCategories.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const categories = await getAffiliationCategoryOptions();

  console.log("sports", categories);
  if (categories === null) {
    return null;
  }

  return categories;
};
