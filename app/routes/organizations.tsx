import { type LoaderFunctionArgs, json } from "react-router";
import { useLoaderData } from "react-router";
import { Outlet } from "react-router";

import { Auth } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  return Response.json({ user });
};

export default function OrganizationsRoute() {
  const data = useLoaderData<typeof loader>();

  return <Outlet />;
}
