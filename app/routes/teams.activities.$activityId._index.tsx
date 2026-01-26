import type { Prisma } from "@prisma/client";
import { Link, useLoaderData, useOutletContext } from "react-router";
import type teamActivityService from "~/services/teamActivityService.server";
import { AttendeeResponseState } from "~/models/teamActivityModel";
import { IoLocationSharp } from "react-icons/io5";
export const loader = () => {
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  return { mapsApiKey };
};

export default function TeamActivityDetailIndexRoute() {
  const { mapsApiKey } = useLoaderData<typeof loader>();

  const { activity, myResponseStatus } = useOutletContext() as {
    activity: Prisma.TeamActivityGetPayload<{
      include: {
        sport: true;
        sportAttributes: {
          include: {
            sportAttribute: true;
          };
        };
      };
    }>;
    myResponseStatus: Awaited<
      ReturnType<typeof teamActivityService.getUserResponse>
    > | null;
  };

  if (!activity) {
    return null;
  }

  console.log(activity);

  return (
    <div className="py-2 px-4">
      {activity.sport ? (
        <div>
          <span>{activity.sport.emoji}</span>
          <span>{activity.sport.name_ja_JP}</span>
        </div>
      ) : null}
      {activity.sport ? (
        <div className="flex gap-2">
          {activity.sportAttributes?.map((sa) => {
            return (
              <span key={sa.sportAttributeId}>{sa.sportAttribute.name}</span>
            );
          })}
        </div>
      ) : null}
      {activity.name ? <h1>{activity.name}</h1> : null}

      <div>
        日時: {activity.startDatetime.toISOString()} -{" "}
        {activity.endDatetime?.toISOString() ?? ""}
      </div>

      {activity.placeName ? (
        <h1 className="flex gap-2">
          <IoLocationSharp size={20} /> {activity.placeName}
        </h1>
      ) : null}
      {activity.placeLat &&
      activity.placeLng &&
      activity.placeGoogleMapsPlaceId ? (
        <div className="w-full">
          <Link
            target="_blank"
            to={`https://www.google.com/maps/search/?api=1&query=${activity.placeLat},${activity.placeLng}&query_place_id=${activity.placeGoogleMapsPlaceId}`}
          >
            <img
              className="w-full"
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${activity.placeLat},${activity.placeLng}&zoom=15&size=720x480&markers=color:red|${activity.placeLat},${activity.placeLng}&key=${mapsApiKey}`}
            />
          </Link>
        </div>
      ) : null}

      <div>
        <span>
          ドロップイン参加 : {activity.isGuestAllowed ? "✅ 可" : "不可"}
        </span>
      </div>

      {myResponseStatus?.status === AttendeeResponseState.MEMBER ? (
        <>
          {/* メンバーは、メンバー以外の参加者の参加費を見れる */}
          <div>メンバー参加費: ¥{activity.priceForMember}</div>
          <div>招待ゲスト参加費: ¥{activity.priceForInvited}</div>
          <div>ドロップイン参加費: ¥{activity.priceForGuest}</div>
        </>
      ) : null}

      {myResponseStatus?.status === AttendeeResponseState.GUEST ||
      !myResponseStatus ? (
        <div>ドロップイン参加費: ¥{activity.priceForGuest}</div>
      ) : null}

      {myResponseStatus?.status === AttendeeResponseState.INVITED ? (
        <div>招待ゲスト参加費: ¥{activity.priceForInvited}</div>
      ) : null}

      {activity.description ? (
        <p className="my-2">{activity.description}</p>
      ) : null}

      {/* <pre>{JSON.stringify(activity, null, 4)}</pre> */}
    </div>
  );
}
