import type { User } from "@prisma/client";
import { NavLink } from "react-router";

export default function UserHeaderNav({ user }: { user: User }) {
  return (
    <div className="w-full border-b-2">
      <style>{`
        .user-nav-item.active {
          color: red;
        }
      `}</style>
      <ul className="flex gap-1 md:gap-4 overflow-x-scroll py-2">
        <li>
          <NavLink
            end
            to="."
            className="user-nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            ホーム
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="activities"
            className="user-nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            活動
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="records"
            className="user-nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            記録
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="connections"
            className="user-nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            つながり
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="sports"
            className="user-nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            スポーツ
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="followers"
            className="user-nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            フォロワー
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="teams"
            className="user-nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            チーム
          </NavLink>
        </li>
        <li>
          <NavLink
            end
            to="media"
            className="user-nav-item rounded-t px-2 py-1 whitespace-nowrap"
          >
            画像・動画
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
