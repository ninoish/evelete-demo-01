import type { Team, TeamMember } from "@prisma/client";
import { useState } from "react";
import { Link, NavLink } from "react-router";
import { HiEllipsisHorizontal } from "react-icons/hi2";

export default function TeamHeaderActionOptions({
  team,
  meMember,
}: {
  team: Team;
  meMember: TeamMember | undefined;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const memberStatus = () => {
    if (!meMember) {
      return null;
    }
    if (meMember.isOwner) {
      return <div className="flex-1 text-sm text-green-800">オーナー</div>;
    }
    if (meMember.isAdmin) {
      return <div className="flex-1 text-sm text-green-600">管理者</div>;
    }

    if (false) {
      return <div>Alnum</div>;
    }

    return <div className="flex-1 text-sm text-green-400">メンバー</div>;
  };

  const teamFollowButton = () => {
    if (meMember) {
      return null;
    }

    // TODO: 実装
    const isFollowing = false;
    if (isFollowing) {
      return (
        <button type="button" className="border rounded py-1 px-2">
          フォロー済
        </button>
      );
    } else {
      return (
        <button type="button" className="border rounded py-1 px-2">
          フォロー
        </button>
      );
    }
  };

  const joinRequestButton = () => {
    if (meMember) {
      return null;
    }
    if (!team.canRequestToJoin) {
      return null;
    }

    // TODO: 実装
    const joinRequestStatus = null;
    if (joinRequestStatus === "pending") {
      return (
        <button type="button" disabled className="border rounded py-1 px-2">
          参加承認待ち
        </button>
      );
    } else {
      return (
        <button type="button" className="border rounded py-1 px-2">
          参加申請
        </button>
      );
    }
  };
  return (
    <div className="flex gap-x-2 justify-end items-center py-2 px-4">
      {memberStatus()}

      {meMember?.canManageTeamActivity ? (
        <Link
          to={`/new/teamActivity?team=${team.slug}`}
          className="border rounded py-1 px-2"
        >
          活動予定
        </Link>
      ) : null}

      {meMember?.canManageTeamActivity ? (
        <button type="button" className="border rounded py-1 px-2">
          投稿
        </button>
      ) : null}

      {meMember?.canManageTeamActivity ? (
        <Link to="results/new" className="border rounded py-1 px-2">
          結果
        </Link>
      ) : null}

      {teamFollowButton()}

      {/* 参加申請 */}
      {joinRequestButton()}

      {/* その他オプション */}
      <div>
        <button className="border rounded py-1 px-2">
          <HiEllipsisHorizontal size={24} />
        </button>
      </div>
    </div>
  );
}
