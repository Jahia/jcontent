import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';

import {ChoiceTree} from './ChoiceTree';
import {useTreeEntries} from '@jahia/data-helper';
import {Dropdown} from '@jahia/moonstone';

jest.mock('@apollo/client', () => ({
    useQuery: jest.fn(() => ({data: undefined, error: null, loading: false}))
}));

jest.mock('@jahia/data-helper', () => ({
    displayName: {},
    useTreeEntries: jest.fn(),
    PredefinedFragments: {
        nodeCacheRequiredFields: {gql: 'fragment NodeCacheRequiredFields on JCRNode { uuid workspace path }'}
    }
}));

describe('ChoiceTree component', () => {
    let props;
    const onChange = jest.fn();

    beforeEach(() => {
        onChange.mockClear();

        useTreeEntries.mockReturnValue({
            loading: false,
            error: null,
            treeEntries: [
                {path: '/root/a', depth: 1, open: false, openable: true, selectable: true, hasChildren: true, node: {uuid: 'A', name: 'a', displayName: 'aa', primaryNodeType: {name: 'jnt:category'}}},
                {path: '/root/b', depth: 1, open: false, openable: false, selectable: true, hasChildren: false, node: {uuid: 'B', name: 'b', displayName: 'bb', primaryNodeType: {name: 'jnt:category'}}}
            ]
        });

        props = {
            onChange,
            onBlur: jest.fn(),
            id: 'ChoiceTree',
            value: [],
            field: {
                displayName: 'ChoiceTree',
                name: 'myTree',
                readOnly: false,
                multiple: true,
                selectorType: 'choiceTree',
                selectorOptions: [
                    {name: 'rootPath', value: '/root'},
                    {name: 'types', value: 'jnt:category'}
                ]
            },
            editorContext: {
                lang: 'en',
                site: 'digitall'
            }
        };
    });

    const buildComp = props => shallowWithTheme(<ChoiceTree {...props}/>, {}, dsGenericTheme);

    it('should bind the id properly', () => {
        const cmp = buildComp(props);
        expect(cmp.find(Dropdown).props().id).toBe(props.id);
    });

    it('should render the lazily-loaded entries as tree data', () => {
        const cmp = buildComp(props);
        const treeData = cmp.find(Dropdown).props().treeData;
        expect(treeData.map(node => node.value)).toEqual(['A', 'B']);
    });

    it('should pass the opened paths so expansion is controlled', () => {
        const cmp = buildComp(props);
        // Root is opened by default so its first level is fetched
        expect(cmp.find(Dropdown).props().openedItems).toContain('/root');
    });

    it('should request a branch fetch when a node is opened', () => {
        const cmp = buildComp(props);
        cmp.find(Dropdown).props().onOpenItem({id: '/root/a'});
        cmp.update();
        expect(cmp.find(Dropdown).props().openedItems).toContain('/root/a');
    });

    it('should toggle a uuid value when an entry is selected', () => {
        const cmp = buildComp(props);
        cmp.find(Dropdown).props().onChange({}, {value: 'A'});
        expect(onChange).toHaveBeenCalledWith(['A']);
    });

    it('should clear all values when the clear action is triggered', () => {
        const cmp = buildComp({...props, value: ['A']});
        cmp.find(Dropdown).props().onClear();
        expect(onChange).toHaveBeenCalledWith([]);
    });
});
