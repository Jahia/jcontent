import React from 'react';
import {CloudCheck, Delete, Edit, NoCloud} from '@jahia/moonstone';
import dayjs from "dayjs";

export const jmixConditionalVisibility = 'jmix:conditionalVisibility';

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

export const getStatus = (status) => {
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

export const getConditionLabel = (name, properties, t) => {
    const getLabel = (startDate) => {
        return (startDate === undefined) ? 'jcontent:label.contentEditor.visibilityTab.conditions.endDateCondition' : 'jcontent:label.contentEditor.visibilityTab.conditions.startDateCondition';
    }

    switch (name) {
        case 'jnt:dayOfWeekCondition':
            return t('jcontent:label.contentEditor.visibilityTab.conditions.dayOfWeekCondition', {days: properties.find(p => p.name === 'dayOfWeek')?.values});
        case 'jnt:startEndDateCondition': {
            const startDate = properties.find(p => p.name === 'start')?.value;
            const endDate = properties.find(p => p.name === 'end')?.value;
            return t((startDate !== undefined && endDate !== undefined ? 'jcontent:label.contentEditor.visibilityTab.conditions.startEndDateCondition' : getLabel(startDate)), {
                startDate: startDate === undefined ? '' : dayjs(startDate).format('LLL'),
                endDate: endDate === undefined ? '' : dayjs(endDate).format('LLL')
            });
        }
        case 'jnt:timeOfDayCondition':
            return t('jcontent:label.contentEditor.visibilityTab.conditions.timeOfDayCondition');
        default:
            return t('jcontent:label.contentEditor.visibilityTab.conditions.' + name.substring(name.lastIndexOf(':') + 1));
    }
};

export const getStatusText = (rowData, t) => {
    const {username, timestamp, status} = rowData
    switch (status) {
        case 'published':
            return t('jcontent:label.contentManager.publicationStatus.published', {userName: username, timestamp});
        case 'modified':
            return t('jcontent:label.contentManager.publicationStatus.modified', {userName: username, timestamp});
        case 'new':
            return t('jcontent:label.contentManager.publicationStatus.new', {userName: username, timestamp});
    }
}
