import { PersonalActivityType, TeamActivityType } from "@prisma/client";

export const getRandom = <T>(arr: T[]): T => {
  const indx = Math.floor(Math.random() * arr.length);
  return arr[indx];
};

export const getRandomRange = (min: number, max: number): number => {
  return min + Math.floor(Math.random() * (max - min));
};

export const getPersonalActivityType = (index: number) => {
  if (index % 20 === 0) {
    return [PersonalActivityType.RECORD_TRIAL];
  }
  if (index % 16 === 0) {
    return [PersonalActivityType.RECORD, PersonalActivityType.CLINIC];
  }
  if (index % 15 === 0) {
    return [PersonalActivityType.REHAB];
  }
  if (index % 14 === 0) {
    return [PersonalActivityType.RECORD];
  }
  if (index % 12 === 0) {
    return [PersonalActivityType.RESULT];
  }
  if (index % 10 === 0) {
    return [PersonalActivityType.COMPETITION, PersonalActivityType.RESULT];
  }
  if (index % 6 === 0) {
    return [PersonalActivityType.TEAM_EVENT];
  }
  if (index % 3 === 0) {
    return [PersonalActivityType.TEAM_PRACTICE];
  }
  if (index % 4 === 0) {
    return [PersonalActivityType.BODY_DATA];
  }
  return [PersonalActivityType.WORKOUT];
};

export const getTeamActivityType = (index: number) => {
  if (index % 20 === 0) {
    return TeamActivityType.EVENT;
  }
  if (index % 16 === 0) {
    return TeamActivityType.PRACTICE;
  }
  if (index % 14 === 0) {
    return TeamActivityType.RECORD;
  }
  if (index % 12 === 0) {
    return TeamActivityType.RESULT;
  }
  if (index % 10 === 0) {
    return TeamActivityType.PRACTICAL_PRACTICE;
  }
  if (index % 6 === 0) {
    return TeamActivityType.COMPETITION;
  }
  if (index % 4 === 0) {
    return TeamActivityType.PRACTICE;
  }
  return TeamActivityType.PRACTICE;
};

export const getUniqueRandom = <T>(arr: T[], count: number): T[] => {
  const set = new Set<T>();
  if (arr.length < count) {
    count = arr.length;
  }
  while (set.size < count) {
    const indx = Math.floor(Math.random() * arr.length);
    set.add(arr[indx]);
  }
  return Array.from(set);
};

export const getUniqueRandomRange = <T>(
  arr: T[],
  min: number,
  max: number,
): T[] => {
  const set = new Set<T>();
  let count = min + Math.floor(Math.random() * (max - min));
  if (count == 0) {
    return [];
  }
  if (arr.length < count) {
    count = arr.length;
  }
  while (set.size < count) {
    const indx = Math.floor(Math.random() * arr.length);
    set.add(arr[indx]);
  }
  return Array.from(set);
};
