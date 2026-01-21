import { getPrisma } from "./database.server";

export const getAffiliationCategoryOptions = async () => {
  // TODO : カテゴリーって競技によって異なるのでは？
  // もっとざっくりと高校生のクラブとかの方がいいかも。
  // 年齢が低い場合は、申請登録は無理にして。
  // 教室とかの方がいいかも。

  const db = getPrisma();

  const categories = await db.affiliationCategory.findMany({
    orderBy: {
      id: "asc",
    },
  });
  return categories;
};
