import type { Team, TeamMember } from "@prisma/client";
import { NavLink } from "react-router";

export default function TeamHeaderNav({
  team,
  meMember,
}: {
  team: Team;
  meMember: TeamMember | undefined;
}) {
  return (
    <div className="w-full border-b-2">
      <style>{`
        .nav-item.active {
          color: red;
        }
      `}</style>
      <ul className="flex gap-1 md:gap-4 overflow-x-scroll py-2">
        <li>
          <NavLink end to="." className="nav-item  px-2 py-1 whitespace-nowrap">
            ホーム
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="info"
            className="nav-item  px-2 py-1 whitespace-nowrap"
          >
            情報
          </NavLink>
        </li>
        {/* TODO: 非メンバーなら */}
        {!meMember ? (
          <li>
            <NavLink
              end
              to="dropins"
              className="nav-item  px-2 py-1 whitespace-nowrap"
            >
              ドロップイン
            </NavLink>
          </li>
        ) : null}
        {meMember ? (
          <li>
            <NavLink
              end
              to="activities"
              className="nav-item  px-2 py-1 whitespace-nowrap"
            >
              活動予定
            </NavLink>
          </li>
        ) : null}
        <li>
          <NavLink
            end
            to="results"
            className="nav-item  px-2 py-1 whitespace-nowrap"
          >
            試合結果
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="media"
            className="nav-item  px-2 py-1 whitespace-nowrap"
          >
            写真・動画
          </NavLink>
        </li>
        {/* TODO: 後で実装 */}
        {/* <li>
          <NavLink
            to="reviews"
            className="nav-item  px-2 py-1 whitespace-nowrap"
          >
            口コミ
          </NavLink>
        </li> */}
        {meMember || team?.canViewMembers ? (
          <li>
            <NavLink
              end
              to="members"
              className="nav-item  px-2 py-1 whitespace-nowrap"
            >
              メンバー
            </NavLink>
          </li>
        ) : null}
        {meMember ? (
          <>
            <li>
              <NavLink
                end
                to="groups"
                className="nav-item  px-2 py-1 whitespace-nowrap"
              >
                グループ
              </NavLink>
            </li>
            <li>
              <NavLink
                end
                to="chat"
                className="nav-item  px-2 py-1 whitespace-nowrap"
              >
                会話
              </NavLink>
            </li>
            {meMember.isAdmin ? (
              <li>
                <NavLink
                  end
                  to="settings"
                  className="nav-item  px-2 py-1 whitespace-nowrap"
                >
                  チーム設定
                </NavLink>
              </li>
            ) : null}
          </>
        ) : null}
      </ul>
    </div>
  );
}
