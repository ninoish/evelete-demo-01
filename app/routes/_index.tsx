import type { PersonalActivity } from "@prisma/client";
import dayjs from "dayjs";
import { ChevronRight } from "lucide-react";
import { IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect, Link, useLoaderData } from "react-router";
import ActivityGraph from "~/components/ActivityGraph";

import FocusDisplay from "~/components/FocusDisplay";
import MainLayout from "~/layouts/MainLayout";

import { Auth } from "~/services/auth.server";
import personalActivityService from "~/services/personalActivity.server";
import teamActivityService from "~/services/teamActivityService.server";
import userFocusService from "~/services/userFocusService.server";
import userPostService from "~/services/userPostService.server";
import { now } from "~/utils/datetime";
import personalActivityUtil from "~/utils/personalActivity";
import teamActivityUtil from "~/utils/teamActivity";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | Evelete" },
    { name: "description", content: "Welcome to Evelete!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = new Auth();
  const authed = await auth.isAuthenticated(request);

  if (authed) {
    console.log("authed", authed);

    if (!authed.hasSetupMinimumPrefs) {
      return redirect("/welcome");
    }

    // sns timeline
    const posts = await userPostService.getUserPostByUserId(authed.id);

    const [
      userFocuses,
      teamActivities,
      dropIns,
      personalActivities,
      allPersonalActivities,
    ] = await Promise.all([
      userFocusService.getByUserId(authed.id),
      teamActivityService.getByUserId(authed.id, null, null),
      teamActivityService.getDropIns(authed.id, null, null),
      personalActivityService.getByUserSlug(
        authed.slug,
        authed.id,
        now().toDate(),
        now().add(7, "days").toDate(),
      ),
      personalActivityService.getByUserSlug(
        authed.slug,
        authed.id,
        // now().subtract(3, "months").toDate(),
        now()
          .subtract(1, "year")
          .toDate(),
        now().add(2, "weeks").toDate(),
      ),
    ]);

    return {
      user: authed,
      userFocuses,
      posts,
      teamActivities,
      dropIns,
      personalActivities,
      allPersonalActivities,
    };
  }

  // ログアウトユーザー向け処理

  // TODO: IP Address から国を判定

  // TODO: redis からDailyくらいでバッチを組んで固定のを表示
  const [dropIns, posts] = await Promise.all([
    teamActivityService.getDropIns(null, null, null),
    userPostService.getUserPostForLoggedOutUser(),
  ]);

  return {
    user: null,
    userFocuses: [],
    posts,
    teamActivities: [],
    dropIns,
    personalActivities: [],
    allPersonalActivities: [],
  };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const {
    user,
    userFocuses,
    posts,
    teamActivities,
    dropIns,
    personalActivities,
    allPersonalActivities,
  } = data;

  return (
    <MainLayout>
      <div className="flex flex-col xl:flex-row xl:p-2">
        {user ? (
          <>
            <section className="xl:w-[360px]">
              <FocusDisplay userFocuses={userFocuses} />

              <ActivityGraph
                activities={allPersonalActivities}
                includeFuture={true}
              />
              {/* Desktop向けには、ユーザープロフィールとか所属チームのアップデート通知とか？ */}
            </section>
          </>
        ) : null}
        <div className="flex-1 py-2 px-4">
          {user ? (
            <section className="mb-6">
              <div className="flex justify-between">
                <h3 className="font-bold text-2xl">今後の予定</h3>
                <Link to="/me/schedules">すべて見る</Link>
              </div>
              <div>
                {teamActivities?.length > 0 ? (
                  <ul className="flex flex-col md:flex-row gap-2 md:flex-wrap overflow-x-auto">
                    {teamActivities.map((ta) => {
                      const startDatetime = dayjs(ta.startDatetime);
                      const endDatetime = ta.endDatetime
                        ? dayjs(ta.endDatetime)
                        : null;
                      const timeDisplay = `${startDatetime.format(
                        "YYYY年MM月DD日 HH:mm",
                      )} - ${
                        !endDatetime
                          ? ""
                          : startDatetime.isSame(endDatetime, "day")
                            ? endDatetime.format("HH:mm")
                            : endDatetime.format("MM月DD日 HH:mm")
                      }`;

                      const activityTypeDisplay =
                        teamActivityUtil.convertTypeToDisplay(
                          ta.teamActivityType,
                        );

                      return (
                        <li
                          key={ta.id}
                          className={`w-full md:w-auto p-4 border rounded`}
                        >
                          <Link
                            to={`/teams/activities/${ta.id}`}
                            className="block"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="inline-flex flex-wrap gap-2">
                                <span className="rounded border bg-blue-500 text-white py-1 px-2">
                                  {activityTypeDisplay}
                                </span>
                                <span>{ta.sport?.name_ja_JP}</span>
                                {ta.team.imageUrl ? (
                                  <div
                                    style={{
                                      backgroundImage: `url(${ta.team.imageUrl})`,
                                    }}
                                    className="w-8 h-8 rounded bg-cover bg-center"
                                  />
                                ) : null}
                                <span className="whitespace-nowrap">
                                  {ta.team.displayName}
                                </span>
                              </div>
                              <div className="inline-flex gap-2">
                                <span>{ta.name}</span>
                              </div>
                              <div className="inline-flex gap-2">
                                <IoTimeOutline size={12} />
                                <span className="whitespace-nowrap">
                                  {timeDisplay}
                                </span>
                              </div>
                              <div className="inline-flex gap-2">
                                <IoLocationOutline size={12} />
                                <span className="whitespace-nowrap">
                                  {ta.place}
                                </span>
                              </div>
                              {user && ta.priceForMember ? (
                                <div className="inline-flex gap-2">
                                  <span className="whitespace-nowrap">
                                    ¥ {ta.priceForMember}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </Link>
                        </li>
                      );
                    })}

                    {personalActivities.map((pa) => {
                      const startDatetime = dayjs(pa.startDatetime);
                      const endDatetime = pa?.endDatetime
                        ? dayjs(pa.endDatetime)
                        : null;
                      const timeDisplay = `${startDatetime.format(
                        "YYYY年MM月DD日 HH:mm",
                      )} - ${
                        !endDatetime
                          ? ""
                          : startDatetime.isSame(endDatetime, "day")
                            ? endDatetime.format("HH:mm")
                            : endDatetime.format("MM月DD日 HH:mm")
                      }`;

                      const activityTypeDisplay =
                        personalActivityUtil.convertTypeToDisplay(
                          pa?.activityType[0],
                        );

                      return (
                        <li
                          key={pa.id}
                          className={`block border rounded py-2 mr-2`}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="inline-flex gap-2">
                              <span>{activityTypeDisplay}</span>
                              <span>{pa.name}</span>
                            </div>
                            <div className="inline-flex gap-2">
                              <IoTimeOutline size={12} />
                              <span className="whitespace-nowrap">
                                {timeDisplay}
                              </span>
                            </div>
                            <div className="inline-flex gap-2">
                              <IoLocationOutline size={12} />
                              <span className="whitespace-nowrap">
                                {pa?.place}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    }) ?? null}
                  </ul>
                ) : (
                  <div className="text-gray-400 p-4 text-center">
                    予定はありません
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* TODO: 大会 */}

          <section className="mt-2 mb-6">
            <div className="flex flex-wrap items-center mb-2">
              <div className="flex flex-col md:flex-row flex-wrap flex-1 md:items-center gap-x-4">
                <h2 className="font-bold text-2xl">ドロップイン</h2>
                <p className="flex-1 text-sm text-gray-500">
                  ゲスト参加可能なチーム練習
                </p>
              </div>
              <Link
                to="/explore/dropins"
                className="inline-flex gap-2 items-center"
              >
                <span>もっとみる</span>
                <ChevronRight size={18} />
              </Link>
            </div>
            <div>
              <ul className="flex flex-col md:flex-row gap-2 md:flex-wrap overflow-x-auto">
                {dropIns.map((ta) => {
                  const startDatetime = dayjs(ta.startDatetime);
                  const endDatetime = ta.endDatetime
                    ? dayjs(ta.endDatetime)
                    : null;
                  const timeDisplay = `${startDatetime.format(
                    "YYYY年MM月DD日 HH:mm",
                  )} - ${
                    !endDatetime
                      ? ""
                      : startDatetime.isSame(endDatetime, "day")
                        ? endDatetime.format("HH:mm")
                        : endDatetime.format("MM月DD日 HH:mm")
                  }`;

                  const activityTypeDisplay =
                    teamActivityUtil.convertTypeToDisplay(ta.teamActivityType);

                  return (
                    <li
                      key={ta.id}
                      className={`w-full md:w-auto p-4 border rounded`}
                    >
                      <Link to={`/teams/activities/${ta.id}`} className="block">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-col gap-2">
                            <div className="inline-flex gap-2">
                              <span>{ta.sport?.emoji}</span>
                              <span>{ta.sport?.name_ja_JP}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <IoTimeOutline size={18} />
                              <span className="whitespace-nowrap">
                                {timeDisplay}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <IoLocationOutline size={18} />
                              <span className="whitespace-nowrap">
                                {ta.place}
                              </span>
                            </div>

                            <div className="flex gap-2 items-center">
                              {ta.team.imageUrl ? (
                                <span
                                  style={{
                                    backgroundImage: `url(${ta.team.imageUrl})`,
                                  }}
                                  className="block w-6 h-6 rounded bg-cover bg-center"
                                />
                              ) : null}
                              <span className="whitespace-nowrap">
                                {ta.team.displayName}
                              </span>
                            </div>
                          </div>
                          <div className="inline-flex gap-2">
                            <span>{ta.name}</span>
                          </div>

                          {user && ta.priceForMember ? (
                            <div className="inline-flex gap-2">
                              <span className="whitespace-nowrap">
                                ¥ {ta.priceForMember}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  );
                })}

                {personalActivities.map((pa) => {
                  const startDatetime = dayjs(pa.startDatetime);
                  const endDatetime = pa?.endDatetime
                    ? dayjs(pa.endDatetime)
                    : null;
                  const timeDisplay = `${startDatetime.format(
                    "YYYY年MM月DD日 HH:mm",
                  )} - ${
                    !endDatetime
                      ? ""
                      : startDatetime.isSame(endDatetime, "day")
                        ? endDatetime.format("HH:mm")
                        : endDatetime.format("MM月DD日 HH:mm")
                  }`;

                  const activityTypeDisplay =
                    personalActivityUtil.convertTypeToDisplay(pa?.activityType);

                  return (
                    <li
                      key={pa.id}
                      className={`block border rounded py-2 mr-2`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="inline-flex gap-2">
                          <span>{activityTypeDisplay}</span>
                          <span>{pa.name}</span>
                        </div>
                        <div className="inline-flex gap-2">
                          <IoTimeOutline size={12} />
                          <span className="whitespace-nowrap">
                            {timeDisplay}
                          </span>
                        </div>
                        <div className="inline-flex gap-2">
                          <IoLocationOutline size={12} />
                          <span className="whitespace-nowrap">{pa?.place}</span>
                        </div>
                      </div>
                    </li>
                  );
                }) ?? null}
                {/* 
              {recentSchedules.map((s) => {
                const rescol =
                  s.response === "参加"
                    ? "border-green-400 bg-green-100"
                    : s.response === "不参加"
                    ? "border-slate-400 bg-slate-200"
                    : "";
                const resLinkStyle =
                  s.response === "参加"
                    ? "text-black"
                    : s.response === "不参加"
                    ? "text-slate-700"
                    : "text-slate-500";
                return (
                  <li
                    key={s.id}
                    className={`block border rounded py-2 mr-2 ${rescol}`}
                  >
                    <Link
                      to={s.link}
                      className={`block whitespace-nowrap px-2 ${resLinkStyle}`}
                    >
                      <div className="flex items-center">
                        {s.isInvitation ? (
                          <span className="bg-green-400 p-1 rounded text-black mr-2">
                            招待
                          </span>
                        ) : null}
                        {s.isGuest ? (
                          <span className="bg-pink-400 p-1 rounded text-black mr-2">
                            ゲスト参加
                          </span>
                        ) : null}
                        {s.type === "練習" ? (
                          <span className="bg-purple-400 p-1 rounded text-white mr-2">
                            {s.type}
                          </span>
                        ) : s.type === "大会" ? (
                          <span className="bg-yellow-400 p-1 rounded text-black mr-2">
                            {s.type}
                          </span>
                        ) : null}
                        {s.eventName ? <span>{s.eventName}</span> : null}
                        <img
                          src={s.teamImage}
                          alt="team1"
                          className="w-6 h-6 rounded mr-2"
                        />
                        <span className="mr-2">{s.teamName}</span>
                      </div>
                      <div>
                        <span className="">{s.rules}</span>
                      </div>
                      <div>{s.datetime}</div>
                      <div>{s.place}</div>
                    </Link>
                    {s.actions ? (
                      <div className="border-t px-2">
                        <p className="text-center">返信</p>
                      </div>
                    ) : null}
                  </li>
                );
              })} */}
              </ul>
            </div>
          </section>

          <section className="mb-6">
            <h3>フィード</h3>

            <p>
              タイムライン・おすすめ・近くでやるゲスト参加可の練習・近くでやる大会など
            </p>
            {/* フォローしている人・フォローしているチーム・所属しているチームの更新情報フィード */}
            {/* いいねとコメントができる */}
            <ul className="max-w-md mx-auto">
              {posts?.map((f) => {
                return (
                  <li key={f.id} className="border rounded p-4 mb-2 mr-2">
                    {/* <FeedItem {...f}></FeedItem> */}
                  </li>
                );
              }) ?? null}
            </ul>
          </section>

          {/* これは explore メニューに任せる。ゲストは表示する。 */}
          {/*
        <section>
          <h2>近くの練習や大会</h2>
          <div>
            <ul>
              <li>
                <Link to="">練習</Link>
              </li>
              <li>
                <Link to="">大会</Link>
              </li>
            </ul>
          </div>
          <div>もっと探す</div>
        </section>
        */}
          <nav>
            <ul></ul>
          </nav>
        </div>
      </div>
    </MainLayout>
  );
}
