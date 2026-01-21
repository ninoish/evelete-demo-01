import { z } from "zod";

export const workoutFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  activityType: z.string(),
  sports: z.object({}).array(),
  sportAttributes: z.object({}).array(),
  startDatetime: z.date(),
  endDatetime: z.date(),
  status: z.string(),
  place: z.string(),
  menus: z
    .object({
      name: z.string(),
      order: z.number(),
      workoutMenuId: z.number(),
      personalActivityId: z.string(),
      durationSeconds: z.number(),
      setCount: z.number(),
      repetitionCount: z.number(),
    })
    .array(),
});
