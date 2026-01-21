import { now } from "~/utils/datetime";
import { getPrisma } from "./database.server";
import { FriendRequestState } from "@prisma/client";

const isConnected = async (userId: string, friendId: string) => {
  const db = getPrisma();
  return await db.friend.findFirst({
    where: { userId: userId, friendId: friendId },
  });
};

const getConnectionList = async (userId: string) => {
  const db = getPrisma();
  return await db.friend.findMany({
    where: { userId: userId },
    include: { friend: true }, // 詳細も取れる
  });
};

const MAX_REJECTS = 3;
const COOLDOWN_DAYS = 7;

const sendConnectionRequest = async (
  senderUserId: string,
  receivedUserId: string,
) => {
  if (senderUserId === receivedUserId) {
    throw new Error("自分自身には申請できません");
  }

  const db = getPrisma();

  const existingFriend = await db.friend.findFirst({
    where: {
      userId: senderUserId,
      friendId: receivedUserId,
    },
  });

  if (existingFriend) {
    throw new Error("すでに友達です");
  }

  // 相手からリクエスト済みか？
  const reverseRequest = await db.friendRequest.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: receivedUserId,
        toUserId: senderUserId,
      },
    },
  });

  if (reverseRequest && reverseRequest.status === "PENDING") {
    // ③ 逆方向の申請がPENDING → 承認して即座に友達にする
    await db.$transaction([
      db.friend.createMany({
        data: [
          { userId: senderUserId, friendId: receivedUserId },
          { userId: receivedUserId, friendId: senderUserId },
        ],
      }),
      db.friendRequest.update({
        where: {
          fromUserId_toUserId: {
            fromUserId: receivedUserId,
            toUserId: senderUserId,
          },
        },
        data: {
          status: FriendRequestState.ACCEPTED,
        },
      }),
    ]);
    return;
  }

  const existingRequest = await db.friendRequest.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: senderUserId,
        toUserId: receivedUserId,
      },
    },
  });

  if (existingRequest) {
    // BLOCKED: 再申請不可
    if (existingRequest.status === "BLOCKED") {
      throw new Error("これ以上申請できません（ブロックされています）");
    }

    // PENDING: すでに申請中
    if (existingRequest.status === "PENDING") {
      throw new Error("すでに申請中です");
    }

    // REJECTED: 冷却期間中なら拒否
    if (
      existingRequest.status === "REJECTED" &&
      existingRequest.cooldownUntil &&
      now().toDate() < existingRequest.cooldownUntil
    ) {
      throw new Error("冷却期間中のため、申請できません");
    }

    // 再申請可能
    if (existingRequest.rejectedCount + 1 >= MAX_REJECTS) {
      // BLOCKEDに更新
      await db.friendRequest.update({
        where: {
          fromUserId_toUserId: {
            fromUserId: senderUserId,
            toUserId: receivedUserId,
          },
        },
        data: {
          status: "BLOCKED",
          rejectedCount: existingRequest.rejectedCount + 1,
        },
      });
      throw new Error("申請回数の上限を超えたため、ブロックされました");
    }

    // 再申請する（REJECTED → PENDING）
    await db.friendRequest.update({
      where: {
        fromUserId_toUserId: {
          fromUserId: senderUserId,
          toUserId: receivedUserId,
        },
      },
      data: {
        status: "PENDING",
        createdAt: now().toDate(),
        rejectedCount: existingRequest.rejectedCount + 1,
        cooldownUntil: null,
      },
    });

    return;
  }

  // ⑤ 初回申請
  await db.friendRequest.create({
    data: {
      fromUserId: senderUserId,
      toUserId: receivedUserId,
      status: FriendRequestState.PENDING,
    },
  });
};

const approveConnectionRequest = async (
  approverId: string,
  approvedUserId: string,
) => {
  const db = getPrisma();

  return await db.$transaction([
    db.friend.create({
      data: { userId: approvedUserId, friendId: approverId },
    }),
    db.friend.create({
      data: { userId: approverId, friendId: approvedUserId },
    }),
    db.friendRequest.update({
      where: {
        fromUserId_toUserId: {
          fromUserId: approvedUserId,
          toUserId: approverId,
        },
      },
      data: { status: FriendRequestState.ACCEPTED },
    }),
  ]);
};

const denyConnectionRequest = async (
  denierId: string,
  deniedUserId: string,
) => {
  // TODO: impl
};

export default {
  isConnected,
  getConnectionList,
  sendConnectionRequest,
  approveConnectionRequest,
  denyConnectionRequest,
};
