import React from 'react';
import {CloudCheck, Delete, Edit, NoCloud} from '@jahia/moonstone';
import {formatDatetime, formatDayOfWeek, formatTime} from 'date-formatter';
import {isArray} from 'lodash';

export const jmixConditionalVisibility = 'jmix:conditionalVisibility';

// The only DATE-typed properties across all visibility condition types (definitions.cnd). The
// DateTimePicker field component already converts to/from a real UTC instant on its own (see
// DateTimePicker.jsx) -- these are tagged DATE purely so the server stores/compares them as JCR
// dates rather than opaque strings.
const DATE_PROPERTY_NAMES = new Set(['start', 'end']);

const TIME_PROPERTY_NAMES = new Set(['startHour', 'startMinute', 'endHour', 'endMinute']);
const TIME_PAIRS = [['startHour', 'startMinute'], ['endHour', 'endMinute']];

// An hour and its minute form one value: keep or clear them as a pair, never half of it
const normalizeTimePairs = rule => {
    const normalized = {...rule};
    TIME_PAIRS.forEach(([hourKey, minuteKey]) => {
        if (normalized[hourKey]) {
            normalized[minuteKey] = normalized[minuteKey] || '00';
        } else {
            [hourKey, minuteKey].filter(key => key in normalized).forEach(key => {
                normalized[key] = null;
            });
        }
    });
    return normalized;
};

const isClearableProperty = key => DATE_PROPERTY_NAMES.has(key) || TIME_PROPERTY_NAMES.has(key);

// Transform a rule (a flat map of property name -> value, plus a `type` and optionally a `uuid`)
// into the InputVisibilityConditionInput shape expected by the saveVisibilityCondition mutation.
const buildConditionProperties = rule => {
    return Object.keys(rule).reduce((properties, key) => {
        if (key !== 'type' && key !== 'uuid' && key !== 'username' && key !== 'timestamp') {
            const isDateProperty = DATE_PROPERTY_NAMES.has(key);

            // A cleared date arrives as '' (typed then erased) or null (DatePickerInput's own
            // clear path); a cleared time as null (TimeOfDayRule). Neither is a value to set at
            // all. The caller routes it to deletedProperties instead.
            if (isClearableProperty(key) && !rule[key]) {
                return properties;
            }

            const item = {name: key};
            if (isArray(rule[key])) {
                item.values = rule[key];
            } else {
                item.value = rule[key];
            }

            if (isDateProperty) {
                item.type = 'DATE';
            }

            properties.push(item);
        }

        return properties;
    }, []);
};

// A cleared date/time property has no value left to set -- it must be explicitly deleted
// server-side, or the previously-saved value is silently left in place (the mutation only ever
// sets the properties it's given, it never removes one that's simply absent from the list).
const buildDeletedProperties = rule => Object.keys(rule).filter(key => isClearableProperty(key) && !rule[key]);

// A jnt:startEndDateCondition with neither start nor end set, a jnt:dayOfWeekCondition with no day
// selected, or a jnt:timeOfDayCondition with neither time set, is a no-op condition -- saving it can
// only confuse the editor who will see a rule that visibly does nothing. For dates and times, having
// just one of the two boundaries is a legitimate, intentional "open-ended" condition and stays allowed.
export const isSaveDisabled = (type, values) => {
    if (type === 'jnt:startEndDateCondition') {
        return !values.start && !values.end;
    }

    if (type === 'jnt:dayOfWeekCondition') {
        return !values.dayOfWeek || values.dayOfWeek.length === 0;
    }

    if (type === 'jnt:timeOfDayCondition') {
        return !values.startHour && !values.endHour;
    }

    return false;
};

export const buildNewCondition = rule => {
    const normalized = normalizeTimePairs(rule);
    return {
        type: normalized.type,
        properties: buildConditionProperties(normalized)
    };
};

export const buildUpdatedCondition = rule => {
    const normalized = normalizeTimePairs(rule);
    return {
        type: normalized.type,
        uuid: normalized.uuid,
        properties: buildConditionProperties(normalized),
        deletedProperties: buildDeletedProperties(normalized)
    };
};

export const filterRegularFieldSets = fieldSets => {
    const showFieldSet = fieldSet => {
        if (fieldSet?.name !== jmixConditionalVisibility) {
            return false;
        }

        if (fieldSet.dynamic && !fieldSet.hasEnableSwitch && !fieldSet.activated) {
            return false;
        }

        // We must hide fieldSet in the section when the fieldSet is not dynamic and
        // the fieldSet doesn't contain any fields (empty).
        return fieldSet.dynamic || fieldSet.fields.length > 0;
    };

    return fieldSets.filter(fs => showFieldSet(fs));
};

export const getStatus = status => {
    if (status === 'published') {
        return {
            color: 'success',
            chipColor: 'success',
            iconStart: <CloudCheck/>
        };
    }

    if (status === 'modified') {
        return {
            color: 'warning',
            chipColor: 'warning',
            iconStart: <Edit/>
        };
    }

    if (status === 'unpublished') {
        return {
            color: 'default',
            chipColor: 'default',
            iconStart: <NoCloud/>
        };
    }

    if (status === 'deleted') {
        return {
            color: 'danger',
            chipColor: 'danger',
            iconStart: <Delete/>
        };
    }

    if (status === 'new') {
        return {
            color: 'info',
            chipColor: 'default',
            iconStart: <NoCloud/>
        };
    }

    return {
        color: 'default',
        chipColor: 'default'
    };
};

// Localise the stored day-of-week choicelist values (raw keys: 'monday'…'sunday') into the UI
// language, then join them for interpolation into the dayOfWeekCondition sentence.
const formatDaysOfWeek = (values, uilang) => {
    return (values || [])
        .map(day => formatDayOfWeek(day, {locale: uilang}))
        .join(', ');
};

export const getConditionLabel = (name, properties, t, uilang = window.contextJsParameters?.uilang) => {
    const getDateLabel = startDate => {
        return (startDate === undefined) ? 'jcontent:label.contentEditor.visibilityTab.conditions.endDateCondition' : 'jcontent:label.contentEditor.visibilityTab.conditions.startDateCondition';
    };

    const getTimeLabel = startHour => {
        return (startHour === undefined) ? 'jcontent:label.contentEditor.visibilityTab.conditions.endTimeCondition' : 'jcontent:label.contentEditor.visibilityTab.conditions.startTimeCondition';
    };

    switch (name) {
        case 'jnt:dayOfWeekCondition':
            return t('jcontent:label.contentEditor.visibilityTab.conditions.dayOfWeekCondition', {days: formatDaysOfWeek(properties.find(p => p.name === 'dayOfWeek')?.values, uilang)});
        case 'jnt:startEndDateCondition': {
            const startDate = properties.find(p => p.name === 'start')?.value;
            const endDate = properties.find(p => p.name === 'end')?.value;
            return t((startDate !== undefined && endDate !== undefined ? 'jcontent:label.contentEditor.visibilityTab.conditions.startEndDateCondition' : getDateLabel(startDate)), {
                startDate: startDate === undefined ? '' : formatDatetime(startDate, {format: 'long', locale: uilang}),
                endDate: endDate === undefined ? '' : formatDatetime(endDate, {format: 'long', locale: uilang})
            });
        }

        case 'jnt:timeOfDayCondition': {
            const startHour = properties.find(p => p.name === 'startHour')?.value;
            const startMinute = properties.find(p => p.name === 'startMinute')?.value;
            const endHour = properties.find(p => p.name === 'endHour')?.value;
            const endMinute = properties.find(p => p.name === 'endMinute')?.value;
            return t((startHour !== undefined && endHour !== undefined ? 'jcontent:label.contentEditor.visibilityTab.conditions.startEndTimeCondition' : getTimeLabel(startHour)), {
                startTime: startHour === undefined ? '' : formatTime(`${startHour}:${startMinute}`, {locale: uilang}),
                endTime: endHour === undefined ? '' : formatTime(`${endHour}:${endMinute}`, {locale: uilang})
            });
        }

        default:
            return t('jcontent:label.contentEditor.visibilityTab.conditions.' + name.substring(name.lastIndexOf(':') + 1));
    }
};
