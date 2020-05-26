export function getShortStringFromNumber(num: number) {
  if (num < 999) return `${num}`;
  else if (num < 99999) return `${Math.round(num / 100) / 10}k`;
  else return `${Math.round(num / 1000)}k`;
}

export function getNumberFromShortString(str: string) {
  let result: number;
  if (str.indexOf("K") !== -1) {
    result = Number(str.split("K")[0]) * 1000;
  } else if (str.indexOf("M") !== -1) {
    result = Number(str.split("M")[0]) * 1000000;
  } else {
    result = Number(str);
  }

  if (result === NaN)
    throw new Error("Failed to convert short string to number.");

  return result;
}
