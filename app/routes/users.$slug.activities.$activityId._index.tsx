import type { PersonalActivitySportAttribute } from "@prisma/client";
import dayjs from "dayjs";
import { IoLocationSharp } from "react-icons/io5";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import personalActivityService from "~/services/personalActivity.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  if (!params.activityId) {
    return redirect("/");
  }
  const user = await new Auth().isAuthenticated(request);
  // TODO: check only accessibility
  const personalActivity = await personalActivityService.getById(
    params.activityId,
    user?.id ?? null,
  );
  if (!personalActivity) {
    return redirect("/");
  }

  return { personalActivity };
};

export default function UserActivityIndexRoute() {
  const { personalActivity } = useLoaderData<typeof loader>();
  return (
    <div className="py-2 px-4">
      {personalActivity.sport ? (
        <div>
          <span>{personalActivity.sport.emoji}</span>
          <span>{personalActivity.sport.name_ja_JP}</span>
        </div>
      ) : null}
      {personalActivity.sport ? (
        <div className="flex gap-2">
          {personalActivity.sportAttributes?.map(
            (sa: PersonalActivitySportAttribute) => {
              return (
                <span key={sa.sportAttributeId}>{sa.sportAttribute.name}</span>
              );
            },
          )}
        </div>
      ) : null}
      {personalActivity.name ? <h1>{personalActivity.name}</h1> : null}
      <div>
        日時: {dayjs(personalActivity.startDatetime).format("YYYY-MM-DD HH:mm")}{" "}
        -{" "}
        {personalActivity.endDatetime
          ? dayjs(personalActivity.endDatetime).format("YYYY-MM-dd HH:mm")
          : null}
      </div>

      {personalActivity.place ? (
        <h1 className="flex gap-2">
          <IoLocationSharp size={20} /> {personalActivity.place}
        </h1>
      ) : null}

      {personalActivity.asGuest ? (
        <div>
          <span>✅ ドロップイン</span>
        </div>
      ) : null}

      {personalActivity.personalRecords?.map((pr) => {
        return (
          <div className="flex flex-wrap items-center gap-2">
            <div>{pr.recordMaster.nameJa}</div>
            <div>
              {pr.recordValue} {pr.recordMaster.unitValue}
            </div>
          </div>
        );
      })}

      {personalActivity.description ? (
        <p className="my-2">{personalActivity.description}</p>
      ) : null}

      {/* <pre>{JSON.stringify(activity, null, 4)}</pre> */}
    </div>
  );
}
