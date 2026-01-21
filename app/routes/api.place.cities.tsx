import { type LoaderFunctionArgs, data } from "react-router";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);

  const formData = await request.formData();
  const countryId = formData.get("countryId") as string;
  const stateId = formData.get("stateId") as string;

  if (!countryId || !stateId) {
    throw data({ errorMessage: "Invalid parameter" }, { status: 400 });
  }

  const db = getPrisma();

  const cities = await db.city.findMany({
    where: {
      countryId: countryId,
      stateId: stateId,
    },
  });

  return { success: true, result: cities };
};
