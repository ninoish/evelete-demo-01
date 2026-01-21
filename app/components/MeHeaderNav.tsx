import type { TeamMember, User } from "@prisma/client";
import { NavLink } from "react-router";

const navLinks = [
  { path: "/me", name: "ホーム" },
  {
    path: "/me/schedules",
    name: "活動予定",
  },
  {
    path: "/me/body",
    name: "身体",
  },
  {
    path: "/me/activities",
    name: "活動",
  },
  {
    path: "/me/records",
    name: "記録",
  },
  {
    path: "/me/connections",
    name: "つながり",
  },
  {
    path: "/me/followers",
    name: "フォロワー",
  },
  {
    path: "/me/teams",
    name: "チーム",
  },
  {
    path: "/me/sports",
    name: "スポーツ",
  },
  {
    path: "/me/media",
    name: "写真・動画",
  },
  {
    path: "/me/settings",
    name: "設定",
  },
];

export default function MeHeaderNav() {
  return (
    <div className="w-full border-b-2">
      <style>{`
        .nav-item.active {
          color: red;
        }
      `}</style>
      <ul className="flex gap-1 md:gap-4 overflow-x-scroll py-2">
        {navLinks.map((nav) => {
          return (
            <li key={nav.path}>
              <NavLink
                end
                to={`${nav.path}`}
                className="nav-item px-2 py-1 whitespace-nowrap"
              >
                {nav.name}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
