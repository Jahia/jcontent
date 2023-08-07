import React from 'react';
import {shallow} from '@jahia/test-framework';
import {MainActionBar} from './MainActionBar';
import {useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

jest.mock('@jahia/data-helper', () => {
    const original = jest.requireActual('@jahia/data-helper');
    return {
        ...original,
        useNodeInfo: jest.fn()
    };
});

global.contextJsParameters = {config: {jcontent: {showPageBuilder: true}}};

describe('MainActionBar', () => {
    it('Should render', async () => {
        useSelector.mockImplementation(() => ({
            path: 'testPath',
            language: 'en',
            selection: []
        }));

        useNodeInfo.mockImplementation(() => ({
            node: {},
            loading: false
        }));

        const wrapper = shallow(<MainActionBar/>);

        wrapper.find('DisplayAction').forEach(node => {
            expect(node.props().isDisabled).toBeFalsy();
        });
        expect(wrapper.findWhere(node => node.props().actionKey === 'publish').exists()).toBeTruthy();
        expect(wrapper.findWhere(node => node.props().actionKey === 'publishAll').exists()).toBeFalsy();
    });

    it('Should show disabled buttons when there is a selection', async () => {
        useSelector.mockImplementation(() => ({
            path: 'testPath',
            language: 'en',
            selection: ['xxx']
        }));

        useNodeInfo.mockImplementation(() => ({
            node: {},
            loading: false
        }));

        const wrapper = shallow(<MainActionBar/>);

        wrapper.find('DisplayAction').forEach(node => {
            expect(node.props().isDisabled).toBeTruthy();
        });
        expect(wrapper.findWhere(node => node.props().actionKey === 'publish').exists()).toBeTruthy();
        expect(wrapper.findWhere(node => node.props().actionKey === 'publishAll').exists()).toBeFalsy();
    });

    it('Should show publishAll button when on a folder', async () => {
        useSelector.mockImplementation(() => ({
            path: 'testPath',
            language: 'en',
            selection: []
        }));

        useNodeInfo.mockImplementation(() => ({
            node: {
                'jnt:contentFolder': true
            },
            loading: false
        }));

        const wrapper = shallow(<MainActionBar/>);

        expect(wrapper.findWhere(node => node.props().actionKey === 'publish').exists()).toBeFalsy();
        expect(wrapper.findWhere(node => node.props().actionKey === 'publishAll').exists()).toBeTruthy();
    });
});
