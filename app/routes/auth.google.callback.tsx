import { redirect, type LoaderFunctionArgs } from "react-router";

import { Auth } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = new Auth();
  const user = await auth.authenticate("google", request);
  const headers = await auth.refresh(request, user);
  return redirect("/", { headers });
};
