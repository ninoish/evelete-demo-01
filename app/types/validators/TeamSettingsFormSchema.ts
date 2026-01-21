import { BiologicalGender } from "@prisma/client";
import { z } from "zod";
import { FormImageFileSchema } from "~/schema/file";

const TeamSettingsFormSchema = z.object({
  displayName: z.string(),
  abbreviation: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  themeColor: z.string().optional(),
  canRequestToJoin: z.coerce.boolean(),
  canSearch: z.coerce.boolean(),
  canViewActivities: z.coerce.boolean(),
  canViewMembers: z.coerce.boolean(),
  acceptMembersAgeUnder18: z.coerce.boolean(),

  minMemberSkillLevel: z.coerce
    .number()
    .min(1, "1以上")
    .max(100, "100以下")
    .optional(),
  maxMemberSkillLevel: z.coerce
    .number()
    .min(1, "1以上")
    .max(100, "100以下")
    .optional(),
  minJoinSkillLevel: z.coerce
    .number()
    .min(1, "1以上")
    .max(100, "100以下")
    .optional(),
  maxJoinSkillLevel: z.coerce
    .number()
    .min(1, "1以上")
    .max(100, "100以下")
    .optional(),
  minJoinAge: z.coerce.number().min(1, "1以上").max(120, "120以下").optional(),
  maxJoinAge: z.coerce.number().min(1, "1以上").max(120, "100以下").optional(),
  joinPlayerGender: z
    .array(z.enum([BiologicalGender.Female, BiologicalGender.Male]))
    .optional(),
  recruitingMessage: z.string().optional(),
  establishedAt: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((date) => !date || !isNaN(date.getTime()), {
      message: "Invalid Date",
    }),
  currency: z.string().optional(), // TODO: enum or db values

  sports: z.array(z.string()),
  sportAttributes: z.array(z.string()).optional(),
  places: z.array(z.string()),
  coverImageFile: FormImageFileSchema,
  iconImageFile: FormImageFileSchema,
});
export type TeamSettingsFormData = z.infer<typeof TeamSettingsFormSchema>;

export default TeamSettingsFormSchema;
