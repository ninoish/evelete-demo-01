import { data, Link, redirect, type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Auth } from "~/services/auth.server";
import personalBodyDataService from "~/services/personalBodyDataService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (!params.bodyId) {
    return redirect("/login");
  }

  const authed = await new Auth().isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const bodyData = await personalBodyDataService.getById(
    authed.id,
    params.bodyId,
  );
  if (!bodyData) {
    return redirect("/");
  }
  return { bodyData };
};

export default function MyBodyDataDetailsRoute() {
  const data = useLoaderData<typeof loader>();

  const { weight, bodyFatPercentage, description } = data.bodyData;

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link to="/me/body">一覧に戻る</Link>
      </div>
      <div>
        <h1>身体データ詳細</h1>
        {weight && <div>{weight} kg</div>}
        {bodyFatPercentage && <div>{bodyFatPercentage} %</div>}
        {description && <div>{description}</div>}

        <div className="my-4 p-4 bg-amber-50 border rounded">
          <pre className="w-full">{JSON.stringify(data.bodyData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
