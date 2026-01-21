import {
  data,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from "react-router";
import { Link, Outlet, useLoaderData } from "react-router";
import UserLayout from "~/layouts/UserLayout";

import { Auth } from "~/services/auth.server";
import userService from "~/services/userService.server";

export const meta: MetaFunction = () => {
  return [
    { title: "User | Evelete" },
    { name: "description", content: "Welcome to Evelete!" },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (!params.slug) {
    return redirect("/");
  }
  const authUser = await new Auth().isAuthenticated(request);

  const user = await userService.getBySlug(params.slug, authUser?.id ?? null);

  if (!user) {
    throw data({ errorMessage: "ユーザーが見つかりません" }, { status: 404 });
  }

  return { user, authUser };
};

export default function UserRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <UserLayout user={data.user}>
      <Outlet />
    </UserLayout>
  );
}
