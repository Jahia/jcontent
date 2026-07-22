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

export function formatTime(
  hour: string | number,
  minute: string | number,
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
  return dayjs(`${hour}:${minute}`, 'HH:mm')
    .locale(options?.locale || window.contextJsParameters.uilang)
    .format(timeFormatMap[options?.format || 'short']);
}

// dayjs day-of-week indices: 0 = Sunday … 6 = Saturday (locale-independent)
const dayOfWeekIndex: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * Localize a day-of-week key (e.g. 'monday') into its full weekday name in the
 * given locale, using dayjs' bundled locale data (e.g. 'monday' -> 'lundi' / 'Montag').
 */
export function formatDayOfWeek(
  day: string,
  options?: {
    /**
     * The locale in which to display the weekday
     * @default window.contextJsParameters.uilang
     */
    locale?: string;
  }
) {
  return dayjs()
    .locale(options?.locale || window.contextJsParameters.uilang)
    .day(dayOfWeekIndex[String(day).toLowerCase()])
    .format('dddd');
}
