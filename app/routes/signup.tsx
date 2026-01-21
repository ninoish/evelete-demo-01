import {
  Form,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { Link, useActionData } from "react-router";
import { tv } from "tailwind-variants";

import { GoogleForm } from "~/components/GoogleForm";
import { TextField } from "~/components/input/TextField";
import { Auth } from "~/services/auth.server";
import { createUser } from "~/services/signup.server";
import SignUpSchema from "~/types/validators/SignUpSchema";

const signUpPageStyles = tv({
  slots: {
    base: "justify-center items-center flex flex-col gap-y-5",
    form: "rounded-2xl bg-white p-4 md:p-6 w-full max-w-96",
    title: "text-3xl font-extrabold text-black-600 text-center",
    btnWrapper: "text-center mt-5",
    btn: "rounded-xl mt-2 bg-red-500 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-red-600",
    text: "text-gray-600",
    link: "text-red-600 px-2 hover:underline",
  },
  compoundSlots: [{ slots: ["btnWrapper", "btn"], class: "w-full" }],
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (user) {
    return redirect("/");
  }

  return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = new Auth();

  const formData = await request.clone().formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log(rawData);

  const action = String(formData.get("_action"));

  const validationResult = SignUpSchema.safeParse(rawData);
  console.log(validationResult.error);
  if (!validationResult.success) {
    return Response.json(
      { error: validationResult.error.errors, form: action },
      { status: 400 },
    );
  }
  const { email, password } = validationResult.data;

  console.log("action", action);

  switch (action) {
    case "Sign Up": {
      const errors: Record<string, string> = {};

      console.log("action signup", email, password);

      const result = await createUser({ email, password });

      console.log(result.error);

      if (result.error) {
        errors.email = result.error.message;
      }

      if (Object.keys(errors).length > 0) {
        return Response.json({ errors });
      }

      const user = await auth.authenticate("user-pass", request);

      console.log("confirm", user);

      if (!user) {
        return redirect("/signup");
      }

      const headers = await auth.refresh(request, user);

      const searchParams = new URL(request.url).searchParams;
      const returnUrl = searchParams.get("returnUrl");

      return redirect(`/welcome?returnUrl=${returnUrl}`, {
        headers: headers,
      });
    }

    case "Sign In Google": {
      const user = await auth.authenticate("google", request);
      if (!user) {
        return null;
      }
      const headers = await auth.refresh(request, user);
      const searchParams = new URL(request.url).searchParams;
      const returnUrl = searchParams.get("returnUrl");
      return redirect(`/welcome?returnUrl=${returnUrl}`, {
        headers: headers,
      });
    }
    default:
      return null;
  }
};

const SignUpPage = () => {
  const { base, form, title, btnWrapper, btn, text, link } = signUpPageStyles();

  const actionData = useActionData<typeof action>();
  const errors = (actionData as { errors?: Record<string, string> })?.errors;

  return (
    <div className={base()}>
      <div className={form()}>
        <Form method="POST">
          <h2 className={title()}>Create an account</h2>
          <TextField htmlFor="email" label="Email" />
          <TextField htmlFor="password" type="password" label="Password" />
          <div className={btnWrapper()}>
            <button
              type="submit"
              name="_action"
              value="Sign Up"
              className={btn()}
            >
              Create an account
            </button>
          </div>
        </Form>
        <GoogleForm />
      </div>
      <p className={text()}>
        Already have an account?
        <Link to="/login">
          <span className={link()}>Sign In</span>
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
