import type { TeamMember } from "@prisma/client";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import TeamHeaderNav from "./TeamHeaderNav";
import TeamHeaderActionOptions from "./TeamHeaderActionOptions";
import { ChevronRight } from "lucide-react";
import color from "~/utils/color";
import type { TeamInfo } from "~/services/teamService.server";

export function TeamHeader({
  team,
  meMember,
}: {
  team: TeamInfo;
  meMember: TeamMember | undefined;
}) {
  const [isSticky, setIsSticky] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observerTarget = observerRef.current;
    if (!observerTarget) return;

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

  if (!team) {
    return null;
  }

  return (
    <header>
      {/* 固定ヘッダー */}
      {isSticky && (
        <>
          <div className="fixed top-0 left-0 right-0 bg-white shadow z-50 flex flex-col">
            <div className="flex items-center  px-4 py-2">
              {team.imageUrl ? (
                <img
                  src={team.imageUrl}
                  alt={team.displayName}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="font-bold w-6 h-6 rounded-full bg-gray-800 flex justify-center items-center text-sm">
                  <span className="text-white">{team.displayName[0]}</span>
                </div>
              )}
              <span className="ml-2 text-base font-semibold truncate max-w-[80vw]">
                {team.displayName}
              </span>
            </div>
            <TeamHeaderNav team={team} meMember={meMember} />
          </div>
        </>
      )}

      {/* 上部カバー画像とタイトル */}
      <div ref={observerRef} className="relative">
        <div className="flex px-4 pt-4 pb-0 gap-4">
          {team.imageUrl ? (
            <div
              className="rounded-full w-18 md:w-30 h-18 md:h-30 bg-center bg-cover"
              style={{
                backgroundColor: color.invertColor(
                  team.themeColor ?? color.uuidToColor(team.id),
                  false,
                ),
                backgroundImage: `url(${team.imageUrl})`,
              }}
            ></div>
          ) : (
            <div className="rounded-full w-18 md:w-30 h-18 md:h-30 bg-gray-800 flex justify-center items-center">
              <span className="text-white text-3xl md:text-5xl font-bold">
                {team.displayName[0]}
              </span>
            </div>
          )}
          <div className="flex-1 flex flex-col gap-1">
            <h1 className="leading-none text-xl md:text-3xl font-bold whitespace-nowrap ">
              {team.displayName}
            </h1>
            <div>
              <ul className="flex flex-wrap gap-x-2">
                {team.sports.map((sp) => {
                  return (
                    <li key={sp.sportId} className="flex gap-1">
                      <span className="text-sm">{sp.sport.emoji}</span>
                      <span className="text-gray-500 text-sm">
                        {sp.sport.name_ja_JP}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <ul className="flex flex-wrap gap-x-2">
                {team.places?.map((l) => {
                  return <li>{l.place.cityId}</li>;
                })}
              </ul>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <p className="inline-flex text-sm lg:text-base">
                {team.members.length} メンバー
              </p>
              <p className="inline-flex text-sm lg:text-base">
                {team.followers.length} フォロワー
              </p>
            </div>
          </div>
        </div>

        <TeamHeaderActionOptions team={team} meMember={meMember} />

        {!meMember && team.description ? (
          <div className="py-1 px-2 flex items-center">
            <p className="line-clamp-2 flex-1">{team.description}</p>
            <Link to="info">
              <ChevronRight size={24} />
            </Link>
          </div>
        ) : null}
        <TeamHeaderNav team={team} meMember={meMember} />
      </div>
    </header>
  );
}
