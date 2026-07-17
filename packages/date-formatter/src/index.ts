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
