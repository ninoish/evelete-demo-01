import { type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/");
  }
  return {};
};

export default function MySportsEditRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>My sports edit</h1>
      <div>競技歴の編集</div>
    </div>
  );
}
