import { FaInstagram, FaLink, FaTiktok, FaYoutube } from "react-icons/fa";
import { data, Link, type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { Auth } from "~/services/auth.server";
import teamService from "~/services/teamService.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!params.slug) {
    throw data({ errorMessage: "Team Not Found" }, { status: 404 });
  }
  const team = await teamService.getTeamBySlug(params.slug, user?.id ?? null);

  if (!team) {
    throw data({ errorMessage: "Team Not Found" }, { status: 404 });
  }

  const isMember = user
    ? team!.members.find((tm) => tm.userId === user?.id)
    : false;

  const teamSportsAndAttributes =
    teamService.combineTeamSportsAndTeamSportAttributes(
      team.sports,
      team.sportAttributes,
    );

  const ownerMember = team.members.find((mem) => mem.isOwner);

  return { user, team, teamSportsAndAttributes, isMember, ownerMember };
};

export default function TeamInfoRoute() {
  const data = useLoaderData<typeof loader>();

  const { team, teamSportsAndAttributes, user, isMember, ownerMember } = data;

  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <h4 className="text-2xl italic font-bold">About</h4>
        <p>{team.description}</p>
      </div>

      {teamSportsAndAttributes.length ? (
        <div>
          <ul className="flex flex-col md:flex-row md:flex-wrap gap-2 flex-wrap">
            {teamSportsAndAttributes.map((s) => {
              return (
                <li key={s.sportId} className="rounded border p-2">
                  <h5 className="font-bold text-lg inline-flex gap-1 items-center">
                    <span>{s.sport.emoji}</span>
                    <span>{s.sport.name_ja_JP}</span>
                  </h5>
                  <ul className="flex flex-wrap gap-2">
                    {s.teamSportAttributes?.map((attr) => {
                      return (
                        <li key={attr.sportAttribute.id} className="">
                          {attr.sportAttribute.name}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {team.places?.length > 0 ? (
        <div>
          {team.places?.map((place) => {
            return <p key={place.placeId}>{place.place.name}</p>;
          })}
        </div>
      ) : null}

      <div className="w-full bg-gray-600 text-white flex items-center justify-center px-4 py-20 rounded">
        <div className="font-bold">Ad banner</div>
      </div>

      <div>
        <h4 className="text-2xl italic font-bold">Data</h4>
        <div>
          <h6>年齢層の分布</h6>
          <div></div>
        </div>
        <div>
          <h6>競技志向</h6>
          <div></div>
        </div>
        <div>
          <h6>競技レベル</h6>
          <div></div>
        </div>
        <div>
          <h6>競技歴</h6>
          <div></div>
        </div>
        <div>
          <h6>活動頻度</h6>
          <div></div>
        </div>
        <div>
          <h6>活動比率</h6>
          <div></div>
        </div>
        <div>
          <h6>所属メンバーの男女比</h6>
          <div></div>
        </div>
        <div>
          <h6>活動参加者の男女比</h6>
          <div></div>
        </div>
      </div>

      <p className="text-base ">ドロップイン参加者からの評価: ⭐️ 4.9/5.0</p>

      <div>
        <h4 className="text-2xl italic font-bold">Info</h4>

        {team.youtubeChannelUrl ? (
          <div>
            <FaYoutube size={18} />
            <Link to={team.youtubeChannelUrl}>{team.youtubeChannelUrl}</Link>
          </div>
        ) : null}

        {team.instagramUrl ? (
          <div>
            <FaInstagram size={18} />
            <Link to={team.instagramUrl}>{team.instagramUrl}</Link>
          </div>
        ) : null}

        {team.tiktokUrl ? (
          <div>
            <FaTiktok size={18} />
            <Link to={team.tiktokUrl}>{team.tiktokUrl}</Link>
          </div>
        ) : null}

        {team.externalLinkUrl ? (
          <div>
            <FaLink size={18} />
            <Link to={team.externalLinkUrl}>{team.externalLinkUrl}</Link>
          </div>
        ) : null}

        {team.establishedAt ? (
          <div className="inline-flex gap-1 items-center">
            <span>チーム創設</span>
            <span>{team.establishedAt.toISOString().slice(0, 10)}</span>
          </div>
        ) : null}

        {ownerMember ? (
          <div className="flex gap-2 items-center">
            <h5>代表者</h5>
            <Link
              to={`/users/${ownerMember.user.slug}`}
              className="inline-flex items-center gap-1"
            >
              {ownerMember.user.profileImageUrl ? (
                <img
                  src={ownerMember.user.profileImageUrl}
                  className="h-4 w-4 rounded-sm"
                />
              ) : null}
              <span>{ownerMember.user.displayName}</span>
            </Link>
          </div>
        ) : null}
      </div>

      <div className="h-dvh">dummy</div>
    </div>
  );
}
