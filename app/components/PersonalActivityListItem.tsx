import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { IoLocationOutline } from "react-icons/io5";
import { Link } from "react-router";
import {
  displayPersonalActivityType,
  formatStartAndEndDatetime,
} from "~/utils/display";

export default function PersonalActivityListItem({
  id,
  name,
  startDatetime,
  endDatetime,
  durationMinutes,
  status,
  activityType,
  user,
  personalRecords,
  sport,
  sportAttributes,
  place,
}: Prisma.PersonalActivityGetPayload<{
  include: {
    user: true;
    sport: true;
    sportAttributes: true;
    personalRecords: {
      include: {
        recordMaster: true;
      };
    };
  };
}>) {
  return (
    <Link
      to={`/users/${user.slug}/activities/${id}`}
      className="flex flex-col gap-1"
    >
      <h5 className="inline-block">
        <span className="mr-2">
          {displayPersonalActivityType(activityType[0])}
        </span>
        {name ? <span>{name}</span> : null}
        {sport ? <span>{sport.alias_ja_JP}</span> : null}
      </h5>
      <p>
        <span>{formatStartAndEndDatetime(startDatetime, endDatetime)}</span>
      </p>
      {place && (
        <div>
          <IoLocationOutline />
          {place}
        </div>
      )}

      {personalRecords?.length > 0 ? (
        <div>
          <ul>
          {personalRecords.map((pr) => {
            return (
              <li key={pr.id}>
                <h4>{pr.recordMaster.nameJa}</h4>
                <h3>{pr.recordValue}</h3>
              </li>
            );
          })}
          </ul>
        </div>
      ) : null}
    </Link>
  );
}
