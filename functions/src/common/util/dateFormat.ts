export const pad = (val: any, len = 2) => {
  val = String(val);
  while (val.length < len) {
    val = "0" + val;
  }
  return val;
};

export const dateFormat = (() => {
  const token =
    /d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|W{1,2}|[LlopSZN]|"[^"]*"|'[^']*'/g;
  const timezone =
    /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
  const timezoneClip = /[^-+\dA-Z]/g;

  const _masks: any = {
    default: "ddd MMM dd yyyy HH:mm:ss",
    shortDate: "M/d/yy",
    paddedShortDate: "MM/dd/yyyy",
    mediumDate: "MMM d, yyyy",
    longDate: "MMMM d, yyyy",
    fullDate: "dddd, MMMM d, yyyy",
    shortTime: "h:mm TT",
    mediumTime: "h:mm:ss TT",
    longTime: "h:mm:ss TT Z",
    isoDate: "yyyy-MM-dd",
    isoTime: "HH:mm:ss",
    isoDateTime: "yyyy-MM-dd'T'HH:mm:sso",
    isoUtcDateTime: "UTC:yyyy-MM-dd'T'HH:mm:ss'Z'",
    expiresHeaderFormat: "ddd, dd MMM yyyy HH:mm:ss Z",
  };

  // Internationalization strings
  const _i18n = {
    dayNames: [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    monthNames: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"],
  };

  /**
   * Get day name
   * Yesterday, Today, Tomorrow if the date lies within, else fallback to Monday - Sunday
   * @param  {Object}
   * @return {String}
   */
  const getDayName = ({
    y,
    M,
    d,
    _,
    dayName,
    short = false,
  }: {
    y: any;
    M: any;
    d: any;
    _: any;
    dayName: any;
    short?: boolean;
  }) => {
    const today: any = new Date();
    const yesterday: any = new Date();
    yesterday.setDate(yesterday[_ + "Date"]() - 1);
    const tomorrow: any = new Date();
    tomorrow.setDate(tomorrow[_ + "Date"]() + 1);
    const today_d = () => today[_ + "Date"]();
    const today_m = () => today[_ + "Month"]();
    const today_y = () => today[_ + "FullYear"]();
    const yesterday_d = () => yesterday[_ + "Date"]();
    const yesterday_m = () => yesterday[_ + "Month"]();
    const yesterday_y = () => yesterday[_ + "FullYear"]();
    const tomorrow_d = () => tomorrow[_ + "Date"]();
    const tomorrow_m = () => tomorrow[_ + "Month"]();
    const tomorrow_y = () => tomorrow[_ + "FullYear"]();

    if (today_y() === y && today_m() === M && today_d() === d) {
      return short ? "Tdy" : "Today";
    } else if (
      yesterday_y() === y &&
      yesterday_m() === M &&
      yesterday_d() === d
    ) {
      return short ? "Ysd" : "Yesterday";
    } else if (tomorrow_y() === y && tomorrow_m() === M && tomorrow_d() === d) {
      return short ? "Tmw" : "Tomorrow";
    }
    return dayName;
  };

  /**
   * Get the ISO 8601 week number
   * Based on comments from
   * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
   *
   * @param  {Object} `date`
   * @return {Number}
   */
  const getWeek = (date: any) => {
    // Remove time components of date
    const targetThursday = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    // Change date to Thursday same week
    targetThursday.setDate(
      targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3
    );

    // Take January 4th as it is always in week 1 (see ISO 8601)
    const firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

    // Change date to Thursday same week
    firstThursday.setDate(
      firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3
    );

    // Check if daylight-saving-time-switch occurred and correct for it
    const ds =
      targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
    targetThursday.setHours(targetThursday.getHours() - ds);

    // Number of weeks between target Thursday and first Thursday
    const weekDiff =
      (targetThursday.getTime() - firstThursday.getTime()) / (86400000 * 7);
    return 1 + Math.floor(weekDiff);
  };

  /**
   * Get ISO-8601 numeric representation of the day of the week
   * 1 (for Monday) through 7 (for Sunday)
   *
   * @param  {Object} `date`
   * @return {Number}
   */
  const getDayOfWeek = (date: any) => {
    let dow = date.getDay();
    if (dow === 0) {
      dow = 7;
    }
    return dow;
  };

  // /**
  //  * kind-of shortcut
  //  * @param  {*} val
  //  * @return {String}
  //  */
  // const kindOf = (val) => {
  //     if (val === null) {
  //         return 'null';
  //     }

  //     if (val === undefined) {
  //         return 'undefined';
  //     }

  //     if (typeof val !== 'object') {
  //         return typeof val;
  //     }

  //     if (Array.isArray(val)) {
  //         return 'array';
  //     }

  //     return {}.toString.call(val).slice(8, -1).toLowerCase();
  // };

  // Regexes and supporting functions are cached through closure
  return (
    _date: Date | string | number,
    mask: string,
    utc?: boolean,
    gmt?: boolean
  ) => {
    // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
    /*  if (
        arguments.length === 1 &&
        kindOf(date) === "string" &&
        !/\d/.test(date)
      ) {
        mask = date;
        date = undefined;
      } */

    _date = _date || _date === 0 ? _date : new Date();
    // if (!(date instanceof Date)) {
    //     date = new Date(date);
    // }
    const date: any = new Date(_date);

    mask = String(_masks[mask] || mask || _masks["default"]);

    // Allow setting the utc/gmt argument via the mask
    const maskSlice = mask.slice(0, 4);
    if (maskSlice === "UTC:" || maskSlice === "GMT:") {
      mask = mask.slice(4);
      utc = true;
      if (maskSlice === "GMT:") {
        gmt = true;
      }
    }

    const _ = () => (utc ? "getUTC" : "get");
    const d = (): number => date[_() + "Date"]();
    const D = (): number => date[_() + "Day"]();
    const M = (): number => date[_() + "Month"]();
    const y = (): number => date[_() + "FullYear"]();
    const H = (): number => date[_() + "Hours"]();
    const m = (): number => date[_() + "Minutes"]();
    const s = (): number => date[_() + "Seconds"]();
    const L = (): number => date[_() + "Milliseconds"]();
    const o = (): number => (utc ? 0 : date.getTimezoneOffset());
    const W = (): number => getWeek(date);
    const N = (): number => getDayOfWeek(date);

    const flags: any = {
      d: () => d(),
      dd: () => pad(d()),
      ddd: () => _i18n.dayNames[D()],
      DDD: () =>
        getDayName({
          y: y(),
          M: M(),
          d: d(),
          _: _(),
          dayName: _i18n.dayNames[D()],
          short: true,
        }),
      dddd: () => _i18n.dayNames[D() + 7],
      DDDD: () =>
        getDayName({
          y: y(),
          M: M(),
          d: d(),
          _: _(),
          dayName: _i18n.dayNames[D() + 7],
        }),
      M: () => M() + 1,
      MM: () => pad(M() + 1),
      MMM: () => _i18n.monthNames[M()],
      MMMM: () => _i18n.monthNames[M() + 12],
      yy: () => String(y()).slice(2),
      yyyy: () => pad(y(), 4),
      h: () => H() % 12 || 12,
      hh: () => pad(H() % 12 || 12),
      H: () => H(),
      HH: () => pad(H()),
      m: () => m(),
      mm: () => pad(m()),
      s: () => s(),
      ss: () => pad(s()),
      l: () => pad(L(), 3),
      L: () => pad(Math.floor(L() / 10)),
      t: () => (H() < 12 ? _i18n.timeNames[0] : _i18n.timeNames[1]),
      tt: () => (H() < 12 ? _i18n.timeNames[2] : _i18n.timeNames[3]),
      T: () => (H() < 12 ? _i18n.timeNames[4] : _i18n.timeNames[5]),
      TT: () => (H() < 12 ? _i18n.timeNames[6] : _i18n.timeNames[7]),
      Z: () =>
        gmt
          ? "GMT"
          : utc
          ? "UTC"
          : (date!.toString().match(timezone) || [""])
              .pop()
              .replace(timezoneClip, "")
              .replace(/GMT\+0000/g, "UTC"),
      o: () =>
        (o() > 0 ? "-" : "+") +
        pad(Math.floor(Math.abs(o()) / 60) * 100 + (Math.abs(o()) % 60), 4),
      p: () =>
        (o() > 0 ? "-" : "+") +
        pad(Math.floor(Math.abs(o()) / 60), 2) +
        ":" +
        pad(Math.floor(Math.abs(o()) % 60), 2),
      S: () =>
        ["th", "st", "nd", "rd"][
          d() % 10 > 3
            ? 0
            : (((d() % 100) - (d() % 10) != 10 ? 1 : 0) * d()) % 10
        ],
      W: () => W(),
      WW: () => pad(W()),
      N: () => N(),
    };

    return mask.replace(token, (match) => {
      if (match in flags) {
        return flags[match]();
      }
      return match.slice(1, match.length - 1);
    });
  };
})();
