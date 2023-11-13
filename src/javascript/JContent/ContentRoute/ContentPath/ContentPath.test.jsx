import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@apollo/client';
import {shallow} from '@jahia/test-framework';

import {GetContentPath} from './ContentPath.gql-queries';
import {ContentPath} from './ContentPath';
import {cmGoto} from '~/JContent/redux/JContent.redux';

jest.mock('~/JContent/redux/JContent.redux', () => ({
    cmGoto: jest.fn()
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn()
}));

jest.mock('@apollo/client', () => ({
    useQuery: jest.fn().mockReturnValue({})
}));

jest.mock('connected-react-router', () => jest.fn(() => {}));

describe('ContentPath', () => {
    afterEach(() => {
        useQuery.mockClear();
        useDispatch.mockClear();
        useSelector.mockClear();
    });

    it('uses expected query parameters', () => {
        useSelector.mockImplementation(callback => callback({
            language: 'fr',
            jcontent: {
                path: '/x/y/z',
                tableView: {
                    viewMode: 'bar'
                }
            }
        }));

        shallow(<ContentPath/>);

        expect(useQuery).toHaveBeenCalledWith(GetContentPath, {
            variables: {
                path: '/x/y/z',
                language: 'fr'
            }
        });
    });

    it('handle redirects on item click', () => {
        const dispatch = jest.fn();

        useDispatch.mockImplementation(() => dispatch);

        useSelector.mockImplementation(callback => callback({
            jcontent: {
                mode: 'foo',
                tableView: {
                    viewMode: 'bar'
                }
            }
        }));

        const wrapper = shallow(<ContentPath/>).find('SimplePathEntry');
        wrapper.invoke('onItemClick')({path: '/x/y/z'});

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(cmGoto).toHaveBeenCalledWith({mode: 'foo', path: '/x/y/z', params: {sub: false}});
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

        const wrapper = shallow(<ContentPath/>).find('SimplePathEntry');
        expect(wrapper.prop('item')).toEqual(ancestors[0]);
    });
});
