import type { PersonalRecord, RecordMaster } from "@prisma/client";
import { data, Link, type LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import userServiceServer from "~/services/userService.server";
import { date } from "~/utils/datetime";
import { convertDateToRelativeDate } from "~/utils/display";
import { compareCriteriaValues } from "~/utils/personalRecord";
import { convertUnitValueToUnitDisplay } from "~/utils/unitConverter";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const authed = await new Auth().isAuthenticated(request);

  const { slug: userSlug } = params;

  if (!userSlug) {
    throw data({ errorMessage: "Invalid parameter" }, { status: 400 });
  }

  const db = getPrisma();

  const user = await userServiceServer.getBySlug(userSlug, authed?.id);

  if (!user) {
    throw data({ errorMessage: "User Not Found" }, { status: 400 });
  }

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
    userSlug,
    personalRecords: groupedPersonalRecords,
  };
};

export default function UserRecordsRoute() {
  const data = useLoaderData<typeof loader>();
  const { personalRecords, userSlug } = data;

  console.log(personalRecords);

  return (
    <div>
      {/* 
      <div>個人記録、大会記録、所属チームの自分の出場したものの記録</div> */}
      <ul className="p-2 flex flex-wrap gap-2">
        {personalRecords.map((r) => {
          return (
            <li key={r.recordMasterId} className="border rounded flex-1">
              <Link
                to={`/users/${userSlug}/records/${r.recordMaster.id}`}
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
