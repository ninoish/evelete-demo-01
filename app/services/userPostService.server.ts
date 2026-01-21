// TODO: Redisなどに移す。
// タイムライン用
const getUserPostByUserId = async (userId: string) => {
  return [];
};

// タイムライン用
const getUserPostForGuest = async () => {
  return [];
};

export default {
  getUserPostByUserId,
  getUserPostForLoggedOutUser: getUserPostForGuest,
};
