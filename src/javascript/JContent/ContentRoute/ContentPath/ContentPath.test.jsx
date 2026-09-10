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

        const wrapper = shallow(<ContentPath/>).find('SimplePathEntry').first();
        wrapper.invoke('onItemClick')({path: '/x/y/z'});

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(cmGoto).toHaveBeenCalledWith({path: '/x/y/z', params: {sub: false}});
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

        const wrapper = shallow(<ContentPath/>).find('SimplePathEntry').first();
        expect(wrapper.prop('item')).toEqual(ancestors[1]);
    });

    it('keeps the closest ancestor visible in Content tree navigable when it is the direct parent', () => {
        // A node sitting directly under the page it belongs to - an area, say - used to collapse the
        // whole breadcrumb to that page alone, which the last-item rule then rendered disabled: the
        // page was on screen and there was no way back to it.
        const ancestors = [{
            uuid: 'x',
            path: '/x',
            isVisibleInContentTree: true
        }, {
            uuid: 'y',
            path: '/x/y',
            isVisibleInContentTree: true
        }];

        const node = {
            uuid: 'z',
            path: '/x/y/z',
            isVisibleInContentTree: false,
            ancestors
        };

        useQuery.mockImplementation(() => ({data: {jcr: {node}}}));

        const entries = shallow(<ContentPath/>).find('SimplePathEntry');

        expect(entries).toHaveLength(2);
        expect(entries.at(0).prop('item')).toEqual(ancestors[1]);
        expect(entries.at(0).prop('isDisabled')).toBe(false);
        expect(entries.at(1).prop('item')).toEqual(node);
        expect(entries.at(1).prop('isDisabled')).toBe(true);
    });
});
