import {
  type TeamActivity,
  type TeamActivityAttendanceResponse,
  TeamActivityParticipationRequirementType,
  type User,
} from "@prisma/client";
import { Link } from "react-router";

import { useEffect, useRef, useState } from "react";
import TeamActivityHeaderNav from "./TeamActivityHeaderNav";
import { IoLocationOutline } from "react-icons/io5";
import TeamActivityHeaderAttendanceResponse from "./TeamActivityHeaderAttendanceResponse";
import type teamActivityService from "~/services/teamActivityService.server";
import { AttendeeResponseState } from "~/models/teamActivityModel";
import { FaUser } from "react-icons/fa";
import {
  displayTeamActivityType,
  formatStartAndEndDatetime,
} from "~/utils/display";
import TeamIcon from "./TeamIcon";

export function TeamActivityHeader({
  activity,
  user,
  myResponseStatus,
  canEditActivity,
}: {
  activity: TeamActivity;
  user: User;
  myResponseStatus: Awaited<
    ReturnType<typeof teamActivityService.getUserResponse>
  > | null;
  canEditActivity: boolean;
}) {
  const [myResponse, setMyResponse] =
    useState<TeamActivityAttendanceResponse | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [requirements, setRequirements] = useState<{
    [key: string]: string | number;
  }>({});

  useEffect(() => {
    const res = {} as { [key: string]: string | number };
    for (let i = 0; i < activity.participationRequirements.length; i++) {
      const req = activity.participationRequirements[i];
      switch (req.type) {
        case TeamActivityParticipationRequirementType.Gender:
          if (req.stringValue) {
            res[TeamActivityParticipationRequirementType.Gender] =
              req.stringValue;
          }
          break;
        case TeamActivityParticipationRequirementType.MinAge:
          if (req.intValue !== null) {
            res[TeamActivityParticipationRequirementType.MinAge] = req.intValue;
          }
          break;

        case TeamActivityParticipationRequirementType.MaxAge:
          if (req.intValue !== null) {
            res[TeamActivityParticipationRequirementType.MaxAge] = req.intValue;
          }
          break;
        case TeamActivityParticipationRequirementType.MinPlayerExperience:
          if (req.intValue !== null) {
            res[TeamActivityParticipationRequirementType.MinPlayerExperience] =
              req.intValue;
          }
          break;
        case TeamActivityParticipationRequirementType.MaxPlayerExperience:
          if (req.intValue !== null) {
            res[TeamActivityParticipationRequirementType.MaxPlayerExperience] =
              req.intValue;
          }
          break;

        // TODO: set the others
        default:
          break;
      }
    }

    setRequirements(res);
  }, []);

  // 回答
  useEffect(() => {
    if (user) {
      const myRes = activity.attendanceResponses.find(
        (res) => res.userId === user.id,
      );
      if (myRes) {
        setMyResponse(myRes);
      }
    }
  }, []);

  // 表示
  useEffect(() => {
    const observerTarget = observerRef.current;
    if (!observerTarget) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null, // viewport
        threshold: 0,
      },
    );

    observer.observe(observerTarget);

    return () => {
      if (observerTarget) observer.unobserve(observerTarget);
    };
  }, []);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header>
      {/* 固定ヘッダー */}
      {isSticky && (
        <>
          <div className="fixed top-0 left-0 right-0 bg-white shadow z-50 flex flex-col">
            <div className="flex items-center  px-4 py-2 mb-1">
              <TeamIcon size="xs" team={activity.team} />
              <span className="text-base font-semibold truncate max-w-[80vw]">
                {activity.team.displayName}
              </span>
              {canEditActivity ? <button>Edit</button> : null}
            </div>
            <div className="px-4 flex items-center">
              <h1>{displayTeamActivityType(activity.teamActivityType)}</h1>
              <h1 className="px-2 flex-1">
                <span>
                  {formatStartAndEndDatetime(
                    activity.startDatetime,
                    activity.endDatetime,
                  )}
                </span>
              </h1>
              <h6>
                {activity.currentAttendees}/{activity.maxAttendees}
              </h6>
            </div>
            {activity.isGuestAllowed ? (
              <h5 className="font-bold">ドロップイン</h5>
            ) : null}
            <TeamActivityHeaderNav activity={activity} />
          </div>
        </>
      )}

      {/* 上部カバー画像とタイトル */}
      <div ref={observerRef} className="relative py-2">
        <Link
          to={`/teams/${activity.team.slug}`}
          className="flex items-center px-4 mb-1 gap-1"
        >
          <TeamIcon size="xs" team={activity.team} />

          <h2 className="flex-1">
            <span>{activity.team.displayName}</span>
          </h2>
          {canEditActivity ? <button>Edit</button> : null}
          {/* TODO: コピーして日時だけ変更して新規作成できるようにする。 */}
          {canEditActivity ? <button>Duplicate</button> : null}
        </Link>
        <div className=" px-4">
          <div className="flex items-center">
            <h1>{displayTeamActivityType(activity.teamActivityType)}</h1>
            <h1 className="px-2 flex-1">
              <span>
                {formatStartAndEndDatetime(
                  activity.startDatetime,
                  activity.endDatetime,
                )}
              </span>
            </h1>

            <h6 className="flex gap-1 items-center">
              <FaUser size={18} />
              <span>{activity.currentAttendees}</span>
              {activity.maxAttendees ? (
                <span>/{activity.maxAttendees}</span>
              ) : null}
            </h6>
          </div>
          {activity.isGuestAllowed ? (
            <h5 className="font-bold">ドロップイン</h5>
          ) : null}
          {activity.name ? (
            <div>
              <h1 className="font-bold">{activity.name}</h1>
            </div>
          ) : null}
          {activity.place ? (
            <div className="flex items-center">
              <p className="text-base inline-flex items-center">
                <IoLocationOutline />
                <span className="whitespace-nowrap">
                  <a
                    target="_blank"
                    href={`https://www.google.com/maps/search/${activity.place}`}
                    rel="noreferrer"
                  >
                    {activity.place}
                  </a>
                </span>
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-wrap gap-2 items-center">
              {activity.sport ? (
                <h5>
                  {activity.sport.emoji} {activity.sport.name_ja_JP}
                </h5>
              ) : null}

              {activity.sportAttributes?.length > 0
                ? activity.sportAttributes.map((sa) => {
                    return (
                      <h6 key={sa.sportAttributeId}>
                        {sa.sportAttribute?.name}
                      </h6>
                    );
                  })
                : null}
            </div>

            <div className="flex items-center">
              {myResponseStatus?.status === AttendeeResponseState.MEMBER ? (
                <div>参加費: ¥{activity.priceForMember || "-"}</div>
              ) : null}

              {myResponseStatus?.status === AttendeeResponseState.GUEST ||
              !myResponseStatus ? (
                <div>ドロップイン参加費: ¥{activity.priceForGuest}</div>
              ) : null}

              {myResponseStatus?.status === AttendeeResponseState.INVITED ? (
                <div>招待ゲスト参加費: ¥{activity.priceForInvited}</div>
              ) : null}
            </div>
          </div>

          {Object.keys(requirements).length > 0 ? (
            <div className="flex items-center">
              <h1 className="text-lg">参加条件</h1>
              {Object.keys(requirements).length === 0 ? <div>なし</div> : null}

              {requirements[TeamActivityParticipationRequirementType.Gender] ? (
                <div className="flex items-center gap-2">
                  <span>生物学上の性別 :</span>
                  {
                    requirements[
                      TeamActivityParticipationRequirementType.Gender
                    ]
                  }
                </div>
              ) : null}
              {requirements[TeamActivityParticipationRequirementType.MinAge] ||
              requirements[TeamActivityParticipationRequirementType.MaxAge] ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold">年齢 :</span>
                  {requirements[
                    TeamActivityParticipationRequirementType.MinAge
                  ] ? (
                    <div>
                      <span>
                        {
                          requirements[
                            TeamActivityParticipationRequirementType.MinAge
                          ]
                        }
                      </span>
                      <span>歳</span>
                    </div>
                  ) : null}
                  <span>~</span>
                  {requirements[
                    TeamActivityParticipationRequirementType.MaxAge
                  ] ? (
                    <div>
                      {
                        requirements[
                          TeamActivityParticipationRequirementType.MaxAge
                        ]
                      }
                      <span>歳</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {requirements[
                TeamActivityParticipationRequirementType.MinPlayerExperience
              ] ||
              requirements[
                TeamActivityParticipationRequirementType.MaxPlayerExperience
              ] ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold">競技経験 :</span>
                  {requirements[
                    TeamActivityParticipationRequirementType.MinPlayerExperience
                  ] ? (
                    <div>
                      <span>
                        {
                          requirements[
                            TeamActivityParticipationRequirementType
                              .MinPlayerExperience
                          ]
                        }
                      </span>
                    </div>
                  ) : null}
                  <span>~</span>
                  {requirements[
                    TeamActivityParticipationRequirementType.MaxPlayerExperience
                  ] ? (
                    <div>
                      {
                        requirements[
                          TeamActivityParticipationRequirementType
                            .MaxPlayerExperience
                        ]
                      }
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center">
            <TeamActivityHeaderAttendanceResponse
              activity={activity}
              myResponseStatus={myResponseStatus}
            />
          </div>
        </div>
        <TeamActivityHeaderNav activity={activity} />
      </div>
    </header>
  );
}
