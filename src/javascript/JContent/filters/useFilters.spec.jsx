import React from 'react';
import {mount} from 'enzyme';
import {useDispatch, useSelector} from 'react-redux';
import {useFilters} from './useFilters';

const renderHook = hook => {
    const result = {};
    const Probe = () => {
        result.current = hook();
        return null;
    };

    mount(<Probe/>);
    return {result};
};

jest.mock('react-redux', () => ({useDispatch: jest.fn(), useSelector: jest.fn()}));
jest.mock('redux-batched-actions', () => ({batchActions: actions => ({type: 'BATCH', payload: actions})}));
jest.mock('~/JContent/redux/JContent.redux', () => ({cmGoto: data => ({type: 'GOTO', data})}));
jest.mock('@jahia/ui-extender', () => ({registry: {get: jest.fn(), add: jest.fn(), find: jest.fn(() => [])}}));

const lastModified = {field: 'std:lastModified', operator: 'after', value: '2026-11-01'};
const createdBy = {field: 'std:createdBy', operator: 'contains', value: 'anna'};

describe('useFilters', () => {
    let dispatch;

    const render = params => {
        useSelector.mockImplementation(select => select({jcontent: {params}}));
        return renderHook(() => useFilters()).result.current;
    };

    beforeEach(() => {
        dispatch = jest.fn();
        useDispatch.mockReturnValue(dispatch);
    });

    it('reads the filters of the URL', () => {
        expect(render({filters: [lastModified]}).filters).toEqual([lastModified]);
        expect(render({filters: 'broken'}).filters).toEqual([]);
    });

    it('cases 2 and 3: writes the URL, goes back to page 1 and clears the selection in one batch', () => {
        render({searchTerms: 'news', filters: [lastModified]}).setFilter(createdBy);
        const [batch] = dispatch.mock.calls[0];
        expect(batch.type).toBe('BATCH');
        expect(batch.payload[0]).toEqual({type: 'GOTO', data: {params: {searchTerms: 'news', filters: [lastModified, createdBy]}}});
        expect(batch.payload[1]).toEqual(expect.objectContaining({type: 'CM_SET_PAGE', payload: 0}));
        expect(batch.payload[2].type).toBe('CM_CLEAR_SELECTION');
    });

    it('clears one filter or all of them', () => {
        render({filters: [lastModified, createdBy]}).clearFilter('std:lastModified');
        expect(dispatch.mock.calls[0][0].payload[0].data.params).toEqual({filters: [createdBy]});
        render({sub: true, filters: [lastModified, createdBy]}).clearAll();
        expect(dispatch.mock.calls[1][0].payload[0].data.params).toEqual({sub: true});
    });
});
