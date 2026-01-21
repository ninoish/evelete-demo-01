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

export default function MyMediaRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>My media</h1>
      <div>写真・動画</div>
    </div>
  );
}
