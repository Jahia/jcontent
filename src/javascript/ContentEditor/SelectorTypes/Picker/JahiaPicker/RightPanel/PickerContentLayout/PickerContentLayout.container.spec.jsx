import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@apollo/client';
import {registry} from '@jahia/ui-extender';
import {shallow} from '@jahia/test-framework';
import {PickerEditorialLinkQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/editorialLinkPicker/PickerEditorialLinkQueryHandler';
import {PickerContentLayoutContainer} from './PickerContentLayout.container';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
    shallowEqual: jest.fn()
}));

jest.mock('@apollo/client', () => ({
    ...jest.requireActual('@apollo/client'),
    useQuery: jest.fn()
}));

jest.mock('@jahia/ui-extender', () => ({
    registry: {
        get: jest.fn(),
        addOrReplace: jest.fn(),
        registry: {}
    }
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
            searchPath: '',
            searchTerms: '',
            pagination: {currentPage: 0, pageSize: 25},
            sort: {orderBy: ''},
            fileView: {mode: ''},
            tableView: {viewMode: 'structuredView', viewType: 'pages'},
            openPaths: ['/sites/digitall/home', '/sites/digitall/about']
        }
    }
};

const page = (path, nodesCount) => ({
    name: path.split('/').pop(),
    path,
    uuid: path,
    children: {pageInfo: {nodesCount}},
    selectable: true,
    openable: true
});

const treeData = homeChildren => ({
    jcr: {
        rootNodes: [{...page('/sites/digitall', 2), selectable: false}],
        openNodes: [
            {path: '/sites/digitall', uuid: '/sites/digitall', children: {nodes: [page('/sites/digitall/home', 1), page('/sites/digitall/about', 1)]}},
            {path: '/sites/digitall/home', uuid: '/sites/digitall/home', children: homeChildren},
            {path: '/sites/digitall/about', uuid: '/sites/digitall/about', children: {nodes: [page('/sites/digitall/about/team', 0)]}}
        ]
    }
});

const tooManyNodes = {graphQLErrors: [{message: 'This request asked for more than 20000 nodes', extensions: {classification: 'ExecutionAborted'}}]};

describe('PickerContentLayoutContainer', () => {
    const props = {
        pickerConfig: {key: 'editoriallink', selectableTypesTable: ['jnt:page', 'jmix:mainResource'], pickerDialog: {view: 'List', dialogTitle: 'Pick a link'}},
        dblClickSelect: jest.fn()
    };

    beforeEach(() => {
        useSelector.mockImplementation(selector => selector(state));
        registry.get.mockReturnValue({key: 'picker-editorial-link', tableConfig: {queryHandler: PickerEditorialLinkQueryHandler}});
    });

    it('should list what it received and ask to search when the server refused part of the tree', () => {
        // The server refused the children of home, and returned the rest of the tree
        useQuery.mockReturnValue({data: treeData(null), error: tooManyNodes, loading: false, refetch: jest.fn()});

        const cmp = shallow(<PickerContentLayoutContainer {...props}/>);

        expect(useQuery).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({errorPolicy: 'all'}));
        const rows = cmp.find('PickerContentTable').prop('rows');
        expect(rows.map(row => row.path)).toEqual(['/sites/digitall/home', '/sites/digitall/about']);
        expect(rows[0].subRows).toEqual([]);
        expect(rows[1].subRows.map(row => row.path)).toEqual(['/sites/digitall/about/team']);
        expect(cmp.find('[data-sel-role="too-many-items"]').exists()).toBe(true);
    });

    it('should not ask to search when the tree is complete', () => {
        useQuery.mockReturnValue({data: treeData({nodes: [page('/sites/digitall/home/news', 0)]}), loading: false, refetch: jest.fn()});

        const cmp = shallow(<PickerContentLayoutContainer {...props}/>);

        expect(cmp.find('PickerContentTable').prop('rows')[0].subRows.map(row => row.path)).toEqual(['/sites/digitall/home/news']);
        expect(cmp.find('[data-sel-role="too-many-items"]').exists()).toBe(false);
    });
});
