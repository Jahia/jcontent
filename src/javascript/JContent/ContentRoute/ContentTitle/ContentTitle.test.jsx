import React from 'react';
import {shallow} from '@jahia/test-framework';
import ContentTitle from './ContentTitle';
import {useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';

jest.mock('react-redux', () => ({
    useSelector: jest.fn()
}));

jest.mock('@jahia/data-helper', () => ({
    useNodeInfo: jest.fn()
}));

describe('Content title', () => {
    it('Should render', async () => {
        const title = 'Hello Content Title!';
        useSelector.mockImplementation(() => ({
            path: 'testPath',
            language: 'en'
        }));

        useNodeInfo.mockImplementation(() => ({
            node: {
                displayName: title
            },
            loading: false
        }));

        const contentTitle = shallow(<ContentTitle/>);
        expect(contentTitle.contains(title)).toBeTruthy();
    });

    it('Should render empty title while loading', async () => {
        useSelector.mockImplementation(() => ({
            path: 'testPath',
            language: 'en'
        }));

        useNodeInfo.mockImplementation(() => ({
            loading: true
        }));

        const contentTitle = shallow(<ContentTitle/>);
        expect(contentTitle.find('Typography').props().style.opacity).toBe(0);
    });
});
