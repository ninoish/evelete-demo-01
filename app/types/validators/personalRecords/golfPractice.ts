import { z } from "zod";

export const golfClubRowSchema = z.object({
  club: z.string().min(1, "クラブを選択してください"), // 例: "Driver", "7i" など。実運用ではIDでもOK
  shots: z
    .number({ invalid_type_error: "球数は数値で入力してください" })
    .int("整数で入力してください")
    .min(0, "0以上")
    .max(2000, "多すぎます"),
  swings: z
    .number({ invalid_type_error: "数値で入力してください" })
    .int("整数で入力してください")
    .min(0, "0以上")
    .max(5000, "多すぎます"),
  note: z.string().max(120).optional().or(z.literal("")),
});

export const golfPracticeDataSchema = z.object({
  shots: z
    .number({ invalid_type_error: "球数合計は数値で入力してください" })
    .int()
    .min(0)
    .max(10000),
  swings: z
    .number({ invalid_type_error: "素振り回数は数値で入力してください" })
    .int()
    .min(0)
    .max(20000),
  comment: z.string().max(500).optional().or(z.literal("")),
  byClub: z.array(golfClubRowSchema).default([]),
  attachments: z
    .array(
      z.object({
        kind: z.enum(["image", "video"]),
        url: z.string().url(),
        name: z.string().optional(),
      }),
    )
    .default([]),
});

export type GolfPracticeData = z.infer<typeof golfPracticeDataSchema>;

export const golfPracticeRecordSchema = z.object({
  formType: z.literal("golfPractice"),
  order: z.number().int().min(1),
  data: golfPracticeDataSchema,
});
export type GolfPracticeRecord = z.infer<typeof golfPracticeRecordSchema>;
