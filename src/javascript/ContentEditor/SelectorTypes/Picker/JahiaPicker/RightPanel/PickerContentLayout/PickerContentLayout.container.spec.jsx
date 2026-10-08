import React from 'react';
import {useSelector} from 'react-redux';
import {shallow} from '@jahia/test-framework';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';
import {PickerContentLayoutContainer} from './PickerContentLayout.container';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
    shallowEqual: jest.fn()
}));

jest.mock('@jahia/ui-extender', () => ({
    registry: {
        get: () => ({key: 'picker-editorial-link', tableConfig: {}}),
        addOrReplace: jest.fn(),
        registry: {}
    }
}));

jest.mock('~/JContent/ContentRoute/ContentLayout/useLayoutQuery', () => ({
    useLayoutQuery: jest.fn()
}));

jest.mock('./PickerContentTable', () => ({
    PickerContentTable: () => null
}));

jest.mock('./PickerFilesGrid', () => () => null);

const state = {
    site: 'digitall',
    uilang: 'en',
    contenteditor: {
        ceLanguage: 'en',
        picker: {
            mode: 'picker-editorial-link',
            path: '/sites/digitall',
            preSearchModeMemo: '',
            fileView: {mode: ''},
            tableView: {viewMode: 'structuredView', viewType: 'pages'},
            openPaths: []
        }
    }
};

const rows = {nodes: [{path: '/sites/digitall/home', subRows: []}], pageInfo: {totalCount: 1}};
const tooManyNodes = {graphQLErrors: [{message: 'This request asked for more than 20000 nodes', extensions: {classification: 'ExecutionAborted'}}]};

describe('PickerContentLayoutContainer', () => {
    const props = {
        pickerConfig: {key: 'editoriallink', selectableTypesTable: ['jnt:page'], pickerDialog: {view: 'List', dialogTitle: 'Pick a link'}},
        dblClickSelect: jest.fn()
    };

    beforeEach(() => {
        useSelector.mockImplementation(selector => selector(state));
    });

    it('should list what it received and ask to search when the server refused part of the tree', () => {
        useLayoutQuery.mockReturnValue({result: rows, error: tooManyNodes, loading: false, isStructured: true, refetch: jest.fn()});

        const cmp = shallow(<PickerContentLayoutContainer {...props}/>);

        expect(cmp.find('[data-sel-role="too-many-items"]').exists()).toBe(true);
        expect(cmp.find('PickerContentTable').prop('rows')).toBe(rows.nodes);
    });

    it('should not ask to search when the tree is complete', () => {
        useLayoutQuery.mockReturnValue({result: rows, loading: false, isStructured: true, refetch: jest.fn()});

        const cmp = shallow(<PickerContentLayoutContainer {...props}/>);

        expect(cmp.find('[data-sel-role="too-many-items"]').exists()).toBe(false);
    });
});
