import { PersonalWorkoutSelect } from "~/components/input/PersonalWorkoutSelect";

import { WorkoutFormMenu } from "./PersonalWorkoutForm";

export default function PersonalWorkoutMenuForm({
  menus,
  onUpdateMenu,
  onClickAddMenu,
}: {
  menus: WorkoutFormMenu[];
  onUpdateMenu: (menus: WorkoutFormMenu[]) => void;
  onClickAddMenu: () => void;
}) {
  const deleteMenu = (menuId: number) => {
    const menusAfter = menus.filter((m) => m.id !== menuId);

    onUpdateMenu(menusAfter);
  };

  const addMenuItem = (menuId: number) => {
    const ids = new Uint32Array(1);
    crypto.getRandomValues(ids);

    onUpdateMenu(
      menus.map((m) => {
        if (m.id === menuId) {
          m.items.push({
            id: ids[0],
            setCount: "1",
            durationSeconds: "60",
            repetition: "0",
            weight: "0",
            weightUnit: "kg",
            distance: "0",
            distanceUnit: "m",
          });
        }
        return m;
      }),
    );
  };

  const deleteMenuItem = (menuId: number, itemId: number) => {
    onUpdateMenu(
      menus.map((m) => {
        if (m.id === menuId) {
          m.items = m.items.filter((i) => i.id !== itemId);
        }
        return m;
      }),
    );
  };

  const handleChangeMenuInput = (
    menuId: number,
    prop: string,
    e: React.ChangeEvent,
  ) => {
    const target = e.target as HTMLInputElement;
    const name = prop as
      | "repetition"
      | "setCount"
      | "durationSeconds"
      | "weight"
      | "distance";

    console.log(menuId);

    onUpdateMenu(
      menus.map((m) => {
        if (m.id === menuId) {
          console.log("changing", m, name, target.value);
          m[name] = target.value;
        }
        return m;
      }),
    );
  };

  const handleChangeMenuItemInput = (
    menuId: number,
    itemId: number,
    prop: string,
    e: React.ChangeEvent,
  ) => {
    const target = e.target as HTMLInputElement;
    const name = prop as
      | "repetition"
      | "setCount"
      | "durationSeconds"
      | "weight"
      | "distance";

    console.log(menuId, itemId);

    onUpdateMenu(
      menus.map((m) => {
        if (m.id === menuId) {
          m.items = m.items.map((item) => {
            if (item.id === itemId) {
              console.log("changing item", item, name, target.value);
              item[name] = target.value;
            }
            return item;
          });
        }
        return m;
      }),
    );
  };

  return (
    <div className="mb-2 border rounded bg-slate-50 p-4">
      <ul className="mb-4 flex flex-col gap-4">
        {menus.map((menu, menuIndx) => {
          return (
            <li key={menu.id} className="border-b border-b-black pb-4">
              <div className="flex items-end gap-4">
                <PersonalWorkoutSelect
                  name={`menus[${menuIndx}][name]`}
                  onChange={(wo) => {
                    onUpdateMenu(
                      menus.map((m) => {
                        console.log(wo, menu.id, m.id);
                        if (m.id === menu.id) {
                          m.name = wo?.name ?? "";
                        }
                        return m;
                      }),
                    );
                  }}
                />

                <div>
                  <button
                    type="button"
                    color="red"
                    onClick={() => deleteMenu(menu.id)}
                  >
                    メニュー削除
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 items-end my-2 border rounded p-2 bg-slate-100">
                <label className="flex flex-col">
                  <span className="">合計所要時間</span>
                  <div className="inline-flex  items-center">
                    <input
                      type="number"
                      name={`menus[${menuIndx}][durationSeconds]`}
                      value={menu.durationSeconds}
                      onChange={(e) =>
                        handleChangeMenuInput(menu.id, "durationSeconds", e)
                      }
                      min="0"
                      max="1000000"
                    />
                    <span>秒</span>
                  </div>
                </label>

                <label className="flex flex-col ">
                  <span className="text-sm">合計セット数</span>
                  <div className="inline-flex  items-center">
                    <input
                      type="number"
                      name={`menus[${menuIndx}][setCount]`}
                      value={menu.setCount}
                      onChange={(e) =>
                        handleChangeMenuInput(menu.id, "setCount", e)
                      }
                      min="0"
                      max="1000"
                    />
                  </div>
                </label>

                <label className="flex flex-col ">
                  <span className="text-sm">合計Rep数</span>
                  <div className="inline-flex  items-center">
                    <input
                      type="number"
                      name={`menus[${menuIndx}][repetition]`}
                      value={menu.repetition}
                      onChange={(e) =>
                        handleChangeMenuInput(menu.id, "repetition", e)
                      }
                      min="0"
                      max="1000000"
                    />
                  </div>
                </label>

                <label className="flex flex-col ">
                  <span className="text-sm">合計重量</span>
                  <div className="inline-flex  items-center">
                    <input
                      type="number"
                      name={`menus[${menuIndx}][weight]`}
                      value={menu.weight}
                      onChange={(e) =>
                        handleChangeMenuInput(menu.id, "weight", e)
                      }
                      min="0"
                      max="1000000"
                    />
                    <span className="ml-1">{menu.weightUnit}</span>
                  </div>
                </label>

                <label className="flex flex-col ">
                  <span className="text-sm">合計距離</span>
                  <div className="inline-flex  items-center">
                    <input
                      type="number"
                      name={`menus[${menuIndx}][distance]`}
                      value={menu.distance}
                      onChange={(e) =>
                        handleChangeMenuInput(menu.id, "distance", e)
                      }
                      min="0"
                      max="1000000"
                    />
                    <span className="ml-1">{menu.distanceUnit}</span>
                  </div>
                </label>
              </div>

              <div className="mb-2">
                <ul className="">
                  {menu.items.map((item, itemIndx) => {
                    return (
                      <li
                        key={item.id}
                        className="flex flex-wrap gap-y-2 gap-x-4 items-center"
                      >
                        <div className="">#{itemIndx + 1}</div>
                        <label className="flex flex-col ">
                          <span className="text-sm">セット</span>
                          <div className="inline-flex  items-center">
                            <input
                              type="number"
                              name={`menus[${menuIndx}][items][${itemIndx}][setCount]`}
                              value={item.setCount}
                              onChange={(e) =>
                                handleChangeMenuItemInput(
                                  menu.id,
                                  item.id,
                                  "setCount",
                                  e,
                                )
                              }
                              min="0"
                              max="1000"
                            />
                          </div>
                        </label>

                        <label className="flex flex-col ">
                          <span className="text-sm">所要時間</span>
                          <div className="inline-flex  items-center">
                            <input
                              type="number"
                              name={`menus[${menuIndx}][items][${itemIndx}][durationSeconds]`}
                              value={item.durationSeconds}
                              onChange={(e) =>
                                handleChangeMenuItemInput(
                                  menu.id,
                                  item.id,
                                  "durationSeconds",
                                  e,
                                )
                              }
                              min="0"
                              max="1000000"
                            />
                            <span>秒</span>
                          </div>
                        </label>

                        <label className="flex flex-col ">
                          <span className="text-sm">Rep数</span>
                          <div className="inline-flex  items-center">
                            <input
                              type="number"
                              name={`menus[${menuIndx}][items][${itemIndx}][repetition]`}
                              value={item.repetition}
                              onChange={(e) =>
                                handleChangeMenuItemInput(
                                  menu.id,
                                  item.id,
                                  "repetition",
                                  e,
                                )
                              }
                              min="0"
                              max="1000000"
                            />
                          </div>
                        </label>

                        <label className="flex flex-col ">
                          <span className="text-sm">重量</span>
                          <div className="inline-flex  items-center">
                            <input
                              type="number"
                              name={`menus[${menuIndx}][items][${itemIndx}][weight]`}
                              value={item.weight}
                              onChange={(e) =>
                                handleChangeMenuItemInput(
                                  menu.id,
                                  item.id,
                                  "weight",
                                  e,
                                )
                              }
                              min="0"
                              max="1000000"
                            />
                            <span className="ml-1">{item.weightUnit}</span>
                          </div>
                        </label>

                        <label className="flex flex-col ">
                          <span className="text-sm">距離</span>
                          <div className="inline-flex items-center">
                            <input
                              type="number"
                              name={`menus[${menuIndx}][items][${itemIndx}][distance]`}
                              value={item.distance}
                              onChange={(e) =>
                                handleChangeMenuItemInput(
                                  menu.id,
                                  item.id,
                                  "distance",
                                  e,
                                )
                              }
                              min="0"
                              max="1000000"
                            />
                            <span className="ml-1">{item.distanceUnit}</span>
                          </div>
                        </label>
                        {menu.items.length > 1 ? (
                          <button
                            type="button"
                            color="red"
                            onClick={() => deleteMenuItem(menu.id, item.id)}
                          >
                            セットを削除
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <button type="button" onClick={() => addMenuItem(menu.id)}>
                  セットを追加する
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="">
        <button type="button" className="w-full" onClick={onClickAddMenu}>
          メニューを追加する
        </button>
      </div>
    </div>
  );
}
