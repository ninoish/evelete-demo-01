import { z } from "zod";

// ファイルサイズと MIME type のチェック
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "ファイルサイズは10MB以下にしてください",
  })
  .refine((file) => ACCEPTED_TYPES.includes(file.type), {
    message: "PNG, JPG画像または動画ファイルを選択してください",
  });

const NewRecordFormSchema = z.object({
  recordDate: z.string(),
  recordTime: z.string(),
  recordValue: z.string(),
  comment: z.string().optional(),
  files: z
    .any()
    .optional()
    .transform((value) => {
      if (!value) return [];
      if (value instanceof FileList) {
        return Array.from(value);
      }
      return value;
    })
    .refine(
      (files) =>
        Array.isArray(files) && files.every((file) => file instanceof File),
      { message: "ファイルの配列を指定してください" },
    )
    .refine((files) => files.every((file) => file.size <= MAX_FILE_SIZE), {
      message: "各ファイルは10MB以下でなければなりません",
    })
    .refine(
      (files) => files.every((file) => ACCEPTED_TYPES.includes(file.type)),
      { message: "PNG, JPGまたは動画ファイルのみアップロード可能です" },
    ),
});

export type NewRecordForm = z.infer<typeof NewRecordFormSchema>;

export default NewRecordFormSchema;
