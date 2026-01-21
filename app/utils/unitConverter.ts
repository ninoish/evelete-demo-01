export const convertUnitValueToUnitDisplay = (
  prefUnit,
  lang,
  unitValue: string,
  value?: number,
) => {
  if (unitValue === "Centimeter") {
    return "cm";
  }
  if (unitValue === "Meter") {
    return "m";
  }
  if (unitValue === "Kilometer") {
    return "km";
  }
  if (unitValue === "Kilogram") {
    return "kg";
  }
  if (unitValue === "Times") {
    return "回";
  }
  if (unitValue === "KmPerHour") {
    return "km/h";
  }
  if (unitValue === "Shots") {
    return "本";
  }
  if (unitValue === "Point") {
    return "点";
  }
  if (unitValue === "KgAndCount") {
    return "";
  }
  if (unitValue === "Time") {
    return "";
  }
  if (unitValue === "Millisecond") {
    return "秒";
  }
  if (unitValue === "None") {
    return "";
  }
  return "";
};
