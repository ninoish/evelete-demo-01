import { Link, useLocation } from "react-router";
import type { MyProfileType } from "~/services/userService.server";
import MeHeaderNav from "./MeHeaderNav";
import { useEffect, useRef, useState } from "react";
import color from "~/utils/color";

export default function MeHeader({ me }: { me: MyProfileType }) {
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

  return (
    <header className={`${isSticky ? "mb-10" : ""}`}>
      {/* 固定ヘッダー */}
      {isSticky && (
        <>
          <div className="fixed top-0 left-0 right-0 bg-white shadow z-50 flex flex-col">
            <div className="flex items-center px-4 py-2">
              <Link to="/">
                {me.profileImageUrl ? (
                  <img
                    src={me.profileImageUrl}
                    alt="icon"
                    className="w-6 h-6"
                  />
                ) : (
                  <div className="w-6 h-6 text-sm">{me.displayName[0]}</div>
                )}
              </Link>
              <span className="ml-2 text-base font-semibold truncate max-w-[80vw]">
                {me.displayName}
              </span>
            </div>
            <MeHeaderNav />
          </div>
        </>
      )}

      {/* 上部カバー画像とタイトル */}

      <div ref={observerRef} className="relative">
        <div className="flex px-4 pt-4 pb-0 gap-4">
          <>
            {me.profileImageUrl ? (
              <div
                className="rounded-full w-18 md:w-30 h-18 md:h-30 bg-center bg-cover"
                style={{
                  backgroundColor: color.invertColor(
                    color.uuidToColor(me.id),
                    false,
                  ),
                  backgroundImage: `url(${me.profileImageUrl})`,
                }}
              ></div>
            ) : (
              <div className="rounded-full w-18 md:w-30 h-18 md:h-30 bg-gray-800 flex justify-center items-center">
                <span className="text-white text-5xl md:text-7xl font-bold">
                  {me.displayName[0]}
                </span>
              </div>
            )}
          </>
          <div className="flex-1 flex flex-col gap-1">
            <h1 className="leading-none text-xl md:text-3xl font-bold whitespace-nowrap ">
              {me.displayName}
            </h1>
            <div>
              <ul className="flex flex-wrap gap-x-2">
                {me.sports.map((sp) => {
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
            </div>
            <div className="flex flex-wrap gap-x-4">
              <p className="inline-flex text-sm lg:text-base">
                {me._count.friendsWith} つながり
              </p>
              <p className="inline-flex text-sm lg:text-base">
                {me._count.followers} フォロワー
              </p>
            </div>
          </div>
        </div>
        <MeHeaderNav />
      </div>
    </header>
  );
}
