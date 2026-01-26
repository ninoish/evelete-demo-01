import {
  type TeamActivity,
  TeamActivityAttendanceResponseType,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { FaComment } from "react-icons/fa";
import { Link, useFetcher, useLocation } from "react-router";
import { AttendeeResponseState } from "~/models/teamActivityModel";
import type teamActivityService from "~/services/teamActivityService.server";

export default function TeamActivityHeaderAttendanceResponse({
  activity,
  myResponseStatus,
}: {
  activity: TeamActivity;
  myResponseStatus: Awaited<
    ReturnType<typeof teamActivityService.getUserResponse>
  > | null;
}) {
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isDropinModalOpen, setIsDropinModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const [commentValue, setCommentValue] = useState(
    myResponseStatus?.response?.responseComment ?? "",
  );

  const location = useLocation();

  const fetcher = useFetcher();
  const commentFetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data) {
      // action から返ってきたデータを処理
      console.log("Action result:", fetcher.data);
    }
    setIsResponseModalOpen(false);
    setIsDropinModalOpen(false);
  }, [fetcher.data]);

  useEffect(() => {
    if (commentFetcher.data) {
      // action から返ってきたデータを処理
      console.log("Comment Action result:", commentFetcher.data);
    }
    setIsCommentModalOpen(false);
    setIsCommentModalOpen(false);
  }, [commentFetcher.data]);

  const openResponseModal = () => {
    setIsResponseModalOpen(true);
  };

  const openDropInModal = () => {
    setIsDropinModalOpen(true);
  };

  const openCommentModal = () => {
    setIsCommentModalOpen(true);
  };

  const responseButton = () => {
    if (!myResponseStatus) {
      return (
        <Link to={`/login?returnUrl=${location.pathname}`}>
          <button className="response-button login" type="button">
            ログインして参加する
          </button>
        </Link>
      );
    }

    // TODO: activity の参加上限の場合、Waiting List など。
    if (myResponseStatus.response) {
      switch (myResponseStatus.response.response) {
        case TeamActivityAttendanceResponseType.GOING: {
          return (
            <button
              className="response-button going"
              onClick={openResponseModal}
            >
              参加
            </button>
          );
        }
        case TeamActivityAttendanceResponseType.NOT_GOING: {
          return (
            <button
              className="response-button not-going"
              onClick={openResponseModal}
            >
              不参加
            </button>
          );
        }
        case TeamActivityAttendanceResponseType.MAYBE: {
          return (
            <button
              className="response-button maybe"
              onClick={openResponseModal}
            >
              未定
            </button>
          );
        }
        case TeamActivityAttendanceResponseType.CANCELED__USER_REASON: {
          return (
            <button disabled className="response-button canceled-user-reason">
              キャンセル済
            </button>
          );
        }
        case TeamActivityAttendanceResponseType.CANCELED__TEAM_REASON: {
          return (
            <button disabled className="response-button canceled-team-reason">
              チームによってキャンセルされました
            </button>
          );
        }
        default: {
          throw new Error("UNKNOWN RESPONSE TYPE");
        }
      }
    }
    if (myResponseStatus.status === AttendeeResponseState.MEMBER) {
      return (
        <button
          className="response-button no-response"
          onClick={openResponseModal}
        >
          出欠回答する
        </button>
      );
    } else if (myResponseStatus.status === AttendeeResponseState.INVITED) {
      return (
        <button
          onClick={openResponseModal}
          className="response-button no-response"
        >
          出欠回答する
        </button>
      );
    } else if (myResponseStatus.status === AttendeeResponseState.GUEST) {
      return (
        <button onClick={openDropInModal} className="response-button dropin">
          ドロップインに参加する
        </button>
      );
    }
    throw new Error("UNKNOWN STATUS");
  };

  return (
    <div className="w-full">
      <style>{`
        .response-button {
          width: 100%;
          display: block;
          text-align: center;
          border: 1px solid #dadada;
          border-radius: .25rem;
          padding: .25rem .5rem;
        }
          
        .response-button.going {
          background-color: green;
          color: white;
        }
        .response-button.not-going {
          background-color: red;
          color: white;
        }
        .response-button.maybe {
          background-color: gray;
          color: white;
        }
        .response-button.login {
          background-color: green;
          color: white;
        }
      `}</style>

      <div className="flex items-center">
        <div className="flex-1">{responseButton()}</div>

        {/* 回答済みの場合だけ、コメント可能 */}
        {myResponseStatus?.response ? (
          <div className="ml-2">
            <button type="button" onClick={openCommentModal}>
              <FaComment size={24} />
            </button>
          </div>
        ) : null}
      </div>

      {isCommentModalOpen ? (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-8">
          <div className="z-20 w-full">
            <div>
              <commentFetcher.Form method="post" action="comment">
                <div className="flex items-center">
                  <input
                    type="text"
                    name="comment"
                    value={commentValue}
                    onChange={(ev) => {
                      setCommentValue(ev.currentTarget.value);
                    }}
                    className="bg-white flex-1"
                  />
                  <button
                    disabled={commentFetcher.state === "submitting"}
                    type="submit"
                    className="bg-green-400 text-white whitespace-nowrap ml-1 py-2 px-2 rounded"
                  >
                    {commentFetcher.state === "submitting"
                      ? "保存中..."
                      : "コメント"}
                  </button>
                </div>
              </commentFetcher.Form>
            </div>
          </div>
          <div
            className="z-10 absolute w-full h-full bg-gray-950 opacity-70"
            onClick={() => {
              setIsCommentModalOpen(false);
            }}
          ></div>
        </div>
      ) : null}

      {isResponseModalOpen ? (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-8">
          <div className="z-20 w-full">
            <ul className="flex flex-col gap-2">
              <li className="w-full">
                <fetcher.Form method="post" action="response">
                  <input
                    type="hidden"
                    name="response"
                    value={TeamActivityAttendanceResponseType.GOING}
                  />
                  <button
                    disabled={fetcher.state === "submitting"}
                    type="submit"
                    className={`w-full rounded text-center py-2 text-xl response-option bg-green-600 text-white ${myResponseStatus?.response?.response === TeamActivityAttendanceResponseType.GOING ? "selected" : ""}`}
                  >
                    {fetcher.state === "submitting" ? "回答中..." : "参加"}
                  </button>
                </fetcher.Form>
              </li>

              <li>
                <fetcher.Form method="post" action="response">
                  <input
                    type="hidden"
                    name="response"
                    value={TeamActivityAttendanceResponseType.NOT_GOING}
                  />
                  <button
                    disabled={fetcher.state === "submitting"}
                    type="submit"
                    className={`w-full rounded text-center py-2 text-xl response-option  bg-red-600 text-white ${myResponseStatus?.response?.response === TeamActivityAttendanceResponseType.NOT_GOING ? "selected" : ""}`}
                  >
                    {fetcher.state === "submitting" ? "回答中..." : "不参加"}
                  </button>
                </fetcher.Form>
              </li>

              <li>
                <fetcher.Form method="post" action="response">
                  <input
                    type="hidden"
                    name="response"
                    value={TeamActivityAttendanceResponseType.MAYBE}
                  />
                  <button
                    disabled={fetcher.state === "submitting"}
                    type="submit"
                    className={`w-full rounded text-center py-2 text-xl response-option bg-yellow-600 text-white ${myResponseStatus?.response?.response === TeamActivityAttendanceResponseType.MAYBE ? "selected" : ""}`}
                  >
                    {fetcher.state === "submitting" ? "回答中..." : "未定"}
                  </button>
                </fetcher.Form>
              </li>
            </ul>
          </div>
          <div
            className="z-10 absolute w-full h-full bg-gray-950 opacity-70"
            onClick={() => {
              setIsResponseModalOpen(false);
            }}
          ></div>
        </div>
      ) : null}

      {isDropinModalOpen ? (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-8">
          <div className="z-20 w-full">
            <div className="bg-white rounded p-4">
              <h2>ドロップインに参加</h2>
              <p className="py-2">
                注意事項や、参加条件の確認、参加費、キャンセル時の扱いなどの確認テキスト
              </p>
              <div className="flex justify-center">
                <fetcher.Form method="post" action="response">
                  <input
                    type="hidden"
                    name="response"
                    value={TeamActivityAttendanceResponseType.GOING}
                  />
                  <button
                    disabled={fetcher.state === "submitting"}
                    type="submit"
                    className={`bg-green-600 text-white py-1 px-2 text-center rounded response-option ${myResponseStatus?.response?.response === TeamActivityAttendanceResponseType.GOING ? "selected" : ""}`}
                  >
                    {fetcher.state === "submitting"
                      ? "回答中..."
                      : "理解して参加する"}
                  </button>
                </fetcher.Form>
              </div>
            </div>
          </div>
          <div
            className="z-10 absolute w-full h-full bg-gray-950 opacity-70"
            onClick={() => {
              setIsDropinModalOpen(false);
            }}
          ></div>
        </div>
      ) : null}
    </div>
  );
}
