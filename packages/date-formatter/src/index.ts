/// <reference types='@jahia/ui-extender' />
import dayjs from 'dayjs';

import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/pt';

import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(LocalizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Export a fully configured dayjs instance
 *
 * @deprecated Use functions from `date-formatter` if possible
 */
const deprecatedDayjs = dayjs;
export { deprecatedDayjs as dayjs };

const formatMap = {
  short: 'lll',
  long: 'LLL',
};

export function formatDatetime(
  date: Parameters<typeof dayjs>[0],
  options?: {
    /**
     * The format in which to display the date
     * @default 'short'
     */
    format?: keyof typeof formatMap;

    /**
     * The locale in which to display the date
     * @default window.contextJsParameters.uilang
     */
    locale?: string;
  }
) {
  return dayjs(date)
    .locale(options?.locale || window.contextJsParameters.uilang)
    .format(formatMap[options?.format || 'short']);
}

const timeFormatMap = {
  short: 'LT', // localized time, e.g. 2:30 PM (en) / 14:30 (fr)
  long: 'LTS', // localized time with seconds
};

/**
 * @param time RFC 9557-formatted time string (HH, HH:mm, HH:mm:ss or HH:mm:ss.sss)
 */
export function formatTime(
  time: string,
  options?: {
    /**
     * The format in which to display the time
     * @default 'short'
     */
    format?: keyof typeof timeFormatMap;

    /**
     * The locale in which to display the time
     * @default window.contextJsParameters.uilang
     */
    locale?: string;
  }
) {
  // Parse the time the same way Temporal.PlainTime.from does (will make the migration easier)
  return dayjs(time, ['HH:mm:ss.SSS', 'HH:mm:ss', 'HH:mm', 'HH'])
    .locale(options?.locale || window.contextJsParameters.uilang)
    .format(timeFormatMap[options?.format || 'short']);
}

const weekdayFormatMap = {
  full: 'weekdays',
  short: 'weekdaysShort',
  min: 'weekdaysMin',
} as const;
const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * @param day Case-insensitive day-of-week name, in English (e.g. 'monday', 'tuesday', etc.)
 */
export function formatDayOfWeek(
  day: string,
  options?: {
    /**
     * The format in which to display the weekday
     * @default 'full'
     */
    format?: keyof typeof weekdayFormatMap;

    /**
     * The locale in which to display the weekday
     * @default window.contextJsParameters.uilang
     */
    locale?: string;
  }
) {
  const index = weekdays.indexOf(day.toLowerCase());

  // If the day is not a valid day-of-week key, return it as-is
  if (index === -1) return day;

  return dayjs.Ls[options?.locale || window.contextJsParameters.uilang]?.[
    weekdayFormatMap[options?.format || 'full']
  ]?.[index] ?? day;
}
