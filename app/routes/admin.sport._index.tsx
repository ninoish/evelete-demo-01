import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getPrisma } from "~/services/database.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const db = getPrisma();
  const sports = await db.sport.findMany({
    include: {
      _count: {
        select: {
          users: true,
          teams: true,
          organizations: true,
          eventEntryPoints: true,
          teamResults: true,
          personalResult: true,
          personalRecords: true,
          personalActivities: true,
        },
      },
    },
  });
  return {
    sports,
  };
};

/*
スポーツの内容が編集できる
翻訳 を追加
Alias 追加
利用者数の把握
利用チーム数の把握
*/
export default function AdminSportIndexRoute() {
  const data = useLoaderData<typeof loader>();

  const sports = data.sports;
  return (
    <div className="p-8">
      <div className="text-blue-600 border p-4 bg-amber-100 flex flex-wrap gap-x-12 gap-y-4">
        <Link to="./attribute">Sport Attributes</Link>
        <Link to="./category">Sport Categories</Link>
        <Link to="./popularity-by-country">Popularity by Countries</Link>
        <Link to="./personal-records">Related Personal Records</Link>
        <Link to="./team-results">Team Results</Link>
      </div>

      <div>
        <table>
          {sports.map((sp) => {
            return (
              <tr key={sp.id}>
                <td>{sp.id}</td>
                <td>{sp.name_ja_JP}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </div>
  );
}
