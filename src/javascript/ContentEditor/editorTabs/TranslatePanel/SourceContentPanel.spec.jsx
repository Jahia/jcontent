import React from 'react';
import {shallow} from '@jahia/test-framework';
import {SourceContentPanel} from './SourceContentPanel';
import {SideBySideSourceProvider} from '~/ContentEditor/contexts';
import {SourceContentFormBuilder} from './SourceContentFormBuilder';

jest.mock('~/ContentEditor/contexts', () => ({
    SideBySideSourceProvider: ({children}) => children
}));
jest.mock('./SourceContentFormBuilder', () => ({
    SourceContentFormBuilder: () => null
}));

describe('SourceContentPanel', () => {
    it('renders the source form inside the shared side-by-side source provider', () => {
        const wrapper = shallow(<SourceContentPanel/>);
        const provider = wrapper.find(SideBySideSourceProvider);
        expect(provider.exists()).toBe(true);
        expect(provider.find(SourceContentFormBuilder).exists()).toBe(true);
    });
});
