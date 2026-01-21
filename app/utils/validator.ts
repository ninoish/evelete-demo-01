import * as z from "zod";

export const floatSchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    } else if (typeof value === "number") {
      // クライアント側で処理されて、サーバー側ではnumberになっている。
      return value;
    }
    return undefined;
  },
  z
    .number()
    .optional(), // optional で undefined を許容
);

export const intSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  } else if (typeof value === "number") {
    return Math.floor(value);
  }
  return undefined;
}, z.number().int().optional());

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, expected HH:mm");

export const formBooleanSchema = z.preprocess(
  (value) => (value === "true" ? true : false),
  z.boolean(),
);
