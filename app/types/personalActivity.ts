// 個人のスケジュールおよび、チームのスケジュールに対する返答。

import type { Prisma } from "@prisma/client";

export interface RecurringPersonalActivity {
  id: string;
  recurringType: string;
  startDate: string;
  endDate: string;
}

// 活動内容
export interface ActivityMenu {
  id: string;
  name: string;
  menuStatus: string; // これからやる予定かやった記録か
  content: string;
}

// 変更履歴を保存 : place, price, guest allowance, datetime, name, rules, sports
export interface PersonalActivityRevisions {
  id: string;
  value: string;
}

// PersonalActivityのフォーム型
export type PersonalActivityForm = Omit<
  Prisma.PersonalActivityGetPayload<{
    include: {
      sports: true;
      sportAttributes: true;
      menus: {
        select: {
          id: true;
          name: true;
          order: true;
          durationSeconds: true;
          setCount: true;
          repetitionCount: true;
          durationPerRep: true;
          weight: true;
          distance: true;
          workoutMenuId: true;
          workout: true;
          personalActivityId: true;
          personalActivity: true;
        };
      };
    };
  }>,
  | "createdAt"
  | "updatedAt"
  | "posts"
  | "teamActivityId"
  | "isDeleted"
  | "userId"
  | "eventId"
  | "recurringId"
  | "asGuest"
> & {
  menus: {
    id?: null | string;
    name: string;
    order: number;
    workoutMenuId?: null | number;
    workout?: null | PersonalWorkoutMenu;
    durationSeconds?: null | number;
    setCount?: null | number;
    repetitionCount?: null | number;
  }[];
};

interface PersonalWorkoutMenu {
  items: PersonalWorkoutMenuItem[];
}

interface PersonalWorkoutMenuItem {
  name: string;
}
