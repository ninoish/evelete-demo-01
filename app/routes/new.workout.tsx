import { zodResolver } from "@hookform/resolvers/zod";
import {
  DistanceUnit,
  PersonalActivityVisibility,
  WeightUnit,
} from "@prisma/client";
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import { redirect } from "react-router";
import { useLoaderData } from "react-router";
import { useState } from "react";
import { getValidatedFormData } from "remix-hook-form";
import { z } from "zod";
import personalActivityModel from "~/models/personalActivityModel";

import { Auth } from "~/services/auth.server";
import { floatSchema, intSchema, timeSchema } from "~/utils/validator";

export const workoutFormSchema = z.object({
  // name: z.string().optional(),
  description: z.string().optional(),
  // status: z.string(),
  visibility: z.enum([
    PersonalActivityVisibility.PRIVATE,
    PersonalActivityVisibility.FOLLOWERS,
    PersonalActivityVisibility.PUBLIC,
  ]),
  startDate: z.string().date(),
  startTime: timeSchema.or(z.literal("")).optional(),
  endDate: z.string().date(),
  endTime: timeSchema.or(z.literal("")).optional(),
  menus: z.array(z.string()),
  place: z.array(z.string()),
  sportId: z.string().optional(),
});

export type WorkoutFormData = z.infer<typeof workoutFormSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }
  return Response.json({ user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const { data, errors } = await getValidatedFormData(
    request,
    zodResolver(workoutFormSchema),
  );

  if (errors) {
    return Response.json({ error: errors }, { status: 400 });
  }

  const parseResult = workoutFormSchema.safeParse(data);

  if (!parseResult.success) {
    console.log("parseResult", JSON.stringify(parseResult));
    return Response.json(
      { error: parseResult.error.errors[0].message },
      { status: 400 },
    );
  }

  const pa = await personalActivityModel.addWorkout({
    userId: user.id,
    data: parseResult.data,
  });

  if (!pa) {
    return {
      formErrors: ["Failed to create the activity. Please try again later."],
    };
  }

  return redirect(`/users/${user.slug}/activities/${pa.id}`);
};

export default function NewWorkoutRoute() {
  const [activityType, setActivityType] = useState("workout");

  const data = useLoaderData<typeof loader>();

  return (
    <div className="w-full md:w-4/5 lg:w-2/3 mx-auto py-4">
      <h1 className="text-2xl">ワークアウト</h1>
    </div>
  );
}
