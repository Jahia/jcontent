import React, {useState} from 'react';
import PropTypes from 'prop-types';

import DayPicker from 'react-day-picker';
import {TimeSelector} from './TimeSelector/TimeSelector';
import {YearMonthSelector} from './YearMonthSelector/YearMonthSelector';
import {style} from './DatePicker.style';
import {withStyles} from '@material-ui/core';

import frLocale from 'dayjs/locale/fr';
import deLocale from 'dayjs/locale/de';
import enLocale from 'dayjs/locale/en';
import esLocale from 'dayjs/locale/es';
import ptLocale from 'dayjs/locale/pt';
import itLocale from 'dayjs/locale/it';

import dayjs from 'dayjs';
import {generateWeekdaysShort, getDateTime, getHourFromDisabledDays} from '../DatePickerInput/date.util';
import {Button} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

const locales = {
    fr: generateWeekdaysShort(frLocale),
    de: generateWeekdaysShort(deLocale),
    en: generateWeekdaysShort(enLocale),
    es: generateWeekdaysShort(esLocale),
    pt: generateWeekdaysShort(ptLocale),
    it: generateWeekdaysShort(itLocale)
};

const DatePickerCmp = ({
    lang,
    variant,
    classes,
    onSelectDateTime,
    selectedDateTime,
    disabledDays,
    ...props
}) => {
    const [month, setMonth] = useState(selectedDateTime ? new Date(selectedDateTime) : new Date());
    const {t} = useTranslation('jcontent');
    const isDateTime = variant === 'datetime';
    const locale = locales[lang] || locales.en;

    const selectedDays = selectedDateTime ? [selectedDateTime] : [];
    const selectedHour = selectedDateTime ? dayjs(selectedDateTime).format('HH:mm') : '00:00';

    const onToday = () => {
        setMonth(new Date());
        onSelectDateTime(getDateTime(new Date(), selectedHour));
    };

    return (
        <div className={`${classes.container} ${isDateTime ? classes.containerDateTime : ''}`}>
            <div className={classes.datePickerContainer}>
                <DayPicker
                    locale={lang}
                    disabledDays={disabledDays}
                    selectedDays={selectedDays}
                    month={month}
                    months={locale.months}
                    weekdaysLong={locale.weekdays}
                    weekdaysShort={locale.weekdaysShort}
                    firstDayOfWeek={locale.weekStart || 0}
                    captionElement={({date}) => (
                        <YearMonthSelector
                            date={date}
                            months={locale.months}
                            disabledDays={disabledDays}
                            onChange={setMonth}
                        />
                    )}
                    onDayClick={(day, modifiers) => {
                        if (modifiers && modifiers.disabled) {
                            return;
                        }

                        setMonth(day);
                        onSelectDateTime(getDateTime(day, selectedHour));
                    }}
                    {...props}
                />
                <Button label={t('jcontent:label.contentEditor.selectorTypes.dateTimePicker.today')} onClick={onToday}/>
            </div>
            {isDateTime && (
                <TimeSelector
                    disabledHours={{
                        before: getHourFromDisabledDays(selectedDays[0], disabledDays, 'before'),
                        after: getHourFromDisabledDays(selectedDays[0], disabledDays, 'after')
                    }}
                    selectedHour={selectedHour}
                    onHourSelected={hour => {
                        const newDate = getDateTime(selectedDays[0], hour);
                        setMonth(newDate);
                        onSelectDateTime(newDate);
                    }}
                />
            )}
        </div>
    );
};

DatePickerCmp.defaultProps = {
    variant: 'date',
    onSelectDateTime: () => {},
    selectedDateTime: null,
    disabledDays: []
};

DatePickerCmp.propTypes = {
    classes: PropTypes.object.isRequired,
    lang: PropTypes.oneOf(['fr', 'en', 'de']).isRequired,
    variant: PropTypes.oneOf(['date', 'datetime']),
    disabledDays: PropTypes.array,
    onSelectDateTime: PropTypes.func,
    selectedDateTime: PropTypes.object
};

export const DatePicker = withStyles(style)(DatePickerCmp);

DatePicker.displayName = 'DatePicker';
