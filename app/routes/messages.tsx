import { type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  console.log(user);
  return { user };
};

export default function Messages() {
  const data = useLoaderData<typeof loader>();
  console.log(data.user);
  return (
    <div>
      <h1>Messages</h1>
      <ul>
        <li></li>
      </ul>
    </div>
  );
}
