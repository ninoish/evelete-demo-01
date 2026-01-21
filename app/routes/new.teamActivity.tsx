import {
  TeamActivityParticipationRequirementType,
  TeamActivityPaymentMethod,
} from "@prisma/client";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import { useLoaderData, useSubmit } from "react-router";

import {
  newTeamActivityFormSchema,
  TeamActivityForm,
} from "~/components/form/TeamActivityForm";
import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import teamMemberService from "~/services/teamMemberService.server";
import teamServiceServer from "~/services/teamService.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  const db = getPrisma();

  const formData = await request.clone().formData();
  const rawData = Object.fromEntries(formData.entries());

  const groupIdsRaw = formData.getAll("groupIds") as string[];
  const placesRaw = formData.getAll("places") as string[];
  const sportAttributeIdsRaw = formData.getAll("sportAttributeIds") as string[];
  const dropinAgeRangeRaw = formData.getAll("dropinAgeRange") as string[];

  const data = {
    ...rawData,
    groupIds: groupIdsRaw,
    places: placesRaw,
    sportAttributeIds: sportAttributeIdsRaw,
    dropinAgeRange: dropinAgeRangeRaw,
  };

  console.log("data");
  console.log(data);

  const validationResult = newTeamActivityFormSchema.safeParse(data);

  if (!validationResult.success) {
    console.log(validationResult.error);
    return Response.json({ error: validationResult.error }, { status: 400 });
  }

  const {
    name,
    description,
    teamActivityType,
    startDate,
    startTime,
    endDate,
    endTime,
    teamId,
    groupIds,
    status,
    places,
    paymentMethod,
    priceForInvited,
    priceForGuest,
    priceForMember,
    isGuestAllowed,
    isInvitationAllowed,
    maxAttendees,
    maxGuestAttendees,
    maxInvitationAttendees,
    sportId,
    sportAttributeIds,
    dropinAgeRange,
    dropinGender,
  } = validationResult.data;

  // TODO: format
  const startDatetime = new Date(startDate + " " + startTime);
  const endDatetime = endTime ? new Date(startDate + " " + endTime) : null;

  const dropinRequirements = [];
  if (dropinAgeRange?.length) {
    const min = dropinAgeRange[0];
    const max = dropinAgeRange[1];
    dropinRequirements.push({
      type: TeamActivityParticipationRequirementType.MinAge,
      intValue: min,
    });
    dropinRequirements.push({
      type: TeamActivityParticipationRequirementType.MaxAge,
      intValue: min,
    });
  }

  if (dropinGender?.length === 1) {
    // 男女両方許容の際は追加しない
    dropinRequirements.push({
      type: TeamActivityParticipationRequirementType.Gender,
      stringValue: dropinGender,
    });
  }

  const result = await db.teamActivity.create({
    data: {
      name,
      description,
      teamActivityType,
      startDatetime: startDatetime,
      endDatetime: endDatetime,
      durationMinutes: endDatetime
        ? (endDatetime.getTime() - startDatetime.getTime()) / (1000 * 60)
        : null,
      status,
      place: places.length ? places[0].value : null,
      paymentMethod: paymentMethod ? [paymentMethod] : undefined,
      teamId: teamId,
      // TODO: multi currency
      priceForInvited: priceForInvited
        ? Number.parseInt(priceForInvited, 10)
        : null,
      priceForGuest: priceForGuest ? Number.parseInt(priceForGuest, 10) : null,
      priceForMember: priceForMember
        ? Number.parseInt(priceForMember, 10)
        : null,
      isGuestAllowed: isGuestAllowed,
      isInvitationAllowed,
      maxAttendees: maxAttendees ?? null,
      maxGuestAttendees: maxGuestAttendees ?? null,
      maxInvitationAttendees: maxInvitationAttendees ?? null,
      sportId: sportId,
      sportAttributes: {
        create: sportAttributeIds.map((saId) => {
          return {
            sportAttributeId: saId,
          };
        }),
      },
      groups: {
        create: groupIds.map((gId) => {
          return {
            teamGroupId: gId,
          };
        }),
      },
      participationRequirements: {
        create: dropinRequirements,
      },
      creatorId: user.id,
    },
  });

  console.log(result);

  return redirect(`/teams/activities/${result.id}`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const searchParams = new URL(request.url).searchParams;
  const teamSlug = searchParams.get("team") ?? "";

  const team = await teamServiceServer.getTeamBySlug(
    teamSlug,
    user?.id ?? null,
  );

  if (team) {
    const meMember = team
      ? team.members.find((tm) => tm.userId === user?.id)
      : null;
    if (!meMember?.canManageTeamActivity) {
      return redirect("/");
    }
  }

  const myMembers = await teamMemberService.getMyTeamMembers(user.id);

  console.log(myMembers);

  if (!myMembers?.length) {
    return redirect("/");
  }

  const manageableMyMembers = myMembers.filter((mm) => {
    return mm.canManageTeamActivity;
  });

  if (!manageableMyMembers.length) {
    return redirect("/");
  }

  const teams = manageableMyMembers.map((m) => {
    return m.team;
  });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  return { user, teams, selectedTeam: team, apiKey };
};

export default function NewTeamActivityFormRoute() {
  const data = useLoaderData<typeof loader>();

  const { user, teams, selectedTeam, apiKey } = data;

  return (
    <div className="py-2 px-2 md:p-8 max-w-screen-xl mx-auto">
      <h1 className="text-lg md:text-xl mb-2 font-bold">
        {selectedTeam ? (
          <>
            <span>
              <img src={selectedTeam.imageUrl} />
            </span>
            <span>{selectedTeam.displayName} 新規活動予定</span>
          </>
        ) : (
          "新規チーム活動予定"
        )}
      </h1>

      <div className="max-w-screen-xl mx-auto">
        <TeamActivityForm
          teams={teams}
          team={selectedTeam ?? null}
          mapsApiKey={apiKey}
        />
      </div>
    </div>
  );
}
