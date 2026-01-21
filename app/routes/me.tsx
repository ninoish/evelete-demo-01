import type { LoaderFunctionArgs } from "react-router";
import { Outlet, redirect, useLoaderData } from "react-router";
import MeLayout from "~/layouts/MeLayout";

import { Auth } from "~/services/auth.server";
import userServiceServer from "~/services/userService.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: optimize
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const me = await userServiceServer.getForProfileById(user.id);

  console.log(JSON.stringify(me));

  return { me };
};

export default function MeLayoutRoute() {
  const data = useLoaderData<typeof loader>();
  const { me } = data;

  return (
    
    <MeLayout me={me}>
      <Outlet />
    </MeLayout>
  );
}
