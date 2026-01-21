import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import { redirect, useLoaderData, useSubmit } from "react-router";

import { Auth } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  return redirect(`/organizations/`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  return { user };
};

export default function NewOrganizationFormRoute() {
  const submit = useSubmit();

  const data = useLoaderData<typeof loader>();

  const handleSubmit = (values: Event) => {
    console.log("parent handleSubmit", values);
    submit(values, { method: "post" });
  };

  return (
    <div>
      <h1>Create a new organization</h1>
    </div>
  );
}
