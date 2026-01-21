import {
  faBell,
  faCalendar,
  faMessage,
} from "@fortawesome/free-regular-svg-icons";
import { faAdd, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TeamMember, User } from "@prisma/client";
import { Link, NavLink, useRouteLoaderData } from "react-router";

import TeamIcon from "./TeamIcon";
export function Header() {
  const data = useRouteLoaderData("root") as unknown as {
    user: User;
    teamMembers: TeamMember[];
  };
  const user = data?.user;
  const myTeams = data?.teamMembers?.map((tm) => {
    return {
      ...tm.team,
      isAdmin: tm.isAdmin,
      isOwner: tm.isOwner,
    };
  });

  return (
    <header className="flex py-1 md:py-2 px-4 space-x-4 border-b border-neutral-200">
      <div className="grow inline-flex items-center">
        <Link to="/" className="block no-underline hover:no-underline">
          <h1 className="flex items-center">
            <img src="/images/logo.svg" alt="Logo" className="h-6 md:h-8" />
            <span className="evelete-logo hover:no-underline ml-2 md:ml-3 text-2xl md:text-[32px] text-slate-900 ">
              Evelete
            </span>
          </h1>
        </Link>
      </div>

      {/* Desktop up */}
      <div className="flex-auto hidden md:block">
        <ul className="flex h-full items-center space-x-4 justify-end">
          {user ? (
            <>
              {myTeams?.map((team) => {
                return (
                  <li
                    key={team.slug}
                    className="inline-flex items-center justify-center"
                  >
                    <Link to={`/teams/${team.slug}`}>
                      <TeamIcon size="xs" team={team} />
                    </Link>
                  </li>
                );
              }) ?? null}
              <li className="inline-flex items-center justify-center">
                <Link to="/me/schedules" className="inline-flex items-center">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    size="sm"
                    className="h-4"
                  ></FontAwesomeIcon>
                  <span className="ml-2">Schedules</span>
                </Link>
              </li>
              <li className="inline-flex items-center justify-center">
                <Link to="/explore" className="inline-flex items-center">
                  <FontAwesomeIcon
                    className="h-4"
                    icon={faSearch}
                    size="sm"
                  ></FontAwesomeIcon>
                  <span className="ml-2">Explore</span>
                </Link>
              </li>

              <li className="inline-flex items-center justify-center">
                <Link to="/new" className="inline-flex items-center">
                  <FontAwesomeIcon
                    icon={faAdd}
                    size="sm"
                    className="h-4"
                  ></FontAwesomeIcon>
                  <span className="ml-2">New</span>
                </Link>
              </li>

              <li className="inline-flex items-center justify-center">
                <Link to="/notifications" className="inline-flex items-center">
                  <FontAwesomeIcon icon={faBell} size="lg"></FontAwesomeIcon>
                </Link>
              </li>
              <li className="inline-flex items-center justify-center">
                <Link to="/messages" className="inline-flex items-center">
                  <FontAwesomeIcon icon={faMessage} size="lg"></FontAwesomeIcon>
                </Link>
              </li>
              <li className="inline-flex items-center justify-center">
                <Link
                  to="/me"
                  className="inline-flex flex-col items-center justify-center"
                >
                  <div
                    className="bg-no-repeat bg-center bg-cover w-8 h-8 rounded-md"
                    style={{
                      backgroundImage: `url(${user.profileImageUrl})`,
                    }}
                  ></div>
                </Link>
              </li>
            </>
          ) : null}

          {!user ? (
            <>
              <li className="inline-flex items-center justify-center">
                <Link to="/explore" className="inline-flex items-center">
                  <FontAwesomeIcon
                    className="h-4"
                    icon={faSearch}
                    size="sm"
                  ></FontAwesomeIcon>
                  <span className="ml-2">Explore</span>
                </Link>
              </li>
              <li className="flex items-center  justify-center gap-4">
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/signup">Signup</NavLink>
              </li>
            </>
          ) : null}
        </ul>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center gap-3">
        {user ? (
          <>
            {myTeams?.map((team) => {
              return (
                <Link key={team.slug} to={`/teams/${team.slug}`}>
                  <TeamIcon size="xs" team={team} />
                </Link>
              );
            }) ?? null}
            <Link to="/notifications" className="inline-flex items-center">
              <FontAwesomeIcon
                icon={faBell}
                size="lg"
                className="h-4"
              ></FontAwesomeIcon>
            </Link>

            <Link to="/messages" className="inline-flex items-center">
              <FontAwesomeIcon
                icon={faMessage}
                size="lg"
                className="h-4"
              ></FontAwesomeIcon>
            </Link>
          </>
        ) : (
          <>
            <NavLink to="/login" className="">
              Login
            </NavLink>
            <NavLink to="/signup" className="">
              Signup
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
