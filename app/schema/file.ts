import { z } from "zod";

const IMAGE_TYPES = ["image/jpg", "image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 5; // 5MB

// バイト単位のサイズをメガバイト単位に変換する
const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

export const FormImageFileSchema = z
  .instanceof(File, { message: "画像ファイルを選択してください" })
  .optional()
  // .refine((file) => file.length !== 0, { message: "必須です" })
  .refine((file) => !file || sizeInMB(file.size) <= MAX_IMAGE_SIZE, {
    message: "ファイルサイズは最大5MBです",
  })
  .refine((file) => !file || IMAGE_TYPES.includes(file.type), {
    message: ".jpgもしくは.pngのみ可能です",
  });
