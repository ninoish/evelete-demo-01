import { type LoaderFunctionArgs, data } from "react-router";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);

  const formData = await request.formData();

  const db = getPrisma();

  const countries = await db.country.findMany({});

  return { success: true, result: countries };
};
