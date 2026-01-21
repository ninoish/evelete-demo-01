import {
  FaChevronCircleRight,
  FaChevronRight,
  FaComment,
  FaHeart,
} from "react-icons/fa";
import type { LoaderFunctionArgs } from "react-router";
import { Link, redirect, useLoaderData } from "react-router";
import ActivityGraph from "~/components/ActivityGraph";
import RecordDisplayListItem from "~/components/RecordDisplayListItem";
import TeamListItem from "~/components/TeamListItem";
import { Auth } from "~/services/auth.server";
import personalActivityServer from "~/services/personalActivity.server";
import userServiceServer from "~/services/userService.server";
import { now } from "~/utils/datetime";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: optimize
  const authed = await new Auth().isAuthenticated(request);
  if (!authed) {
    return redirect("/login");
  }

  const me = await userServiceServer.getForProfileById(authed.id);

  console.log(JSON.stringify(me));

  const activitiesForGraph = await personalActivityServer.getByUserSlug(
    authed.slug,
    authed.id,
    // now().subtract(3, "months").toDate(),
    now()
      .subtract(1, "year")
      .toDate(),
    now().add(2, "weeks").toDate(),
  );

  return { me, activitiesForGraph };
};

export default function MeIndexRoute() {
  const data = useLoaderData<typeof loader>();
  const { me, activitiesForGraph } = data;
  const myRecordHighlights = me.personalRecords.filter((r) => r.isHighlighted);
  return (
    <div className="py-4">
      <ActivityGraph activities={activitiesForGraph} />

      <div className="p-4 flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-2xl italic font-bold">Records</h4>
            <Link to="records">
              <FaChevronRight size={20} />
            </Link>
          </div>

          {myRecordHighlights.map((rh) => {
            return <div key={rh.id}>{rh.recordMaster.name}</div>;
          })}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-2xl italic font-bold">Posts</h4>
          </div>

          <ul className="flex flex-col gap-4">
            {new Array(20).fill({}).map((_, indx) => {
              return (
                <li key={indx}>
                  <div className="">
                    <div className="flex gap-4">
                      <span>Location</span>
                      <span>Connections to played with</span>
                    </div>
                    <div className="rounded w-full h-72 bg-gray-400 text-white flex items-center justify-center">
                      <span>Image / Videos</span>
                    </div>
                    <div className="py-1 px-1 flex gap-2">
                      <span className="inline-flex gap-2 items-center">
                        <FaHeart size={20} />
                        <span>84</span>
                      </span>
                      <span className="inline-flex gap-2 items-center">
                        <FaComment size={20} />
                        <span>8</span>
                      </span>
                    </div>
                    <div>
                      <p>
                        Text dummy dummy dummy dummy dummy dummy dummy dummy
                        dummy dummy dummy dummy....
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
