// ユーザーの関心
import { BiologicalGender } from "@prisma/client";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
} from "react-router";
import * as z from "zod";
import { TextField } from "~/components/input/TextField";

import userModel from "~/models/userModel";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import userService from "~/services/userService.server";

const WelcomeBasicSchema = z.object({
  displayName: z.string(),
  urlName: z
    .string()
    .regex(
      /^[a-zA-Z0-9_]{4,30}$/,
      "半角英数またはアンダースコアで指定してください",
    ),
  bioGender: z.enum([BiologicalGender.Male, BiologicalGender.Female], {
    required_error: "性別を選択してください。",
  }),
  birthday: z
    .string()
    .date()
    .nonempty("生年月日を入力してください。")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "有効な日付を入力してください。",
    }),
  livingCountry: z.string().nonempty("国を選択してください。"),
  livingState: z.string().nonempty("都道府県を選択してください。"),
  livingCity: z.string().nonempty("市区町村を選択してください。"),
});

type FormData = z.infer<typeof WelcomeBasicSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const auth = new Auth();

    const u = await auth.isAuthenticated(request);
    if (!u) {
      return redirect("/login");
    }

    const user = await userService.getDetailsById(u.id);

    const db = getPrisma();

    // TODO: check if user has setup. if yes, redirect to setting page.

    const countryData = await db.country.findMany({
      include: {
        states: {
          // State は Country とリレーションしているため利用可能
          include: {
            cities: true, // City は State とリレーションしているため利用可能
          },
        },
      },
    });

    return { user, countryData };
  } catch (error) {
    throw data(error);
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const auth = new Auth();

  const authed = await auth.isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const formData = await request.clone().formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log("rawData", rawData);
  const validationResult = WelcomeBasicSchema.safeParse(rawData);
  console.log(validationResult);

  if (!validationResult.success) {
    console.log(validationResult.error);

    return Response.json(
      { error: validationResult.error.errors },
      { status: 400 },
    );
  }

  const {
    displayName,
    urlName,
    bioGender,
    birthday,
    livingCountry,
    livingState,
    livingCity,
  } = validationResult.data;

  try {
    // TODO: check if user has setup. if yes, redirect to setting page.
    const user = await userService.getDetailsById(authed.id);

    if (user.prefSlugLastUpdatedAt) {
    }

    const { user: updatedUser } = await userModel.updatePreferences({
      userId: user.id,
      preferences: {
        displayName,
        slug: urlName,
        birthday,
        bioGender,
        livingCountry,
        livingState,
        livingCity,
      },
    });

    console.log("updatedUser", updatedUser);

    const cookieHeader = await auth.refresh(request, updatedUser);

    return redirect("/welcome/sports", {
      headers: cookieHeader,
    });
  } catch (error) {
    return Response.json({ errors: error }, { status: 400 });
  }
};

const WelcomeBasicPage = () => {
  const { user, countryData } = useLoaderData<typeof loader>();
  const japan = countryData.find((c) => c.name === "Japan");

  const [states, setStates] = useState<{ id: string; name: string }[] | null>(
    null,
  );
  const [cities, setCities] = useState<{ id: string; name: string }[] | null>(
    null,
  );
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<string | undefined>("1990-06-15");
  const [urlName, setUrlName] = useState<string>(`user${new Date().getTime()}`);
  const [errors, setErrors] = useState<string[] | null>(null);
  console.log(user.birthday);

  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (japan) {
      setSelectedCountry(japan.id);
      const selectedCountryData = countryData.find((c) => c.id === japan.id);
      if (selectedCountryData) {
        setStates(selectedCountryData.states);
      } else {
        setStates(null);
      }
      setCities(null);
    }
  }, []);

  // TODO: 実装する
  const navigate = useNavigate();

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = e.currentTarget.value;
    console.log("country : ", countryId);

    setSelectedCountry(countryId);
    const selectedCountryData = countryData.find((c) => c.id === countryId);
    if (selectedCountryData) {
      setStates(selectedCountryData.states);
    } else {
      setStates(null);
    }
    setCities(null);
  };
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = e.currentTarget.value;
    console.log("stateId : ", stateId);

    setSelectedState(stateId);
    const selectedCountryData = countryData.find(
      (c) => c.id === selectedCountry,
    );
    const selectedStateData =
      selectedCountryData?.states.find((s) => s.id === stateId) ?? null;

    if (selectedStateData) {
      setCities(selectedStateData.cities);
    } else {
      setCities(null);
    }
  };
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.currentTarget.value;
    console.log("cityId : ", cityId);
  };
  return (
    <Form method="POST">
      <div className="p-4">
        <div className="max-w-7xl	mx-auto flex flex-col gap-4">
          <h1 className="mb-4 text-center">ユーザー登録</h1>
          <TextField
            htmlFor="displayName"
            type="text"
            label="ユーザーの表示名"
            placeholder="絵部利太郎"
          />
          <TextField
            htmlFor="urlName"
            value={urlName}
            type="text"
            label="ユーザー名 (URLに使われます)"
            placeholder="半角英数字とアンダースコア(_)が使えます"
            minLength={4}
            maxLength={30}
            onChange={(ev) => {
              setUrlName(ev.currentTarget.value);
            }}
          />

          <div>
            <TextField
              type="date"
              label="生年月日 (13歳未満はご利用いただけません)"
              htmlFor="birthday"
              value={birthday}
              onChange={(ev) => {
                setBirthday(ev.currentTarget.value);
              }}
            />
            <p className="text-red-500">一度設定すると変更できません</p>
          </div>

          <div>
            <label>生物学上の性別</label>
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  name="bioGender"
                  value={BiologicalGender.Male}
                />
                男性
              </label>
              <label>
                <input
                  type="radio"
                  name="bioGender"
                  value={BiologicalGender.Female}
                />
                女性
              </label>
            </div>
            <p className="text-red-500">一度設定すると変更できません</p>
          </div>

          {/* Living Area */}
          <div className="flex flex-col gap-4">
            <h4>活動エリア</h4>
            <p className="text-red">全体には公開されません</p>
            <label>
              <select
                name="livingCountry"
                className="p-2"
                onChange={handleCountryChange}
              >
                <option value="">国を選択してください</option>
                {countryData.map((country) => (
                  <option
                    key={country.id}
                    value={country.id}
                    selected={country.id === japan?.id ? true : false}
                  >
                    {country.name}
                  </option>
                ))}
              </select>
            </label>

            {states && states.length > 0 ? (
              <label>
                <select
                  name="livingState"
                  className="p-2"
                  onChange={handleStateChange}
                >
                  <option value="">都道府県を選択してください</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {cities && cities.length > 0 ? (
              <label>
                <select
                  name="livingCity"
                  className="p-2"
                  onChange={handleCityChange}
                >
                  <option value="">市区町村を選択してください</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </div>

        <div className="max-w-7xl	mx-auto">
          {errors?.bioGender ? (
            <p style={{ color: "red" }}>{errors.bioGender.message}</p>
          ) : null}

          {errors?.birthday ? (
            <p style={{ color: "red" }}>{errors.birthday.message}</p>
          ) : null}

          {errors?.livingArea ? (
            <p style={{ color: "red" }}>{errors.livingArea.message}</p>
          ) : null}
          {actionData?.error ? (
            <p style={{ color: "red" }}>{actionData.error}</p>
          ) : null}
        </div>

        <div className="max-w-7xl	mx-auto my-4 flex justify-between gap-4">
          <button
            type="submit"
            className="rounded py-2 px-4 bg-green-700 text-white"
          >
            完了
          </button>
        </div>
      </div>
    </Form>
  );
};

export default WelcomeBasicPage;
