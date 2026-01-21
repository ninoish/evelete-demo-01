import { type LoaderFunctionArgs } from "react-router";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const menus = [
    {
      name: "腕立て伏せ",
      alias: "プッシュアップ",
      measure: ["times", "set", "rep", "interval"],
    },
    {
      name: "腹筋",
      alias: "プッシュアップ",
      measure: ["times", "set", "rep", "interval"],
    },
    {
      name: "バーベルスクワット",
      alias: "プッシュアップ",
      measure: ["times", "set", "rep", "interval"],
    },
  ].map((m, indx) => {
    return {
      ...m,
      id: indx + 1,
    };
  });

  console.log("api.workout-menus menus", menus);
  if (menus === null) {
    return null;
  }

  return Response.json(menus);
};
