import type { WorkoutAndDrillMenu } from "@prisma/client";
import { useEffect, useState } from "react";

export function PersonalWorkoutSelect({
  name,
  onChange,
}: {
  name: string;
  onChange: (value: WorkoutAndDrillMenu | null) => void;
}) {
  const [menus, setMenus] = useState<WorkoutAndDrillMenu[]>([]);
  const [menu, setMenu] = useState<WorkoutAndDrillMenu | null>(null);

  // カテゴリーデータを取得
  useEffect(() => {
    const fetchWorkoutMenus = async () => {
      const response = await fetch("/api/workout-menus");
      const data = (await response.json()) as WorkoutAndDrillMenu[];
      console.log("res api workout-menus", data);
      setMenus(data);
    };

    fetchWorkoutMenus();
  }, []);

  return (
    <label>
      <span>ワークアウト種目</span>
      <select
        name={name}
        value={menu?.name}
        onChange={(e) => {
          e.target.value;
          const m = menus.find((m) => m.id === parseInt(e.target.value, 10));
          if (m) {
            setMenu(m);
          }
          onChange(m ?? null);
        }}
      >
        <option value=""></option>
        {menus.map((m) => {
          return (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          );
        })}
      </select>
    </label>

    // TODO: Combobox で入力してフィルターできるようにする
  );
}
