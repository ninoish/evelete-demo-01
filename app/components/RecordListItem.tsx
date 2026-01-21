import { Link } from "react-router";

export default function RecordListItem({
  id,
  sports,
  teamId,
  eventId,
  activityId,
  recordCompetition,
  recordCategory,
  recordCategoryDetail,
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
  teamId?: string;
  shouldDisplayOnProile: boolean;
  recordCompetition?: string;
  recordCategory?: string;
  recordCategoryDetail?: string;
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
          {teamId ? <p>As {teamId}</p> : null}
          {activityId ? <p>{activityId}</p> : null}
          {recordCompetition ? <p>{recordCompetition}</p> : null}
          {recordTarget ? <p>{recordTarget}</p> : null}
          <p>{recordDatetime}</p>
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
