import * as React from "react";
import { useStore } from "@tanstack/react-form";

// personalRecords 用の ID 定義
const ROUND_COURSE_ID = "golf-round-course";           // recordData: { name: string }
const ROUND_HOLES_COUNT_ID = "golf-round-holes-count";  // recordValue: number
const ROUND_TOTAL_PAR_ID = "golf-round-total-par";      // recordValue: number
const ROUND_TOTAL_SCORE_ID = "golf-round-total-score";  // recordValue: number (holes[].strokes 合計)
const ROUND_HOLES_DETAIL_ID = "golf-round-holes-detail";// recordData: { holes: Hole[] }

type Hole = {
  index: number; // 1-based
  par: number;
  yard: number;
  strokes: number; // 結果（打数）
  putts: number;
  maxDrive: number; // 最大飛距離
};

export function GolfRoundForm({ form, onChange }: { form: any; onChange?: () => void }) {
  const personalRecords: Array<{ recordMasterId: string; recordValue?: number; recordData?: any }>
    = useStore(form.store, (s: any) => s.values?.personalRecords ?? []);

  const getNumber = (id: string, fallback = 0): number => {
    const hit = personalRecords.find((r) => r.recordMasterId === id);
    const v = hit?.recordValue ?? hit?.recordData?.value;
    return Number.isFinite(v) ? Number(v) : fallback;
  };
  const getString = (id: string, fallback = ""): string => {
    const hit = personalRecords.find((r) => r.recordMasterId === id);
    const v = (hit?.recordData?.name as string) ?? (hit?.recordData?.value as string);
    return typeof v === "string" ? v : fallback;
  };
  const getHoles = (): Hole[] => {
    const hit = personalRecords.find((r) => r.recordMasterId === ROUND_HOLES_DETAIL_ID);
    const holes: Hole[] = hit?.recordData?.holes ?? [];
    return Array.isArray(holes) ? holes : [];
  };

  const upsertNumber = (id: string, value: number) => {
    form.setFieldValue("personalRecords", (prev: any[] = []) => {
      const next = [...prev];
      const i = next.findIndex((r) => r.recordMasterId === id);
      if (i >= 0) next[i] = { ...next[i], recordValue: value };
      else next.push({ recordMasterId: id, recordValue: value });
      return next;
    });
    onChange?.();
  };
  const upsertString = (id: string, name: string) => {
    form.setFieldValue("personalRecords", (prev: any[] = []) => {
      const next = [...prev];
      const i = next.findIndex((r) => r.recordMasterId === id);
      const record = { recordMasterId: id, recordData: { name } };
      if (i >= 0) next[i] = { ...next[i], ...record };
      else next.push(record);
      return next;
    });
    onChange?.();
  };
  const upsertHoles = (holes: Hole[]) => {
    form.setFieldValue("personalRecords", (prev: any[] = []) => {
      const next = [...prev];
      const i = next.findIndex((r) => r.recordMasterId === ROUND_HOLES_DETAIL_ID);
      const record = { recordMasterId: ROUND_HOLES_DETAIL_ID, recordData: { holes } };
      if (i >= 0) {
        next[i] = { ...next[i], ...record };
      } else {
        next.push(record);
      }
      console.log(next);
      return next;
    });
    onChange?.();
  };

  // 現在の値（親の personalRecords から読み出し）
  const courseName = getString(ROUND_COURSE_ID, "");
  const holeCount = Math.max(1, getNumber(ROUND_HOLES_COUNT_ID, 18));
  const totalPar = Math.max(0, getNumber(ROUND_TOTAL_PAR_ID, 72));
  const holes = React.useMemo<Hole[]>(() => {
    const cur = getHoles();
    // ホール数変更に応じて配列長を調整
    if (cur.length === holeCount) return cur;
    const next: Hole[] = Array.from({ length: holeCount }, (_, i) => {
      const from = cur[i];
      return from ?? { index: i + 1, par: 4, yard: 350, strokes: 4, putts: 0, maxDrive: 0 };
    });
    return next;
  }, [holeCount, personalRecords]);

  // totalScore は holes[].strokes の合計から自動計算
  const totalScore = React.useMemo(() => holes.reduce((s, h) => s + (Number(h.strokes) || 0), 0), [holes]);

  // 親へ副作用的に反映（holes/totalScore）
  React.useEffect(() => {
    upsertHoles(holes);
    upsertNumber(ROUND_TOTAL_SCORE_ID, totalScore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(holes)]);

  return (
    <section className="w-full space-y-4 p-4 rounded-2xl border bg-white shadow-sm">
      <h2 className="text-lg font-semibold">ゴルフ ラウンド記録</h2>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-2">
        <label className="block col-span-3">
          <span className="block text-sm font-medium mb-1">コース名</span>
          <input
            type="text"
            className="w-full rounded-xl border px-3 py-2"
            value={courseName}
            onChange={(e) => upsertString(ROUND_COURSE_ID, e.target.value)}
            placeholder="例：武蔵野カントリークラブ"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">ホール数</span>
          <select
            className="w-full rounded-xl border px-3 py-2"
            value={holeCount}
            onChange={(e) => upsertNumber(ROUND_HOLES_COUNT_ID, Number(e.target.value))}
          >
            <option value={9}>9</option>
            <option value={18}>18</option>
            <option value={27}>27</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">Par (合計)</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-xl border px-3 py-2"
            value={totalPar}
            onChange={(e) => upsertNumber(ROUND_TOTAL_PAR_ID, Math.max(0, Math.floor(Number(e.target.value || 0))))}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">最終スコア</span>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-xl border px-3 py-2 bg-gray-100"
            value={totalScore}
            readOnly
          />
        </label>
      </div>

      {/* ホールごとの記録 */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">ホールごとの記録</h3>
        {holes.map((h, i) => (
          <div key={i} className="border-b last:border-b-0 pb-4 grid grid-cols-6 md:grid-cols-12 gap-x-4 gap-y-2 items-end">
            <div className="col-span-1">
              <label className="block text-xs text-gray-600 mb-1">#</label>
              <input type="number" className="w-full border-none py-2" style={{ "--color-border": "none"}} value={h.index} readOnly />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Par</label>
              <input
                type="number"
                inputMode="numeric"
                className="w-full rounded-xl border px-3 py-2"
                value={h.par}
                onChange={(e) => {
                  const v = Math.max(3, Math.floor(Number(e.target.value || 3)));
                  const next = holes.slice();
                  next[i] = { ...next[i], par: v };
                  upsertHoles(next);
                }}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-gray-600 mb-1">Yard</label>
              <input
                type="number"
                inputMode="numeric"
                className="w-full rounded-xl border px-3 py-2"
                value={h.yard}
                onChange={(e) => {
                  const v = Math.max(1, Math.floor(Number(e.target.value || 0)));
                  const next = holes.slice();
                  next[i] = { ...next[i], yard: v };
                  upsertHoles(next);
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">結果（打数）</label>
              <input
                type="number"
                inputMode="numeric"
                className="w-full rounded-xl border px-3 py-2"
                value={Number.isFinite(h.strokes) ? String(h.strokes) : "0"}
                onChange={(e) => {
                  const v = Math.max(0, Math.floor(Number(e.target.value || 0)));
                  const next = holes.slice();
                  next[i] = { ...next[i], strokes: v };
                  upsertHoles(next);
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Putt 数</label>
              <input
                type="number"
                inputMode="numeric"
                className="w-full rounded-xl border px-3 py-2"
                value={h.putts}
                onChange={(e) => {
                  const v = Math.max(0, Math.floor(Number(e.target.value || 0)));
                  const next = holes.slice();
                  next[i] = { ...next[i], putts: v };
                  upsertHoles(next);
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">最大飛距離</label>
              <input
                type="number"
                inputMode="numeric"
                className="w-full rounded-xl border px-3 py-2"
                value={h.maxDrive}
                onChange={(e) => {
                  const v = Math.max(0, Math.floor(Number(e.target.value || 0)));
                  const next = holes.slice();
                  next[i] = { ...next[i], maxDrive: v };
                  upsertHoles(next);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
