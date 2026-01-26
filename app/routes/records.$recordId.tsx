import {
  data,
  Link,
  type LoaderFunctionArgs,
  Outlet,
  useLoaderData,
} from "react-router";
import MainLayout from "~/layouts/MainLayout";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import { date } from "~/utils/datetime";
import { convertUnitValueToUnitDisplay } from "~/utils/unitConverter";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { recordId } = params;

  if (!recordId) {
    throw data({ errorMessage: "Invalid parameters" }, { status: 400 });
  }

  // TODO: ユーザープリファレンス制御
  const authed = await new Auth().isAuthenticated(request);
  if (!authed) {
    // return redirect("/");
  }

  const db = getPrisma();

  const personalRecord = await db.personalRecord.findFirst({
    where: {
      id: recordId,
    },
    include: {
      recordMaster: true,
      user: true,
    },
  });

  if (!personalRecord) {
    throw data({ errorMessage: "Record Not Found" }, { status: 404 });
  }

  return {
    personalRecord,
  };
};

export default function UserRecordDetailRoute() {
  const { personalRecord } = useLoaderData<typeof loader>();

  const user = personalRecord.user;
  return (
    <MainLayout>
      <div className="p-4 flex flex-col gap-2">
        <Link to={`/users/${user.slug}`}>
          <div className="flex items-center">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="icon" className="w-6 h-6" />
            ) : (
              <div className="w-6 h-6 text-sm">{user.displayName[0]}</div>
            )}
            <span className="ml-2 text-base font-semibold truncate max-w-[80vw]">
              {user.displayName}
            </span>
          </div>
        </Link>
        <h1>{personalRecord.recordMaster.nameJa}</h1>
        <div className="flex gap-2">
          <span>記録日</span>
          <span>
            {date(personalRecord.recordDatetime).format("YYYY年MM月DD日 HH:mm")}
          </span>
        </div>

        <div className="flex gap-2">
          <span>記録</span>
          <div className="inline-flex gap-1">
            <span className="font-bold">{personalRecord.recordValue}</span>
            <span>
              {convertUnitValueToUnitDisplay(
                null,
                null,
                personalRecord.recordMaster.unitValue,
              )}
            </span>
          </div>
        </div>
        <Outlet context={{ personalRecord }} />
      </div>
    </MainLayout>
  );
}
