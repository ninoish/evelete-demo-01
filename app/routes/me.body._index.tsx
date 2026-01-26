import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { redirect, type LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";

import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryScatter,
  VictoryAxis,
  VictoryContainer,
  VictoryLabel,
} from "victory";

import { Auth } from "~/services/auth.server";
import personalBodyDataService from "~/services/personalBodyDataService.server";
import { date, toJST } from "~/utils/datetime";
import { convertDateToRelativeDate } from "~/utils/display";

const CHART_RED = "#D31A3D";
const CHART_BLUE = "#0056B3";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const bodyData = await personalBodyDataService.getRecentData(user.id);

  return { bodyData };
};

// 小数丸め
const round = (v: number, dp = 1) => {
  const k = Math.pow(10, dp);
  return Math.round(v * k) / k;
};

// “気持ちよい”刻み幅（d3.ticks風の簡易版）
const niceStep = (span: number, target = 5) => {
  if (span <= 0) return 1;
  const raw = span / target;
  const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
  const err = raw / pow10;
  let step;
  if (err >= 7.5) step = 10;
  else if (err >= 3.5) step = 5;
  else if (err >= 2.25) step = 2.5;
  else if (err >= 1.5) step = 2;
  else step = 1;
  return step * pow10;
};

const makeTicks = (min: number, max: number, step: number, dp = 0) => {
  const ticks: number[] = [];
  const s = Math.ceil(min / step) * step;
  const e = Math.floor(max / step) * step;
  for (let t = s; t <= e + step * 0.5; t += step) {
    ticks.push(Number(t.toFixed(dp)));
  }
  return ticks;
};

const CHART_WIDTH = 450;
const CHART_HEIGHT = 260;

export default function MyBodyDataIndexRoute() {
  const { bodyData } = useLoaderData<typeof loader>();

  const [displaySpan, setDisplaySpan] = useState<"3m" | "6m" | "1y" | "all">(
    "3m",
  );

  const weightRaw: { x: Date; y: number }[] = [];
  const fatRaw: { x: Date; y: number }[] = [];
  for (const bd of bodyData ?? []) {
    const x = new Date(bd.measurementDatetime);
    if (bd.weight != null) weightRaw.push({ x, y: bd.weight });
    if (bd.bodyFatPercentage != null)
      fatRaw.push({ x, y: round(bd.bodyFatPercentage, 1) }); // ←小数1位に丸めて“表示=プロット”
  }

  if (weightRaw.length === 0)
    return <div className="px-2">データがありません</div>;

  // 2) レンジ + パディング
  const wmin0 = Math.min(...weightRaw.map((d) => d.y));
  const wmax0 = Math.max(...weightRaw.map((d) => d.y));
  const fmin0 = fatRaw.length ? Math.min(...fatRaw.map((d) => d.y)) : 0;
  const fmax0 = fatRaw.length ? Math.max(...fatRaw.map((d) => d.y)) : 1;

  const padRange = (min: number, max: number, pct: number, minPad: number) => {
    const span = Math.max(max - min, 0);
    const pad = Math.max(span * pct, minPad);
    return [min - pad, max + pad] as [number, number];
  };

  const weightRange = padRange(
    wmin0 === wmax0 ? wmin0 - 5 : wmin0,
    wmin0 === wmax0 ? wmax0 + 5 : wmax0,
    0.1,
    0.8,
  );
  const fatRange = padRange(
    fmin0 === fmax0 ? fmin0 - 3 : fmin0,
    fmin0 === fmax0 ? fmax0 + 3 : fmax0,
    0.12,
    0.25,
  );

  // 3) % → kg スケール写像（※両方“パディング後レンジ”で）
  const mapFatToWeight = (p: number) => {
    const [wmin, wmax] = weightRange;
    const [fmin, fmax] = fatRange;
    return wmin + ((p - fmin) / (fmax - fmin)) * (wmax - wmin);
  };

  // 4) 右軸（%）の tick を作る（小数1位刻みを優先）
  const fatStep = Math.max(0.1, niceStep(fatRange[1] - fatRange[0], 6));
  const fatTicks = makeTicks(fatRange[0], fatRange[1], fatStep, 1); // 表示は1桁
  const fatTicksOnWeight = fatTicks.map(mapFatToWeight); // ← 左スケール上の高さ

  // 5) 左軸（kg）の “見やすい”tick
  const wStep = niceStep(weightRange[1] - weightRange[0], 6);
  const weightTicks = makeTicks(
    weightRange[0],
    weightRange[1],
    wStep,
    wStep < 1 ? 1 : 0,
  );

  // 6) 左軸グリッドを “weightTicks ∪ fatTicksOnWeight” にすることで、
  //    赤の% tick 位置とグリッド線が一致（＝見た目ズレが起きない）
  const gridTicks = Array.from(
    new Set([...weightTicks, ...fatTicksOnWeight]),
  ).sort((a, b) => a - b);

  // 7) プロット用データ
  const fatOnWeight = fatRaw.map((d) => ({ x: d.x, y: mapFatToWeight(d.y) }));

  return (
    <div>
      <div className="py-2 px-4 flex justify-center md:justify-end">
        <Link
          to="/new/body"
          className="w-full md:w-auto py-2 px-4 inline-flex items-center justify-center rounded bg-blue-700 text-white"
        >
          <span>記録する</span>
        </Link>
      </div>

      <div className="px-2 max-w-4xl mx-auto">
        {weightRange ? (
          <VictoryChart
            theme={VictoryTheme.clean}
            padding={{ top: 12, right: 12, bottom: 48, left: 12 }}
            domain={{ y: weightRange }}
            domainPadding={{ x: 30, y: 30 }}
            scale={{ x: "time" }}
            containerComponent={<VictoryContainer responsive={true} />}
          >
            {/* X軸：絶対日付（SSR/CSR一致） */}
            <VictoryAxis
              crossAxis
              tickFormat={(d: Date) => dayjs(d).format("MM/DD")}
              style={{ tickLabels: { fontSize: 10 } }}
            />

            {/* 体重（kg） */}
            <VictoryLine
              data={weightRaw}
              style={{
                data: {
                  stroke: CHART_BLUE,
                  strokeWidth: 2,
                },
              }}
            />

            {/* 体脂肪率（%）— 左スケールに写像してプロット（数値は丸め後） */}
            <VictoryLine
              data={fatOnWeight}
              style={{
                data: {
                  stroke: CHART_RED,
                  strokeWidth: 2,
                },
              }}
            />

            <VictoryScatter
              data={weightRaw}
              size={2}
              style={{ data: { fill: CHART_BLUE } }}
              labels={({ index, datum }) => `${datum.y}kg`}
              labelComponent={
                <VictoryLabel
                  renderInPortal={false}
                  dy={-10}
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    fill: CHART_BLUE,
                  }}
                />
              }
            />
            <VictoryScatter
              data={fatOnWeight}
              size={2}
              style={{ data: { fill: CHART_RED } }}
              labels={({ index }) => `${fatRaw[index!].y}%`}
              labelComponent={
                <VictoryLabel
                  renderInPortal={false}
                  dy={-10}
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    fill: CHART_RED,
                  }}
                />
              }
            />
          </VictoryChart>
        ) : null}
      </div>

      <div className="px-2 max-w-4xl mx-auto">
        <ul className="flex flex-col gap-2">
          {bodyData?.map((data) => {
            let dateStr = convertDateToRelativeDate(
              toJST(date(data.measurementDatetime)),
            );
            if (dateStr === "0h") {
              dateStr = "たった今";
            }

            return (
              <li key={data.id} className="w-full p-4 border-b">
                <Link to={`/me/body/${data.id}`}>
                  <div>{dateStr}</div>
                  {data.weight && <div>体重: {data.weight}</div>}
                  {data.bodyFatPercentage && (
                    <div>体脂肪率: {data.bodyFatPercentage}%</div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
