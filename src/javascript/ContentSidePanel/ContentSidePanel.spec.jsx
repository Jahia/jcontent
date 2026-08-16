import React from 'react';
import {shallow} from 'enzyme';
import {useQuery} from '@apollo/client';

jest.mock('@apollo/client', () => ({
    useQuery: jest.fn()
}));

jest.mock('~/JContent/SidePanel', () => ({
    SidePanel: () => null,
    SidePanelContextProvider: ({children}) => children
}));

jest.mock('~/ContentEditor/contexts', () => ({
    ContentEditorConfigContextProvider: ({children}) => children
}));

jest.mock('~/ContentEditor/ContentEditor/useEditFormDefinition', () => ({
    useEditFormDefinition: jest.fn(() => ({loading: true}))
}));

jest.mock('~/JContent/SidePanel/registerSidePanelTabs', () => ({
    registerSidePanelTabs: jest.fn()
}));

jest.mock('@jahia/ui-extender', () => ({
    registry: {find: jest.fn(() => [{key: 'ceSidePanelDetailsTab'}])}
}));

import {ContentSidePanel} from './ContentSidePanel';

describe('ContentSidePanel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useQuery.mockReturnValue({data: undefined, loading: false});
    });

    it('should wrap the panel in the gap-filling providers', () => {
        const cmp = shallow(<ContentSidePanel path="/sites/digitall/home" language="en"/>);
        expect(cmp.find('ContentSidePanelProviders').exists()).toBe(true);
        expect(cmp.find('ContentSidePanelResolver').props().workspace).toBe('edit');
    });

    it('should translate the initialTab alias into its registry key', () => {
        const cmp = shallow(<ContentSidePanel path="/sites/digitall/home" language="en" initialTab="usages"/>);
        expect(cmp.find('ContentSidePanelResolver').props().initialTab).toBe('ceSidePanelUsagesTab');
    });

    it('should forward the requested workspace', () => {
        const cmp = shallow(<ContentSidePanel uuid="uuid-1" language="en" workspace="live"/>);
        expect(cmp.find('ContentSidePanelResolver').props().workspace).toBe('live');
    });

    it('should skip the path resolution query when a uuid is given', () => {
        shallow(<ContentSidePanel uuid="uuid-1" language="en"/>)
            .find('ContentSidePanelResolver')
            .dive();

        expect(useQuery).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({skip: true}));
    });

    it('should resolve the uuid from the path and configure the content editor context with it', () => {
        useQuery.mockReturnValue({data: {jcr: {nodeByPath: {uuid: 'uuid-from-path'}}}, loading: false});

        const resolved = shallow(<ContentSidePanel path="/sites/digitall/home" language="fr"/>)
            .find('ContentSidePanelResolver')
            .dive();

        expect(resolved.find('ContentEditorConfigContextProvider').props().config)
            .toEqual({uuid: 'uuid-from-path', lang: 'fr', mode: 'edit'});
    });

    it('should degrade to an empty panel when the node cannot be resolved', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        useQuery.mockReturnValue({data: {jcr: {nodeByPath: null}}, loading: false});

        const resolved = shallow(<ContentSidePanel path="/sites/digitall/unknown" language="en"/>)
            .find('ContentSidePanelResolver')
            .dive();

        expect(resolved.find('ContentEditorConfigContextProvider').exists()).toBe(false);
        expect(resolved.find('EmptyContentSidePanel').exists()).toBe(true);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
