import React from 'react';
import {useSelector} from 'react-redux';
import {useNodeChecks, useNodeInfo} from '@jahia/data-helper';
import {shallow} from '@jahia/test-framework';
import {Typography} from '@jahia/moonstone';
import {
    transformNodeTypesToActions,
    useCreatableNodetypesTree,
    flattenNodeTypes,
    childrenLimitReachedOrExceeded
} from './createContent.utils';

import {useNamedChildPlaceholders} from './useNamedChildPlaceholders';

import {createContentAction} from './createContentAction';

jest.mock('react-redux', () => {
    return {useSelector: jest.fn()};
});
jest.mock('@jahia/data-helper', () => {
    return {
        useNodeChecks: jest.fn(),
        useNodeInfo: jest.fn()
    };
});
jest.mock('~/ContentEditor/ContentTypeSelectorModal', () => jest.fn());
jest.mock('./createContent.utils', () => {
    return {
        useCreatableNodetypesTree: jest.fn(),
        flattenNodeTypes: jest.fn(),
        transformNodeTypesToActions: jest.fn(),
        childrenLimitReachedOrExceeded: jest.fn()
    };
});
jest.mock('~/JContent/JContent.utils', () => {
    return {
        JahiaRenderedModulesUtil: {
            getArea: () => {},
            getModule: () => undefined,
            resolveNodeTypes: () => []
        }
    };
});
jest.mock('./useNamedChildPlaceholders', () => {
    return {useNamedChildPlaceholders: jest.fn()};
});

describe('CreateNewContent', () => {
    let CreateNewContent;
    let defaultProps;
    let loading;
    let nodeTypes;
    let placeholders;
    beforeEach(() => {
        placeholders = [];
        CreateNewContent = createContentAction.component;
        defaultProps = {
            render: jest.fn(() => {
                return <Typography>render</Typography>;
            })
        };
        useSelector.mockImplementation(() => {
            return {language: 'en', uilang: 'en'};
        });
        useNodeChecks.mockImplementation(() => {
            return {node: {uuid: 'xxx'}, loading: loading};
        });
        useNodeInfo.mockImplementation(() => {
            return {node: {uuid: 'xxx'}, loading: loading};
        });
        useCreatableNodetypesTree.mockImplementation(() => {
            return {
                loadingTypes: loading,
                error: undefined,
                nodetypes: nodeTypes
            };
        });
        flattenNodeTypes.mockImplementation(l => l);
        useCreatableNodetypesTree.mockImplementation(() => {
            return {
                loadingTypes: loading,
                error: undefined,
                nodetypes: nodeTypes
            };
        });
        transformNodeTypesToActions.mockImplementation(l => l);
        childrenLimitReachedOrExceeded.mockImplementation(() => false);
        useNamedChildPlaceholders.mockImplementation(() => ({loading: false, placeholders}));
    });

    it('should not render CreateNewContent when loading', () => {
        defaultProps.loading = jest.fn(() => {
            return <Typography>Loading</Typography>;
        });

        defaultProps.path = '/sites/digitall/home';
        loading = true;
        nodeTypes = ['nodetype1', 'nodetype2'];
        const cmp = shallow(<CreateNewContent {...defaultProps}/>);
        console.log(cmp.debug());
        const loadingComponent = cmp.find('mockConstructor').at(0).shallow();
        console.log(loadingComponent.debug());
        expect(loadingComponent.find('Typography').length).toBe(1);
        expect(loadingComponent.find('Typography').shallow().debug()).toContain('Loading');
    });
    it('should contain 2 nodetypes when loading done', () => {
        defaultProps.loading = jest.fn(() => {
            return <Typography>Loading</Typography>;
        });

        defaultProps.path = '/sites/digitall/home';
        loading = false;
        nodeTypes = ['nodetype1', 'nodetype2'];
        const cmp = shallow(<CreateNewContent {...defaultProps}/>);
        // 2 is the number of types returned.
        expect(cmp.length).toEqual(nodeTypes.length);
        expect(cmp.at(0).props().isAllTypes).toBe(false);
    });
    it('should contain "allTypes" only when no types found and loading done', () => {
        defaultProps.loading = jest.fn(() => {
            return <Typography>Loading</Typography>;
        });

        defaultProps.path = '/sites/digitall/home';
        loading = false;
        nodeTypes = undefined;
        const cmp = shallow(<CreateNewContent {...defaultProps}/>);
        // 1 is the number of types returned.
        expect(cmp.length).toEqual(1);
        console.log(cmp.debug());
        const renderingComponent = cmp.find('mockConstructor').at(0).shallow();
        console.log(renderingComponent.debug());
        expect(cmp.props().isAllTypes).toBe(true);
    });
    it('should add one action per named placeholder', () => {
        defaultProps.path = '/sites/digitall/contents/someObject';
        loading = false;
        nodeTypes = ['nodetype1'];
        placeholders = [
            {name: 'childObject2', nodeTypes: ['cent:childObject2']},
            {name: 'childobject3', nodeTypes: ['cent:childObject2']}
        ];
        const cmp = shallow(<CreateNewContent {...defaultProps}/>);
        expect(cmp.length).toBe(3);
        expect(cmp.at(1).props().createdNodeName).toBe('childObject2');
        expect(cmp.at(2).props().createdNodeName).toBe('childobject3');
    });
    it('should key named actions by name so two children of one type do not collide', () => {
        defaultProps.path = '/sites/digitall/contents/someObject';
        loading = false;
        nodeTypes = [];
        placeholders = [
            {name: 'childObject2', nodeTypes: ['cent:childObject2']},
            {name: 'childobject3', nodeTypes: ['cent:childObject2']}
        ];
        const cmp = shallow(<CreateNewContent {...defaultProps}/>);
        const keys = cmp.map(node => node.key());
        expect(new Set(keys).size).toBe(keys.length);
    });
    it('should stay visible when only named placeholders are creatable', () => {
        defaultProps.path = '/sites/digitall/contents/someObject';
        loading = false;
        nodeTypes = [];
        placeholders = [{name: 'childObject2', nodeTypes: ['cent:childObject2']}];
        const cmp = shallow(<CreateNewContent {...defaultProps}/>);
        expect(cmp.length).toBe(1);
        expect(cmp.at(0).props().createdNodeName).toBe('childObject2');
    });
    it('should not render the node until the action checks pass', () => {
        defaultProps.path = '/sites/digitall/contents/someObject';
        loading = false;
        nodeTypes = ['nodetype1'];
        useNodeChecks.mockImplementation(() => ({node: {uuid: 'xxx'}, checksResult: false, loading: false}));
        shallow(<CreateNewContent {...defaultProps}/>);
        expect(useNamedChildPlaceholders).toHaveBeenCalledWith(expect.objectContaining({skip: true}));
    });
    it('should render the node once the action checks pass', () => {
        defaultProps.path = '/sites/digitall/contents/someObject';
        loading = false;
        nodeTypes = ['nodetype1'];
        useNodeChecks.mockImplementation(() => ({node: {uuid: 'xxx'}, checksResult: true, loading: false}));
        shallow(<CreateNewContent {...defaultProps}/>);
        expect(useNamedChildPlaceholders).toHaveBeenCalledWith(expect.objectContaining({skip: false}));
    });
    it('should hide an action restricted to other node types, even when named placeholders exist', () => {
        // The header shows createPage next to createContent; on a content node its type tree is
        // empty, and the named placeholders must not make it visible.
        defaultProps.path = '/sites/digitall/contents/someObject';
        defaultProps.showOnNodeTypes = ['jnt:page'];
        loading = false;
        nodeTypes = [];
        placeholders = [{name: 'childObject1', nodeTypes: ['cent:childObject1']}];
        useNodeChecks.mockImplementation((variables, options) => ({
            node: {uuid: 'xxx'},
            checksResult: !options.showOnNodeTypes?.includes('jnt:page'),
            loading: false
        }));
        useNamedChildPlaceholders.mockImplementation(({skip}) => ({loading: false, placeholders: skip ? [] : placeholders}));
        const cmp = shallow(<CreateNewContent {...defaultProps}/>);
        expect(useNamedChildPlaceholders).toHaveBeenLastCalledWith(expect.objectContaining({skip: true}));
        expect(cmp.length).toBe(1);
        expect(cmp.props().isVisible).toBe(false);
    });
    it('should not restrict the action checks with an empty showOnNodeTypes', () => {
        defaultProps.path = '/sites/digitall/contents/someObject';
        defaultProps.showOnNodeTypes = [];
        loading = false;
        nodeTypes = ['nodetype1'];
        shallow(<CreateNewContent {...defaultProps}/>);
        expect(useNodeChecks.mock.calls.at(-1)[1].showOnNodeTypes).toBeUndefined();
    });
    it('should render nothing when neither a type nor a named placeholder is creatable', () => {
        defaultProps.path = '/sites/digitall/contents/someObject';
        loading = false;
        nodeTypes = [];
        placeholders = [];
        const cmp = shallow(<CreateNewContent {...defaultProps}/>);
        expect(cmp.props().isVisible).toBe(false);
    });
});
