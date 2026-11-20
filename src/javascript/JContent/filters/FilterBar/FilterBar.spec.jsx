import React from 'react';
import {mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {Button, CollectionBar} from '@jahia/moonstone';
import {FilterBar} from './FilterBar';
import {FilterSelector} from './FilterSelector';
import {collectionBarLabels, filterValueLabel} from './filterLabels';

// The last segment of the first key, and the options, so that a test reads the words
const t = (keys, options) => {
    const key = Array.isArray(keys) ? keys[0] : keys;
    const last = key.split('.').slice(-2).join('.');
    return options ? `${last}${JSON.stringify(options)}` : last;
};

jest.mock('react-i18next', () => ({useTranslation: () => ({t, i18n: {language: 'en'}})}));

const fields = [
    {key: 'std:lastModified', label: 'Last modified', kind: 'date', property: 'jcr:lastModified'},
    {key: 'std:createdBy', label: 'Created by', kind: 'text', property: 'jcr:createdBy'},
    {key: 'std:tags', label: 'Tags', kind: 'text', property: 'j:tagList', multiple: true},
    {key: 'prop:options', label: 'Options', kind: 'choice', property: 'options', multiple: true, options: [{value: 'garage', label: 'Garage'}, {value: 'pool', label: 'Pool'}]},
    {key: 'std:lastPublished', label: 'Last published', kind: 'date', property: 'j:lastPublished'}
];
const defaultFields = ['std:lastModified', 'std:createdBy'];

const render = props => mount(<FilterBar fields={fields} defaultFields={defaultFields} isCollapsed={false} onChange={jest.fn()} {...props}/>);
const barFilters = wrapper => wrapper.find(CollectionBar).first().props().filters;
const barFilter = (wrapper, key) => barFilters(wrapper).find(filter => filter.key === key);

// Opens the selector of a filter, and gives its FilterSelector
const openSelector = (wrapper, key) => {
    act(() => {
        wrapper.find(CollectionBar).first().props().onOpenFilterChange(key);
    });
    wrapper.update();
    return mount(<>{barFilter(wrapper, key).selector({close: jest.fn()})}</>).find(FilterSelector);
};

describe('filterValueLabel', () => {
    it('gives the operator and the value in words', () => {
        expect(filterValueLabel(t, fields[1], {field: 'std:createdBy', operator: 'contains', value: 'news'})).toBe('text.contains news');
        expect(filterValueLabel(t, fields[0], {field: 'std:lastModified', operator: 'after', value: '2026-11-01'})).toBe('date.after 2026-11-01');
        expect(filterValueLabel(t, fields[4], {field: 'std:lastPublished', operator: 'empty'})).toBe('date.empty');
    });

    it('joins several values with their labels', () => {
        expect(filterValueLabel(t, fields[3], {field: 'prop:options', operator: 'is', value: ['garage', 'pool']}))
            .toBe('choiceMultiple.is Garagefilters.valueSeparatorPool');
    });

    it('gives an empty text for a filter with no value', () => {
        expect(filterValueLabel(t, fields[1], {field: 'std:createdBy', operator: 'contains', value: ''})).toBe('');
        expect(filterValueLabel(t, fields[1], undefined)).toBe('');
    });

    it('keeps the {{name}} placeholder for CollectionBar', () => {
        expect(collectionBarLabels(t).clearFilter).toBe('filters.clearFilter{"name":"{{name}}"}');
    });
});

describe('FilterBar', () => {
    it('case 1: gives one chip for each field, the default ones displayed by default, and no columns', () => {
        const wrapper = render({filters: []});
        const filters = barFilters(wrapper);
        expect(filters.map(filter => filter.key)).toEqual(fields.map(field => field.key));
        expect(filters.filter(filter => filter.isDisplayedByDefault).map(filter => filter.key)).toEqual(defaultFields);
        expect(filters.every(filter => filter.valueLabel === '')).toBe(true);
        expect(wrapper.find(CollectionBar).first().props().columns).toBeUndefined();
        expect(wrapper.find(CollectionBar).first().props().i18n.toolbarLabel).toBe('filters.toolbarLabel');
    });

    it('case 3: shows the value of an active filter on its chip', () => {
        const wrapper = render({filters: [{field: 'std:tags', operator: 'contains', value: 'press'}]});
        expect(barFilter(wrapper, 'std:tags').valueLabel).toBe('textMultiple.contains press');
    });

    it('ignores a filter on a field that is not in the list', () => {
        const onChange = jest.fn();
        const wrapper = render({onChange, filters: [{field: 'prop:gone', operator: 'contains', value: 'x'}, {field: 'std:tags', operator: 'contains', value: 'press'}]});
        barFilter(wrapper, 'std:tags').onClear({});
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it('case 3: applies the draft when the selector closes', () => {
        const onChange = jest.fn();
        const wrapper = render({onChange, filters: []});
        const selector = openSelector(wrapper, 'std:tags');
        expect(selector.props().draft).toEqual({operator: 'contains'});
        act(() => {
            selector.props().onDraftChange({operator: 'contains', value: 'press'});
        });
        wrapper.update();
        act(() => {
            barFilter(wrapper, 'std:tags').onClose({reason: 'close'});
        });
        expect(onChange).toHaveBeenCalledWith([{field: 'std:tags', operator: 'contains', value: 'press'}]);
    });

    it('case 4: discards the draft on Escape', () => {
        const onChange = jest.fn();
        const wrapper = render({onChange, filters: [{field: 'std:tags', operator: 'contains', value: 'press'}]});
        const selector = openSelector(wrapper, 'std:tags');
        expect(selector.props().draft).toEqual({operator: 'contains', value: 'press'});
        act(() => {
            selector.props().onDraftChange({operator: 'contains', value: 'event'});
        });
        wrapper.update();
        act(() => {
            barFilter(wrapper, 'std:tags').onClose({reason: 'escape'});
        });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('case 5: changes nothing when an added chip closes with no value', () => {
        const onChange = jest.fn();
        const wrapper = render({onChange, filters: []});
        openSelector(wrapper, 'std:createdBy');
        act(() => {
            barFilter(wrapper, 'std:createdBy').onClose({reason: 'outsidePress'});
        });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('case 6: clears one filter', () => {
        const onChange = jest.fn();
        const wrapper = render({onChange, filters: [{field: 'std:tags', operator: 'contains', value: 'press'}, {field: 'std:createdBy', operator: 'contains', value: 'anna'}]});
        barFilter(wrapper, 'std:tags').onClear({});
        expect(onChange).toHaveBeenCalledWith([{field: 'std:createdBy', operator: 'contains', value: 'anna'}]);
    });

    it('case 7: clears all the filters', () => {
        const onChange = jest.fn();
        const wrapper = render({onChange, filters: [{field: 'std:tags', operator: 'contains', value: 'press'}]});
        wrapper.find(CollectionBar).first().props().onClearAll({});
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it('case 9: shows no value control for an operator with no value', () => {
        const wrapper = render({filters: [{field: 'std:lastPublished', operator: 'empty'}]});
        expect(barFilter(wrapper, 'std:lastPublished').valueLabel).toBe('date.empty');
        const selector = openSelector(wrapper, 'std:lastPublished');
        expect(selector.find('input').length).toBe(0);
    });

    it('cases 11 and 12: shows the collapsed chip with the count of active filters', () => {
        const wrapper = render({
            isCollapsed: true,
            filters: [{field: 'std:tags', operator: 'contains', value: 'press'}, {field: 'std:createdBy', operator: 'contains', value: 'anna'}, {field: 'std:createdBy', operator: 'contains', value: ''}]
        });
        expect(wrapper.find(CollectionBar).length).toBe(0);
        const chip = wrapper.find(Button).filterWhere(button => button.props()['data-sel-role'] === 'filters-collapsed');
        expect(chip.props().label).toBe('filters.collapsedCount{"count":2}');
        act(() => {
            chip.props().onClick();
        });
        wrapper.update();
        expect(wrapper.find('[role="dialog"]').first().find(CollectionBar).length).toBe(1);
    });

    it('shows the collapsed chip with no count when no filter is active', () => {
        const wrapper = render({isCollapsed: true, filters: []});
        const chip = wrapper.find(Button).filterWhere(button => button.props()['data-sel-role'] === 'filters-collapsed');
        expect(chip.props().label).toBe('filters.collapsed');
    });

    it('gives the column choice to CollectionBar for a module', () => {
        const onVisibleColumnsChange = jest.fn();
        const wrapper = render({filters: [], columns: [{key: 'title', label: 'Title'}], visibleColumns: ['title'], onVisibleColumnsChange});
        expect(wrapper.find(CollectionBar).first().props()).toEqual(expect.objectContaining({columns: [{key: 'title', label: 'Title'}], visibleColumns: ['title']}));
    });
});
