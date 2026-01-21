import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
} from "react-router";
import { tv } from "tailwind-variants";

import { GoogleForm } from "~/components/GoogleForm";
import { TextField } from "~/components/input/TextField";
import { Auth } from "~/services/auth.server";
import LoginSchema from "~/types/validators/LoginSchema";

export const meta: MetaFunction = () => {
  return [{ title: "Login" }];
};

const loginPageStyles = tv({
  slots: {
    base: "justify-center py-4 items-center flex flex-col gap-y-5",
    form: "rounded-2xl bg-white p-4 md:p-6 w-full max-w-96",
    title: "text-2xl font-extrabold text-black-600 text-center mb-6",
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

  const searchParams = new URL(request.url).searchParams;
  const returnUrl = searchParams.get("returnUrl");

  return { user, returnUrl };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = new Auth();

  const formData = await request.clone().formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log(rawData);

  const action = String(formData.get("_action"));

  const validationResult = LoginSchema.safeParse(rawData);
  console.log(validationResult.error);
  if (!validationResult.success) {
    return Response.json(
      { error: validationResult.error.errors, form: action },
      { status: 400 },
    );
  }

  try {
    switch (action) {
      case "Sign In": {
        const user = await auth.authenticate("user-pass", request);

        console.log("user", user);
        if (!user) {
          return redirect("/login");
        }

        const headers = await auth.refresh(request, user);

        const searchParams = new URL(request.url).searchParams;
        const returnUrl = searchParams.get("returnUrl");

        if (returnUrl) {
          return redirect(returnUrl, {
            headers: headers,
          });
        }
        return redirect("/", {
          headers: headers,
        });
      }
      case "Sign In Google": {
        const user = await auth.authenticate("google", request);

        console.log("user", user);

        if (!user) {
          return null;
        }
        const headers = await auth.refresh(request, user);

        const searchParams = new URL(request.url).searchParams;
        const returnUrl = searchParams.get("returnUrl");

        if (returnUrl) {
          return redirect(returnUrl, {
            headers: headers,
          });
        }
        return redirect("/", {
          headers: headers,
        });
      }
      default:
        return null;
    }
  } catch (error) {
    console.error(error);
    throw data({ errorMessage: "Login Error" }, { status: 500 });
  }
};

const LoginPage = () => {
  const { base, form, title, btnWrapper, btn, text, link } = loginPageStyles();

  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const errors = (actionData as { errors?: Record<string, string> })?.errors;

  const urlParameters = loaderData.returnUrl
    ? `?returnUrl=${loaderData.returnUrl}`
    : "";

  return (
    <div className={base()}>
      <div className={form()}>
        <Form method="POST">
          <div className="mb-3">
            <Link to="/" className="block no-underline hover:no-underline">
              <h1 className="flex items-center justify-center">
                <img src="/images/logo.svg" alt="Logo" className="h-6 md:h-8" />
                <span className="evelete-logo hover:no-underline ml-2 md:ml-3 text-2xl md:text-[32px] text-slate-900 ">
                  Evelete
                </span>
              </h1>
            </Link>
          </div>

          <input type="hidden" name="_action" value="Sign In" />
          <h2 className={title()}>ユーザーログイン</h2>
          <TextField htmlFor="email" label="Eメールアドレス" />
          <TextField htmlFor="password" type="password" label="パスワード" />
          <div className={btnWrapper()}>
            <button type="submit" className={btn()}>
              ログイン
            </button>
          </div>
        </Form>
        <GoogleForm />
      </div>
      <p className={text()}>
        <span>まだアカウントをお持ちでない場合は</span>
        <Link to={`/signup${urlParameters}`}>
          <span className={link()}>サインアップ</span>
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
