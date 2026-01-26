import { PersonalActivityType, TeamActivityType } from "@prisma/client";
import dayjs, { type Dayjs } from "dayjs";

export const convertDateToRelativeDate = (date: Dayjs) => {
  const today = dayjs();

  console.log(date);
  const diffMilliSec = today.diff(date);
  console.log(diffMilliSec);

  if (diffMilliSec < 1000 * 60 * 60 * 24) {
    return Math.floor(diffMilliSec / (1000 * 60 * 60)) + "h";
  } else if (diffMilliSec < 1000 * 60 * 60 * 24 * 365) {
    return Math.floor(diffMilliSec / (1000 * 60 * 60 * 24)) + "d";
  } else {
    return Math.floor(diffMilliSec / (1000 * 60 * 60 * 24 * 365)) + "y";
  }
};

export const convertDateStringToRelativeDate = (date: string) => {
  if (!date) {
    return "";
  }
  const relDate = dayjs(date);
  return convertDateToRelativeDate(relDate);
};

export const displayTeamActivityType = (type: TeamActivityType) => {
  switch (type) {
    case TeamActivityType.PRACTICE: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-blue-800 text-white rounded">
          練習
        </span>
      );
    }

    case TeamActivityType.COMPETITION: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-red-800 text-white rounded">
          大会
        </span>
      );
    }
    case TeamActivityType.EVENT: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-green-800 text-white rounded">
          イベント
        </span>
      );
    }
    case TeamActivityType.PRACTICAL_PRACTICE: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-red-800 text-white rounded">
          練習試合
        </span>
      );
    }
    case TeamActivityType.RECORD: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-orange-800 text-white rounded">
          記録
        </span>
      );
    }
    case TeamActivityType.RESULT: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          記録
        </span>
      );
    }
  }
  return null;
};

export const displayPersonalActivityType = (type: PersonalActivityType) => {
  switch (type) {
    case PersonalActivityType.PRACTICE: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-blue-800 text-white rounded">
          練習
        </span>
      );
    }

    case PersonalActivityType.COMPETITION: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-red-800 text-white rounded">
          大会
        </span>
      );
    }
    case PersonalActivityType.TEAM_EVENT: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-green-800 text-white rounded">
          チームイベント
        </span>
      );
    }
    case PersonalActivityType.PRACTICAL_PRACTICE: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-red-800 text-white rounded">
          練習試合
        </span>
      );
    }
    case PersonalActivityType.RECORD: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-orange-800 text-white rounded">
          記録
        </span>
      );
    }
    case PersonalActivityType.RESULT: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          記録
        </span>
      );
    }
    case PersonalActivityType.BODY_DATA: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          身体記録
        </span>
      );
    }
    case PersonalActivityType.CLINIC: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          練習会・クリニック
        </span>
      );
    }
    case PersonalActivityType.REHAB: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          リハビリ
        </span>
      );
    }
    case PersonalActivityType.RECORD_TRIAL: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          記録会
        </span>
      );
    }
    case PersonalActivityType.WORKOUT: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          ワークアウト
        </span>
      );
    }
    case PersonalActivityType.ENJOY: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          エンジョイ
        </span>
      );
    }
    case PersonalActivityType.TEAM_ACTIVITY: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          チーム活動
        </span>
      );
    }
    case PersonalActivityType.DROPIN: {
      return (
        <span className="whitespace-nowrap py-1 px-2 bg-purple-800 text-white rounded">
          ドロップイン
        </span>
      );
    }
  }
  return null;
};

export const formatStartAndEndDatetime = (
  startDt: Date,
  endDt: Date | null,
) => {
  const start = dayjs(startDt);
  const end = endDt ? dayjs(endDt) : null;
  let res = `${start.format("YYYY年MM月DD日 HH:mm")}`;

  if (end) {
    res += `- ${
      start.isSame(end, "day")
        ? end.format("HH:mm")
        : end.format("MM月DD日 HH:mm")
    }`;
  }
  return res;
};
