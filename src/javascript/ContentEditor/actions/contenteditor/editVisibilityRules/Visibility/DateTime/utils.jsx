import React from 'react';
import {CloudCheck, Delete, Edit, NoCloud} from '@jahia/moonstone';
import {formatDatetime, formatDayOfWeek, formatTime} from 'date-formatter';
import {isArray} from 'lodash';

export const jmixConditionalVisibility = 'jmix:conditionalVisibility';

// Transform a rule (a flat map of property name -> value, plus a `type` and optionally a `uuid`)
// into the InputVisibilityConditionInput shape expected by the saveVisibilityCondition mutation.
const buildConditionProperties = rule => {
    return Object.keys(rule).reduce((properties, key) => {
        if (key !== 'type' && key !== 'uuid' && key !== 'username' && key !== 'timestamp') {
            const item = {name: key};
            if (isArray(rule[key])) {
                item.values = rule[key];
            } else {
                item.value = rule[key];
            }

            properties.push(item);
        }

        return properties;
    }, []);
};

export const buildNewCondition = rule => ({
    type: rule.type,
    properties: buildConditionProperties(rule)
});

export const buildUpdatedCondition = rule => ({
    type: rule.type,
    uuid: rule.uuid,
    properties: buildConditionProperties(rule)
});

export const generateUUID = () => {
    if (window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(/[xy]/g, c => {
        const r = window.crypto.getRandomValues(new Uint8Array(1))[0] & 0xf;
        return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
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
                startTime: startHour === undefined ? '' : formatTime(startHour, startMinute, {locale: uilang}),
                endTime: endHour === undefined ? '' : formatTime(endHour, endMinute, {locale: uilang})
            });
        }

        default:
            return t('jcontent:label.contentEditor.visibilityTab.conditions.' + name.substring(name.lastIndexOf(':') + 1));
    }
};

export const getStatusText = (rowData, t) => {
    const {username, timestamp, status} = rowData;
    switch (status) {
        case 'published':
            return t('jcontent:label.contentManager.publicationStatus.published', {userName: username, timestamp});
        case 'modified':
            return t('jcontent:label.contentManager.publicationStatus.modified', {userName: username, timestamp});
        case 'deleted':
            return t('jcontent:label.contentEditor.visibilityTab.conditions.markedForDeletionBy', {userName: username, timestamp});
        default:
            return t('jcontent:label.contentManager.publicationStatus.new', {userName: username, timestamp});
    }
};
