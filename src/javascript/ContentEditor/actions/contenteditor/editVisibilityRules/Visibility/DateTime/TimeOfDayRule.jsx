import React from 'react';
import {useTranslation} from 'react-i18next';
import {TimeInput, Typography} from '@jahia/moonstone';
import {useFormikContext} from 'formik';
import styles from './DateTime.scss';

const boundaries = [
    {name: 'start', hourField: 'startHour', minuteField: 'startMinute'},
    {name: 'end', hourField: 'endHour', minuteField: 'endMinute'}
];

// Legacy rules may hold non-zero-padded parts, which Temporal.PlainTime cannot parse
const pad = part => String(part).padStart(2, '0');
const toTimeValue = (hour, minute) => (hour ? `${pad(hour)}:${pad(minute || 0)}` : null);

export const TimeOfDayRule = () => {
    const {t} = useTranslation('jcontent');
    const {values, setFieldValue} = useFormikContext();

    return (
        <div className={styles.row}>
            {boundaries.map(({name, hourField, minuteField}) => {
                const id = `timeOfDayCondition-${name}`;
                return (
                    <div key={name} className="flexCol">
                        <Typography component="label" weight="bold" htmlFor={id}>
                            {t(`jcontent:label.contentEditor.visibilityTab.conditions.${name}Time`)}
                        </Typography>
                        <TimeInput
                            id={id}
                            size="big"
                            data-sel-role={id}
                            value={toTimeValue(values[hourField], values[minuteField])}
                            onChange={(event, time) => {
                                // Cleared -> null (not undefined) so the save path can route it to deletedProperties
                                const [hour, minute] = time === null ? [null, null] : time.toString().split(':');
                                setFieldValue(hourField, hour);
                                setFieldValue(minuteField, minute);
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

TimeOfDayRule.displayName = 'TimeOfDayRule';
