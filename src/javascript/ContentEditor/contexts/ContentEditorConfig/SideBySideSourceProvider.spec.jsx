import React from 'react';
import {shallow} from '@jahia/test-framework';
import {SideBySideSourceProvider} from './SideBySideSourceProvider';
import {ContentEditorConfigContextProvider, useContentEditorConfigContext} from './ContentEditorConfig.context';
import {useContentEditorContext} from '~/ContentEditor/contexts/ContentEditor';

jest.mock('./ContentEditorConfig.context', () => ({
    useContentEditorConfigContext: jest.fn(),
    ContentEditorConfigContextProvider: () => null
}));
jest.mock('~/ContentEditor/contexts/ContentEditor', () => ({
    useContentEditorContext: jest.fn()
}));

describe('SideBySideSourceProvider', () => {
    const child = <div id="child"/>;

    const render = (baseConfig, nodeData, props = {}) => {
        useContentEditorConfigContext.mockReturnValue(baseConfig);
        useContentEditorContext.mockReturnValue({nodeData});
        return shallow(<SideBySideSourceProvider {...props}>{child}</SideBySideSourceProvider>);
    };

    // The config object handed down to the overridden ContentEditorConfigContextProvider.
    const providedConfig = wrapper => wrapper.find(ContentEditorConfigContextProvider).props().config;

    it('builds a read-only side-by-side source config', () => {
        const cfg = providedConfig(render({lang: 'fr'}, {hasWritePermission: true, lockedAndCannotBeEdited: false}));
        expect(cfg.sideBySideContext).toMatchObject({
            enabled: true,
            readOnly: true,
            translateLang: 'fr'
        });
    });

    it('defaults the source language to the config language', () => {
        expect(providedConfig(render({lang: 'fr'}, {})).lang).toBe('fr');
    });

    it('prefers an existing side-by-side language for the source column (Translate-tab behaviour)', () => {
        expect(providedConfig(render({lang: 'fr', sideBySideContext: {lang: 'en'}}, {})).lang).toBe('en');
    });

    it('lets sourceLang / translateLang props override the defaults', () => {
        const cfg = providedConfig(render({lang: 'fr'}, {}, {sourceLang: 'de', translateLang: 'it'}));
        expect(cfg.lang).toBe('de');
        expect(cfg.sideBySideContext.translateLang).toBe('it');
    });

    it('takes permissions from the editable node, not the read-only source', () => {
        const cfg = providedConfig(render({lang: 'fr'}, {hasWritePermission: false, lockedAndCannotBeEdited: true}));
        expect(cfg.sideBySideContext.hasWritePermission).toBe(false);
        expect(cfg.sideBySideContext.lockedAndCannotBeEdited).toBe(true);
    });

    it('preserves the base config and any other side-by-side keys', () => {
        const cfg = providedConfig(render({lang: 'fr', uuid: 'abc', sideBySideContext: {custom: 1}}, {}));
        expect(cfg.uuid).toBe('abc');
        expect(cfg.sideBySideContext.custom).toBe(1);
    });

    it('renders its children under the overridden config', () => {
        const wrapper = render({lang: 'fr'}, {});
        expect(wrapper.find(ContentEditorConfigContextProvider).props().children).toBe(child);
    });
});
