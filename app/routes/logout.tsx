import { redirect, type LoaderFunctionArgs } from "react-router";

import { Auth } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = new Auth();
  const user = await auth.isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const loggedOut = await auth.logout(request);
  console.log(loggedOut);
  return loggedOut;
};
