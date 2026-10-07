import React from 'react';
import {shallow} from '@jahia/test-framework';
import {SingleSelect} from './SingleSelect';

/**
 * A constraint may name the group it belongs to, which turns the flat dropdown into labelled groups.
 * Used to show a page's templates and the site's page samples in one list without confusing the two.
 */
describe('SingleSelect grouping', () => {
    const constraint = (value, displayValue, group) => ({
        displayValue,
        value: {string: value},
        properties: group ? [{name: 'group', value: group}] : []
    });

    const render = valueConstraints => shallow(
        <SingleSelect
            id="template"
            value={null}
            field={{name: 'jnt_templateName', valueConstraints, readOnly: false}}
            inputContext={{}}
            onChange={jest.fn()}
            onBlur={jest.fn()}
        />
    );

    const dataOf = cmp => cmp.find('Dropdown').prop('data');

    it('should stay a flat list when no constraint names a group', () => {
        const data = dataOf(render([constraint('centered', 'Centered'), constraint('free', 'Free')]));

        expect(data).toHaveLength(2);
        expect(data[0]).toMatchObject({label: 'Centered', value: 'centered'});
        expect(data[0].groupLabel).toBeUndefined();
    });

    it('should build one group per label, in the order they first appear', () => {
        const data = dataOf(render([
            constraint('centered', 'Centered', 'Templates'),
            constraint('free', 'Free', 'Templates'),
            constraint('jcontent:pageSample:/sites/s/samples/pages/blog', 'Blog', 'Page samples')
        ]));

        expect(data).toHaveLength(2);
        expect(data[0].groupLabel).toBe('Templates');
        expect(data[0].options.map(o => o.value)).toEqual(['centered', 'free']);
        expect(data[1].groupLabel).toBe('Page samples');
        expect(data[1].options.map(o => o.label)).toEqual(['Blog']);
    });

    it('should group everything as soon as one constraint names a group', () => {
        // Mixing grouped and flat entries is not a shape the dropdown accepts, so an ungrouped
        // entry lands in a group of its own rather than being dropped.
        const data = dataOf(render([
            constraint('loose', 'Loose'),
            constraint('blog', 'Blog', 'Page samples')
        ]));

        expect(data).toHaveLength(2);
        expect(data[0].options.map(o => o.value)).toEqual(['loose']);
        expect(data[1].groupLabel).toBe('Page samples');
    });

    it('should keep the empty placeholder when there are no constraints', () => {
        expect(dataOf(render([]))).toEqual([{label: '', value: ''}]);
    });
});
