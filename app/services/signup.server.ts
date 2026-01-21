import bcrypt from "bcryptjs";

import { getPrisma } from "./database.server";
import { v4 as uuidv4 } from "uuid";

export const createUser = async (
  data: Record<"email" | "password", string>,
) => {
  const { email, password } = data;

  if (!(email && password)) {
    throw new Error("Invalid input");
  }

  const db = getPrisma();

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return { error: { message: "メールアドレスは既に登録済みです" } };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const newUser = await db.user.create({
    data: {
      displayName: "tmpusername",
      slug: uuidv4(),
      email,
      description: "",
      profileImageUrl: "",
      auth: {
        create: {
          passwordHash: hashedPassword,
        },
      },
    },
  });

  return { id: newUser.id, email: newUser.email };
};
