import React from 'react';
import {shallow} from '@jahia/test-framework';
import BrowseControlBar from './BrowseControlBar';
import {useSelector} from 'react-redux';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(() => ({
        path: '/test',
        mode: 'pages',
        siteKey: 'testSite'
    }))
}));

jest.mock('@jahia/ui-extender', () => ({
    registry: {
        find: jest.fn(() => [])
    },
    DisplayAction: () => false,
    DisplayActions: () => false
}));

jest.mock('~/JContent/JContent.redux', () => ({
    cmClearSelection: jest.fn()
}));

jest.mock('connected-react-router', () => jest.fn(() => {
}));

describe('BrowseControlBar', () => {
    it('should display', () => {
        const bar = shallow(<BrowseControlBar showActions/>);
        expect(bar.find('DisplayActions').length).toEqual(1);
        expect(bar.find('DisplayAction').length).toEqual(1);
        expect(bar.find('FileModeSelector').length).toEqual(0);
    });

    it('should not display actions', () => {
        const bar = shallow(<BrowseControlBar showActions={false}/>);
        expect(bar.find('DisplayActions').length).toEqual(0);
        expect(bar.find('DisplayAction').length).toEqual(0);
        expect(bar.find('FileModeSelector').length).toEqual(0);
    });

    it('should show file selectors', () => {
        useSelector.mockImplementation(() => ({
            path: '/test',
            mode: 'media',
            siteKey: 'testSite'
        }));
        const bar = shallow(<BrowseControlBar showActions/>);
        expect(bar.find('DisplayActions').length).toEqual(1);
        expect(bar.find('DisplayAction').length).toEqual(1);
        expect(bar.find('FileModeSelector').length).toEqual(1);
    });
});
