import React from 'react';
import {shallow} from '@jahia/test-framework';
import ToolBar from './ToolBar';
import {useSelector} from 'react-redux';
import {useNodeInfo} from "@jahia/data-helper";

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn()
}));

jest.mock('~/JContent/JContent.redux', () => ({
    cmClearSelection: jest.fn()
}));

jest.mock('connected-react-router', () => jest.fn(() => {}));

jest.mock('@jahia/data-helper', () => ({
    useNodeInfo: jest.fn()
}));

describe('Toolbar', () => {
    it('should not render selection infos when there is no selection', () => {
        useSelector.mockImplementation(() => ({
            selection: []
        }));

        useNodeInfo.mockImplementation(() => ({
            nodes: [],
            loading: false
        }));

        const toolbar = shallow(<ToolBar/>);
        expect(toolbar.find('Typography').length).toEqual(0);
        expect(toolbar.find('Button').length).toEqual(0);
    });

    it('should render selection infos when there is selection', () => {
        useSelector.mockImplementation(() => ({
            selection: ['/test']
        }));

        useNodeInfo.mockImplementation(() => ({
            nodes: [],
            loading: false
        }));

        const toolbar = shallow(<ToolBar/>);
        expect(toolbar.find('Typography').prop('children')).toContain('itemsSelected');
        expect(toolbar.find('Button').prop('icon').type('SvgCancel')).toBeDefined();
        expect(toolbar.find('Typography').prop('data-cm-selection-size')).toBe(1);
    });

    it('should render multiple selection actions for 1 item', () => {
        useSelector.mockImplementation(() => ({
            selection: ['/test']
        }));

        useNodeInfo.mockImplementation(() => ({
            nodes: [],
            loading: false
        }));

        const toolbar = shallow(<ToolBar/>);
        expect(toolbar.find('Typography').prop('children')).toContain('itemsSelected');
        expect(toolbar.find('Button').prop('icon').type('SvgCancel')).toBeDefined();
        expect(toolbar.find('Typography').prop('data-cm-selection-size')).toBe(1);
        expect(toolbar.find('ButtonGroup').children()).toHaveLength(2);
    });

    it('should render multiple selection actions for 2 items', () => {
        useSelector.mockImplementation(() => ({
            selection: ['/test', '/test/child']
        }));

        useNodeInfo.mockImplementation(() => ({
            nodes: [],
            loading: false
        }));

        const toolbar = shallow(<ToolBar/>);
        expect(toolbar.find('Typography').prop('children')).toContain('itemsSelected');
        expect(toolbar.find('Button').prop('icon').type('SvgCancel')).toBeDefined();
        expect(toolbar.find('Typography').prop('data-cm-selection-size')).toBe(2);
        expect(toolbar.find('ButtonGroup').children()).toHaveLength(2);
    });
});
