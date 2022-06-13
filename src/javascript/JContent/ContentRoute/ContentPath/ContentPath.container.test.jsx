import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@apollo/react-hooks';
import {shallow} from '@jahia/test-framework';

import {GetContentPath} from './ContentPath.gql-queries';
import ContentPathContainer from './ContentPath.container';
import ContentPath from './ContentPath';
import {cmGoto} from '~/JContent/JContent.redux';

jest.mock('~/JContent/JContent.redux', () => ({
    cmGoto: jest.fn()
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn()
}));

jest.mock('@apollo/react-hooks', () => ({
    useQuery: jest.fn().mockReturnValue({})
}));

jest.mock('connected-react-router', () => jest.fn(() => {}));

describe('ContentPathContainer', () => {
    afterEach(() => {
        useQuery.mockClear();
        useDispatch.mockClear();
        useSelector.mockClear();
    });

    it('uses expected query parameters', () => {
        useSelector.mockImplementation(callback => callback({
            language: 'fr',
            jcontent: {
                path: '/x/y/z'
            }
        }));

        shallow(<ContentPathContainer/>);

        expect(useQuery).toHaveBeenCalledWith(GetContentPath, {
            variables: {
                path: '/x/y/z',
                language: 'fr'
            }
        });
    });

    it('renders correctly', () => {
        const ancestors = [
            {uuid: 'x', path: '/x'},
            {uuid: 'y', path: '/x/y'}
        ];

        useQuery.mockImplementation(() => ({
            data: {
                jcr: {
                    node: {
                        ancestors: ancestors
                    }
                }
            }
        }));

        const wrapper = shallow(<ContentPathContainer/>);
        expect(wrapper.type()).toBe(ContentPath);
        expect(wrapper.prop('items')).toEqual(ancestors);
        expect(wrapper.prop('onItemClick')).toBeDefined();
    });

    it('handle redirects on item click', () => {
        const dispatch = jest.fn();

        useDispatch.mockImplementation(() => dispatch);

        useSelector.mockImplementation(callback => callback({
            jcontent: {
                mode: 'foo'
            }
        }));

        const wrapper = shallow(<ContentPathContainer/>);
        wrapper.invoke('onItemClick')('/x/y/z');

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(cmGoto).toHaveBeenCalledWith({mode: 'foo', path: '/x/y/z'});
    });

    it('starts from the closest ancestor visible in Content tree if node is not visible Content tree', () => {
        const ancestors = [{
            uuid: 'x',
            path: '/x',
            isVisibleInContentTree: true
        }, {
            uuid: 'y',
            path: '/x/y',
            isVisibleInContentTree: true
        }, {
            uuid: 'z',
            path: '/x/y/z',
            isVisibleInContentTree: false
        }];

        useQuery.mockImplementation(() => ({
            data: {
                jcr: {
                    node: {
                        isVisibleInContentTree: false,
                        ancestors: ancestors
                    }
                }
            }
        }));

        const wrapper = shallow(<ContentPathContainer/>);
        expect(wrapper.prop('items')).toEqual(ancestors.slice(1));
    });
});
