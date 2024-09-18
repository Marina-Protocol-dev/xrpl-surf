import { dateFormat } from "./dateFormat";

export const convertDateType = (value: any) => {
  try {
    if (value["seconds"]) {
      return new Date(value["seconds"] * 1000);
    }

    return new Date(value);
  } catch (err: any) {
    console.error(err.toString());
    return null;
  }
};

export const dateTypeHelper = ({ key, obj }: { key: string; obj: any }) => {
  try {
    const _value = obj[key];

    if (!_value) {
      return null;
    }

    if (_value["seconds"]) {
      return new Date(_value["seconds"] * 1000);
    }

    return new Date(_value);
  } catch (err: any) {
    console.error(err.toString());
    return null;
  }
};

export const round = (num: number, fixed = 3) => {
  const fixNum = fixed === 3 ? 1000 : Math.pow(10, fixed);
  return Math.round(num * fixNum) / fixNum;
};

export const masking = (value: string) => {
  if (value.length === 2) {
    return value.replace(/(?<=.{1})./gi, "*");
  } else if (value.length > 2) {
    return value.replace(/(?<=.{2})./gi, "*");
  } else {
    return value;
  }
};

export const messageContents = (startTime: any, endTime: any) => {
  const start = convertTimeStampToDate(startTime);
  const end = convertTimeStampToDate(endTime);
  return `${dateFormat(start, "HH:mm")} > ${dateFormat(end, "HH:mm")}`;
};

export const convertTimeStampToDate = (value: any) => {
  return new Date(value["seconds"] * 1000);
};

export const convertRoleLevel = (role: string): number => {
  if (!role.startsWith("level")) {
    return 0;
  }

  return parseInt(role.replace("level", ""));
};

export const convertTierStr = (tier: number) => {
  if (tier == 1) {
    return "Bronze";
  } else if (tier == 2) {
    return "Silver";
  } else if (tier == 3) {
    return "Gold";
  } else if (tier == 4) {
    return "Platinum";
  }

  return "NONE";
};

const prep = (t: string): string[] =>
  ("" + t)
    // treat non-numerical characters as lower version
    // replacing them with a negative number based on charcode of first character
    .replace(
      // eslint-disable-next-line no-useless-escape
      /[^\d.]+/g,
      (c) =>
        "." +
        (c
          .replace(/[\W_]+/, "")
          .toUpperCase()
          .charCodeAt(0) -
          65536) +
        "."
    )
    // remove trailing "." and "0" if followed by non-numerical characters (1.0.0b);
    .replace(/(?:\.0+)*(\.-\d+(?:\.\d+)?)\.*$/g, "$1")
    // return array
    .split(".");

export const compareVer = (a: string, b: string) => {
  const c: string[] = prep(a);
  const d: string[] = prep(b);
  const len = Math.max(c.length, d.length);
  let res = 0;
  let i = 0;
  while (!res && i < len) {
    //convert every item into integer
    const n1: number = ~~c[i];
    const n2: number = ~~d[i++];
    res = n1 === n2 ? 0 : n1 > n2 ? 1 : -1;
  }
  return res;
};

export const calcBoost = (
  referralFlag: boolean,
  tier1Size: number,
  tier2Size: number,
  adsWatch: boolean
) => {
  return round(
    (1 + (referralFlag ? 0.25 : 0) + tier1Size * 0.2 + tier2Size * 0.05) *
      24 *
      (adsWatch === true ? 2 : 1)
  );
};
