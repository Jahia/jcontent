import React from 'react';
import {mount} from 'enzyme';
import {ContentDetails} from './ContentDetails';

const mockNotify = jest.fn();
jest.mock('@apollo/client', () => ({...jest.requireActual('@apollo/client'), useQuery: () => ({data: undefined})}));
jest.mock('@jahia/react-material', () => ({useNotifications: () => ({notify: mockNotify})}));
jest.mock('~/JContent/SidePanel', () => ({
    useSidePanelContext: () => ({
        nodeData: {path: '/sites/site/contents/text'},
        details: [],
        technicalInfo: [{label: 'UUID', value: 'abc-123'}]
    })
}));

const flushPromises = () => new Promise(resolve => {
    setTimeout(resolve, 0);
});

describe('ContentDetails', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        mockNotify.mockClear();
    });

    it('logs the error when the browser refuses the clipboard write', async () => {
        const error = new Error('denied');
        Object.defineProperty(navigator, 'clipboard', {value: {writeText: jest.fn(() => Promise.reject(error))}, configurable: true});
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        mount(<ContentDetails/>).find('[data-sel-role="detail-row"] button').simulate('click');
        await flushPromises();

        expect(consoleError).toHaveBeenCalledWith('Unable to copy to clipboard', error);
        expect(mockNotify).not.toHaveBeenCalled();
    });
});
