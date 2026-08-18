import React from 'react';
import {useTranslation} from 'react-i18next';
import {TimeInput, Typography} from '@jahia/moonstone';
import {useFormikContext} from 'formik';
import styles from './DateTime.scss';

// The jnt:timeOfDayCondition node type stores the time as four zero-padded string properties.
// TimeInput reads and emits a single time, so each side maps onto its hour/minute pair.
const boundaries = [
    {name: 'start', hourField: 'startHour', minuteField: 'startMinute'},
    {name: 'end', hourField: 'endHour', minuteField: 'endMinute'}
];

const toTimeValue = (hour, minute) => (hour ? `${hour}:${minute || '00'}` : null);

export const TimeOfDayRule = () => {
    const {t} = useTranslation('jcontent');
    const {values, setFieldValue} = useFormikContext();

    return (
        <div className={styles.row}>
            {boundaries.map(({name, hourField, minuteField}) => {
                const id = `timeOfDayCondition-${name}`;
                return (
                    <div key={name} className="flexCol">
                        <Typography component="label" variant="caption" htmlFor={id}>
                            {t(`jcontent:label.contentEditor.visibilityTab.conditions.${name}Time`)}
                        </Typography>
                        <TimeInput
                            id={id}
                            data-sel-role={id}
                            value={toTimeValue(values[hourField], values[minuteField])}
                            onChange={(event, time) => {
                                const [hour, minute] = time === null ? [] : time.toString().split(':');
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
