import { faCalendar, faUser } from "@fortawesome/free-regular-svg-icons";
import { faAdd, faHome, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TeamMember, User } from "@prisma/client";
import { Link, useRouteLoaderData } from "react-router";

export function Footer() {
  const data = useRouteLoaderData("root") as unknown as {
    user: User;
    teamMembers: TeamMember[];
  };
  const user = data?.user;

  return (
    <footer className="bg-white py-2 border-t border-neutral-200 block md:hidden">
      <nav>
        <ul className="flex justify-evenly items-center">
          <li>
            <Link to="/" className="flex flex-col items-center justify-center">
              <div className="h-6">
                <FontAwesomeIcon
                  icon={faHome}
                  size="1x"
                  className="h-6"
                ></FontAwesomeIcon>
              </div>
              <span>Home</span>
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link
                  to="/me/schedules"
                  className="flex flex-col items-center justify-center"
                >
                  <div className="h-6">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      size="1x"
                      className="h-6"
                    ></FontAwesomeIcon>
                  </div>
                  <span>Schedules</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/new"
                  className="flex flex-col items-center justify-center"
                >
                  <div className="h-6">
                    <FontAwesomeIcon
                      icon={faAdd}
                      size="1x"
                      className="h-6"
                    ></FontAwesomeIcon>
                  </div>
                  <span>Add</span>
                </Link>
              </li>
            </>
          ) : null}

          <li>
            <Link
              to="/explore"
              className="flex flex-col items-center justify-center"
            >
              <div className="h-6">
                <FontAwesomeIcon
                  icon={faSearch}
                  size="1x"
                  className="h-6"
                ></FontAwesomeIcon>
              </div>
              <span>Explore</span>
            </Link>
          </li>
          {user ? (
            <li>
              <Link
                to="/me"
                className="flex flex-col items-center justify-center"
              >
                <div
                  className="bg-no-repeat bg-center bg-cover w-6 h-6 rounded-md"
                  style={{
                    backgroundImage: `url(${user.profileImageUrl})`,
                  }}
                ></div>
                <span>Me</span>
              </Link>
            </li>
          ) : null}

          {!user ? (
            <li>
              <Link
                to="/signup"
                className="flex flex-col items-center justify-center"
              >
                <FontAwesomeIcon icon={faUser} size="1x"></FontAwesomeIcon>
                <span>Sign up</span>
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </footer>
  );
}
