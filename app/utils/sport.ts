import type { Sport, SportAttribute } from "@prisma/client";

const groupSportsAndSportAttributes = (
  sports: Sport[],
  sportAttributes: SportAttribute[],
) => {
  return sports.map((sp) => {
    const attrs = sportAttributes.filter((attr) => attr.sportId);
    return { ...sp, attributes: attrs };
  });
};
export default groupSportsAndSportAttributes;

export type SportGroup = ReturnType<
  typeof groupSportsAndSportAttributes
>[number];
