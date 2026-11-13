import React from 'react';
import {shallow} from 'enzyme';
import {useQuery} from '@apollo/client';
import {ContentHistory} from './ContentHistory';

jest.mock('@apollo/client', () => ({...jest.requireActual('@apollo/client'), useQuery: jest.fn()}));
jest.mock('react-redux', () => ({useSelector: jest.fn(() => 'en')}));
jest.mock('~/JContent/SidePanel', () => ({useSidePanelContext: () => ({nodeData: {path: '/sites/site/contents/text'}})}));
jest.mock('~/ContentEditor/DesignSystem/LoaderOverlay', () => ({LoaderOverlay: () => <div data-testid="loader"/>}));
jest.mock('~/JContent/SidePanel/ContentHistory/HistoryList', () => ({HistoryList: () => <div data-testid="history-list"/>}));

const filter = cmp => cmp.find('[data-sel-role="history-action-filter"]');

describe('ContentHistory', () => {
    it('keeps the filter on screen while a new filter or page loads', () => {
        useQuery.mockReturnValue({data: undefined, loading: true, error: undefined});
        const cmp = shallow(<ContentHistory/>);
        expect(filter(cmp).exists()).toBe(true);
        expect(cmp.find('LoaderOverlay').exists()).toBe(true);
    });

    it('keeps the filter on screen when the query fails', () => {
        useQuery.mockReturnValue({data: undefined, loading: false, error: new Error('failed')});
        const cmp = shallow(<ContentHistory/>);
        expect(filter(cmp).exists()).toBe(true);
        expect(cmp.text()).toContain('jcontent:label.contentEditor.history.errorLoading');
    });

    it('shows the empty state when the content has no history', () => {
        useQuery.mockReturnValue({data: {jcr: {nodeByPath: {history: {entries: [], count: 0}}}}, loading: false, error: undefined});
        const cmp = shallow(<ContentHistory/>);
        expect(cmp.find('[data-sel-role="history-empty"]').exists()).toBe(true);
        expect(filter(cmp).exists()).toBe(false);
    });
});
