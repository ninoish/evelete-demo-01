import {
  type Prisma,
  TeamActivityAttendanceResponseType,
} from "@prisma/client";
import { Link, type LoaderFunctionArgs, data } from "react-router";
import { useLoaderData } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const db = getPrisma();

  const activity = await db.teamActivity.findUnique({
    where: { id: params.activityId },
    include: {
      attendanceResponses: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!activity) {
    throw data({ errorMessage: "Activity Not Found" }, { status: 404 });
  }

  const mappedResponses = activity.attendanceResponses.reduce(
    (mapped, res) => {
      mapped[res.response].push(res);
      return mapped;
    },
    {
      [TeamActivityAttendanceResponseType.GOING]:
        [] as Prisma.TeamActivityAttendanceResponseGetPayload<{
          include: { user: true };
        }>[],
      [TeamActivityAttendanceResponseType.NOT_GOING]:
        [] as Prisma.TeamActivityAttendanceResponseGetPayload<{
          include: { user: true };
        }>[],
      [TeamActivityAttendanceResponseType.MAYBE]:
        [] as Prisma.TeamActivityAttendanceResponseGetPayload<{
          include: { user: true };
        }>[],
      [TeamActivityAttendanceResponseType.CANCELED__USER_REASON]:
        [] as Prisma.TeamActivityAttendanceResponseGetPayload<{
          include: { user: true };
        }>[],
      [TeamActivityAttendanceResponseType.CANCELED__TEAM_REASON]:
        [] as Prisma.TeamActivityAttendanceResponseGetPayload<{
          include: { user: true };
        }>[],
    },
  );

  return { responses: mappedResponses };
};

export default function TeamActivityAttendeesRoute() {
  const { responses } = useLoaderData<typeof loader>();
  return (
    <div>
      <div>
        <h4 className="px-2 text-lg font-bold text-green-900">
          参加予定 ({responses[TeamActivityAttendanceResponseType.GOING].length}
          )
        </h4>

        <ul>
          {responses[TeamActivityAttendanceResponseType.GOING].map((res) => {
            return (
              <li key={res.userId} className="border-b px-2 py-2">
                <Link to={`/users/${res.user.slug}`}>
                  <div className="flex">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="mr-2">
                        {res.user.profileImageUrl ? (
                          <img
                            className="w-8 h-8 rounded"
                            src={res.user.profileImageUrl}
                          />
                        ) : null}
                      </div>
                      <div>{res.user.displayName}</div>
                      {res.isGuest ? (
                        <div className="text-purple-500">ゲスト</div>
                      ) : null}
                      {res.isInvited ? (
                        <div className="text-orange-500">招待</div>
                      ) : null}
                    </div>
                  </div>
                </Link>
                {res.responseComment ? (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 italic">
                      {res.responseComment}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {responses[TeamActivityAttendanceResponseType.CANCELED__TEAM_REASON]
        .length > 0 ? (
        <div className="mt-4">
          <h4 className="px-2 text-lg font-bold text-red-700">
            この予定はチームの都合でキャンセルされました
          </h4>

          <ul>
            {responses[
              TeamActivityAttendanceResponseType.CANCELED__TEAM_REASON
            ].map((res) => {
              return (
                <li key={res.userId} className="border-b px-2 py-2">
                  <Link to={`/users/${res.user.slug}`}>
                    <div className="flex">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="mr-2">
                          {res.user.profileImageUrl ? (
                            <img
                              className="w-8 h-8 rounded"
                              src={res.user.profileImageUrl}
                            />
                          ) : null}
                        </div>
                        <div>{res.user.displayName}</div>

                        {res.isGuest ? (
                          <div className="text-purple-500">ゲスト</div>
                        ) : null}
                        {res.isInvited ? (
                          <div className="text-orange-500">招待</div>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                  {res.responseComment ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 italic">
                        {res.responseComment}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {responses[TeamActivityAttendanceResponseType.NOT_GOING].length > 0 ? (
        <div className="mt-4">
          <h4 className="px-2 text-lg font-bold text-red-900">
            不参加 (
            {responses[TeamActivityAttendanceResponseType.NOT_GOING].length})
          </h4>

          <ul>
            {responses[TeamActivityAttendanceResponseType.NOT_GOING].map(
              (res) => {
                return (
                  <li key={res.userId} className="border-b px-2 py-2">
                    <div className="flex">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="mr-2">
                          {res.user.profileImageUrl ? (
                            <img
                              className="w-8 h-8 rounded"
                              src={res.user.profileImageUrl}
                            />
                          ) : null}
                        </div>
                        <div>{res.user.displayName}</div>

                        {res.isGuest ? (
                          <div className="text-purple-500">ゲスト</div>
                        ) : null}
                        {res.isInvited ? (
                          <div className="text-orange-500">招待</div>
                        ) : null}
                      </div>
                    </div>
                    {res.responseComment ? (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 italic">
                          {res.responseComment}
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              },
            )}
          </ul>
        </div>
      ) : null}

      {responses[TeamActivityAttendanceResponseType.MAYBE].length > 0 ? (
        <div className="mt-4">
          <h4 className="px-2 text-lg font-bold text-gray-700">
            未定 ({responses[TeamActivityAttendanceResponseType.MAYBE].length})
          </h4>

          <ul>
            {responses[TeamActivityAttendanceResponseType.MAYBE].map((res) => {
              return (
                <li key={res.userId} className="border-b px-2 py-2">
                  <Link to={`/users/${res.user.slug}`}>
                    <div className="flex">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="mr-2">
                          {res.user.profileImageUrl ? (
                            <img
                              className="w-8 h-8 rounded"
                              src={res.user.profileImageUrl}
                            />
                          ) : null}
                        </div>
                        <div>{res.user.displayName}</div>

                        {res.isGuest ? (
                          <div className="text-purple-500">ゲスト</div>
                        ) : null}
                        {res.isInvited ? (
                          <div className="text-orange-500">招待</div>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                  {res.responseComment ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 italic">
                        {res.responseComment}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {responses[TeamActivityAttendanceResponseType.CANCELED__USER_REASON]
        .length > 0 ? (
        <div className="mt-4">
          <h4 className="px-2 text-lg font-bold text-red-700">
            キャンセル (
            {
              responses[
                TeamActivityAttendanceResponseType.CANCELED__USER_REASON
              ].length
            }
            )
          </h4>

          <ul>
            {responses[
              TeamActivityAttendanceResponseType.CANCELED__USER_REASON
            ].map((res) => {
              return (
                <li key={res.userId} className="border-b px-2 py-2">
                  <Link to={`/users/${res.user.slug}`}>
                    <div className="flex">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="mr-2">
                          {res.user.profileImageUrl ? (
                            <img
                              className="w-8 h-8 rounded"
                              src={res.user.profileImageUrl}
                            />
                          ) : null}
                        </div>
                        <div>{res.user.displayName}</div>

                        {res.isGuest ? (
                          <div className="text-purple-500">ゲスト</div>
                        ) : null}
                        {res.isInvited ? (
                          <div className="text-orange-500">招待</div>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                  {res.cancelReason ? (
                    <div className="mt-2">
                      <p className="text-sm text-red-600 italic">
                        {res.cancelReason}
                      </p>
                    </div>
                  ) : null}
                  {res.responseComment ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 italic">
                        {res.responseComment}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
