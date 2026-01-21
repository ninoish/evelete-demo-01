import type { PersonalActivity } from "@prisma/client";
import { LoaderFunctionArgs, redirect } from "react-router";
import { Link, useLoaderData, useRouteLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import personalActivityService from "~/services/personalActivity.server";
import { now } from "~/utils/datetime";
import {
  displayPersonalActivityType,
  displayTeamActivityType,
  formatStartAndEndDatetime,
} from "~/utils/display";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (!params.slug) {
    return redirect("/");
  }
  const me = await new Auth().isAuthenticated(request);

  // TODO: check only accessibility
  const personalActivities = await personalActivityService.getByUserSlug(
    params.slug,
    me?.id ?? null,
    now().add(-7, "days").toDate(),
    now().toDate(),
  );
  if (!personalActivities) {
    // TODO : 404
    return redirect("/");
  }

  return { personalActivities };
};

export default function UserActivitiesRoute() {
  const { personalActivities } = useLoaderData<typeof loader>();
  console.log(personalActivities);
  return (
    <div>
      <h1>活動一覧</h1>
      <div>ユーザー活動一覧: 練習、トレーニング、チーム活動参加</div>
      <div>Githubの草みたいなので表示</div>

      <ul className="flex flex-col gap-2">
        {personalActivities?.map((pa: PersonalActivity) => {
          return (
            <li key={pa.id}>
              <Link to={`/users/${pa.user.slug}/activities/${pa.id}`} className="flex items-center flex-wrap gap-2">
                
                {pa.activityType?.map((at) => {
                  return <div>{displayPersonalActivityType(at)}</div>;
                })}
                <div>
                  {formatStartAndEndDatetime(pa.startDatetime, pa.endDatetime)}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
