import Redis from "ioredis";

export default class Kv {
  public client: Redis;

  public constructor(env?: KvEnv) {
    this.client = new Redis(getRedisUrl(env));
  }
}

export interface KvEnv {
  REDIS_URL: string;
}

const getRedisUrl = (env?: Partial<KvEnv>): string => {
  // ローカル環境用に dotenv を読み込み
  if (typeof process !== "undefined" && process.env?.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  return env?.REDIS_URL ?? "";
};
