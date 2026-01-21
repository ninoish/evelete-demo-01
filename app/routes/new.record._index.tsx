import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Link, redirect } from "react-router";
import { useLoaderData, useSubmit } from "react-router";

import { PersonalRecordForm } from "~/components/form/PersonalRecordForm";
import MainLayout from "~/layouts/MainLayout";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  for (const pair of body.entries()) {
    console.log(pair[0], pair[1], typeof pair[1]);
  }

  return redirect(`/`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const db = getPrisma();

  const userPersonalRecordMasterGroup = await db.personalRecord.groupBy({
    by: ["recordMasterId"],
    where: {
      userId: user.id,
    },
    orderBy: {
      _max: {
        recordDatetime: "desc",
      },
    },
  });

  const userPersonalRecordMasterIds = userPersonalRecordMasterGroup.map(
    (prg) => prg.recordMasterId,
  );

  const recordMasters = await db.recordMaster.findMany({
    where: {
      isTeamRecord: false,
    },
  });

  const userPersonalRecordMaster = recordMasters.filter(
    (rm) => userPersonalRecordMasterIds.indexOf(rm.id) !== -1,
  );

  // TODO: user sport から関連ありそうな種目を優先表示する

  return { user, recordMasters, userPersonalRecordMaster };
};

export default function NewPersonalRecordRoute() {
  const { recordMasters, userPersonalRecordMaster } =
    useLoaderData<typeof loader>();

  const [rms, setRms] = useState(recordMasters);

  return (
    <MainLayout>
      <div className="p-4">
        <h1 className="font-bold text-xl mb-2">
          記録したい種目を選んでください
        </h1>

        <div className="mb-2">
          <input
            type="text"
            name="filtering"
            placeholder="種目名で検索"
            onChange={(e) => {
              const keyword = e.target.value;
              const filtered = recordMasters.filter((rm) => {
                return (
                  rm.name.indexOf(keyword) >= 0 ||
                  rm.nameJa.indexOf(keyword) >= 0 ||
                  rm.id.indexOf(keyword) >= 0
                );
              });

              setRms(filtered);
            }}
          />
        </div>

        <ul className="flex flex-wrap gap-2 mb-2">
          {userPersonalRecordMaster.map((rm) => {
            return (
              <li key={rm.id} className="border border-emerald-400 rounded">
                <Link
                  to={`/new/record/${rm.id}`}
                  className="text-lg px-2 py-1.5 text-emerald-600 font-bold"
                >
                  {rm.nameJa}
                </Link>
              </li>
            );
          })}
        </ul>

        <div>
          <ul className="flex flex-wrap gap-2">
            {rms.map((rm) => {
              return (
                <li key={rm.id} className="border rounded">
                  <Link
                    to={`/new/record/${rm.id}`}
                    className="text-lg px-2 py-1.5"
                  >
                    {rm.nameJa}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
