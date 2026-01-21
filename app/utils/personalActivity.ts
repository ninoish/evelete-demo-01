import { PersonalActivityType } from "@prisma/client";

const convertTypeToDisplay = (type: PersonalActivityType) => {
  switch (type) {
    case PersonalActivityType.BODY_DATA:
      return "ボディ";
    case PersonalActivityType.EVENT_COMPETITION:
      return "大会";
    case PersonalActivityType.EVENT_OTHER:
      return "イベント";
    case PersonalActivityType.EVENT_RECORD_TRIAL:
      return "記録会";
    case PersonalActivityType.RECORD:
      return "記録";
    case PersonalActivityType.RESULT:
      return "試合結果";
    case PersonalActivityType.TEAM_ACTIVITY:
      return "チーム";
    // case PersonalActivityType.TEAM_EVENT:
    //   return "";
    // case PersonalActivityType.TEAM_PRACTICE:
    //   return "";
    case PersonalActivityType.WORKOUT:
      return "ワークアウト";
    default:
      return "";
  }
};

export default {
  convertTypeToDisplay,
};
