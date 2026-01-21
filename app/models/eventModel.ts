import { getPrisma } from "~/services/database.server";

const getById = async ({ id }: { id: string | undefined }) => {
  const db = getPrisma();
  return await db.event.findFirstOrThrow({
    where: {
      id,
    },
    include: {
      organization: true,
      entryPoints: true,
    },
  });
};

export default {
  getById,
};
