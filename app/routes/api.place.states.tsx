import { type LoaderFunctionArgs, data } from "react-router";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);

  const formData = await request.formData();
  const countryId = formData.get("countryId") as string;

  if (!countryId) {
    throw data({ errorMessage: "Invalid parameter" }, { status: 400 });
  }

  const db = getPrisma();

  const states = await db.state.findMany({
    where: {
      countryId: countryId,
    },
  });

  return { success: true, result: states };
};
