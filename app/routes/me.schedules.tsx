import { redirect, type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import dayjs from "dayjs";
import { useState } from "react";

import PersonalActivityListItem from "~/components/PersonalActivityListItem";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import { PersonalActivityType } from "@prisma/client";
import type { PersonalActivity } from "@prisma/client";
import ActivityDatePicker from "~/components/ActivityDatePicker";

interface Calenar {
  id: string;
  isToday?: boolean;
  isSelectedDay?: boolean;
  year?: number;
  month?: number;
  date?: number;
  dateDisplay: string;
  activities?: PersonalActivity[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/");
  }
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  let fromDt = null;
  if (from) {
    // TODO validate from
    fromDt = dayjs(from).startOf("month");
  } else {
    fromDt = dayjs().startOf("month");
  }

  const db = getPrisma();

  console.log(fromDt.endOf("month").toDate());

  const personalActivities = await db.personalActivity.findMany({
    where: {
      userId: user.id,
      startDatetime: {
        // TODO: consider timezone
        gte: fromDt.toDate(),
        lt: fromDt.endOf("month").toDate(),
      },
      NOT: {
        activityType: {
          has: PersonalActivityType.BODY_DATA,
        },
      },
    },
    include: {
      user: true,
      sport: true,
      sportAttributes: true,
      personalRecords: {
        include: {
          recordMaster: true,
        },
      },
    },
    orderBy: {
      startDatetime: "asc",
    },
  });

  return {
    personalActivities,
    fromDate: fromDt.toDate(),
  };
};

export default function MySchedulesRoute() {
  const data = useLoaderData<typeof loader>();

  const { fromDate, personalActivities } = data;
  const from = dayjs(fromDate);

  console.log("from", from);

  const today = new Date();
  const activityRefs: {
    [key: string]: React.RefObject<HTMLLIElement>;
  } = {};
  const [calendar, setCalendar] = useState<Calenar[]>([]);
  // sconst [currentDt, setCurrentDt] = useState(fromDate);

  const buildCalendar = (dt: Date) => {
    console.log("buildcal");

    // 2週間のカレンダーを作る

    const day = dayjs(dt);

    const firstDay = day.startOf("week");
    const cal = [];

    const DAYS = 14;
    let month = null;
    for (let i = 0; i < DAYS; i++) {
      const d = firstDay.add(i, "day");
      let dateDisplay = "" + d.date();
      if (month !== d.month()) {
        month = d.month();
        dateDisplay = d.format("MM/DD");
      }
      cal.push({
        id: `cid-${i}`,
        isToday: d.date() === today.getDate(),
        isSelectedDay: d.date() === dt.getDate(),
        year: d.year(),
        month: d.month() + 1,
        date: d.date(),
        dateDisplay,
        activities: personalActivities.filter(
          (s) =>
            dayjs(s.startDatetime).format("YYYY/MM/DD") ===
            d.format("YYYY/MM/DD"),
        ),
      });
    }

    setCalendar(cal);
  };

  const handleDateSelect = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    console.log(e);
    const activity = personalActivities[personalActivities.length - 1];
    activityRefs[activity.id]?.current.scrollIntoView();
    return null;
  };

  return (
    <div>
      <ActivityDatePicker from={from} activities={personalActivities} />

      <ul className="flex flex-wrap space-2 my-2">
        {personalActivities.map((pa) => {
          return (
            <li
              key={pa.id}
              className="p-2 mb-2 mx-2 w-full md:w-auto"
            >
              <PersonalActivityListItem {...pa}></PersonalActivityListItem>
            </li>
          );
        })}
      </ul>

      <div>
        <img src="/dummy/images/calendar1.png" alt="vision" />
      </div>
      <div>
        <img src="/dummy/images/calendar2.png" alt="vision" />
      </div>
      <div>
        <img src="/dummy/images/calendar3.jpeg" alt="vision" />
      </div>
      <div>
        <img src="/dummy/images/calendar4.jpeg" alt="vision" />
      </div>
      <div>
        <img src="/dummy/images/calendar5.jpeg" alt="vision" />
      </div>
    </div>
  );
}
