import type { TeamActivityAttendanceResponseType } from "@prisma/client";
import { data, type ActionFunctionArgs } from "react-router";
import { Auth } from "~/services/auth.server";
import teamActivityServiceServer from "~/services/teamActivityService.server";

export async function action({ params, request }: ActionFunctionArgs) {
  if (!params.activityId) {
    throw data({ errorMessage: "Team Activity Not Found" }, { status: 404 });
  }

  const user = await new Auth().isAuthenticated(request);

  if (!user) {
    throw data({ errorMessage: "User Not Authorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const response = formData.get(
    "response",
  ) as TeamActivityAttendanceResponseType;

  if (!response) {
    throw data(
      { errorMessage: "Team Activity Attendance Response Not Found" },
      { status: 404 },
    );
  }

  const activity = await teamActivityServiceServer.getById(
    params.activityId,
    user.id,
  );

  if (!activity) {
    throw data({ errorMessage: "Team Activity Not Found" }, { status: 404 });
  }

  // 参加資格チェック
  const attendCheck = await teamActivityServiceServer.canAttend(
    activity,
    user.id,
  );

  if (!attendCheck.canAttend) {
    throw data({ errorMessage: "No Permission to attend" }, { status: 403 });
  }

  const res = await teamActivityServiceServer.respond(
    user.id,
    activity.id,
    response,
    attendCheck.status,
  );

  return { success: true, result: res };
}
