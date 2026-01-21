import { TeamActivityType } from "@prisma/client";

const convertTypeToDisplay = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.PRACTICE:
      return "練習";
    case TeamActivityType.EVENT:
      return "イベント";
    case TeamActivityType.COMPETITION:
      return "大会";
    case TeamActivityType.RECORD:
      return "記録";
    case TeamActivityType.RESULT:
      return "試合結果";
    default:
      return null;
  }
};

export default {
  convertTypeToDisplay,
};
