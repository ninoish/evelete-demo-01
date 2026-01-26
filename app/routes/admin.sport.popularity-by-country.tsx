import type { Country, Prisma } from "@prisma/client";
import {
  type ActionFunctionArgs,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const db = getPrisma();
  const sportPopularities = await db.sportPopularityByCountry.findMany({
    include: {
      sport: true,
      country: true,
    },
    orderBy: {
      priority: "asc",
    },
  });

  const popularityByCountry = sportPopularities.reduce(
    (countries, p) => {
      const country = countries.find((country) => country.id === p.countryId);
      if (country) {
        country.sports.push(p);
      } else {
        countries.push({
          ...p.country,
          sports: [p],
        });
      }
      return countries;
    },
    [] as (Country & {
      sports: Prisma.SportPopularityByCountryGetPayload<{
        include: { sport: true; country: true };
      }>[];
    })[],
  );

  return {
    popularityByCountry,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const db = getPrisma();
  const formData = await request.formData();
  const intent = formData.get("_action");

  if (intent === "init") {
    // 1) volleyball を取得
    const volleyball = await db.sport.findUnique({
      where: { id: "volleyball" },
      select: { id: true },
    });
    if (!volleyball) {
      throw new Response("Sport(id=volleyball) not found", { status: 400 });
    }

    // 2) 既に1件以上の popularity がある国のIDを取得（distinct countryId）
    const existing = await db.sportPopularityByCountry.findMany({
      select: { countryId: true },
      distinct: ["countryId"],
    });
    const existingIds = new Set(existing.map((e) => e.countryId));

    // 3) まだ1件も popularity が無い国を取得
    const targetCountries = await db.country.findMany({
      where: {
        id: { notIn: Array.from(existingIds) },
      },
      select: { id: true },
    });

    if (targetCountries.length > 0) {
      // 4) 各国に1件ずつ、volleyball を priority=1 で作成
      await db.sportPopularityByCountry.createMany({
        data: targetCountries.map((c) => ({
          sportId: volleyball.id,
          countryId: c.id,
          priority: 1,
        })),
        // 既存があってもスキップ（安全策）
        skipDuplicates: true,
      });
    }

    // 一覧に戻る（自分自身を再読込）
    return redirect(new URL(request.url).pathname);
  }

  if (intent === "edit") {
    // TODO: 後で実装
    return redirect(new URL(request.url).pathname);
  }

  // 不明な intent は 400
  throw new Response("Unknown _action", { status: 400 });
};

export default function AdminSportPopularityByCountryRoute() {
  const { popularityByCountry } = useLoaderData<typeof loader>();

  const maxLength = popularityByCountry.reduce((max, c) => {
    return Math.max(max, c.sports.length);
  }, 0);

  return (
    <div>
      <h1>国ごとの人気スポーツ</h1>

      <form method="post">
        <button type="submit" name="_action" value="init">
          Initialize
        </button>
      </form>

      <form method="post">
        <div className="relative">
          <div className="pb-24">
            <table>
              <thead>
                <tr>
                  <th className="p-4 border">Country</th>
                  {new Array(20).fill(null).map((_, i) => {
                    return (
                      <th key={i} className="p-4 border">
                        {i + 1}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {popularityByCountry.map((c) => {
                  const blanks = 20 - c.sports.length;

                  return (
                    <tr key={c.id}>
                      <td className="p-4 border">{c.name}</td>
                      {c.sports.map((s) => {
                        return (
                          <td key={s.id} className="p-4 border">
                            {s.sport.name_ja_JP}
                          </td>
                        );
                      })}
                      {new Array(blanks).fill(null).map((_, i) => {
                        return <td key={i} className="p-4 border"></td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="fixed bottom-0 left-0 right-0 bg-yellow-400 p-8">
            <button type="submit" name="_action" value="edit">
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
