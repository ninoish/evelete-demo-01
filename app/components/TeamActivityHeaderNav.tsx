import type { TeamActivity } from "@prisma/client";
import { NavLink } from "react-router";

export default function TeamActivityHeaderNav({
  activity,
}: {
  activity: TeamActivity;
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
          <NavLink
            end
            to="."
            className="nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            詳細
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="attendees"
            className="nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            参加回答
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="chat"
            className="nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            会話
          </NavLink>
        </li>

        {/* TODO: ゲストならDropin参加後に評価できる。仕様決める */}
        {false ? (
          <li className="rounded-tl rounded-tr border border-blue-600 py-2 px-4">
            <NavLink end to="evaluate" className="whitespace-nowrap">
              評価する
            </NavLink>
          </li>
        ) : null}
        {/* TODO: 仕様決める */}
        {false ? (
          <li className="rounded-tl rounded-tr border border-blue-600 py-2 px-4">
            <NavLink end to="settings" className="whitespace-nowrap">
              アクティビティ設定
            </NavLink>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
