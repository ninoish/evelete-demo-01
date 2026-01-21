import {
  PersonalActivityStatus,
  PersonalActivityType,
  PersonalActivityVisibility,
} from "@prisma/client";
import { z } from "zod";
import { FormImageFileSchema } from "~/schema/file";

import { timeSchema } from "~/utils/validator";

const WorkSetSchema = z.object({
  weight: z.coerce.number().min(0),
  reps: z.coerce.number().int().min(0),
  order: z.coerce.number().int().min(1),
});

const OneSetSchema = z.object({
  name: z.string().min(1),
  order: z.coerce.number().int().min(1),
  value: z.string().optional().default(""),
  weights: z.array(z.coerce.number().min(0)).default([]),
  totalReps: z.coerce.number().int().min(0).default(0),
  workSets: z.array(WorkSetSchema).default([]),
});

const PersonalRecordSchema = z.record(z.any());

const PersonalActivityFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  activityType: z.enum([
    PersonalActivityType.PRACTICE,
    PersonalActivityType.WORKOUT,
    PersonalActivityType.PRACTICAL_PRACTICE,
    PersonalActivityType.COMPETITION,
    PersonalActivityType.ENJOY,
    PersonalActivityType.REHAB,
    PersonalActivityType.RECORD_TRIAL,
  ]),
  visibility: z.enum([
    PersonalActivityVisibility.PRIVATE,
    PersonalActivityVisibility.FOLLOWERS,
    PersonalActivityVisibility.PUBLIC,
  ]),
  sport: z.string(),
  sportAttributes: z.array(z.string()),
  startDate: z.string().date(),
  startTime: timeSchema,
  endDate: z.string().date().optional(),
  endTime: timeSchema.or(z.literal("")).optional(),
  status: z.enum([
    PersonalActivityStatus.PUBLISHED,
    PersonalActivityStatus.DRAFT,
  ]),
  place: z.string().optional(),
  menus: z.array(z.custom<{}>()).optional(),
  personalRecords: z.array(PersonalRecordSchema),
  personalResults: z.array(z.object({})).optional(),
  files: z.array(FormImageFileSchema),
});
export type PersonalActivityFormValues = z.infer<
  typeof PersonalActivityFormSchema
>;

export default PersonalActivityFormSchema;
