import { Link } from "react-router";

export default function RecordDisplayListItem({
  id,
  sports,
  eventId,
  activityId,
  recordCompetition,
  recordCategory,
  recordTarget,
  displayType,
  displayOrder,
  recordDatetime,
  recordValue,
  content,
  likeCount,
  commentCount,
  mediaUrl,
}: {
  id: string;
  sports?: string[] | null;
  eventId?: string;
  activityId?: string;
  shouldDisplayOnProile: boolean;
  recordCompetition?: string;
  recordCategory?: string;
  recordTarget?: string | string[];
  displayType?: string;
  displayOrder?: number;
  recordDatetime: string;
  recordValue: string | string[];
  content?: string;
  likeCount: number | null;
  commentCount: number | null;
  mediaUrl?: string;
}) {
  return (
    <Link to={`/users/records/${id}`}>
      <div className="flex">
        {mediaUrl ? (
          <div className="mr-3">
            <img src={mediaUrl} alt={id} className="max-w-36 rounded" />
          </div>
        ) : null}
        <div>
          {eventId ? <p>{eventId}</p> : null}
          {activityId ? <p>{activityId}</p> : null}
          {/* ??? */}
          <div>{displayType}</div>
          {/* 大会名? */}
          {recordCompetition ? <p>{recordCompetition}</p> : null}
          {recordCategory ? (
            <p>
              {recordCategory}
              {recordTarget ? <span> - {recordTarget}</span> : null}
            </p>
          ) : null}
          {/* 記録日時 */}
          <p>{recordDatetime}</p>
          {/* 一つの記録に複数の記録があるイメージ。 (陸上の槍投げで、1 ~ 5投目など) */}
          <h5 className="font-bold text-2xl">
            {Array.isArray(recordValue) ? recordValue.join(", ") : recordValue}
          </h5>
          {content ? <p>{content}</p> : null}
          <p>
            {likeCount} likes, {commentCount} comments
          </p>
        </div>
      </div>
    </Link>
  );
}
