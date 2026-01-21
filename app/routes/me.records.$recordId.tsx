import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import { useState } from "react";
import {
  Link,
  type LoaderFunctionArgs,
  redirect,
  useNavigate,
} from "react-router";
import { useLoaderData } from "react-router";
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryScatter,
  VictoryContainer,
} from "victory";
import MainLayout from "~/layouts/MainLayout";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import { compareCriteriaValues } from "~/utils/personalRecord";
import { isBodyDataRelatedRecord } from "./new.record.$recordId";
import { convertUnitValueToUnitDisplay } from "~/utils/unitConverter";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  if (!params.recordId) {
    return redirect("/");
  }

  const authed = await new Auth().isAuthenticated(request);
  if (!authed) {
    return redirect("/");
  }

  const recordId = params.recordId;

  if (isBodyDataRelatedRecord(recordId)) {
    return redirect("/me/body");
  }

  const db = getPrisma();

  const recordMaster = await db.recordMaster.findFirstOrThrow({
    where: {
      id: recordId,
    },
  });

  const personalRecords = await db.personalRecord.findMany({
    where: {
      userId: authed.id,
      recordMasterId: recordMaster.id,
    },
    include: {
      user: true,
    },
    orderBy: {
      recordDatetime: "desc",
    },
  });

  return {
    recordMaster,
    personalRecords,
  };
};

const DATE_RANGE = {
  ONE_WEEK: "ONE_WEEK",
  THREE_MONTH: "THREE_MONTH",
  YEAR: "YEAR",
  ALL: "ALL",
};

export default function MyRecordDetailsRoute() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState<
    (typeof DATE_RANGE)[keyof typeof DATE_RANGE]
  >(DATE_RANGE.THREE_MONTH);

  const { recordMaster, personalRecords } = data;

  const formattedRecords = personalRecords.reduce<{
    lineChart: Record<string, number>;
    scatterChart: { x: string; y: number }[];
  }>(
    (res, r) => {
      const value =
        r.detail && JSON.parse(r.detail)?.recordValue
          ? parseFloat(JSON.parse(r.detail)?.recordValue)
          : null;
      if (!value) {
        return res;
      }

      const dt = dayjs(r.recordDatetime);
      const formatDt = dt.format("YYYY-MM-DD");
      if (formatDt in res) {
        if (
          compareCriteriaValues(
            recordMaster.criteria[0],
            res.lineChart[formatDt],
            value,
          )
        ) {
          res.lineChart[formatDt] = value;
        }
      }
      res.lineChart[formatDt] = value;

      res.scatterChart.push({
        x: formatDt,
        y: value,
      });
      return res;
    },
    { lineChart: {}, scatterChart: [] },
  );

  const lineChartData =
    Object.keys(formattedRecords.lineChart)
      .map((date) => {
        return {
          x: date,
          y: formattedRecords.lineChart[date],
        };
      })
      .sort((a, b) => (a.x > b.x ? 1 : -1)) ?? [];
  console.log(lineChartData);

  return (
    <div>
      <div className="flex gap-2 items-center px-4 py-2">
        <button onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} size="sm" />
        </button>
        <h4 className="flex-1 font-bold">{recordMaster.nameJa}</h4>
        <Link
          to={`/new/record/${recordMaster.id}`}
          className="rounded bg-amber-700 text-white py-1 px-2"
        >
          記録追加
        </Link>
      </div>

      {personalRecords?.length ? (
        <>
          <VictoryChart
            theme={VictoryTheme.clean}
            domainPadding={{ x: 25, y: 25 }}
            domain={{
              y: [
                personalRecords.reduce(
                  (cur, pr) => (cur > pr.recordValue ? pr.recordValue : cur),
                  recordMaster.maxValue ?? 0,
                ) - (recordMaster.standardValueMargin ?? 10),
                personalRecords.reduce(
                  (cur, pr) => (cur < pr.recordValue ? pr.recordValue : cur),
                  recordMaster.minValue ?? 0,
                ) + (recordMaster.standardValueMargin ?? 10),
              ],
            }}
            containerComponent={
              <VictoryContainer
                style={{
                  pointerEvents: "auto",
                  userSelect: "auto",
                  touchAction: "auto",
                }}
              />
            }
          >
            <VictoryLine data={lineChartData} />
            <VictoryScatter
              size={5}
              labels={({ datum }) => datum.y}
              data={formattedRecords.scatterChart}
            />
          </VictoryChart>

          <ul className="">
            {personalRecords?.map((pr) => {
              return (
                <li key={pr.id}>
                  <Link
                    to={`/records/${pr.id}`}
                    className="border-b p-4 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        {dayjs(pr.recordDatetime).format(
                          "YYYY年MM月DD日 HH:mm",
                        )}
                      </div>
                      <div className="font-bold text-2xl italic">
                        {pr.recordValue}{" "}
                        {convertUnitValueToUnitDisplay(
                          null,
                          null,
                          recordMaster.unitValue,
                        )}
                      </div>
                    </div>
                    {pr.detail ? (
                      <div>{JSON.parse(pr.detail).comment}</div>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="py-4 flex flex-col gap-1 items-center justify-center">
          <h6 className="font-bold">まだ記録がありません。</h6>
          <p>
            <Link
              to={`/new/record/${recordMaster.id}`}
              className="text-blue-600"
            >
              {recordMaster.nameJa}を記録する
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
