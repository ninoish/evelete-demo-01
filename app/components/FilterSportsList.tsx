import type { Sport } from "@prisma/client";
import { Link } from "react-router";
import { useState } from "react";

import styles from "./FilterSportsList.module.css";

export default function FilterSportsList({ sports }: { sports: Sport[] }) {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <>
      <div className="flex justify-between mb-2">
        <button
          onClick={toggleFilterVisibility}
          style={{
            all: "unset",
            cursor: "pointer",
          }}
          className="text-lg md:text-2xl"
        >
          競技から探す
        </button>
        <input
          placeholder="Filter Sports"
          value=""
          className="border px-4 px-2"
        />
      </div>
      <div
        className={`${styles.content} ${
          isFilterVisible ? styles.visible : styles.hidden
        }`}
      >
        <ul className="flex flex-wrap gap-2">
          {sports?.map((sp) => {
            return (
              <li key={sp.id}>
                <Link
                  to={`./${sp.slug}`}
                  className="rounded border border-slate-400 block p-3 md:p-4 w-full hover:bg-slate-50"
                >
                  {sp.emoji ? <span className="mr-2">{sp.emoji}</span> : null}
                  <span>{sp.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
