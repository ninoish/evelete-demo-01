/* eslint-disable jsx-a11y/label-has-associated-control */
import { Form } from "react-router";
import dayjs from "dayjs";
import { useState } from "react";

import PersonalWorkoutMenuForm from "./PersonalWorkoutMenuForm";

export interface WorkoutFormMenuItem {
  id: number;
  setCount: string | undefined;
  durationSeconds: string;
  repetition: string | undefined;
  weight: string | undefined;
  weightUnit: string | undefined;
  distance: string | undefined;
  distanceUnit: string | undefined;
}
export interface WorkoutFormMenu {
  id: number;
  name: string;
  durationSeconds: string;
  setCount: string | undefined;
  repetition: string | undefined;
  weight: string | undefined;
  weightUnit: string | undefined;
  distance: string | undefined;
  distanceUnit: string | undefined;
  items: WorkoutFormMenuItem[];
}
export interface WorkoutForm {
  name: string | undefined;
  description: string | undefined;
  sports: string | undefined;
  status: "draft" | "published";
  place: string | undefined;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  shouldSaveMenuAsTemplate: boolean;
  menus: WorkoutFormMenu[];
}

export function PersonalWorkoutForm() {
  const [shouldRecordWorkoutMenu, setShouldRecordWorkoutMenu] =
    useState<boolean>(false);

  const [form, setForm] = useState<WorkoutForm>({
    name: "",
    description: "",
    sports: "",
    status: "published",
    place: "",
    startDate: dayjs().add(1, "hour").format("YYYY-MM-DD"),
    endDate: dayjs().add(2, "hour").format("YYYY-MM-DD"),
    startTime: dayjs().add(1, "hour").startOf("hour").format("HH:mm"),
    endTime: dayjs().add(2, "hour").startOf("hour").format("HH:mm"),
    shouldSaveMenuAsTemplate: false,
    menus: [],
  });

  // workout, post, record, event, result が同じことはあるのではないか？

  const addMenu = () => {
    const ids = new Uint32Array(2);
    crypto.getRandomValues(ids);

    setForm({
      ...form,
      menus: [
        ...form.menus,
        {
          id: ids[0],
          name: "",
          durationSeconds: "60",
          setCount: "1",
          repetition: "10",
          weight: "0",
          weightUnit: "kg",
          distance: "0",
          distanceUnit: "m",
          items: [
            {
              id: ids[1],
              setCount: "1",
              durationSeconds: "60",
              repetition: "0",
              weight: "0",
              weightUnit: "kg",
              distance: "0",
              distanceUnit: "m",
            },
          ],
        },
      ],
    });
  };

  const handleChangeFormCheckbox = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const target = e.target as HTMLInputElement;

    console.log(target.name, target.checked);
    setForm({
      ...form,
      [target.name]: target.checked,
    });
  };

  const handleChangeFormInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const target = e.target as HTMLInputElement;

    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  const handleSportSuggestionClick = (
    e: React.SyntheticEvent<HTMLButtonElement>,
  ) => {
    const sportName = e.currentTarget?.dataset?.sportName?.trim() ?? "";
    if (!sportName) {
      return;
    }

    const sports = form.sports?.split(",")?.filter((s) => s?.trim());
    console.log(sports, sportName);
    const existing = sports?.find((s) => s?.trim() === sportName?.trim());
    if (!existing) {
      console.log(form.sports);
      setForm({
        ...form,
        sports: sports ? [...sports, sportName?.trim()].join(", ") : sportName,
      });
    }
  };

  const handleMenuUpdate = (menus) => {
    console.log(menus);
    setForm({
      ...form,
      menus: menus,
    });

    if (menus.length === 0) {
      setShouldRecordWorkoutMenu(false);
      console.log("shouldRecordWorkoutMenu false");
    }
  };

  return (
    <Form method="post">
      <input type="hidden" name="activityType" value="workout" />
      <div className="flex flex-col">
        <div className="mb-2">
          <label className="block mb-2">
            <span className="">スポーツ</span>
            <input
              type="text"
              name="sports"
              value={form.sports}
              onChange={handleChangeFormInput}
            />
          </label>
          <ul className="flex w-full gap-4">
            <li>
              <button
                type="button"
                className="text-left inline-flex items-center justify-between w-auto px-4 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={handleSportSuggestionClick}
                data-sport-name={"running"}
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">Running</div>
                  <div className="w-full text-sm">3 days streak</div>
                </div>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="text-left inline-flex items-center justify-between w-auto px-4 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={handleSportSuggestionClick}
                data-sport-name={"weightTraining"}
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">
                    Weight Training
                  </div>
                  <div className="w-full text-sm">2 times this month</div>
                </div>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleSportSuggestionClick}
                data-sport-name={"volleyBall"}
                className="text-left inline-flex items-center justify-between w-auto px-4 py-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="block">
                  <div className="w-full text-lg font-semibold">Volleyball</div>
                  <div className="w-full text-sm">
                    No acitivity since Nov 9th
                  </div>
                </div>
              </button>
            </li>
          </ul>
        </div>

        <div className="flex items-end flex-wrap gap-x-4 gap-y-2 mb-2">
          <label className="">
            <span className="">開始日</span>
            <input
              type="date"
              name="startDate"
              required={true}
              value={form.startDate}
              placeholder="Date"
              className="mr-1"
              onChange={handleChangeFormInput}
            />
          </label>

          <label className="">
            <span className="">開始時間</span>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChangeFormInput}
            />
          </label>

          <label className="">
            <span>終了日</span>
            <input
              type="date"
              name="endDate"
              required={true}
              value={form.endDate}
              placeholder="Date"
              className="mr-1"
              onChange={handleChangeFormInput}
            />
          </label>

          <label className="">
            <span className="">終了時間</span>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChangeFormInput}
            />
          </label>

          <label>
            <span>ステータス</span>
            <select
              name="status"
              value={form.status}
              onChange={handleChangeFormInput}
            >
              {[
                {
                  label: "公開",
                  value: "published",
                },
                {
                  label: "ドラフト",
                  value: "draft",
                },
              ].map((o) => {
                return (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <div>
          <div className="mb-2">
            <label className="">
              <span className="">タイトル</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChangeFormInput}
              />
            </label>
          </div>

          <div className="mb-2">
            <label className="">
              <span className="">コメント</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChangeFormInput}
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="">
              <span className="">場所</span>
              <input
                type="text"
                name="place"
                value={form.place}
                onChange={handleChangeFormInput}
              />
            </label>
          </div>

          <div className="mb-4">
            <div className="mb-2">
              <label>
                <span>メニューを記録する</span>
                <input
                  type="checkbox"
                  placeholder="メニュー名"
                  key="shouldRecordWorkoutMenu"
                  checked={shouldRecordWorkoutMenu}
                  onChange={(e) => {
                    setShouldRecordWorkoutMenu(e.target.checked);
                    if (form.menus.length === 0) {
                      addMenu();
                    }
                  }}
                />
              </label>
            </div>

            {shouldRecordWorkoutMenu ? (
              <>
                <PersonalWorkoutMenuForm
                  menus={form.menus}
                  onUpdateMenu={handleMenuUpdate}
                  onClickAddMenu={addMenu}
                />
                <label className="flex items-center gap-2">
                  <div className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="shouldSaveMenuAsTemplate"
                      checked={form.shouldSaveMenuAsTemplate}
                      onChange={handleChangeFormCheckbox}
                    />
                  </div>
                  <span className="text-sm">
                    メニューをテンプレートとして保存する
                  </span>
                </label>
              </>
            ) : null}
          </div>

          <div>
            <button type="submit">作成</button>
          </div>
        </div>
      </div>
    </Form>
  );
}
