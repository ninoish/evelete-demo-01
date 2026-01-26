import { useStore } from "@tanstack/react-form";

const PRACTICE_SHOTS_ID = "golf-practice-shots";
const PRACTICE_SWINGS_ID = "golf-practice-swings";

type GolfPracticeFormProps = {
  form: any; // TanStack Form instance (useAppForm)
  onChange?: () => void; // 親に何か変更があったことを知らせたい場合
};

// personalRecords[] はサーバーに送る最終形式（親の管理）
// 例: { recordMasterId: string; recordValue: number }[]
// この子は shots/swings 入力を personalRecords[] へ即時反映する
export default function GolfPracticeForm({
  form,
  onChange,
}: GolfPracticeFormProps) {
  // 親フォームの personalRecords[] を購読
  const personalRecords: Array<{
    recordMasterId: string;
    recordValue: number;
  }> = useStore(form.store, (s: any) => s.values?.personalRecords ?? []);
  const description: string = useStore(
    form.store,
    (s: any) => s.values?.description ?? "",
  );

  // 読み出しヘルパー
  const getPrValue = (id: string): number => {
    const hit = personalRecords.find((r) => r.recordMasterId === id);
    return Number.isFinite(hit?.recordValue) ? Number(hit!.recordValue) : 0;
  };

  // 追加/更新ヘルパー
  const upsertPR = (id: string, value: number) => {
    form.setFieldValue(
      "personalRecords",
      (prev: Array<{ recordMasterId: string; recordValue: number }> = []) => {
        const next = [...prev];
        const i = next.findIndex((r) => r.recordMasterId === id);
        if (i >= 0) next[i] = { ...next[i], recordValue: value };
        else next.push({ recordMasterId: id, recordValue: value });
        return next;
      },
    );
    onChange?.();
  };

  // 表示用の現在値
  const shots = getPrValue(PRACTICE_SHOTS_ID);
  const swings = getPrValue(PRACTICE_SWINGS_ID);

  return (
    <section className="w-full space-y-4 p-4 rounded-2xl border bg-white shadow-sm">
      <h2 className="text-lg font-semibold">ゴルフ練習</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shots */}
        <label className="block">
          <span className="block text-sm font-medium mb-1">打球数</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-xl border px-3 py-2"
            name="shots"
            value={Number.isFinite(shots) ? String(shots) : "0"}
            onChange={(e) => {
              const v = Math.max(0, Math.floor(Number(e.target.value || 0)));
              upsertPR(PRACTICE_SHOTS_ID, v);
            }}
          />
        </label>

        {/* Swings */}
        <label className="block">
          <span className="block text-sm font-medium mb-1">素振り数</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-xl border px-3 py-2"
            name="swings"
            value={Number.isFinite(swings) ? String(swings) : "0"}
            onChange={(e) => {
              const v = Math.max(0, Math.floor(Number(e.target.value || 0)));
              upsertPR(PRACTICE_SWINGS_ID, v);
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-1">
        {/* description */}

        <label className="block">
          <span className="block text-sm font-medium">コメント</span>
          <textarea
            className="w-full rounded-xl border px-3 py-2"
            name="description"
            value={description}
            onChange={(e) => {
              console.log(e.target.value);
              form.setFieldValue("description", (prev: string = "") => {
                return e.target.value;
              });
              onChange?.();
            }}
          />
        </label>
      </div>
    </section>
  );
}
