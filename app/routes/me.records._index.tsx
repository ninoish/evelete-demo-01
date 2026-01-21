import type { PersonalRecord, RecordMaster } from "@prisma/client";
import { Link, type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import { date } from "~/utils/datetime";
import { convertDateToRelativeDate } from "~/utils/display";
import { compareCriteriaValues } from "~/utils/personalRecord";
import { convertUnitValueToUnitDisplay } from "~/utils/unitConverter";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/");
  }

  const db = getPrisma();

  const personalRecords = await db.personalRecord.findMany({
    where: {
      userId: user.id,
    },
    include: {
      user: true,
      recordMaster: true,
    },
    orderBy: {
      recordDatetime: "desc",
    },
  });

  const groupedPersonalRecords = personalRecords.reduce(
    (gs, pr) => {
      const existing = gs.find((g) => g.recordMasterId === pr.recordMasterId);
      if (existing) {
        if (pr.recordDatetime > existing.latestRecord.recordDatetime) {
          existing.latestRecord = pr;
        }
        if (
          compareCriteriaValues(
            pr.recordMaster.criteria[0],
            existing.bestRecord.recordValue,
            pr.recordValue,
          )
        ) {
          existing.bestRecord = pr;
        }
      } else {
        gs.push({
          recordMasterId: pr.recordMasterId,
          recordMaster: pr.recordMaster,
          latestRecord: pr,
          bestRecord: pr,
          records: [pr],
        });
      }

      return gs;
    },
    [] as {
      recordMasterId: string;
      recordMaster: RecordMaster;
      latestRecord: PersonalRecord;
      bestRecord: PersonalRecord;
      records: PersonalRecord[];
    }[],
  );

  return {
    personalRecords: groupedPersonalRecords,
  };
};

export default function MyRecordsIndexRoute() {
  const data = useLoaderData<typeof loader>();
  const { personalRecords } = data;

  console.log(personalRecords);

  return (
    <div>
      {/* <h4>私の記録 Index</h4>
      <div>個人記録、大会記録、所属チームの自分の出場したものの記録</div> */}

      <div className="py-2 px-4 flex justify-center md:justify-end">
        <Link
          to="/new/record"
          className="w-full md:w-auto py-2 px-4 inline-flex items-center justify-center rounded bg-blue-700 text-white"
        >
          <span>記録を追加する</span>
        </Link>
      </div>

      <ul className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {personalRecords.map((r) => {
          return (
            <li key={r.recordMasterId} className="border rounded">
              <Link
                to={`/me/records/${r.recordMaster.id}`}
                className="block h-full w-full p-2"
              >
                <div className="w-full">
                  <p className="inline-block text-base font-semibold">
                    {r.recordMaster.nameJa}
                  </p>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <p className="leading-none">
                      <span className="mr-0.5 text-xs text-gray-500">最新</span>
                      <span className="text-xs text-gray-500">
                        {convertDateToRelativeDate(
                          date(r.latestRecord.recordDatetime).format(
                            "YYYY-MM-DD HH:mm",
                          ),
                        )}
                      </span>
                    </p>
                    <div className="leading-none flex gap-1 items-end">
                      <span className="text-2xl font-bold italic">
                        {r.latestRecord.recordValue}
                      </span>
                      <span>
                        {convertUnitValueToUnitDisplay(
                          null,
                          null,
                          r.recordMaster.unitValue,
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="leading-none">
                      <span className="mr-0.5 text-xs text-gray-500">
                        ベスト
                      </span>
                      <span className="text-xs text-gray-500">
                        {convertDateToRelativeDate(
                          date(r.bestRecord.recordDatetime).format(
                            "YYYY-MM-DD HH:mm",
                          ),
                        )}
                      </span>
                    </p>
                    <div className="leading-none flex gap-1 items-end">
                      <span className="text-2xl font-bold italic">
                        {r.bestRecord.recordValue}
                      </span>
                      <span>
                        {convertUnitValueToUnitDisplay(
                          null,
                          null,
                          r.recordMaster.unitValue,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
