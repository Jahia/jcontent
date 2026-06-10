import {DayOfWeekSelect} from './DayOfWeekSelect';

export const registerDayOfWeekSelect = ceRegistry => {
    ceRegistry.add('selectorType', 'DayOfWeekSelect', {
        dataType: ['String'],
        cmp: DayOfWeekSelect,
        supportMultiple: true,
        labelKey: 'jcontent:label.contentEditor.selectorTypes.dayOfWeekSelect.displayValue',
        properties: [
            {name: 'description', value: 'jcontent:label.contentEditor.selectorTypes.dayOfWeekSelect.description'},
            {name: 'iconStart', value: 'Calendar'}
        ]
    });
};

