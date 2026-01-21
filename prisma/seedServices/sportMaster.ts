import { getPrisma } from "~/services/database.server";
import sportData from "../masterData/sports";
import type { Sport } from "@prisma/client";

export const createSportMaster = async () => {
  const db = getPrisma();
  return db.sport.createManyAndReturn({
    data: sportData.map((sport) => {
      return sport;
    }),
  });
};
export const createSportAttributeMaster = async (sports: Sport[]) => {
  const db = getPrisma();

  const sas = [];
  for (const sport of sports) {
    sas.push({ name: "男子", sportId: sport.id });
    sas.push({ name: "女子", sportId: sport.id });
  }

  return db.sportAttribute.createManyAndReturn({
    data: sas,
  });
};

export const createSportCategoryMaster = async () => {
  const db = getPrisma();
  return [];
};

export const createAffiliationCategory = async () => {
  const db = getPrisma();

  const affiliations = [
    { slug: "junior", name: "ジュニア", locale: "ja_JP" },
    { slug: "youth", name: "ユース", locale: "ja_JP" },
    { slug: "elementary-school", name: "小学生", locale: "ja_JP" },
    { slug: "middle-school", name: "中学生", locale: "ja_JP" },
    { slug: "high-school", name: "高校生", locale: "ja_JP" },
    { slug: "university", name: "大学生", locale: "ja_JP" },
    { slug: "amateur", name: "社会人", locale: "ja_JP" },
    { slug: "masters", name: "マスター", locale: "ja_JP" },
    { slug: "senior", name: "シニア", locale: "ja_JP" },
    { slug: "corporate", name: "実業団", locale: "ja_JP" },
    { slug: "professional", name: "プロ", locale: "ja_JP" },
    { slug: "district", name: "地区代表", locale: "ja_JP" },
    { slug: "prefectural", name: "都道府県代表", locale: "ja_JP" },
    { slug: "national", name: "国代表", locale: "ja_JP" },
  ];

  return await db.affiliationCategory.createManyAndReturn({
    data: affiliations,
  });
};
