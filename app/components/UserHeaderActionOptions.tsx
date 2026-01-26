import type { User } from "@prisma/client";
import { useState } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";

export default function UserHeaderActionOptions({ user }: { user: User }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const userFollowButton = () => {
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

  const userConnectButton = () => {
    // TODO: 実装
    const isConnected = false;
    if (isConnected) {
      return (
        <button type="button" className="border rounded py-1 px-2">
          ✅ つながり
        </button>
      );
    } else {
      return (
        <button type="button" className="border rounded py-1 px-2">
          つながり申請する
        </button>
      );
    }
  };

  const openTalk = () => {
    // TODO: 実装
    const canTalk = false;
    if (canTalk) {
      return (
        <button type="button" className="border rounded py-1 px-2">
          トーク
        </button>
      );
    } else {
      return null;
    }
  };
  return (
    <div className="flex gap-x-2 justify-end items-center py-2 px-4">
      {userConnectButton()}
      {userFollowButton()}
      {openTalk()}

      {/* その他オプション */}
      <div>
        <button className="border rounded py-1 px-2">
          <HiEllipsisHorizontal size={24} />
        </button>
      </div>
    </div>
  );
}
