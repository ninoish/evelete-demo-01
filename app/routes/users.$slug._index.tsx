import { FaComment, FaHeart } from "react-icons/fa";
import { data, type LoaderFunctionArgs, useLoaderData } from "react-router";
import ActivityGraph from "~/components/ActivityGraph";
import { Auth } from "~/services/auth.server";
import personalActivityServer from "~/services/personalActivity.server";
import { now } from "~/utils/datetime";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const authed = await new Auth().isAuthenticated(request);

  const { slug: userSlug } = params;
  if (!userSlug) {
    throw data({ errorMessage: "Invalid parameter" }, { status: 400 });
  }
  const activities = await personalActivityServer.getByUserSlug(
    userSlug,
    authed?.id,
    // now().subtract(3, "months").toDate(),
    now()
      .subtract(1, "year")
      .toDate(),
    now().toDate(),
  );

  return { activities };
};

export default function UserIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="">
      <div className="pt-4 pb-0">
        <ActivityGraph activities={data.activities} includeFuture={false} />
      </div>
      <div className="p-4">
        <p className="mb-2 p-4 rounded border bg-yellow-100">
          ここにユーザーが、他のユーザーに見て欲しい記録や戦績が表示されます。
        </p>

        <div className="my-4 bg-gray-600 text-white rounded w-full p-20 flex items-center justify-center">
          <span>Ads here</span>
        </div>

        <p className="p-4 pb-96 rounded border bg-yellow-200">
          ここにユーザーの投稿や記録などがタイムライン形式で表示されます。
        </p>
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
