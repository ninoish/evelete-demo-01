import { PersonalActivityVisibility } from "@prisma/client";
import { z } from "zod";

import { floatSchema, intSchema, timeSchema } from "~/utils/validator";

const IMAGE_TYPES = ["image/jpg", "image/png"];
const MAX_IMAGE_SIZE = 5; // 5MB

// バイト単位のサイズをメガバイト単位に変換する
const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

const BodyDataFormSchema = z
  .object({
    // name: z.string().optional(),
    description: z.string().optional(),
    // status: z.string(),
    visibility: z.enum([
      PersonalActivityVisibility.PRIVATE,
      PersonalActivityVisibility.FOLLOWERS,
      PersonalActivityVisibility.PUBLIC,
    ]),
    measurementDate: z.string().date(),
    measurementTime: timeSchema.or(z.literal("")).optional(),
    weight: z.coerce
      .number()
      .min(10, "体重は10以上")
      .max(500, "体重は500以下")
      .optional()
      .or(z.nan()),
    height: floatSchema.optional(),
    bodyFatMass: floatSchema.optional(),
    bodyFatPercentage: z.coerce
      .number()
      .min(1, "体脂肪率は1以上")
      .max(80, "体脂肪率は80以下")
      .optional()
      .or(z.nan()),
    bodyAge: intSchema.optional(),
    consumedCalories: floatSchema.optional(),
    bodyWater: floatSchema.optional(),
    proteinAmount: floatSchema.optional(),
    mineralAmount: floatSchema.optional(),
    muscleAmount: floatSchema.optional(),
    abdominalCircumference: floatSchema.optional(),
    chestCircumference: floatSchema.optional(),
    waistCircumference: floatSchema.optional(),
    hipCircumference: floatSchema.optional(),
    bodyImages: z
      .array(
        z
          .custom<FileList>()
          // .refine((file) => file.length !== 0, { message: "必須です" })
          .transform((file) => file[0])
          .refine((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE, {
            message: "ファイルサイズは最大5MBです",
          })
          .refine((file) => IMAGE_TYPES.includes(file.type), {
            message: ".jpgもしくは.pngのみ可能です",
          }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      const fields = [
        data.weight,
        data.height,
        data.bodyFatMass,
        data.bodyFatPercentage,
        data.bodyAge,
        data.consumedCalories,
        data.bodyWater,
        data.proteinAmount,
        data.mineralAmount,
        data.muscleAmount,
        data.abdominalCircumference,
        data.chestCircumference,
        data.waistCircumference,
        data.hipCircumference,
      ];
      return fields.some((val) => val !== undefined && val !== null);
    },
    {
      message: "最低1つ以上の身体情報を入力してください",
      path: ["weight"], // weight フィールドに関連付けられたエラーとして表示されます
    },
  );
export type BodyDataFormData = z.infer<typeof BodyDataFormSchema>;

export default BodyDataFormSchema;
