/**
 * ランダムな英数字文字列を生成する
 * @param length 生成する文字列の長さ
 * @returns a-zA-Z0-9 の文字からなるランダムな文字列
 */
export function generateRandomAlphanumeric(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
