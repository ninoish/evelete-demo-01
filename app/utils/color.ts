function uuidToColor(uuid: string): string {
  // UUID のハイフンを除去して、16進数文字列として扱う
  const hex = uuid.replace(/-/g, "");

  // 最初の6文字（3バイト = R, G, B）を取得
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // RGB をカラーコードに変換
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function invertColor(hex: string, bw: boolean) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  const r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    // https://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
  }
  // invert color components
  const rStr = (255 - r).toString(16),
    gStr = (255 - g).toString(16),
    bStr = (255 - b).toString(16);
  // pad each with zeros and return
  return (
    "#" + rStr.padStart(2, "0") + gStr.padStart(2, "0") + bStr.padStart(2, "0")
  );
}

export default {
  uuidToColor,
  invertColor,
};
