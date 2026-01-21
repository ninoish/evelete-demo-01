// Cloudflare workers 側で、時間を正確に取得することはできない。
// ブラウザ <=> Workers で時間のずれが生じてバグの原因となるため、utc をアプリ内で横断的に扱う。
// 特にサーバー側に保存する際はUTCにする。

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

export const now = () => {
  return dayjs().utc();
};

export const date = (dt: Date) => {
  return dayjs(dt).utc();
};

export const dateFromString = (dt: string) => {
  return dayjs(dt).utc();
};

export const toLocale = (dt: dayjs.Dayjs, timezone: string) => {
  return dt.tz(timezone);
};

export const toJST = (dt: dayjs.Dayjs) => {
  return dt.tz("Asia/Tokyo");
};
