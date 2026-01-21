import { faComment, faHeart } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { UserPost } from "@prisma/client";
import { Link } from "react-router";
import {
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function PostItem(post: UserPost) {
  try {
    const body = JSON.parse(post.body);

    return (
      <div className="flex flex-col">
        <div className="flex items-center">
          {body.team.imageUrl ? (
            <Link to={`/teams/${body.team.slug}`}>
              <div
                style={{
                  backgroundImage: `url(${body.team.imageUrl})`,
                }}
                className="w-8 h-8 bg-center bg-cover bg-no-repeat mr-1 rounded-full"
              ></div>
            </Link>
          ) : null}
          {body.team.displayName ? (
            <div>
              <p className="mr-2">
                <Link to={`/teams/${body.team.slug}`}>
                  {body.team.displayName}
                </Link>
              </p>
            </div>
          ) : null}

          {body.user.imageUrl ? (
            <div
              style={{
                backgroundImage: `url(${body.user.imageUrl})`,
              }}
              className="w-8 h-8 bg-center bg-cover bg-no-repeat mr-1 rounded-md"
            ></div>
          ) : null}
          {body.user.displayName ? (
            <div>
              <p>
                <Link to={`/users/${body.user.slug}`}>
                  {body.user.displayName}
                </Link>
              </p>
            </div>
          ) : null}
        </div>
        <div>
          <div className="flex justify-end mt-1">
            <p className="text-sm mr-4">
              <Link to={`/post/${post.id}`}>{post.createdAt.toString()}</Link>
            </p>
            {body.category ? (
              <p className="text-sm mr-4">{body.category}</p>
            ) : null}
            <p className="text-sm">共有: {body.sharingWith}</p>
          </div>
          {body.mediaUrl ? (
            <div className="mt-1 mb-2">
              <img src={body.mediaUrl} alt={body.id} className="max-h-full" />
            </div>
          ) : null}

          {activityTitle ? <p className="font-bold">{activityTitle}</p> : null}
          {activityContent ? <p>{activityContent}</p> : null}
          {eventName ? <p className="font-bold">{eventName}</p> : null}

          {sports ? (
            <div className="mr-3">
              <p className="flex">
                {sports.map((s) => (
                  <span key={s} className="mr-1 p-1 font-bold border rounded">
                    {s}
                  </span>
                ))}
              </p>
            </div>
          ) : null}

          {activityItems ? (
            <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap">
              {activityDuration ? (
                <div>
                  <h4>時間</h4>
                  <p className="font-bold">{activityDuration}</p>
                </div>
              ) : null}
              {activityItems.map((ai) => (
                <div key={ai.name} className="mr-2">
                  <h4>{ai.name}</h4>
                  <p className="font-bold">{ai.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {records ? (
            <div className="flex flex-nowrap overflow-x-auto whitespace-nowrap">
              {records.map((r) => (
                <div key={r.name} className="mr-2">
                  <h4>{r.name}</h4>
                  <p className="font-bold">{r.value}</p>
                  {r.diff ? <p className="text-sm">({r.diff})</p> : null}
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex justify-between">
            {teamActivityTitle ? (
              <p className="font-bold">{teamActivityTitle}</p>
            ) : null}
            {teamActivityFeedType ? <p>{teamActivityFeedType}</p> : null}
          </div>

          {teamActivityContent ? (
            <p className="mt-2">{teamActivityContent}</p>
          ) : null}
          {teamActivityItems ? (
            <div className="mt-2 flex flex-nowrap overflow-x-auto whitespace-nowrap">
              {teamActivityItems.map((item) => {
                return (
                  <div
                    key={item.datetime}
                    className="border rounded p-2 mr-2 whitespace-nowrap"
                  >
                    <p>
                      {item.category} {item.datetime}
                    </p>
                    {item.price ? <p>¥{item.price}</p> : null}
                    {item.attendanceStatus ? (
                      <p>
                        <span className="mr-2">
                          ✅ {item.attendanceStatus.going}
                        </span>
                        <span className="mr-2">
                          ❌ {item.attendanceStatus.notGoing}
                        </span>
                        <span className="mr-2">
                          未定 {item.attendanceStatus.tbd}
                        </span>
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}

          {category === "team-result" ? (
            <div>
              <p>{teamResultPlace}</p>
              <p>{teamResultDate}</p>
              <ul className="flex flex-nowrap overflow-x-auto whitespace-nowrap">
                {teamResultItems?.map((i) => (
                  <li key={i.id} className="border rounded mr-2 p-2">
                    <p className="text-sm">{i.name}</p>
                    <p className="">vs {i.opponentTeamName}</p>
                    <p>
                      <span className="font-bold">{i.ourScore}</span>
                      <span className="mx-4">-</span>
                      <span>{i.theirScore}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {chartType ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={"160px"}>
              <LineChart
                width={500}
                height={300}
                data={chartValues}
                margin={{
                  top: 5,
                  right: 2,
                  left: 2,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" padding={{ left: 10, right: 10 }}>
                  <Label position="insideStart" />
                </XAxis>
                <YAxis
                  tickSize={1}
                  domain={["dataMin", "dataMax"]}
                  padding={{ top: 10, bottom: 10 }}
                />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          ) : null}

          <p>
            <span className="mr-4">
              <FontAwesomeIcon icon={faHeart} className="mr-1" size="1x" />
              {likeCount}
            </span>
            <span>
              <FontAwesomeIcon icon={faComment} className="mr-1" size="1x" />
              {commentCount}
            </span>
          </p>
        </div>
      </div>
    );
  } catch (e) {
    return null;
  }
}
