import type { RecordMaster } from "@prisma/client";
import {
  z,
  ZodArray,
  ZodObject,
  ZodDefault,
  ZodNullable,
  ZodOptional,
} from "zod";
import { LongJumpFields } from "~/components/recordForm/LongJumpFields";
import { GolfScoreFields } from "./GolfScoreFields";
import { timeSchema } from "~/utils/validator";
import dayjs from "dayjs";

export const CommonRecordFormSchema = z.object({
  // TODO: 過去の日付のみ登録可能にする
  recordDate: z.iso.date(),
  recordTime: timeSchema.optional(),
  place: z.object({ name: z.string() }).optional(),
  comment: z.string().optional(),
  recordValue: z.number(),
  // TODO: ファイルは後で実装
  /*
  files: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: "ファイルサイズは最大5MBです",
    })
    .refine(
      (file) =>
        !file || ["image/jpg", "image/jpeg", "image/png"].includes(file.type),
      {
        message: ".jpgもしくは.pngのみ可能です",
      },
    ),
    */
});

export const LongDistanceJumpFormSchema = z.object({
  wind: z.coerce.number().optional(),
  distance: z.coerce.number().min(0),
});

export const GolfScoreFormSchema = z.object({
  numberOfHoles: z.coerce.number().optional(),
  par: z.coerce.number().optional(),
  recordValue: z.coerce.number(),
  holes: z
    .array(
      z.object({
        courseName: z.string().optional(),
        holeNo: z.coerce.number().optional(),
        par: z.coerce.number().optional(),
        userScore: z.coerce.number(),
      }),
    )
    .optional(),
});

const getSpecificSchema = (id: string): any | null => {
  const entry = specificRecordMap[id];
  return entry ? entry.schema : null;
};

const getRecordMasterSchema = (recordMaster: RecordMaster) => {
  return CommonRecordFormSchema.merge(
    z.object({
      recordValue: z.coerce.number(),
    }),
  );
};

export const getPersonalRecordDefaultValues = (recordMaster: RecordMaster) => {
  if (recordMaster.id in specificRecordMap) {
    return specificRecordMap[recordMaster.id].defaultValues;
  }
  const now = dayjs();
  return {
    recordDate: now.format('YYYY-MM-DD'),
    recordTime: now.format('HH:mm'),
    place: { name: "" },
    comment: undefined,
    recordValue: undefined,
  };
};

export const getPersonalRecordSchema = (recordMaster: RecordMaster): any => {
  const specialSchema = getSpecificSchema(recordMaster.id);
  if (specialSchema) {
    return specialSchema;
  }
  return getRecordMasterSchema(recordMaster);
};

type SpecificRecordEntry = {
  schema: any;
  component: React.FC<{ form: any }>;
  defaultValues: Record<string, any>;
};

export const specificRecordMap: Record<string, SpecificRecordEntry> = {
  "long-jump": {
    schema: CommonRecordFormSchema.extend(LongDistanceJumpFormSchema.shape),
    component: LongJumpFields,
    defaultValues: {},
  },
  "golf-18h-score": {
    schema: CommonRecordFormSchema.extend(GolfScoreFormSchema.shape).refine(
      (data) => !!data.recordValue,
      {
        path: ["recordValue"],
        message: "合計スコアは必須です",
      },
    ),
    component: GolfScoreFields,
    defaultValues: {
      recordValue: undefined,
      numberOfHoles: 18,
      par: 72,
      holes: [],
    },
  },
};

function unwrapSchema(schema: any): any {
  if (
    schema instanceof ZodOptional ||
    schema instanceof ZodNullable ||
    schema instanceof ZodDefault
  ) {
    return unwrapSchema(schema.def.innerType);
  }
  return schema;
}

// 2) Object スキーマの中から「配列フィールド」のキーだけ取り出す関数
export function getArraySchemaKeys(schema: any): string[] {
  const maybeObj = schema; // schema instanceof ZodEffects ? schema._def.schema :

  if (!(maybeObj instanceof ZodObject)) {
    throw new Error("ZodObject が渡されることを期待しています");
  }

  // v3: _def.shape() だったが、v4: _def.shape がそのまま shape オブジェクト
  const shape = (maybeObj as any)._def.shape as Record<string, any>;

  return Object.entries(shape)
    .filter(([key, fieldSchema]) => {
      const unwrapped = unwrapSchema(fieldSchema);

      console.log(unwrapped._def.typeName);
      return unwrapped instanceof ZodArray;
    })
    .map(([key]) => key);
}

export function getObjectSchemaKeys(schema: any): string[] {
  // まず最上位が Effects なら剥がして ZodObject を得る
  const maybeObj = schema; // schema instanceof ZodEffects ? schema._def.schema :

  if (!(maybeObj instanceof ZodObject)) {
    throw new Error("ZodObject が渡されることを期待しています");
  }

  // shape() で { key: ZodType } のマップを取り出す
  const shape = (maybeObj as any)._def.shape as Record<string, any>;

  // 各フィールドを unwrap して、ZodArray かどうか判定
  return Object.entries(shape)
    .filter(([key, fieldSchema]) => {
      const unwrapped = unwrapSchema(fieldSchema);
      return unwrapped instanceof ZodObject;
    })
    .map(([key]) => key);
}
