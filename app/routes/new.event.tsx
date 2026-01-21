import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { useLoaderData, useSubmit } from "react-router";

import { Auth } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  for (const pair of body.entries()) {
    console.log(pair[0], pair[1], typeof pair[1]);
  }

  return redirect(`/events/`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  return { user };
};

export default function NewEventFormRoute() {
  const submit = useSubmit();

  const data = useLoaderData<typeof loader>();

  const handleSubmit = (values) => {
    console.log("parent handleSubmit", values);
    submit(values, { method: "post" });
  };

  return (
    <div>
      <h1>Create a new event</h1>
    </div>
  );
}
