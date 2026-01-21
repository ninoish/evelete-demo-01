import type { PersonalActivity } from "@prisma/client";
import { date, now } from "~/utils/datetime";

export default function ActivityGraph({
  activities,
  includeFuture = true,
}: {
  activities: PersonalActivity[];
  includeFuture?: boolean;
}) {
  // TODO: まとめをredisから取得する
  if (!activities) {
    activities = [];
  }
  const today = now();
  const oneYearAgo = today.subtract(1, "year");
  // const oneYearAgo = today.subtract(3, "month");
  const oneYearAgoStartOfWeek = oneYearAgo.startOf("week");
  const twoWeeksLater = today.add(2, "weeks");
  const twoWeeksLaterEndOfWeek = twoWeeksLater.endOf("week");
  const daysBetween = includeFuture
    ? twoWeeksLaterEndOfWeek.diff(oneYearAgoStartOfWeek, "days") + 1
    : today.diff(oneYearAgoStartOfWeek, "days") + 1;
  const graph = []; // Array(daysBetween);
  for (let i = 0; i < daysBetween; i++) {
    const dt = oneYearAgoStartOfWeek.add(i, "day");
    const display = dt.format("YYYY-MM-DD");
    const match = activities.filter(
      (a) =>
        date(a.startDatetime).tz("Asia/Tokyo").format("YYYY-MM-DD") === display,
    );
    graph.push({
      id: `graph-item-${i + 1}`,
      dayjs: dt,
      display,
      activityCount: match.length,
      isToday: dt.isSame(today, "day"),
      isSchedule: dt.isAfter(today, "day"),
    });
  }

  const cols = Math.floor(graph.length / 7) + 1;

  return (
    <div className="flex items-center justify-center px-4">
      <ul
        className={`max-w-md grid grid-flow-col grid-cols-${cols} grid-rows-7 gap-0.5 w-full h-full`}
      >
        {graph.map((g) => {
          return (
            <li
              key={g.id}
              className={`flex justify-center items-center aspect-square rounded-xs ${
                g.isSchedule
                  ? g.activityCount > 2
                    ? "outline outline-1 outline-emerald-600"
                    : g.activityCount === 0
                      ? "outline outline-1 outline-slate-100 bg-white"
                      : "outline outline-1 outline-emerald-300"
                  : g.activityCount > 2
                    ? "bg-emerald-600"
                    : g.activityCount === 0
                      ? "bg-slate-200"
                      : "bg-emerald-300"
              } ${g.isToday ? "outline outline-1 outline-yellow-200 " : ""}`}
            >
              <div className="text-sm"></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
