import type { Sport, SportAttribute } from "@prisma/client";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

export function SportsSelect({ preferedSportIds, allowMultiple }) {
  const [sports, setSports] = useState<Sport[]>([]);

  // カテゴリーデータを取得
  useEffect(() => {
    const fetchSports = async () => {
      const response = await fetch("/api/sport-options");
      const data = await response.json();
      console.log("res api sports", data);
      setSports(data);
    };

    fetchSports();
  }, []);

  const sportAttributeOptionFetcher = useFetcher();
  const sportAttributeOptions = sportAttributeOptionFetcher.data as
    | SportAttribute[]
    | undefined;

  const handleSportsChange = (e) => {
    console.log("SPORTSCHANGE", e);
    sportAttributeOptionFetcher.load(
      `/api/sport-attribute-options?sportIds=${e.join(",")}`,
    );
  };

  const handleSportAttributesChange = (e) => {
    console.log("SportAttribute CHANGE", e);
  };

  return (
    <>
      {/* TODO: Multi Select */}
      <label>
        <span>スポーツ</span>
        <div>
          {sports.map((s) => {
            return (
              <label key={s.id}>
                <span>{s.name}</span>
                <input
                  type="checkbox"
                  onChange={handleSportsChange}
                  name="sports"
                  value={s.id}
                />
              </label>
            );
          })}
        </div>
      </label>

      {/* TODO: Multi Select */}
      {sportAttributeOptions ? (
        <div>
          <h2>スポーツ属性</h2>
          <div>
            {sportAttributeOptions.map((sa) => {
              return (
                <label key={sa.id}>
                  <span>{sa.name}</span>
                  <input
                    type="checkbox"
                    onChange={handleSportAttributesChange}
                    name="sportAttributes"
                    value={sa.id}
                  />
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}
