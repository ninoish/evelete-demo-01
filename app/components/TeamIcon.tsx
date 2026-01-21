import type { Team } from "@prisma/client";
import color from "~/utils/color";

export default function TeamIcon({
  team,
  size,
}: {
  team: Team;
  size: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = size === "xs" ? "h-8 w-8" : "h-12 w-12";
  const teamColor = color.uuidToColor(team.id);
  return (
    <>
      {team.imageUrl ? (
        <div
          className={`bg-cover bg-center rounded-full shadow ${sizeClass}`}
          style={{ backgroundImage: `url("${team.imageUrl}")` }}
        ></div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-full shadow ${sizeClass}`}
          style={{ backgroundColor: teamColor }}
        >
          <span style={{ color: color.invertColor(teamColor, true) }}>
            {team.displayName[0]}
          </span>
        </div>
      )}
    </>
  );
}
