import { HiOutlinePencil } from "react-icons/hi2";
import { IoScaleOutline, IoTrendingUpOutline } from "react-icons/io5";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { RankingIcon } from "@phosphor-icons/react";
import { FaDumbbell, FaRunning } from "react-icons/fa";

export const meta: MetaFunction = () => {
  return [
    { title: "Evelete" },
    { name: "description", content: "Welcome to Evelete!" },
  ];
};

export default function Index() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-center py-4 text-xl">New</h1>
      <ul className="flex flex-wrap gap-4 w-full px-4">
        {menuItems.map((m) => {
          return (
            <li className="w-full" key={m.title}>
              <Link
                to={m.path}
                className="box-border border rounded  block w-full shadow"
              >
                <div className="py-3 px-2 flex flex-col items-center justify-center gap-1">
                  {m.icon}
                  <h4>{m.title}</h4>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const menuItems = [
  {
    path: "/new/post",
    icon: <HiOutlinePencil size={24} />,
    title: "Post",
  },
  {
    path: "/new/body",
    icon: <IoScaleOutline size={24} />,
    title: "Body Data",
  },
  {
    path: "/new/activity",
    icon: <FaRunning size={24} />,
    title: "Schedule",
  },
  {
    path: "/new/teamActivity",
    icon: <FaRunning size={24} />,
    title: "Team Schedule",
  },
  {
    path: "/new/workout",
    icon: <FaDumbbell size={24} />,
    title: "Workout",
  },
  {
    path: "/new/record",
    icon: <IoTrendingUpOutline size={24} />,
    title: "Record",
  },
  {
    path: "/new/personalResult",
    icon: <RankingIcon size={24} />,
    title: "Result",
  },
];

// <>
//   <h1>デバッグ用 新規作成</h1>
//   <div className="flex flex-col gap-4">
//     <Link to="/new/activity">New personalActivity</Link>
//     <Link to="/new/body">New Body Data</Link>
//     <Link to="/new/ai">New Activity with AI</Link>
//     <Link to="/new/post">New Personal Post</Link>
//     <Link to="/new/personalResult">New Person Result</Link>
//     <Link to="/new/record">New Person Record</Link>
//     <Link to="/new/team">New Team</Link>
//     <Link to="/new/teamActivity">New Team Activity</Link>
//     <Link to="/new/teamResult">New Team Result</Link>
//     <Link to="/new/organization">New Organization</Link>
//     <Link to="/new/event">New Event</Link>
//     <Link to="/new/focus">New Personal Focus</Link>
//   </div>
// </>
