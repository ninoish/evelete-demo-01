import { Button } from "../ui/button";

type WorkSet = { weight: number; reps: number; order: number };
type OneSet = {
  name: string;
  order: number;
  value: string;
  weights: number[];
  totalReps: number; // ←元の reps:number を改名
  workSets: WorkSet[]; // ←元の reps: WorkSet[] を改名
};

type PersonalRecord = {
  recordId: string;
  order: number;
  sets: OneSet[];
};

export default function WorkoutForm({ form }: { form: any }) {
  const removeSet = (recIdx: number, setIdx: number) => {
    form.setFieldValue(
      `personalRecords.${recIdx}.sets`,
      (prev: OneSet[] = []) => prev.filter((_, i) => i !== setIdx),
    );
  };

  const addWorkSet = (recIdx: number, setIdx: number) => {
    form.setFieldValue(
      `personalRecords.${recIdx}.sets.${setIdx}.workSets`,
      (prev: WorkSet[] = []) => [
        ...prev,
        { weight: 0, reps: 0, order: prev.length + 1 },
      ],
    );
  };

  const removeWorkSet = (recIdx: number, setIdx: number, wsIdx: number) => {
    form.setFieldValue(
      `personalRecords.${recIdx}.sets.${setIdx}.workSets`,
      (prev: WorkSet[] = []) => prev.filter((_, i) => i !== wsIdx),
    );
  };

  const removeRecord = (idx: number) => {
    form.setFieldValue("personalRecords", (prev) =>
      prev.filter((_, i) => i !== idx),
    );
  };

  const addRecord = () => {
    form.setFieldValue("personalRecords", (prev) => [
      ...prev,
      {
        recordId: "",
        order: prev.length + 1,
        sets: [
          {
            name: "",
            order: 1,
            value: "",
            weights: [],
            totalReps: 0,
            workSets: [],
          },
        ],
      },
    ]);
  };

  const addSet = (recIdx: number) => {
    form.setFieldValue(
      `personalRecords.${recIdx}.sets`,
      (prev: OneSet[] = []) => [
        ...prev,
        {
          name: "",
          order: prev.length + 1,
          value: "",
          weights: [],
          totalReps: 0,
          workSets: [],
        },
      ],
    );
  };

  return (
    <>
      <form.Field mode="array" name="personalRecords">
        {(field) => {
          const records = field.state.value ?? [];
          return (
            <div className="space-y-4">
              {records.map((_, recIdx) => (
                <div key={recIdx} className="rounded-2xl border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Record #{recIdx + 1}
                    </div>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => removeRecord(recIdx)}
                    >
                      削除
                    </button>
                  </div>

                  {/* recordId */}
                  <form.Field name={`personalRecords.${recIdx}.recordId`}>
                    {(f) => (
                      <label className="block">
                        <span className="text-sm">記録ID</span>
                        <input
                          name={f.name}
                          value={f.state.value ?? ""}
                          onBlur={f.handleBlur}
                          onChange={(e) => f.handleChange(e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          placeholder="recordId"
                        />
                        {f.state.meta.errors?.[0] && (
                          <div className="text-red-600 text-sm">
                            {f.state.meta.errors[0]}
                          </div>
                        )}
                      </label>
                    )}
                  </form.Field>

                  {/* order */}
                  <form.Field name={`personalRecords.${recIdx}.order`}>
                    {(f) => (
                      <label className="block">
                        <span className="text-sm">表示順</span>
                        <input
                          type="number"
                          name={f.name}
                          value={f.state.value ?? 1}
                          onBlur={f.handleBlur}
                          onChange={(e) =>
                            f.handleChange(Number(e.target.value))
                          }
                          className="w-32 border rounded px-2 py-1"
                        />
                      </label>
                    )}
                  </form.Field>

                  {/* ---- Sets (nested array) ---- */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Sets</div>
                      <button
                        type="button"
                        className="text-blue-600"
                        onClick={() => addSet(recIdx)}
                      >
                        + セット追加
                      </button>
                    </div>

                    <form.Field
                      mode="array"
                      name={`personalRecords.${recIdx}.sets`}
                    >
                      {(setsField) => {
                        const sets = setsField.state.value ?? [];
                        return (
                          <div className="space-y-3">
                            {sets.map((_, setIdx) => (
                              <div
                                key={setIdx}
                                className="rounded-xl border p-3 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-gray-600">
                                    Set #{setIdx + 1}
                                  </div>
                                  <button
                                    type="button"
                                    className="text-red-600"
                                    onClick={() => removeSet(recIdx, setIdx)}
                                  >
                                    セット削除
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* name */}
                                  <form.Field
                                    name={`personalRecords.${recIdx}.sets.${setIdx}.name`}
                                  >
                                    {(f) => (
                                      <label className="block">
                                        <span className="text-sm">名前</span>
                                        <input
                                          name={f.name}
                                          value={f.state.value ?? ""}
                                          onBlur={f.handleBlur}
                                          onChange={(e) =>
                                            f.handleChange(e.target.value)
                                          }
                                          className="w-full border rounded px-2 py-1"
                                        />
                                      </label>
                                    )}
                                  </form.Field>

                                  {/* order */}
                                  <form.Field
                                    name={`personalRecords.${recIdx}.sets.${setIdx}.order`}
                                  >
                                    {(f) => (
                                      <label className="block">
                                        <span className="text-sm">順序</span>
                                        <input
                                          type="number"
                                          name={f.name}
                                          value={f.state.value ?? setIdx + 1}
                                          onBlur={f.handleBlur}
                                          onChange={(e) =>
                                            f.handleChange(
                                              Number(e.target.value),
                                            )
                                          }
                                          className="w-full border rounded px-2 py-1"
                                        />
                                      </label>
                                    )}
                                  </form.Field>

                                  {/* value */}
                                  <form.Field
                                    name={`personalRecords.${recIdx}.sets.${setIdx}.value`}
                                  >
                                    {(f) => (
                                      <label className="block md:col-span-2">
                                        <span className="text-sm">
                                          値（メモなど）
                                        </span>
                                        <input
                                          name={f.name}
                                          value={f.state.value ?? ""}
                                          onBlur={f.handleBlur}
                                          onChange={(e) =>
                                            f.handleChange(e.target.value)
                                          }
                                          className="w-full border rounded px-2 py-1"
                                        />
                                      </label>
                                    )}
                                  </form.Field>

                                  {/* totalReps */}
                                  <form.Field
                                    name={`personalRecords.${recIdx}.sets.${setIdx}.totalReps`}
                                  >
                                    {(f) => (
                                      <label className="block">
                                        <span className="text-sm">
                                          合計回数
                                        </span>
                                        <input
                                          type="number"
                                          name={f.name}
                                          value={f.state.value ?? 0}
                                          onBlur={f.handleBlur}
                                          onChange={(e) =>
                                            f.handleChange(
                                              Number(e.target.value),
                                            )
                                          }
                                          className="w-full border rounded px-2 py-1"
                                        />
                                      </label>
                                    )}
                                  </form.Field>

                                  {/* weights: number[]（簡易: カンマ区切りで編集） */}
                                  <form.Field
                                    name={`personalRecords.${recIdx}.sets.${setIdx}.weights`}
                                  >
                                    {(f) => (
                                      <label className="block md:col-span-2">
                                        <span className="text-sm">
                                          ウェイト(kg) カンマ区切り
                                        </span>
                                        <input
                                          name={f.name}
                                          value={(f.state.value ?? []).join(
                                            ",",
                                          )}
                                          onBlur={f.handleBlur}
                                          onChange={(e) =>
                                            f.handleChange(
                                              e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean)
                                                .map(Number),
                                            )
                                          }
                                          className="w-full border rounded px-2 py-1"
                                        />
                                      </label>
                                    )}
                                  </form.Field>
                                </div>

                                {/* ---- workSets (nested array in set) ---- */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium">
                                      ワークセット
                                    </div>
                                    <button
                                      type="button"
                                      className="text-blue-600"
                                      onClick={() => addWorkSet(recIdx, setIdx)}
                                    >
                                      + 追加
                                    </button>
                                  </div>

                                  <form.Field
                                    mode="array"
                                    name={`personalRecords.${recIdx}.sets.${setIdx}.workSets`}
                                  >
                                    {(wsField) => {
                                      const workSets =
                                        wsField.state.value ?? [];
                                      return (
                                        <div className="space-y-2">
                                          {workSets.map((_, wsIdx) => (
                                            <div
                                              key={wsIdx}
                                              className="grid grid-cols-4 items-end gap-2"
                                            >
                                              <form.Field
                                                name={`personalRecords.${recIdx}.sets.${setIdx}.workSets.${wsIdx}.order`}
                                              >
                                                {(f) => (
                                                  <label className="block">
                                                    <span className="text-xs">
                                                      順序
                                                    </span>
                                                    <input
                                                      type="number"
                                                      name={f.name}
                                                      value={
                                                        f.state.value ??
                                                        wsIdx + 1
                                                      }
                                                      onBlur={f.handleBlur}
                                                      onChange={(e) =>
                                                        f.handleChange(
                                                          Number(
                                                            e.target.value,
                                                          ),
                                                        )
                                                      }
                                                      className="w-full border rounded px-2 py-1"
                                                    />
                                                  </label>
                                                )}
                                              </form.Field>

                                              <form.Field
                                                name={`personalRecords.${recIdx}.sets.${setIdx}.workSets.${wsIdx}.weight`}
                                              >
                                                {(f) => (
                                                  <label className="block">
                                                    <span className="text-xs">
                                                      重量(kg)
                                                    </span>
                                                    <input
                                                      type="number"
                                                      name={f.name}
                                                      value={f.state.value ?? 0}
                                                      onBlur={f.handleBlur}
                                                      onChange={(e) =>
                                                        f.handleChange(
                                                          Number(
                                                            e.target.value,
                                                          ),
                                                        )
                                                      }
                                                      className="w-full border rounded px-2 py-1"
                                                    />
                                                  </label>
                                                )}
                                              </form.Field>

                                              <form.Field
                                                name={`personalRecords.${recIdx}.sets.${setIdx}.workSets.${wsIdx}.reps`}
                                              >
                                                {(f) => (
                                                  <label className="block">
                                                    <span className="text-xs">
                                                      回数
                                                    </span>
                                                    <input
                                                      type="number"
                                                      name={f.name}
                                                      value={f.state.value ?? 0}
                                                      onBlur={f.handleBlur}
                                                      onChange={(e) =>
                                                        f.handleChange(
                                                          Number(
                                                            e.target.value,
                                                          ),
                                                        )
                                                      }
                                                      className="w-full border rounded px-2 py-1"
                                                    />
                                                  </label>
                                                )}
                                              </form.Field>

                                              <div className="flex justify-end">
                                                <button
                                                  type="button"
                                                  className="text-red-600"
                                                  onClick={() =>
                                                    removeWorkSet(
                                                      recIdx,
                                                      setIdx,
                                                      wsIdx,
                                                    )
                                                  }
                                                >
                                                  削除
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    }}
                                  </form.Field>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    </form.Field>
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      </form.Field>
      <div>
        <Button type="button" onClick={addRecord}>
          個人記録を追加する
        </Button>
      </div>
    </>
  );
}
