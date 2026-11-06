import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@apollo/client';
import {useNodeInfo} from '@jahia/data-helper';
import {registry} from '@jahia/ui-extender';
import {mount} from '@jahia/test-framework';
import {PickerEditorialLinkQueryHandler} from '~/ContentEditor/SelectorTypes/Picker/configs/editorialLinkPicker/PickerEditorialLinkQueryHandler';
import {registerPickerReducer} from '~/ContentEditor/SelectorTypes/Picker/Picker.redux';
import {SelectionHandler} from './SelectionHandler';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
    shallowEqual: jest.fn()
}));

jest.mock('@apollo/client', () => ({
    ...jest.requireActual('@apollo/client'),
    useQuery: jest.fn()
}));

jest.mock('@jahia/data-helper', () => ({
    ...jest.requireActual('@jahia/data-helper'),
    useNodeInfo: jest.fn()
}));

jest.mock('@jahia/ui-extender', () => ({
    registry: {
        get: jest.fn(),
        find: jest.fn()
    }
}));

let pickerReducer;
registerPickerReducer({add: (type, key, {reducer}) => {
    pickerReducer = reducer;
}});

// The state that the media picker leaves behind
const pickerState = {
    ...pickerReducer(undefined, {type: 'INIT'}),
    mode: 'picker-media',
    modes: ['picker-media'],
    preSearchModeMemo: 'picker-media',
    site: 'digitall',
    path: '/sites/digitall/files/images',
    openPaths: ['/sites/digitall/files', '/sites/digitall/files/images', '/sites/digitall/home/news/area-main']
};

const state = {uilang: 'en', contenteditor: {picker: pickerState}};

const ancestor = (path, isOpenableInPages = false) => ({path, isOpenableInPages, isOpenableInContent: false, primaryNodeType: {name: 'jnt:base'}});

const selectedNode = {
    uuid: 'news-1',
    path: '/sites/digitall/home/news/area-main/news-list/news-1',
    site: {path: '/sites/digitall'},
    primaryNodeType: {name: 'jnt:news'},
    ancestors: [
        ancestor('/'),
        ancestor('/sites'),
        ancestor('/sites/digitall'),
        ancestor('/sites/digitall/home', true),
        ancestor('/sites/digitall/home/news', true),
        ancestor('/sites/digitall/home/news/area-main'),
        ancestor('/sites/digitall/home/news/area-main/news-list')
    ]
};

const editorialLinkAccordion = {
    key: 'picker-editorial-link',
    getPathForItem: node => node.site.path,
    getViewTypeForItem: () => 'pages',
    tableConfig: {queryHandler: PickerEditorialLinkQueryHandler, defaultSort: {orderBy: ''}}
};

const pickerConfig = {key: 'editoriallink', selectableTypesTable: ['jnt:page', 'jmix:mainResource'], pickerDialog: {displayTree: false}};

describe('SelectionHandler', () => {
    let dispatch;

    // The open paths once the picker applied what the handler dispatched on opening
    const openPathsAfterOpening = () => dispatch.mock.calls
        .map(([action]) => action)
        .filter(action => action.meta?.batch)
        .flatMap(action => action.payload)
        .reduce(pickerReducer, pickerState)
        .openPaths;

    const openPicker = () => mount(
        <SelectionHandler site="digitall" pickerConfig={pickerConfig} initialSelectedItem={[{path: selectedNode.path}]} lang="en">
            <div/>
        </SelectionHandler>
    );

    beforeEach(() => {
        dispatch = jest.fn();
        useDispatch.mockReturnValue(dispatch);
        useSelector.mockImplementation(selector => selector(state));
        useNodeInfo.mockReturnValue({loading: false, node: {path: pickerState.path}});
        useQuery.mockReturnValue({loading: false, data: {jcr: {nodesByPath: [selectedNode]}}});
        registry.get.mockReturnValue({key: 'picker-media', tableConfig: {queryHandler: {getFragments: () => []}}});
        registry.find.mockReturnValue([editorialLinkAccordion]);
    });

    it('should flag the ancestors with the openable types of the picker, whatever picker opened before', () => {
        openPicker();

        expect(useQuery).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            variables: expect.objectContaining({
                pagesOpenableTypes: PickerEditorialLinkQueryHandler.getOpenableTypes('pages'),
                contentOpenableTypes: PickerEditorialLinkQueryHandler.getOpenableTypes('content')
            })
        }));
    });

    it('should open only the root and the ancestors that the tree shows as rows', () => {
        openPicker();

        expect(openPathsAfterOpening()).toEqual([
            '/sites/digitall',
            '/sites/digitall/home',
            '/sites/digitall/home/news'
        ]);
    });

    it('should open every ancestor of the selection in a picker that declares no openable types', () => {
        registry.find.mockReturnValue([{...editorialLinkAccordion, tableConfig: {queryHandler: {getFragments: () => []}}}]);

        openPicker();

        expect(openPathsAfterOpening()).toEqual([
            '/sites/digitall',
            '/sites/digitall/home',
            '/sites/digitall/home/news',
            '/sites/digitall/home/news/area-main',
            '/sites/digitall/home/news/area-main/news-list'
        ]);
    });
});
