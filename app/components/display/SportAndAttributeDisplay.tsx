import type { Sport, SportAttribute } from "@prisma/client";

import SportAttributePill from "./SportAttributePill";
import SportPill from "./SportPill";

export default function SportAndAttributeDisplay({
  selectedSport,
  selectedSportAttributes,
}: {
  selectedSport: Sport;
  selectedSportAttributes: SportAttribute[];
}) {
  return (
    <div className="rounded border p-2">
      <h2>
        <SportPill sport={selectedSport} />
      </h2>

      <ul className="flex gap-1">
        {selectedSportAttributes.map((attr) => {
          return (
            <li key={attr.id}>
              <SportAttributePill sportAttribute={attr} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
