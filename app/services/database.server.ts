import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaClient } from "@prisma/client";
import pg from "pg";

// グローバル変数に型をつけて保持（Workersでも可）
declare global {
  var _prisma: PrismaClient | undefined;
}

export const getPrisma = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });

  // ↓ global this をすると、workers でエラーが起きる。
  // if (!globalThis._prisma) {
  //   const { DATABASE_URL } = getEnv(env);

  //   console.log("DATABASE_URL: ", DATABASE_URL);
  //   // const pool = new pg.PoolConfig({
  //   //   connectionString: DATABASE_URL,
  //   //   // ↓ これがあると、cloudflare workers <=> supabase の相性が悪くてエラーになる。
  //   //   // https://github.com/brianc/node-postgres/issues/3144
  //   //   // ssl: { rejectUnauthorized: false },
  //   // });
  //   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL },);
  //   globalThis._prisma = new PrismaClient({ adapter });

  //   console.log("DATABASE_URL abc");
  // }

  // return globalThis._prisma!;
};

// function getEnv(env?: Partial<EnvBindings>): EnvBindings {
//   // ローカル環境用に dotenv を読み込み
//   if (typeof process !== "undefined" && process.env?.DATABASE_URL) {
//     return { DATABASE_URL: process.env.DATABASE_URL! };
//   }

//   return {
//     DATABASE_URL: env?.DATABASE_URL ?? "",
//   };
// }
