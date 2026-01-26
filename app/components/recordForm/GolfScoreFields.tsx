import { NumberField } from "~/components/recordForm/fields/NumberField";
import type { ReactFormExtendedApi } from "@tanstack/react-form";

type GolfFormApi = ReactFormExtendedApi<
  {
    recordValue: number;
    numberOfHoles: number;
    par: number;
    holes?: Array<{
      courseName?: string;
      holeNo?: number;
      par?: number;
      userScore: number;
    }>;
  },
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export function GolfScoreFields({ form }: { form: GolfFormApi }) {
  return (
    <>
      {/* ユーザースコア */}
      <form.Field name="recordValue">
        {(f) => <NumberField label="合計スコア" field={f} />}
      </form.Field>

      <div className="flex items-center gap-2">
        <form.Field name="numberOfHoles">
          {(f) => <NumberField label="ホール数" field={f} />}
        </form.Field>

        <form.Field name="par">
          {(f) => <NumberField label="パー" field={f} />}
        </form.Field>
      </div>

      {/* holes 配列 */}
      <form.Field name="holes" mode="array">
        {(fieldArray) => (
          <div className="flex flex-col gap-2">
            {(fieldArray.state.value || []).map((_, idx) => (
              <div key={idx} className="flex gap-1 items-end">
                {/* 
                <form.Field name={`holes[${idx}].courseName`}>
                  {(f) => <TextField label="Course" field={f} />}
                </form.Field> 
                */}
                <form.Field name={`holes[${idx}].holeNo`}>
                  {(f) => <NumberField label="Hole No" field={f} />}
                </form.Field>
                <form.Field name={`holes[${idx}].par`}>
                  {(f) => <NumberField label="Par" field={f} />}
                </form.Field>
                <form.Field name={`holes[${idx}].userScore`}>
                  {(f) => <NumberField label="Score" field={f} />}
                </form.Field>
                <button
                  type="button"
                  onClick={() => fieldArray.removeValue(idx)}
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                for (let i = 0; i < form.getFieldValue("numberOfHoles"); i++) {
                  fieldArray.pushValue({
                    //                    courseName: "",
                    holeNo: i + 1,
                    par: 4,
                    userScore: 8,
                  });
                }
              }}
            >
              ホールを追加
            </button>

            <pre>{JSON.stringify(fieldArray.state.value)}</pre>
          </div>
        )}
      </form.Field>
    </>
  );
}
